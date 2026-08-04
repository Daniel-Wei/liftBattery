# Lift Battery 朋友 Beta Azure 部署说明

本文档用于把当前 Lift Battery 项目准备到朋友 Beta 环境。范围只覆盖部署、环境配置、CI/CD、Azure 资源和验证流程，不新增产品功能，不调整训练/报告数据模型，也不重写趋势报告或每周 PDF 报告逻辑。

## 当前项目结构

- `client/`：React/Vite 前端。Beta 推荐部署到 Azure Static Web Apps。
- `backend/LiftBattery.Api/`：.NET 8 Azure Functions isolated worker。HTTP API、Service Bus 消费者、Timer 触发器都在同一个 Function App 中运行。
- `backend/LiftBattery.Api/Data/Migrations/`：EF Core SQL Server migration。Beta 数据库必须是 Azure SQL Database。
- `backend/LiftBattery.Api/SERVICE_BUS_SETUP.md`：现有趋势报告 Service Bus 设计说明，部署时不能删除或绕过。
- `docker-compose.yml`：本地开发依赖。现在包含本地 SQL Server、Azurite 和前端 nginx 镜像；它不是 Beta 生产运行方案。

## Azure 目标架构

```text
Browser
  -> Azure Static Web Apps
  -> Azure Functions HTTP API
  -> Azure SQL Database
  -> Azure Storage Table/Blob
  -> Azure Service Bus queues
  -> Azure Functions ServiceBusTrigger/TimerTrigger
  -> SMTP provider for weekly report email
  -> Application Insights
```

当前后端不是 App Service 容器应用，而是 Azure Functions。HTTP API、趋势报告队列消费者、每周报告定时扫描和每周报告队列消费者都部署在同一个 Function App 中。这样可以保留现有 Service Bus + Blob pipeline，并避免为了 Beta 临时重构运行时。

## Azure 资源清单

建议使用单独资源组，例如 `rg-liftbattery-beta`。

- Azure Static Web Apps：托管 `client/dist`。
- Azure Function App：Linux 或 Windows 均可，运行时选择 .NET isolated，版本 8。
- Azure Storage Account：Function runtime 使用，同时承载 Table 和 Blob。
- Azure Service Bus Namespace：建议 Standard tier，保留 DLQ。
- Azure Service Bus Queue：`trend-report-jobs`，趋势报告异步生成。
- Azure Service Bus Queue：`weekly-report-jobs`，每周 PDF 报告异步生成。
- Azure SQL Server + Azure SQL Database：Beta 主数据库。
- Application Insights：Function App 日志、异常、依赖调用追踪。
- SMTP provider：用于每周报告邮件发送。

Service Bus 队列建议开启 duplicate detection，窗口可从 10 分钟开始。永久无效消息会立即 dead-letter；临时错误会保留 Active Job 并重投。相同 RunId 的 redelivery 可以基于不可变 Snapshot 重新计算，重复 Worker 通过 ETag 条件终态写入实现幂等。达到最终 DeliveryCount 时，代码才会将仍处于 Active 状态的 Job 标记为 Failed、释放 active-job lease，并主动送入 DLQ。

## 本地 Docker 与 Beta Azure SQL 的边界

Docker SQL Server 只用于本地开发：

```powershell
docker compose up -d sqlserver azurite
```

本地连接串在 `backend/LiftBattery.Api/local.settings.example.json` 中是：

```text
Server=127.0.0.1,14333;Database=LiftBattery;User Id=sa;Password=Change_this_local_password_123!;TrustServerCertificate=True;Encrypt=False
```

Beta 不能使用本地 Docker SQL Server。Beta 的 `ConnectionStrings__LiftBatteryDatabase` 必须填 Azure SQL Database 连接串，并且通过 Function App application settings 或 GitHub Actions secrets 注入。

## 本地运行命令

1. 启动本地 SQL Server 和 Azurite：

```powershell
docker compose up -d sqlserver azurite
```

2. 创建 `backend/LiftBattery.Api/local.settings.json`：

```powershell
Copy-Item backend\LiftBattery.Api\local.settings.example.json backend\LiftBattery.Api\local.settings.json
```

3. 应用本地 migration：

```powershell
dotnet ef database update --project backend\LiftBattery.Api\LiftBattery.Api.csproj --startup-project backend\LiftBattery.Api\LiftBattery.Api.csproj
```

4. 启动 Functions：

```powershell
cd backend\LiftBattery.Api
func start
```

5. 启动前端：

```powershell
cd client
npm ci
npm run dev
```

如果本地要测试 Service Bus queue consumer，需要把 `ServiceBusConnection` 指向一个开发用 Azure Service Bus namespace。Azurite 支持 Storage Blob/Queue/Table，但不模拟 Azure Service Bus。

## Azure Function App application settings

Function App 至少需要以下设置：

- `AzureWebJobsStorage`：Azure Storage connection string。
- `FUNCTIONS_WORKER_RUNTIME`：`dotnet-isolated`。
- `ConnectionStrings__LiftBatteryDatabase`：Azure SQL Database connection string。
- `ServiceBusConnection`：Service Bus connection string，需要 send/listen 权限。
- `TrendReportQueueName`：`trend-report-jobs`。
- `TrendReportMaxDeliveryCount`：必须与 `trend-report-jobs` Queue 的 `MaxDeliveryCount` 完全一致，例如 `10`。
- `TrendReportTableName`：`TrendReportJobs`。
- `TrendReportPayloadBlobContainerName`：`trend-report-payloads`。
- `WeeklyReportQueueName`：`weekly-report-jobs`。
- `WeeklyReportBlobContainerName`：`weekly-reports`。
- `WeeklyReportScheduleTimer`：`0 0 2 * * *`，每天 UTC 02:00 扫描一次 SQL 中带索引的到期 schedule。
- `WeeklyReportDispatchBatchSize`：默认 `100`。
- `WeeklyReportDispatchLeaseMinutes`：默认 `10`，防止 Timer 多实例重复领取。
- `WeeklyReportProcessingLeaseMinutes`：默认 `30`，防止同一 period 的重复消息并发处理。
- `APPLICATIONINSIGHTS_CONNECTION_STRING`：Application Insights connection string。
- `Auth__BetaInviteCode`：朋友 Beta 邀请码。
- `Auth__RequireSecureCookie`：Beta 必须是 `true`。
- `Auth__SessionDays`：例如 `14`。
- `Email:SmtpHost`、`Email:FromAddress`、`Email:SmtpPort`、`Email:EnableSsl`、`Email:SmtpUsername`、`Email:SmtpPassword`：每周报告邮件配置。

## Static Web Apps 设置

Static Web Apps 构建前端时需要：

- GitHub variable `VITE_API_BASE_URL`：Function App API 根地址，例如 `https://<function-app>.azurewebsites.net/api`。
- GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN`：Static Web Apps deployment token。

部署完成后，把 Static Web Apps 域名加入 Function App 的 CORS allow list，并允许 credentials。登录 cookie 使用 `HttpOnly`，跨站点访问时要确保浏览器、CORS 和 cookie secure 策略一致。

## GitHub Actions secrets 和 variables

Secrets：

- `AZURE_STATIC_WEB_APPS_API_TOKEN`：前端部署 token。
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`：Function App publish profile。
- `AZURE_SQL_CONNECTION_STRING`：Azure SQL Database migration 连接串。

Variables：

- `VITE_API_BASE_URL`：前端访问 API 的地址。
- `AZURE_FUNCTIONAPP_NAME`：Function App 名称。

当前 workflow：

- `.github/workflows/frontend-static-web-app.yml`：构建 `client` 并上传 `client/dist` 到 Static Web Apps。
- `.github/workflows/azure-functions-api.yml`：restore/build/test/publish 后部署 Azure Functions。
- `.github/workflows/azure-sql-migration.yml`：手动触发 EF Core migration，必须输入 `APPLY`。

## Azure SQL migration 流程

Beta 第一次部署前：

1. 在 Azure Portal 创建 SQL Server 和 SQL Database。
2. 给当前公网 IP 或 GitHub runner 所需访问方式配置 firewall。更稳的方式是本地先手动 migration，或者使用受控网络 runner。
3. 设置 GitHub secret `AZURE_SQL_CONNECTION_STRING`。
4. 在 GitHub Actions 手动运行 `Apply Azure SQL migrations`，输入 `APPLY`。

本地手动 migration 示例：

```powershell
$env:ConnectionStrings__LiftBatteryDatabase="Server=tcp:<server>.database.windows.net,1433;Initial Catalog=<db>;Persist Security Info=False;User ID=<user>;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
dotnet ef database update --project backend\LiftBattery.Api\LiftBattery.Api.csproj --startup-project backend\LiftBattery.Api\LiftBattery.Api.csproj
```

不要在用户流量高峰自动跑 migration。Beta 阶段建议手动确认后执行。

## Service Bus 和趋势报告 pipeline

趋势报告入口：

- HTTP Function：`CreateTrendReport`。
- 状态查询：`GetTrendReport`。
- Queue producer：`TrendReportServiceBusQueue`。
- Queue consumer：`ProcessTrendReportJob`。
- Queue name：`trend-report-jobs`。
- Table name：`TrendReportJobs`。
- Payload Blob container：`trend-report-payloads`。

消息体是 `TrendReportQueueMessageDto`：

- `JobId`：Table job id。
- `RunId`：本次运行相关 ID，也作为 `CorrelationId`。
- `UserId`：当前用户。

DataVersion 逻辑：

- SQL `Users.TrendReportDataVersion` 是每个用户当前源数据版本的唯一权威来源。
- 保存或删除 Training/PreCheck 时，源数据和新 `DataVersion` 由同一次 SQL `SaveChangesAsync` 原子提交。
- 提交报告时只读取当前 SQL `DataVersion`；Worker 开始执行时才在同一个 SQL snapshot transaction 中读取 `DataVersion`、Training 和 PreCheck。
- 如果已有 queued/processing job 覆盖被修改日期，旧 job 会直接进入 `Superseded`。
- Consumer 会比较 job 与当前 SQL `DataVersion`，避免旧数据写回新结果。

DLQ 逻辑：

- `TrendReportQueueFunctions` 无法反序列化或字段无效时，调用 `DeadLetterMessageAsync`。
- reason 是 `InvalidTrendReportQueueMessage`。
- 非最终 delivery 的临时异常不会把 Job 改成 Failed，而是抛出，让 Service Bus 重新投递。
- 重投可以重新处理同一 RunId 的 Processing Job；重复计算是允许的，但 `Completed`、`Failed`、`Cancelled` 和 `Superseded` 都是不可覆盖的终态，只有第一个 ETag 条件终态写入成功。
- 最终 delivery 失败时，Job 才会变为 Failed 并释放 active-job lease，消息以 reason `TrendReportRetryLimitExceeded` 主动进入 DLQ。

## 每周报告 Service Bus + Blob pipeline

每周报告入口：

- HTTP Function：`GetWeeklyReportSchedule`、`UpdateWeeklyReportSchedule`。
- Timer Function：`EnqueueDueWeeklyReports`。
- Queue consumer：`ProcessWeeklyReportJob`。
- Queue name：`weekly-report-jobs`。
- SQL tables：`WeeklyReportSchedule`、`WeeklyReportDelivery`。
- Blob container：`weekly-reports`。

消息体是 `WeeklyReportQueueMessageDto`：

- `ScheduleId`：SQL schedule identity。
- `PeriodKey`：报告周期 identity；与 `ScheduleId` 共同组成确定性 idempotency key。
- `UserId`、接收邮箱、时区、源数据和 `DataVersion` 不进入消息，Worker 从 SQL 读取最新值。

Blob 逻辑：

- `TrendReportPayloadBlobStore` 使用 `AzureWebJobsStorage`，container 默认 `trend-report-payloads`。
- 趋势报告只持久化 Result，路径为 `users/{userId}/jobs/{jobId}/result-{sha256}.json`；Worker Snapshot 只存在于单次执行内存中，Table Job row 只保存 Result Blob pointer。
- `WeeklyReportBlobStorage` 使用 `AzureWebJobsStorage` 连接 Storage。
- container 默认 `weekly-reports`。
- blob path 格式：`schedules/{scheduleId}/periods/{periodKey}/weekly-report.pdf`。
- metadata 写入报告周期、`SourceDataVersion`、`DataSampledAtUtc` 和 `GeneratedAtUtc`。

DLQ 逻辑：

- `WeeklyReportQueueFunctions` 无法解析或字段不合法时，调用 `DeadLetterMessageAsync`。
- reason 是 `InvalidWeeklyReportQueueMessage`。
- 业务处理中的临时异常走 Service Bus retry。

## Smoke tests

部署后按顺序验证：

1. 打开 Static Web Apps，确认页面能加载。
2. 注册 Beta 用户，邀请码正确时能登录。
3. 刷新页面后 `/me` 仍能识别 session cookie。
4. 保存 pre-check，确认 Azure SQL 有数据。
5. 保存训练记录，确认 Azure SQL 有数据。
6. 打开趋势报告页，生成报告，确认 `trend-report-jobs` 有消息被消费。
7. 轮询 `GetTrendReport`，确认状态从 queued/processing 到 completed，并确认 `trend-report-payloads` 中存在 result JSON；Worker source snapshot 只在单次执行的内存中存在，不再持久化 snapshot JSON。
8. 修改训练记录，确认旧趋势报告提示过期或重新生成。
9. 启用每周报告 schedule，把 timer 临时设成短周期，确认 `weekly-report-jobs` 入队。
10. 确认每周报告 PDF 上传到 Blob，并且 metadata 有 correlationId。
11. 确认邮件发送成功。
12. 在 Application Insights 用 correlationId 搜索 producer、consumer、Blob upload、email send 日志。
13. 手动投递无效 JSON 到两个队列，确认进入各自 DLQ。

## Azure Portal 手动设置

- 创建资源组。
- 创建 Azure SQL Server 和 Database。
- 配置 SQL firewall 或私有网络访问。
- 创建 Storage Account。
- 创建 Service Bus namespace 和两个 queue。
- 配置 Function App application settings。
- 配置 Function App CORS，允许 Static Web Apps 域名并允许 credentials。
- 配置 Static Web Apps deployment token 到 GitHub secret。
- 下载 Function App publish profile 到 GitHub secret。
- 设置 GitHub variables。
- 配置 Application Insights 并复制 connection string。
- 配置 SMTP secret。
- 首次运行 migration。
- 首次部署后执行 smoke tests。

## 失败排查

- 登录失败：检查 `Auth__BetaInviteCode`、`Auth__RequireSecureCookie`、CORS credentials、Static Web Apps 域名是否在 Function App CORS allow list。
- API 黑屏或请求失败：检查 `VITE_API_BASE_URL` 是否指向 `/api` 根路径，浏览器 Network 是否被 CORS 拦截。
- SQL 失败：检查 `ConnectionStrings__LiftBatteryDatabase`、SQL firewall、EF migration 是否执行。
- 趋势报告卡在 queued：检查 `ServiceBusConnection`、`TrendReportQueueName`、Function trigger 是否启动、Application Insights 是否有 consumer 异常。
- 趋势报告 payload 读取失败：检查 `AzureWebJobsStorage`、`TrendReportPayloadBlobContainerName`、Blob 权限以及 Table row 中的 Blob pointer/hash。
- 每周报告没有入队：检查 `WeeklyReportScheduleTimer`、用户 schedule enabled、timezone 和 Function App 当前配置。
- PDF 没有上传：检查 `AzureWebJobsStorage`、`WeeklyReportBlobContainerName`、Blob 权限和 consumer 日志。
- 邮件未发出：检查 SMTP host、port、SSL、username、password、sender address。
- DLQ 堆积：先看 dead-letter reason，再按 correlationId 搜索 Application Insights。

## Beta 发布顺序

1. 创建 Azure 资源。
2. 设置 GitHub secrets 和 variables。
3. 本地或 GitHub Actions 执行 Azure SQL migration。
4. 手动运行 `Deploy Azure Functions API`。
5. 手动运行 `Deploy frontend to Azure Static Web Apps`。
6. 在 Portal 配置 CORS 和 application settings。
7. 执行 smoke tests。
8. 把 timer 从测试频率调整到 Beta 需要的频率。
9. 邀请朋友使用 Beta 邀请码。
