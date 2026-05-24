# LiftOps API

# LiftOps API 说明

## English

The final backend target is a .NET 8 Azure Functions API with Azure Service Bus for future asynchronous events, reminders, and watch-state processing.

Phase 1 does not implement backend endpoints or Azure Service Bus integration. This folder is intentionally reserved for a later Azure Functions project.

Expected Phase 4 work:

- create a .NET 8 Azure Functions isolated worker project
- add models for check-ins, plans, load snapshots, nutrition snapshots, weekly reviews, and settings
- add API endpoints
- define Azure Service Bus message contracts for daily logs, reminders, and watch-state events
- add an Azure Functions Dockerfile
- add the API service to `docker-compose.yml`

## 中文

最终后端目标是 .NET 8 Azure Functions API，并在后续使用 Azure Service Bus 处理异步事件、提醒和观察状态流程。

Phase 1 不实现后端 endpoint，也不实现 Azure Service Bus 集成。当前文件夹刻意保留给后续 Azure Functions 项目。

Phase 4 预期工作：

- 创建 .NET 8 Azure Functions isolated worker 项目
- 添加 check-ins、plans、load snapshots、nutrition snapshots、weekly reviews 和 settings 模型
- 添加 API endpoints
- 定义用于每日记录、提醒和观察状态事件的 Azure Service Bus 消息契约
- 添加 Azure Functions Dockerfile
- 将 API 服务加入 `docker-compose.yml`
