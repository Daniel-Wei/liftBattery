# liftBattery Azure DevOps 与本地开发手册

审计日期：2026-11-17（悉尼）。本次只改开发流程与 CI，不更改业务、数据库架构或现有 GitHub 部署。Azure CI 不部署、不运行数据库迁移、不需要任何应用密钥。

## 1. 先选工作目录

| 目录 | 用途 | 当前内容 |
| --- | --- | --- |
| `C:\Users\dddww\Documents\Codex\liftBattery` | 原工作树，继续开发现有产品 | `main` 上有未提交的教练 UI 和相关测试；保留原样 |
| `C:\Users\dddww\Documents\Codex\liftBattery-azure-devops` | 独立工作树，检查 CI、PR 模板和练习 | 从已提交的 `main`（`bcad510`）建立；不含原工作树的未提交内容 |

这两个目录共享 Git 历史和分支，文件内容及本机配置各自独立。原 `origin` 仍指向原 GitHub 仓库。现有 GitHub Actions 构建并部署 Azure Functions 和 Static Web Apps，触发条件包含 `main` 及相应路径；SQL migration workflow 需手动确认。不要把本次练习推到 GitHub，以免与已有部署流程混淆。

### Azure Repos → GitHub：同步代码，不部署

Azure Repos 的 `main` 是开发主线，GitHub 的 `main` 只接收已经验证的同一 SHA。其他分支和标签不参与同步，不强推。GitHub 仓库是公开的，合入 Azure `main` 的提交历史将同步公开。同步不会改动现有部署工作流；需要部署时另外确认并运行对应的部署流程。

自动同步默认关闭。启用前，在 GitHub Actions 保存 `AZURE_MIRROR_READ_TOKEN`（仅限 LiftBattery 组织，Azure DevOps **Code: Read** 和 **Build: Read**），在 Azure 的 **LiftBattery CI** 保存秘密变量 `GitHubMainMirrorDispatchToken`（仅限 `Daniel-Wei/liftBattery`，GitHub **Contents: Read and write**）。不要把令牌写进仓库或发送到聊天。首先在 GitHub 手动运行 **Mirror validated Azure main** 并指定一个已通过的 Azure CI build ID，核对不触发部署；确认后再将 Azure 管道变量 `EnableGitHubMainMirror` 设为 `true`。

同步作业会核对 CI 结果、当前 Azure `main` 和 GitHub `main` 的祖先关系，只允许快进更新。实际推送使用 GitHub Actions 的临时作业令牌，因此不会再触发这里的 `push` 事件部署。两端 SHA 相同才报告成功。如果 GitHub 有独有提交或候选提交改动了 GitHub workflow，作业会停下让人检查，不覆盖任何提交。

后端是 .NET 8、Azure Functions v4 isolated worker、EF Core 8 / SQL Server；没有 `.sln`。后端 xUnit 测试项目引用 API 项目，所以从测试 `.csproj` restore/build 会覆盖两者。前端为 React 18、TypeScript、Vite、npm 锁文件及 Vitest。

## 2. Windows 本地开发和启动

开发准备：Git、[.NET 8 SDK](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)、[Node.js 24 LTS](https://nodejs.org/en/about/previous-releases)（含 npm）、[Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)。Windows 建议使用 Microsoft 的 Core Tools 安装器；本机现有的 npm 版本可以先用 `func --version` 确认，但从 `dotnet run` 启动时 Windows 优先使用原生安装的工具。

```powershell
git --version
dotnet --list-sdks
node --version
npm --version
func --version
```

### 模式 A：只改 UI 或预览教练工作台

打开 PowerShell，在**原工作树**执行。这个入口不需要 Azure 登录、API、SQL 或 Service Bus；会使用浏览器中的独立演示数据。

```powershell
Set-Location 'C:\Users\dddww\Documents\Codex\liftBattery\client'
npm ci
$env:VITE_API_BASE_URL = '/api'
npm run dev
```

打开 [教练工作台演示](http://127.0.0.1:5192/?workspace=demo)。也可以从登录页点「先看看教练工作台」。已提交的 `bcad510` 没有这轮教练页面；若在 CI 工作树启动，会显示原有个人训练应用。改 React/CSS 后 Vite 自动刷新；停止用 `Ctrl+C`。如要看静态生产包，可运行 `npm run build` 后 `npm run preview`，默认端口 4192。构建预览用于 UI 检查；联调 API 请用 Vite dev server 的代理。

### 模式 B：本地登录、训练记录、练前检查

1. **准备开发数据服务。** 需要一个独立的开发 SQL Server 数据库和 Azurite 的 Blob / Queue / Table。已有 SQL Server 可以直接用；Azurite 可单独运行 `azurite --location .azurite`，保持终端开启。若已经使用本仓库已有的 Compose，可在仓库根目录运行 `docker compose up -d sqlserver azurite`；它已有 SQL `14333` 与 Azurite `10000–10002` 的映射。本次不要求安装 Docker，不修改 Compose，也不要删除现有 SQL volume 来重设密码。

2. **建立本机配置。** 在你要启动的仓库根目录执行。已有文件不覆盖：

   ```powershell
   $settings = '.\backend\LiftBattery.Api\local.settings.json'
   if (-not (Test-Path -LiteralPath $settings)) {
     Copy-Item -LiteralPath '.\backend\LiftBattery.Api\local.settings.example.json' -Destination $settings
   }
   git check-ignore backend/LiftBattery.Api/local.settings.json
   ```

   在 `Values` 中填 `ConnectionStrings__LiftBatteryDatabase`（只选本地或专用开发库）、`AzureWebJobsStorage=UseDevelopmentStorage=true`、`FUNCTIONS_WORKER_RUNTIME=dotnet-isolated`、`Auth__RequireSecureCookie=false` 和自选的本地 `Auth__BetaInviteCode`。例子使用本机 SQL `127.0.0.1,14333`，账号、密码和库名以你本地安装为准。保留模板中的队列和 timer 名称，不填生产连接串、Application Insights 或 SMTP。仅开发 HTTP 操作时，在 `Values` 中添加：

   ```json
   "AzureWebJobs.EnqueueDueWeeklyReports.Disabled": "true",
   "AzureWebJobs.ProcessWeeklyReportJob.Disabled": "true",
   "AzureWebJobs.RecoverPendingTrendReportEnqueues.Disabled": "true",
   "AzureWebJobs.ConvergeTimedOutTrendReportJobs.Disabled": "true",
   "AzureWebJobs.ProcessTrendReportJob.Disabled": "true"
   ```

   这是要合到现有 `Values` 的片段。JSON 最后一项后不要留逗号。不要上传实际配置文件，或把密钥放到 `VITE_*`；Vite 配置会进入浏览器。优先用进程环境变量设置 `VITE_API_BASE_URL`，当前仓库不自动忽略所有 `.env` 文件。[本地 Functions 配置](https://learn.microsoft.com/en-us/azure/azure-functions/functions-develop-local) · [禁用单个函数](https://learn.microsoft.com/en-us/azure/azure-functions/disable-function)

3. **只对开发 SQL 运行迁移。** 当前项目的设计时 factory 优先读 `local.settings.json`，仅改同名环境变量不能可靠覆盖该文件。先在编辑器确认服务器和数据库是开发目标，再执行。下例把 EF 8 装到单独的工具目录，不替换现有全局 EF 工具：

   ```powershell
   $apiProject = '.\backend\LiftBattery.Api\LiftBattery.Api.csproj'
   $settingsPath = '.\backend\LiftBattery.Api\local.settings.json'
   $devDb = (Get-Content -Raw -LiteralPath $settingsPath | ConvertFrom-Json).Values.ConnectionStrings__LiftBatteryDatabase
   if ([string]::IsNullOrWhiteSpace($devDb)) { throw '请先配置本地开发 SQL' }
   # 这里使用本机 SQL；如确需专用远程开发库，先单独确认目标，不移除保护后照搬。
   $sqlBuilder = [System.Data.SqlClient.SqlConnectionStringBuilder]::new($devDb)
   if ($sqlBuilder.DataSource -notmatch '^(?:127[.]0[.]0[.]1|localhost|[.])(?:[,\\].*)?$') {
     throw '不是明确的本地 SQL 地址，停止迁移'
   }
   Write-Host ('迁移目标：' + $sqlBuilder.DataSource + ' / ' + $sqlBuilder.InitialCatalog)
   $efTools = Join-Path $env:LOCALAPPDATA 'LiftBatteryDevTools\EF8'
   $ef = Join-Path $efTools 'dotnet-ef.exe'
   if (-not (Test-Path -LiteralPath $ef)) {
     dotnet tool install dotnet-ef --version 8.0.8 --tool-path $efTools
     if ($LASTEXITCODE -ne 0) { throw 'EF 工具安装失败' }
   }
   & $ef database update --project $apiProject --startup-project $apiProject
   if ($LASTEXITCODE -ne 0) { throw '数据库迁移失败，请先检查开发库' }
   ```

4. **启动后端，保持终端 A 开启。** SQL 与 Azurite 就绪后，在仓库根目录执行。本机实测需要显式启动 Functions host：

   ```powershell
   Set-Location .\backend\LiftBattery.Api
   dotnet build -c Release
   if ($LASTEXITCODE -ne 0) { throw '后端构建失败' }
   func start --script-root .\bin\Release\net8.0 --no-build --port 7071
   ```

   项目会在构建时将 `host.json` 和本机 `local.settings.json` 复制到输出目录。改后端代码或本机配置后，先 `Ctrl+C` 停掉 host，再重新构建并启动。当前机器的 npm 版 Core Tools 下，直接 `dotnet run` 会报 worker 缺少 `HostEndpoint`；这不是 SQL 错误，不要手填 gRPC 地址。优先使用上述命令；安装原生 Core Tools 后可按 [isolated worker 指南](https://learn.microsoft.com/en-us/azure/azure-functions/dotnet-isolated-process-guide) 尝试 SDK 启动。

5. **启动前端，保持终端 B 开启。** 在另一个 PowerShell 进入同一仓库的 `client`：

   ```powershell
   npm ci
   $env:VITE_API_BASE_URL = '/api'
   npm run dev
   ```

   打开 [本地应用](http://127.0.0.1:5192/)，用第 2 步设置的本地邀请码注册测试账号。Vite 将 `/api` 转发到 `http://localhost:7071`，同源访问让登录 Cookie 正常工作。验证顺序：

   ```powershell
   curl.exe -i http://localhost:7071/api/auth/me
   curl.exe -i http://127.0.0.1:5192/api/auth/me
   ```

   没有登录时两个请求都应返回 401，这只验证端口和路由。再用 UI 注册、登录并保存一笔训练和练前检查，以验证 SQL、Storage 和会话。教练工作区新增数据仍在当前浏览器，不能用上述 SQL 路径验证跨设备同步。

6. **需要完整报告联调时**，使用单独的开发 Service Bus namespace / queues，按 [仓库现有配置说明](../backend/LiftBattery.Api/SERVICE_BUS_SETUP.md) 配置 `ServiceBusConnection` 与队列名，然后只恢复要测试的触发器。Azurite 不模拟 Service Bus。周报 SMTP 只接测试收件地址；以实际消费、报告保存和测试邮件验证，从未登录的 401 或空队列无法证明报告可用。

常见问题：

- 5192 或 7071 被占用：`Get-NetTCPConnection -State Listen -LocalPort 5192,7071` 查进程，仅停止自己的开发服务。Vite 固定 5192，改 API 端口要同步代理。
- Vite 返回 502 或连接被拒：先检查 7071 的 HTTP 响应及 host 日志。若返回 HTML 而非 JSON，检查 API URL 与代理。
- SQL 连接失败 / 表缺失：确认开发实例、密码、库名、端口和迁移。Azurite 表相关错误：确认三个模拟器端口及 `AzureWebJobsStorage`。
- 本地登录失败：检查本地邀请码、`Auth__RequireSecureCookie=false` 及浏览器是否使用同一个 `127.0.0.1:5192` 地址。

### 提交前运行与 Azure CI 同样的检查

从所选工作树根目录执行。每条命令必须成功再继续；CI 使用独立 step，失败即停止。

```powershell
$tests = 'backend/LiftBattery.Api.Tests/LiftBattery.Api.Tests.csproj'
dotnet restore $tests
dotnet build $tests -c Release --no-restore
dotnet test $tests -c Release --no-build --no-restore
Push-Location client
npm ci
npm test
npm run build
Pop-Location
```

## 3. 接入现有 Azure DevOps

复用组织、项目、Boards 和已有仓库。以 Azure DevOps 页面地址区分组织与项目：`https://dev.azure.com/<组织>/<项目>`；在 **Repos → Files → Clone → HTTPS** 复制无密钥的仓库地址。检查所用身份对该项目有读权限；后续需仓库 Contribute / Create branch、Pipeline 编辑和队列权限，设置保护时再由有 **Edit policies / Manage permissions** 的管理员操作。服务连接只在日后部署需要，这个构建不需要。

Windows 如还没有 Azure CLI，安装 [Microsoft 官方 Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli-windows)，然后重新开 PowerShell：

```powershell
az --version
az extension show --name azure-devops
# 仅在扩展不存在时执行安装：
az extension add --name azure-devops
az login --allow-no-subscriptions --output none
```

本机已安装 Microsoft 便携 Azure CLI 2.93.0 和 Azure DevOps 扩展 1.0.11，未改系统 PATH。用它时，在运行上述命令前执行 `$env:Path = "$env:LOCALAPPDATA\LiftBatteryDevTools\AzureCLI\bin;$env:Path"`。审计时 CLI 未登录，尚无已确认组织／项目／仓库。`az login` 要求你亲自完成账号及 MFA 登录；如属于来宾租户，指定正确 `--tenant <tenant-id>`。必要时依据组织政策用 `az devops login --organization $org`，在提示中输入最小权限 PAT，不放入命令、URL、日志或 Git。Git HTTPS 通过 Git Credential Manager 登录，因此 Git 凭据和 Azure CLI 登录要分别验证。[Azure DevOps CLI](https://learn.microsoft.com/en-us/azure/devops/cli/) · [PAT 登录](https://learn.microsoft.com/en-us/azure/devops/cli/log-in-via-pat) · [Git 身份认证](https://learn.microsoft.com/en-us/azure/devops/repos/git/auth-overview)

```powershell
$org = 'https://dev.azure.com/<组织>'
$project = '<已有项目名>'
$repo = '<已有仓库名>'
az devops project list --organization $org -o table
az repos list --organization $org --project $project -o table
az repos show --organization $org --project $project --repository $repo --query '{id:id,remoteUrl:remoteUrl,defaultBranch:defaultBranch}'
```

项目或仓库查不到时先检查登录账号及读取权限；列表空并不自动等于不存在。确认该项目没有此仓库且已获准创建时，才用 `az repos create --organization $org --project $project --name $repo` 或在 UI 建立**空仓库**；不初始化 README 或其他提交。不要创建新组织或 Board。

在 CI 工作树检查远程，再添加新别名。若 `azure-devops` 已存在，只校验地址，不覆盖：

```powershell
git remote -v
# 仅在新别名不存在时运行：
git remote add azure-devops '<从已有 Azure Repo 复制的 HTTPS Clone URL>'
git ls-remote --symref azure-devops HEAD
git ls-remote --heads --tags azure-devops
git fetch azure-devops
```

如果已有稳定分支，要先比较远端与本地基线，例如 `git log --left-right --oneline azure-devops/main...main`。Azure 仓库若已有不同历史，停止引导推送并确认正确仓库与历史；不使用镜像导入覆盖、`--force`、`--all`，也不自动创建远端分支。

## 4. 分支和引导 CI

- **稳定分支**：当前沿用 `main`，对应需求的 `master` 职责；不改名，不新增平行的长期 `master`。如果已有 Azure Repos 本来使用 `master`，仅在确认属于同一历史后沿用其实际稳定分支。YAML 同时接受 `main`、`master` 和 `develop` 的提交触发。
- **`develop`**：集成分支，从验证通过的稳定基线建立一次。短期 `feature/*`、`bugfix/*` 从它出发并提 PR 回它；`spike/*` 用于实验，允许放弃不合并。
- **`hotfix/*`**：从稳定分支出发，PR 回稳定分支，再通过 PR 同步到 `develop`。

以下推送、远端分支、Pipeline 和保护规则需要先确认，不是已执行步骤。

1. 如果 Azure Repo 已有同历史的稳定分支，先审核本地 `codex/azure-devops-ci`，只推这个源分支：`git push -u azure-devops codex/azure-devops-ci`。首次引入 YAML 以 PR 合并；如已有保护，遵守现行规则。若是已确认的**空仓库**，批准后可先以显式 ref 引导 `git push azure-devops codex/azure-devops-ci:refs/heads/main`，随后确认 Azure 默认分支。此步骤只写 Azure Repos，不写 GitHub。
2. 在 **Pipelines → New pipeline → Azure Repos Git → Existing Azure Pipelines YAML file** 选实际仓库及已推送且包含 YAML 的分支。先查是否已有同一仓库和 YAML 的 CI，存在则复用。CLI 等价方式：

   ```powershell
   $yamlBranch = '<包含已推送 YAML 的分支>'
   az pipelines list --organization $org --project $project -o table
   az pipelines create --organization $org --project $project --name 'liftBattery CI' --repository $repo --repository-type tfsgit --branch $yamlBranch --yaml-path azure-pipelines.yml --skip-first-run true
   # 记录定义 ID；下次可以复用该定义，不重复创建。
   $pipelineId = [int](Read-Host '输入已确认的 Pipeline 定义 ID')
   az pipelines run --id $pipelineId --branch $yamlBranch --organization $org --project $project
   ```

3. 确认 Azure agent 的 restore、build、测试安装及构建步骤均成功。YAML 合并后，在 Pipeline 的 **Default branch for manual and scheduled builds** 检查默认分支为稳定分支。用已验证的稳定提交建立 `develop`：在 Azure Repos 的 **Branches → New branch** 选择稳定分支作为基线；若 `develop` 已存在，不覆盖。首次稳定发布前，明确当前基线和待发布的功能范围。
4. 在稳定分支和 `develop` 上启用下一节的保护。之后的 PR CI 由目标分支的 **Build validation** 执行合并候选提交，Azure Repos 不依赖 YAML 的 `pr:`。不要用草稿 PR 验证自动校验。[Pipeline CLI](https://learn.microsoft.com/en-us/cli/azure/pipelines?view=azure-cli-latest#az-pipelines-create) · [Azure Repos YAML 触发器](https://learn.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git?view=azure-devops#pr-triggers)

## 5. 保护稳定分支与 develop

在 **Repos → Branches → ⋯ → Branch policies** 为两个分支分别配置。先检查现有规则，更新原规则而非复制：

| 设置 | 推荐 |
| --- | --- |
| Build validation | 选 `liftBattery CI`，Automatic、Required，无路径过滤；目标分支更新时立即过期并重新校验 |
| Check for linked work items | Required |
| Check for comment resolution | Required |
| Limit merge types | 开 Squash；如需保留长期分支的共同历史，也允许 Merge (no fast-forward) 用于长期分支相互同步。日常短分支用 Squash |
| Minimum reviewers | 单人阶段关闭。不设置必须由他人审核的策略 |
| Branch security | 对日常账号禁用 Force push（包含删除分支／标签）及 push 或 complete PR 的 bypass；检查继承或建分支时的直接 Allow |

如果想练习投票，可另设最低 1 票，开启 **Allow requestors to approve their own changes**，关闭 **Prohibit the most recent pusher from approving their own changes**，避免同时设独立 required reviewer。自批是一道自检，不是独立审核。实际设置视组织额外策略而定。不要给自己的日常身份开 bypass 来绕过失败验证。

CLI 示例（仅在获准改策略并确认没有同类配置时执行）。`$stable` 设为确认过的实际分支，`$repoId` 为上节查到的 ID：

```powershell
$stable = 'main'
$repoId = az repos show --organization $org --project $project --repository $repo --query id -o tsv
foreach ($branch in @($stable, 'develop')) {
  az repos policy list --repository-id $repoId --branch $branch --org $org --project $project -o table
}
# 先审阅列表；下面给出对一个已存在分支的命令，随后可针对另一分支重复。
$branch = $stable
$scope = @('--repository-id', $repoId, '--branch', $branch, '--branch-match-type', 'exact', '--organization', $org, '--project', $project, '--enabled', 'true', '--blocking', 'true')
az repos policy build create @scope --build-definition-id $pipelineId --display-name 'Required CI' --manual-queue-only false --queue-on-source-update-only false --valid-duration 0
az repos policy work-item-linking create @scope
az repos policy comment-required create @scope
az repos policy merge-strategy create @scope --allow-squash true --allow-no-fast-forward true --allow-rebase false --allow-rebase-merge false
```

每条命令失败时停止查看实际权限或策略，不继续重复创建。分支权限建议在 UI 复查有效权限。[分支策略](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-policies?view=azure-devops) · [分支安全](https://learn.microsoft.com/en-us/azure/devops/repos/git/branch-permissions?view=azure-devops) · [构建策略 CLI](https://learn.microsoft.com/en-us/cli/azure/repos/policy/build)

## 6. 第一个练习 PR：从 Boards 到 Squash

1. 在已有 Board 建一个 Task 或 User Story，题为「验证 liftBattery PR 工作流」，记下 ID。进入新工作树，确认干净，从已受保护的 `azure-devops/develop` 建立自己的短分支。预备分支 `feature/azure-devops-pr-practice` 是一个仅修改文档的提交；将该提交挑到真实练习分支，避免带入前期 bootstrap 历史。

   ```powershell
   $workItemId = [int](Read-Host '输入 Azure Boards 工作项 ID')
   $branchName = "feature/$workItemId-azure-devops-pr"
   git status --short
   git fetch azure-devops
   git switch -c $branchName azure-devops/develop
   git cherry-pick feature/azure-devops-pr-practice
   git log --oneline azure-devops/develop..HEAD
   git diff --stat azure-devops/develop...HEAD
   # 取得推送许可后，仅推真实练习分支：
   git push -u azure-devops $branchName
   ```

2. 在 **Repos → Pull requests → New pull request** 选 `feature/<ID>-azure-devops-pr → develop`，填模板并验证右侧 **Work items** 显示正确 ID。模板在 Azure Repo 默认分支出现后会自动填入；引导 PR 可以手工复制。非草稿状态会触发目标分支 CI。CLI 等价：

   ```powershell
   az repos pr create --organization $org --project $project --repository $repo --source-branch $branchName --target-branch develop --title 'docs: verify Azure DevOps PR workflow' --work-items $workItemId --draft false --delete-source-branch false --open
   ```

3. 打开 PR **Files**，留一个真实的检查评论，例如「能否明确以下启动方式是否需要 Azure 账号？」。本地改文档后提交到原源分支，查看新迭代，回复并 Resolve 该线程。单人可自己完成这次自检，有合作者时请对方评审。
4. 验证阻断：只在这条**未合并的练习分支**上暂时给 YAML 增加一个明确命名的失败 step（Ubuntu `- script: exit 1`），提交并按约定获准后推送。等对应的 **required** 校验显示 Failed，确认 Complete 不可用，不点绕过或 auto-complete。再用正常提交移除此临时 step（不改/删除任何原有 CI step），推送，等待最新合并候选变绿。实际失败验证不会通过关闭测试或改远程规则完成。
5. 链接 Work Item、评论已解决、最新 CI 通过后，在 **Complete** 选 **Squash commit**，保留源分支。用 **Commits / Boards** 检查合并只引入一个文档提交，工作项仍有关联。建议在 PR 详情保留通过/失败构建链接作为练习记录。

[链接 Boards 工作项](https://learn.microsoft.com/en-us/azure/devops/boards/backlogs/connect-work-items-to-git-dev-ops?view=azure-devops) · [PR 模板](https://learn.microsoft.com/en-us/azure/devops/repos/git/pull-request-templates?view=azure-devops) · [审查 PR](https://learn.microsoft.com/en-us/azure/devops/repos/git/review-pull-requests?view=azure-devops) · [Squash merge](https://learn.microsoft.com/en-us/azure/devops/repos/git/merging-with-squash?view=azure-devops)

## 7. 发布 V1：何时可以打标签

本地审计结果：干净基线的 .NET restore / Release build / xUnit **48 通过、0 跳过**；锁文件安装 / Vitest **34 通过** / Vite build 成功。原工作树包含未提交的新教练页面，分别验证 .NET **48 通过**、前端 **55 通过**及生产构建成功。后者不是一个可发布的 Git 提交。

本机启动冒烟：5192 的教练演示入口与前端入口模块返回 200；使用本地 Azurite 和已禁用异步触发器的 Functions host，7071 及经 5192 代理的 `/api/auth/me` 均返回预期 401。SQL 服务未运行，未执行迁移、注册或报告联调，401 不验证数据库。

发布前还要处理这些具体问题：

- 先确定第一版到底发布已提交的个人训练应用，还是包含当前未提交的教练管理 UI。选择后者就单独整理、review 和提交；浏览器本机保存不可当成云端的多学员数据服务。
- `npm ci` 提示完整依赖树 10 条漏洞（其中 2 critical、5 high），本次 `npm audit --omit=dev` 为 0。梳理开发/构建依赖告警、升级与回归；本次没有改依赖或者把 audit 当成已解决。Vite 报大包警告，尤其 3D / 图表资源，构建成功但后续可评估加载。
- GitHub 前端部署现有 Node 20 已停止支持；新 CI 与实测本机使用 Node 24。先单独升级 GitHub 工作流并验证 Azure，避免此次接入误触发部署。[Node 支持状态](https://nodejs.org/en/about/previous-releases)
- Azure Repos CI 尚无远程实测。候选提交走受保护 PR，再对**合并后的稳定 SHA**运行 Azure CI。β 环境按 [现有上线手册](beta-go-live-runbook.md) 验证注册登录、数据隔离、SQL 迁移、训练保存、趋势与周报队列／通知及 3D；公网扩大发布前检查手册中列的认证与数据管理门槛。不用本地单元测试代替线上验收。

只有发布范围已确认，测试、CI 和实际环境冒烟都通过，才准备下面这个带注释的标签。暂不执行：

```powershell
git fetch azure-devops --tags
git tag --list v1.0.0
# 如果远端或本地已经有 v1.0.0，停止并定位现有标签；不覆盖。
git log -1 azure-devops/main
$verifiedSha = '<被 CI 和实际验收核对过的稳定分支 SHA>'
git tag -a v1.0.0 $verifiedSha -m 'liftBattery v1.0.0'
git show --no-patch v1.0.0
# 另行批准后才执行：
# git push azure-devops refs/tags/v1.0.0
```

标签使用实际稳定分支基线，`develop` 仍可在该已核实的提交建立，已有 `develop` 不重写。打标签不发布 Azure 应用或 GitHub Release。若要将 GitHub 继续作为发布渠道，先明确两库同步方向、发布权限和现有 workflow 触发条件。

## 8. Azure DevOps 排障

- 没有 `az` / 扩展：检查终端 PATH、便携目录或重新开 PowerShell；扩展用 `az extension show --name azure-devops`。
- 401 / 403 / 找不到项目：确认是正确登录身份、租户、组织 URL、项目与 repo 访问权限。从 Repos 的 Clone 对话框复制 HTTPS URL，避免把 GitHub URL 用于 Azure。
- 排队没有 agent：在 **Organization settings → Pipelines → Parallel jobs** 检查可用并行容量；不要自行开通计费。[Microsoft-hosted parallel jobs](https://learn.microsoft.com/en-us/azure/devops/pipelines/licensing/concurrent-jobs)
- PR 没自动跑：目标分支要存在 Required Build validation，选择正确 Pipeline，PR 退出 Draft，检查 YAML 和 Pipeline 权限。
- CI 绿了仍无法合并：检查是否是最新候选构建、是否有未解决评论、未链接工作项或继承/必需的审查策略。不要 force-push、跳过校验或绕过保护。

## 9. 变更说明 / File notes

File / 文件：`azure-pipelines.yml`

- EN — What: CI for .NET 8 and Node 24 covering the real project graph, both existing test suites and the frontend build. Why: validate branches and Azure Repos PR candidates without deploy credentials. Review: branch filters, step paths, fail-on-error behavior and required PR policy attachment.
- 中文 — 修改：为实际项目和现有测试添加 .NET 8、Node 24 CI。目的：验证提交与 PR，不依赖部署凭据。Review：分支过滤、路径、错误是否阻断及 PR 策略是否绑定。

File / 文件：`.azuredevops/pull_request_template.md`

- EN — What: lightweight PR checklist for intent, tests, risks and migrations. Why: keep solo review traceable. Review: verify coverage and that the template appears once the default branch contains it.
- 中文 — 修改：补充意图、验证、风险和迁移检查项。目的：让单人自检可追踪。Review：确认清单够用，且 Azure 默认分支合并后模板可见。

File / 文件：`docs/azure-devops-workflow.md`

- EN — What: repository audit, Windows startup and Azure DevOps runbook. Why: make setup, PR drills and release gates repeatable. Review: organization/repo/branch names, local settings, hosted capacity and the verified release SHA.
- 中文 — 修改：记录审计、Windows 启动与 Azure DevOps 全流程。目的：可重复执行配置、练习和发布检查。Review：真实组织／仓库／分支名、本地配置、Agent 容量和发布 SHA。
