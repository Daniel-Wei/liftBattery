# liftBattery Architecture

# liftBattery 架构说明

---

## Final Target / 最终目标

### English

The final target architecture is:

```txt
React + TypeScript frontend
+ .NET 8 Azure Functions backend API
+ Azure Service Bus for async events, reminders, and queue-based workflows
+ Docker-based local development and build packaging
```

Phase 1 is still static frontend UI only. The Azure Functions API and Azure Service Bus workflows are planned for later phases and must not be treated as implemented yet.

### 中文

最终目标架构是：

```txt
React + TypeScript 前端
+ .NET 8 Azure Functions 后端 API
+ Azure Service Bus 用于异步事件、提醒和基于队列的流程
+ 基于 Docker 的本地开发和构建打包
```

Phase 1 仍然只是静态前端 UI。Azure Functions API 和 Azure Service Bus 流程是后续阶段规划，当前不能视为已经实现。

---

## Repository Layout / 项目结构

```txt
liftBattery/
  client/        React + TypeScript + Vite frontend
  api/           Future .NET 8 Azure Functions backend and Service Bus integration boundary
  docs/          Product, architecture, and milestone docs
  docker-compose.yml
```

```txt
liftBattery/
  client/        React + TypeScript + Vite 前端
  api/           后续 .NET 8 Azure Functions 后端和 Service Bus 集成边界
  docs/          产品、架构和阶段文档
  docker-compose.yml
```

---

## Runtime Shape / 运行形态

### English

Development and deployment should be able to use Docker:

- `client` builds the React app and serves it as static assets.
- `api` will later run a .NET 8 Azure Functions isolated worker app.
- Azure Service Bus will later decouple check-in events, reminders, and watch-state workflows from direct request handling.
- `docker-compose.yml` currently runs the frontend only; the API service should be added when Phase 4 creates the Functions project.

### 中文

开发和部署应能使用 Docker：

- `client` 构建 React 应用，并以静态资源方式提供。
- `api` 后续运行 .NET 8 Azure Functions isolated worker 应用。
- Azure Service Bus 后续用于解耦 check-in 事件、提醒和观察状态流程，避免全部塞进同步请求处理。
- 当前 `docker-compose.yml` 只运行前端；Phase 4 创建 Functions 项目后，再加入 API 服务。

---

## Phase Boundaries / 阶段边界

### English

Phase 1 may include Docker scaffolding, but it must not add:

- real backend endpoints
- Azure Service Bus queues, topics, subscriptions, or message handlers
- persistence
- authentication
- AI coach logic
- payment or subscription logic
- medical or diagnostic logic

### 中文

Phase 1 可以包含 Docker 脚手架，但不能添加：

- 真实后端 endpoint
- Azure Service Bus 队列、主题、订阅或消息处理器
- 持久化
- 登录认证
- AI 教练逻辑
- 支付或订阅逻辑
- 医学或诊断逻辑

---

## Future API Direction / 后续 API 方向

### English

The backend should be a .NET 8 Azure Functions API. Likely function areas:

- wellness check-ins
- core work plans
- support load plans
- load snapshots
- nutrition snapshots
- weekly reviews
- settings

The API should expose training operations data, not medical diagnosis.

---

## Future Azure Service Bus Role / 后续 Azure Service Bus 角色

### English

Azure Service Bus is part of the final architecture, but it is not implemented in Phase 1.

Planned uses:

- publish a message when a daily log is submitted
- queue reminder jobs for daily logs and weekly reviews
- process watch-state events such as deload watch, recovery watch, and cut pressure watch
- decouple Azure Functions request handlers from background processing

Example future message names:

```txt
daily-log-submitted
weekly-review-due
watch-state-raised
reminder-scheduled
notification-requested
```

### 中文

Azure Service Bus 属于最终架构的一部分，但 Phase 1 不实现。

后续用途：

- 用户提交每日记录后发布消息
- 为每日记录和每周复盘排队提醒任务
- 处理 deload watch、recovery watch、cut pressure watch 等观察状态事件
- 将 Azure Functions 的同步请求处理和后台流程解耦

后续消息名称示例：

```txt
daily-log-submitted
weekly-review-due
watch-state-raised
reminder-scheduled
notification-requested
```

### 中文

后端应使用 .NET 8 Azure Functions API。可能的 function 领域：

- wellness check-in
- core work plans
- support load plans
- load snapshots
- nutrition snapshots
- weekly reviews
- settings

API 应提供训练运营数据，不提供医学诊断。
