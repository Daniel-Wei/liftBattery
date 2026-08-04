# Lift Battery 封闭 Beta 上线 Runbook

本文档是 Lift Battery 当前版本的正式上线操作手册，覆盖 Azure 资源、生产配置、数据库 migration、GitHub Actions 部署、验证、回滚和上线门槛。

适用范围：

- React/Vite 前端部署到 Azure Static Web Apps。
- .NET 8 isolated Azure Functions 部署到独立 Function App。
- Azure SQL 保存用户、认证、Pre-check、Training、DataVersion 和 Weekly Report 数据。
- Azure Table/Blob 保存 Trend Report Job 状态和生成结果。
- Azure Service Bus 处理 Trend Report 和 Weekly Report 异步消息。
- 当前 Weekly Report Worker 暂时禁用，仅开放手动 Trend Report 测试。

## 1. 当前发布基线

本文档首次生成时的代码基线：

```text
Branch: main
Commit: 763fc9eb1716703bb06e3504d08fcfb5f708a876
Remote: origin/main
Working tree: clean
```

验证结果：

```text
Backend: 47 passed, 0 failed
Frontend: 25 passed, 0 failed
Frontend production build: passed
```

再次上线前仍应重新运行测试，不应长期依赖上述历史结果。

## 2. 部署架构决定

生产访问链路必须采用同源 `/api`：

```text
Browser
  -> Azure Static Web Apps
      -> /api/*
          -> linked Azure Function App
              -> Azure SQL
              -> Azure Storage Table/Blob
              -> Azure Service Bus
```

前端 GitHub variable 必须配置为：

```text
VITE_API_BASE_URL=/api
```

不要把它配置成独立的 `https://<function-app>.azurewebsites.net/api`。当前认证 Cookie 使用 `SameSite=Lax`；让 Static Web Apps 代理 `/api` 后，Cookie 属于前端同一站点，可以稳定支持刷新页面后的登录状态。

关联现有 Function App 需要 Azure Static Web Apps Standard plan：

- <https://learn.microsoft.com/azure/static-web-apps/functions-bring-your-own>
- <https://learn.microsoft.com/azure/static-web-apps/apis-overview>

## 3. 上线范围判断

当前版本适合：

- 开发者本人在真实 Azure 环境执行 smoke test。
- 少量已知朋友使用邀请码参加封闭 Beta。
- 验证持久化、登录、异步消息、报告生成和多用户隔离。

当前版本不适合：

- 无邀请码公开注册。
- 大规模公开推广。
- 对可用性、恢复时间或数据保留作正式 SLA 承诺。

公开发布前至少还需要：登录/注册限流、邮箱验证、密码找回、账号和数据删除、隐私说明、真实 Azure 集成测试、IaC 和更完整的监控告警。

## 4. Azure 资源清单

本 Runbook 按“删除旧环境后完全从零创建”执行。不要复用旧的 SQL、Storage、Service Bus、Function App 或 Static Web App。所有应用级资源放在同一个新 Resource Group 中，使整个 Beta 环境具有一致的生命周期。

建议资源名称：

| Resource | Suggested name |
|---|---|
| Resource Group | `rg-liftbattery-beta` |
| SQL Server | `sql-liftbattery-beta-<suffix>` |
| SQL Database | `LiftBatteryBeta` |
| Storage Account | `stliftbatterybeta<suffix>` |
| Service Bus Namespace | `sb-liftbattery-beta-<suffix>` |
| Function App | `func-liftbattery-beta-<suffix>` |
| Static Web App | `swa-liftbattery-beta` |
| Application Insights | `appi-liftbattery-beta` |
| Trend queue | `trend-report-jobs` |
| Weekly queue | `weekly-report-jobs` |

SQL、Storage、Service Bus 和 Function App 优先选择 `Australia East`。Storage Account、SQL Server、Function App 等资源名称需要全局唯一。

## Phase 0：完整删除旧 Azure 环境

只有在旧环境不再保存任何需要保留的数据时才执行本节。删除 Resource Group 会删除组内所有资源、deployment records 和当前保存的操作记录，而且不可逆：

- <https://learn.microsoft.com/azure/azure-resource-manager/management/manage-resources-portal>
- <https://learn.microsoft.com/rest/api/resources/resource-groups/delete>

### Phase 0.1：确认删除边界

进入 Azure Portal：

```text
Subscriptions
  -> Azure subscription 1
  -> Overview
```

记录并核对：

```text
Subscription name
Subscription ID
Directory / Tenant
Status = Active
```

然后进入：

```text
Resource groups
  -> <旧 Resource Group 名称>
  -> Overview
```

删除前必须逐项确认：

- 当前打开的是旧 Lift Battery 开发环境，不是其他项目的 Resource Group。
- Resource Group 中的 SQL 数据、Blob、Table 和 Service Bus 消息都不需要保留。
- 组内没有被其他项目共用的资源。
- 没有需要保留的自定义域名、证书或 DNS 配置。
- 已记录旧 Resource Group 的准确名称，但不会在新环境中复用旧 connection string 或 deployment credential。

可以从 Resource Group 的 `Resources` 页面按类型检查，预计会看到以下部分或全部资源：

```text
Microsoft.Sql/servers
Microsoft.Sql/servers/databases
Microsoft.Storage/storageAccounts
Microsoft.ServiceBus/namespaces
Microsoft.Web/sites
Microsoft.Web/staticSites
Microsoft.Insights/components
Microsoft.Web/serverfarms
```

如果发现任何无法确认用途的资源，先停止删除并查明所有者。

### Phase 0.2：清理删除锁

进入：

```text
<旧 Resource Group>
  -> Settings
  -> Locks
```

如果存在 `Delete` 或 `ReadOnly` lock，确认它只用于旧 Lift Battery 环境后再移除。存在锁时，整组删除可能失败或停留在删除中。

### Phase 0.3：暂停旧自动部署

在删除和新环境配置完成之间，不要向 `main` 推送代码。当前三个 workflow 可能因为 push 自动运行或被手工运行：

```text
.github/workflows/azure-functions-api.yml
.github/workflows/azure-sql-migration.yml
.github/workflows/frontend-static-web-app.yml
```

进入 GitHub：

```text
Repository
  -> Settings
  -> Secrets and variables
  -> Actions
```

删除旧环境专属的 Secrets：

```text
AZURE_FUNCTIONAPP_PUBLISH_PROFILE
AZURE_SQL_CONNECTION_STRING
AZURE_STATIC_WEB_APPS_API_TOKEN
```

删除或清空旧环境专属的 Variable：

```text
AZURE_FUNCTIONAPP_NAME
```

`VITE_API_BASE_URL=/api` 不包含 Azure credential，可以保留。后续创建完新资源后，必须重新生成并写入所有已删除的 Secrets；不要把旧 publish profile、SQL connection string 或 Static Web Apps token 重新放回去。

### Phase 0.4：删除旧 Resource Group

Portal 主流程：

```text
Azure Portal
  -> Resource groups
  -> <旧 Resource Group 名称>
  -> Delete resource group
```

在确认页面：

1. 再次查看将被删除的资源列表。
2. 输入完整的旧 Resource Group 名称。
3. 确认删除。
4. 等待 Portal notification 明确显示删除完成。

不要在删除仍进行时开始创建同名资源。Azure 删除是异步操作，资源名称可能在一段时间内仍不可重新使用。

如果希望在浏览器中用 Cloud Shell 先核验再删除，可以执行：

```bash
az account show --output table
az group list --output table
az resource list --resource-group "<旧 Resource Group 名称>" --output table
az lock list --resource-group "<旧 Resource Group 名称>" --output table
az group delete --name "<旧 Resource Group 名称>" --yes
```

命令中的占位符必须手工替换成 Portal 中核对过的完整名称。不要复制一个未经核对的 Resource Group 名称执行删除。

### Phase 0.5：验证旧环境已经消失

Portal 中依次检查：

```text
Resource groups
  -> 搜索旧 Resource Group 名称
  -> 应无结果

All resources
  -> Resource group filter = <旧 Resource Group 名称>
  -> 应无结果
```

如果 Resource Group 仍显示 `Deleting`，等待删除结束，不要创建新环境。如果删除失败：

1. 打开旧 Resource Group 的 `Activity log`。
2. 找到失败的 Delete operation。
3. 检查资源锁、权限或具体失败资源。
4. 修复原因后再次删除。

如果曾配置自定义域名，还要到域名提供商处删除旧 Static Web App 的 CNAME/TXT 记录；这些 DNS 记录不一定属于被删除的 Azure Resource Group。

### Phase 0.6：从干净状态重新开始

确认以下条件全部成立后，才继续第 5 节：

- [ ] 旧 Resource Group 已完全消失。
- [ ] 旧 Lift Battery Azure resources 已无法访问。
- [ ] GitHub 中三个旧 deployment Secrets 已删除。
- [ ] 本地或密码管理器中不再把旧 connection string 当作新环境配置。
- [ ] 新环境将使用新生成的全局唯一资源名称和 credentials。
- [ ] Subscription 状态为 `Active`，并且允许创建资源。

## 5. 上线前置条件

### 5.1 Azure Subscription

进入 Azure Portal：

```text
Subscriptions
  -> Azure subscription 1
  -> Overview
```

必须确认：

```text
Status = Active
```

如果仍是 `Reactivation in progress`、`Disabled` 或 `Read only`，停止部署。订阅层的 `409` 不是应用问题。

### 5.2 本地验证

从仓库根目录执行：

```powershell
dotnet test .\backend\LiftBattery.Api.Tests\LiftBattery.Api.Tests.csproj --configuration Release

Set-Location .\client
npm.cmd ci
npm.cmd test
npm.cmd run build
Set-Location ..
```

确认：

```powershell
git status --short --branch
```

必须没有未提交改动，并且准备部署的 commit 已经推送到 `origin/main`。

## 6. 创建 Resource Group

Azure Portal：

```text
Resource groups
  -> Create
```

配置：

```text
Subscription: Azure subscription 1
Resource group: rg-liftbattery-beta
Region: Australia East
```

## 7. 创建 Azure SQL

Azure Portal：

```text
SQL databases
  -> Create
```

配置：

```text
Resource group: rg-liftbattery-beta
Database name: LiftBatteryBeta
Server: Create new
Server location: Australia East
Authentication: SQL authentication
```

朋友 Beta 可以选择较小的 General Purpose Serverless 或 Portal 当前提供的 Azure SQL 免费额度。创建空数据库，不要加载 Sample 数据。

Networking：

```text
Connectivity method: Public endpoint
Add current client IP: Yes
Allow Azure services and resources to access this server: Yes
Minimum TLS: 1.2
```

`Allow Azure services` 适合当前 Beta 快速上线，但它允许 Azure 内其他资源尝试访问 SQL；数据库账号和密码仍是访问边界。正式扩展前应切换到受控网络或 Managed Identity。

创建后进入：

```text
SQL Database
  -> Connection strings
  -> ADO.NET
```

保存完整连接字符串，并替换真实用户名和密码：

```text
Server=tcp:<server>.database.windows.net,1433;
Initial Catalog=LiftBatteryBeta;
Persist Security Info=False;
User ID=<user>;
Password=<password>;
MultipleActiveResultSets=False;
Encrypt=True;
TrustServerCertificate=False;
Connection Timeout=30;
```

不要把连接字符串写入 Git、README 或截图。

## 8. 创建 Storage Account

Azure Portal：

```text
Storage accounts
  -> Create
```

配置：

```text
Resource group: rg-liftbattery-beta
Region: Australia East
Performance: Standard
Redundancy: LRS
Account kind: StorageV2
Public network access: Enabled
Allow storage account key access: Enabled
Anonymous Blob access: Disabled
```

同一个 Storage Account 当前同时用于：

- Functions host storage。
- `TrendReportJobs` Table。
- `trend-report-payloads` Blob container。
- `weekly-reports` Blob container。

Table 和 Blob container 会由代码首次使用时自动创建。

## 9. 配置 Service Bus

不要复用旧的 `liftBattery-dev` Namespace。Azure Portal：

```text
Service Bus
  -> Create
```

配置：

```text
Resource group: rg-liftbattery-beta
Namespace name: sb-liftbattery-beta-<suffix>
Location: Australia East
Pricing tier: Basic
```

封闭 Beta 使用 `Basic` 即可。应用已经按 Service Bus 的 at-least-once 模型实现业务幂等：Trend Report 使用 `JobId + RunId + DataVersion + ETag`，Weekly Report 使用 `UNIQUE (ScheduleId, PeriodKey)` 和 processing lease。Broker duplicate detection 只是减少偶发重复计算，不是正确性边界。

等待 Namespace 的 `Provisioning state` 变为 `Succeeded`，再进入 `Entities -> Queues` 创建下面两个 Queue。记录新的 Namespace host name；后续 Function App 必须使用这个新 Namespace 的 connection string。

### 9.1 Trend queue

队列名：

```text
trend-report-jobs
```

配置：

```text
Status: Active
Max delivery count: 10
Lock duration: 5 minutes
Sessions: Disabled
Partitioning: Disabled
```

Basic tier 不提供 duplicate detection，这是本部署的预期配置。Service Bus 仍使用 PeekLock、at-least-once redelivery、`MaxDeliveryCount` 和 DLQ；应用层负责重复消息幂等。Standard/Premium 的 broker duplicate detection 仅作为未来可选优化：

<https://learn.microsoft.com/azure/service-bus-messaging/enable-duplicate-detection>

### 9.2 Weekly queue

即使 Worker 暂时禁用，也创建：

```text
weekly-report-jobs
```

使用与 Trend queue 相同的基础配置，避免 Function host 在索引 trigger 时出现 `MessagingEntityNotFound`。

### 9.3 Shared access policy

在 Namespace 下创建：

```text
Policy name: LiftBatteryRuntime
Send: Enabled
Listen: Enabled
Manage: Disabled
```

复制 Primary Connection String，作为 `ServiceBusConnection`。

## 10. 创建 Function App

Azure Portal：

```text
Function App
  -> Create
```

推荐配置：

```text
Resource group: rg-liftbattery-beta
Runtime: .NET 8 Isolated
Region: Australia East
OS: Linux
Hosting: Flex Consumption
Instance memory: 2048 MB
Storage account: 前面创建的 Storage Account
Application Insights: Enabled
Continuous deployment: Disabled
Public network access: Enabled
```

代码通过仓库现有 GitHub Actions 部署，不要在 Portal 内手动创建或编辑 Function 源代码。

## 11. Function App application settings

进入：

```text
Function App
  -> Settings
  -> Environment variables
  -> App settings
```

保留 Azure 自动生成的 `AzureWebJobsStorage` 和 `APPLICATIONINSIGHTS_CONNECTION_STRING`。

### 11.1 Runtime

```text
FUNCTIONS_WORKER_RUNTIME=dotnet-isolated
FUNCTIONS_EXTENSION_VERSION=~4
```

### 11.2 SQL、认证和 Service Bus

```text
ConnectionStrings__LiftBatteryDatabase=<Azure SQL connection string>
ServiceBusConnection=<Service Bus Primary Connection String>

Auth__BetaInviteCode=<new strong invite code>
Auth__RequireSecureCookie=true
Auth__SessionDays=14

PreCheck__DefaultUserId=1
Training__DefaultUserId=1
```

不要继续使用仓库 example 文件中的默认邀请码。

### 11.3 Trend Report

```text
TrendReportQueueName=trend-report-jobs
TrendReportTableName=TrendReportJobs
TrendReportPayloadBlobContainerName=trend-report-payloads
TrendReportDemoDelayMilliseconds=0
TrendReportEnqueueRecoveryTimer=0 10 2 * * *
TrendReportJobConvergenceTimer=0 20 2 * * *
TrendReportQueuedJobTimeoutMinutes=15
TrendReportProcessingJobTimeoutMinutes=30
TrendReportEnqueueRecoveryMaxAttempts=5
```

### 11.4 Weekly Report

```text
WeeklyReportQueueName=weekly-report-jobs
WeeklyReportBlobContainerName=weekly-reports
WeeklyReportScheduleTimer=0 0 2 * * *
WeeklyReportDispatchBatchSize=100
WeeklyReportDispatchLeaseMinutes=10
WeeklyReportProcessingLeaseMinutes=30
```

本地 `local.settings.json` 不会随 publish 部署，必须在 Azure 再设置一次。

启用 Weekly Report 前必须先配置 SMTP。不要先启用 Function 再补邮件凭据，否则到期消息会持续失败和重投。

Azure App Settings 名称和值：

```text
Email__SmtpHost=<SMTP host>
Email__FromAddress=<verified sender address>
Email__SmtpPort=587
Email__EnableSsl=true
Email__SmtpUsername=<SMTP username>
Email__SmtpPassword=<SMTP password or application client secret>
```

`Email__SmtpPassword` 必须保存为 Function App application setting 或 Key Vault reference，不能提交到 GitHub、`local.settings.example.json` 或其他 tracked file。

封闭 Beta 最快可以使用 Gmail SMTP：

```text
Email__SmtpHost=smtp.gmail.com
Email__FromAddress=<完整 Gmail 地址>
Email__SmtpPort=587
Email__EnableSsl=true
Email__SmtpUsername=<与 FromAddress 相同的 Gmail 地址>
Email__SmtpPassword=<开启两步验证后生成的 16 位 App Password>
```

不要填写普通 Gmail 登录密码。Google SMTP 使用 TLS/STARTTLS 587，并可能要求 App Password：

- <https://support.google.com/mail/answer/7104828>

Azure 原生的正式方案是 Azure Communication Services Email SMTP：

```text
Email__SmtpHost=smtp.azurecomm.net
Email__FromAddress=donotreply@<Azure managed or verified domain>
Email__SmtpPort=587
Email__EnableSsl=true
Email__SmtpUsername=<ACS SMTP Username>
Email__SmtpPassword=<linked Entra application client secret value>
```

该方案需要先创建 Email Communication Service、连接 domain、创建 Communication Service、注册 Entra application、分配发送权限并创建 SMTP Username：

- <https://learn.microsoft.com/azure/communication-services/quickstarts/email/send-email-smtp/smtp-authentication>

当前 `SmtpEmailSender` 使用 username/password SMTP。不要使用 Outlook/Exchange Online 普通账号密码作为长期方案；Exchange Online 正在移除 SMTP AUTH Basic authentication，应改用 ACS SMTP、支持的事务邮件提供商或将代码迁移到 OAuth/Graph。

完成 SMTP 配置后，删除以下两个旧 setting；如果它们不存在，则 Function 默认启用：

```text
AzureWebJobs.EnqueueDueWeeklyReports.Disabled
AzureWebJobs.ProcessWeeklyReportJob.Disabled
```

不要为了启用 Weekly Report 而新建 `Disabled=false`。这两个 setting 不存在时，Azure Functions 默认启用对应 Function；只有需要临时停用时才添加并设为 `true`。

保存 App Settings 后重启 Function App。在 `Functions` 页面确认：

```text
EnqueueDueWeeklyReports = Enabled
ProcessWeeklyReportJob = Enabled
```

Linux 环境的层级配置使用双下划线 `__`：

<https://learn.microsoft.com/azure/azure-functions/functions-app-settings>

## 12. 配置 Function App publish profile

当前 workflow 使用 publish profile：

```text
.github/workflows/azure-functions-api.yml
```

在 Function App 中打开：

```text
Settings
  -> Configuration
  -> General settings
  -> SCM Basic Auth Publishing Credentials = On
```

回到 Overview，下载 `Get publish profile`。Publish profile 是高权限部署凭据，只能保存到 GitHub Secret：

<https://learn.microsoft.com/azure/azure-functions/functions-how-to-github-actions>

公开发布前建议将 workflow 改为 Azure OIDC，移除长期 publish profile。

## 13. 创建 Static Web App

Azure Portal：

```text
Static Web Apps
  -> Create
```

配置：

```text
Resource group: rg-liftbattery-beta
Name: swa-liftbattery-beta
Plan: Standard
Deployment source: Other / Deployment token
```

选择 `Other`，避免 Azure 自动生成一条与仓库现有 workflow 冲突的新 workflow。

创建后：

```text
Static Web App
  -> Overview
  -> Manage deployment token
```

复制 token：

<https://learn.microsoft.com/azure/static-web-apps/deployment-token-management>

## 14. GitHub Secrets 和 Variables

进入：

```text
GitHub repository
  -> Settings
  -> Secrets and variables
  -> Actions
```

Repository secrets：

```text
AZURE_FUNCTIONAPP_PUBLISH_PROFILE=<publish profile XML>
AZURE_SQL_CONNECTION_STRING=<Azure SQL connection string>
AZURE_STATIC_WEB_APPS_API_TOKEN=<SWA deployment token>
```

Repository variables：

```text
AZURE_FUNCTIONAPP_NAME=<Function App resource name>
VITE_API_BASE_URL=/api
```

仓库使用的 workflow：

- `.github/workflows/azure-sql-migration.yml`
- `.github/workflows/azure-functions-api.yml`
- `.github/workflows/frontend-static-web-app.yml`

## 15. 执行 SQL migration

GitHub：

```text
Actions
  -> Apply Azure SQL migrations
  -> Run workflow
  -> Branch: main
  -> confirm: APPLY
```

必须等待 workflow 变绿。

在 Azure SQL Query editor 验证：

```sql
SELECT MigrationId
FROM __EFMigrationsHistory
ORDER BY MigrationId;
```

应包含：

```text
20260801172623_AddWeeklyReportScheduling
```

如果 GitHub runner 无法连接 SQL，先检查 SQL Networking 和 `Allow Azure services`；必要时给执行 migration 的客户端 IP 添加临时 firewall rule。

## 16. 部署 Function App

GitHub：

```text
Actions
  -> Deploy Azure Functions API
  -> Run workflow
  -> main
```

成功后在 Function App 的 Functions 列表确认 HTTP、Trend Service Bus、Trend Timer、`EnqueueDueWeeklyReports` 和 `ProcessWeeklyReportJob` functions 全部已加载且为 Enabled。

直接访问：

```text
https://<function-app>.azurewebsites.net/api/auth/me
```

未登录返回 `401` JSON 表示 Function、SQL 和 HTTP pipeline 基本可用。`500` 需要检查 connection string、SQL firewall、migration 和 Application Insights。

## 17. 首次部署 Static Web App

GitHub：

```text
Actions
  -> Deploy frontend to Azure Static Web Apps
  -> Run workflow
  -> main
```

前端 workflow 使用 `VITE_API_BASE_URL=/api` 构建并上传 `client/dist`。

## 18. 关联 Function App

首次前端部署后：

```text
Static Web App
  -> Settings
  -> APIs
  -> Production
  -> Link
```

选择：

```text
Backend resource type: Function App
Resource name: <Function App name>
Backend slot: Production
```

关联后访问：

```text
https://<static-web-app>.azurestaticapps.net/api/auth/me
```

应返回 `401`，不能是 `404` 或 `502`。前端后续所有 API 请求都从 Static Web Apps 同源 `/api` 进入，不需要配置浏览器跨站 CORS。

## 19. Smoke test

### 19.1 Authentication

1. 使用新的 Beta invite code 注册。
2. 登录。
3. 刷新页面。
4. 确认仍然登录。
5. DevTools 中确认 `LiftBattery.Session` 位于 Static Web Apps 域名，且为 `HttpOnly`、`Secure`、`SameSite=Lax`。

### 19.2 Pre-check

1. 保存 Pre-check。
2. 刷新并读取。
3. 修改一次。
4. 删除一次。

### 19.3 Training

1. 创建并保存 session。
2. 刷新并读取。
3. 删除 session。
4. 确认只影响当前用户。

### 19.4 Trend Report

1. 创建一份报告。
2. 观察 `Queued/Processing -> Completed`。
3. 确认 Service Bus Active messages 回到 0。
4. 确认 DLQ 为 0。
5. 确认 `TrendReportJobs` Table 有 Job row。
6. 确认 `trend-report-payloads` 有 result JSON。
7. 修改 Training 或 Pre-check。
8. 确认旧报告变为过期，并可重新生成。

### 19.5 Weekly Report

启用前确认：

```text
EnqueueDueWeeklyReports = Enabled
ProcessWeeklyReportJob = Enabled
weekly-report-jobs Active messages = 0
weekly-report-jobs DLQ messages = 0
```

执行一次完整 smoke test：

1. 在前端保存一个 `Enabled` schedule，RecipientEmail 使用你能立即检查的测试邮箱。
2. 把发送日和本地发送时间设为未来 5–10 分钟；不要直接手改 `LastPeriodKey` 或 Delivery 状态。
3. 等待 `EnqueueDueWeeklyReports` 的下一次五分钟扫描。
4. 在 Application Insights 确认出现 `Weekly report schedule dispatched`。
5. 确认 `weekly-report-jobs` 消息被 `ProcessWeeklyReportJob` 消费，Active messages 回到 0，DLQ 为 0。
6. 确认 Storage 的 `weekly-reports` container 中生成 PDF。
7. 确认收件箱收到 PDF；同时检查垃圾邮件目录。
8. 查询 SQL，确认同一 `(ScheduleId, PeriodKey)` 只有一个 `WeeklyReportDelivery`，且状态为 `Sent`。
9. 重新投递相同 PeriodKey 的消息时，确认不会再次生成 Delivery 或重新发送已标记为 `Sent` 的报告。

如果邮件发送失败，不要手工把 Delivery 改成 `Sent`。保留消息重投，让日志暴露 SMTP 错误；修复凭据后再重试。首次测试结束后可以把 schedule 临时设为 Disabled，避免等待排错期间意外继续发送。

## 20. Application Insights 验证

异常：

```kusto
exceptions
| where timestamp > ago(1h)
| order by timestamp desc
```

失败请求：

```kusto
requests
| where timestamp > ago(1h)
| where success == false
| order by timestamp desc
```

Trend Report logs：

```kusto
traces
| where timestamp > ago(1h)
| where message contains "Trend report"
    or message contains "RunId"
| order by timestamp desc
```

上线前必须没有持续重复出现的 SQL、Storage、Service Bus listener 或 Job convergence 异常。

## 21. 费用保护

在 Subscription 下创建 Cost Management budget，至少配置 50%、80%、100% 邮件告警。

当前主要固定或潜在成本：

- Static Web Apps Standard。
- Service Bus Basic operations。
- Azure SQL。
- Functions executions。
- Application Insights ingestion。

## 22. Go / No-Go checklist

只有全部满足才邀请朋友：

- [ ] 旧 Resource Group 和旧 deployment credentials 已删除。
- [ ] SQL、Storage、Service Bus、Function App、Static Web App 和 Application Insights 都属于新 Beta Resource Group。
- [ ] Subscription 状态为 Active。
- [ ] Backend tests、frontend tests 和 production build 全部通过。
- [ ] SQL migration workflow 成功。
- [ ] Function deployment workflow 成功。
- [ ] Frontend deployment workflow 成功。
- [ ] Static Web Apps 已关联 Function App。
- [ ] SWA `/api/auth/me` 未登录返回 401。
- [ ] 注册、登录、刷新保持登录成功。
- [ ] Pre-check CRUD 成功。
- [ ] Training CRUD 成功。
- [ ] Trend Report 完成且 DLQ 为 0。
- [ ] Weekly Report SMTP、Timer、Queue、PDF、Blob 和 Email pipeline 已完整启用并测试。
- [ ] Application Insights 没有持续异常。
- [ ] Azure budget 已设置。
- [ ] Beta invite code 不是仓库默认值。
- [ ] 测试用户知道这是封闭 Beta，且数据可能需要在测试期清理。

## 23. 回滚

应用代码回滚：

```powershell
git revert <bad-commit>
git push origin main
```

push 后对应 GitHub Actions 会重新部署。

紧急停止后端：

```text
Function App
  -> Overview
  -> Stop
```

数据库 migration 不应通过手工删除表回滚。发生严重数据问题时，使用 Azure SQL point-in-time restore 创建恢复数据库，验证后再切换 Function App connection string。

如果 publish profile 或 deployment token 泄露：

1. 立即 reset/revoke credential。
2. 更新 GitHub Secret。
3. 检查 GitHub Actions 和 Azure Activity Log。

## 24. 已知非阻塞项与公开发布阻塞项

封闭 Beta 非阻塞项：

- 前端 production bundle 目前约 1.3 MB，Vite 有 chunk-size warning。
- Azure 资源仍通过 Portal 手工创建，尚未 IaC 化。
- Function deploy 仍使用 publish profile，而不是 OIDC。

公开发布阻塞项：

- 登录和注册没有 rate limiting/lockout。
- 没有邮箱验证和密码找回。
- 没有账号及个人数据自助删除。
- 没有正式隐私说明与数据保留策略。
- 没有真实 Azure SQL/Storage/Service Bus 的自动集成测试。
- 没有完整浏览器 E2E 测试。
