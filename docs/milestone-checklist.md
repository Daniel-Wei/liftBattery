# liftBattery Milestone Checklist

# liftBattery 阶段打卡清单

Legend:

图例：

- [ ] Not started / 未开始
- [~] In progress / 进行中
- [x] Completed / 已完成
- [!] Blocked or failed / 阻塞或失败

---

## Phase 0: Repo and Documentation Setup

## Phase 0：项目结构和文档搭建

Estimated time:

预计时间：

```txt
2-3 hours / 2-3 小时
```

Checklist:

清单：

* [x] Create `liftBattery` repo folder / 创建 `liftBattery` 项目文件夹
* [x] Create `README.md` / 创建 `README.md`
* [x] Create `docs/codex-instructions.md` / 创建 `docs/codex-instructions.md`
* [x] Create `docs/milestone-checklist.md` / 创建 `docs/milestone-checklist.md`
* [x] Create empty `client/` folder / 创建空的 `client/` 文件夹
* [x] Create empty `api/` folder / 创建空的 `api/` 文件夹
* [x] Confirm bilingual documentation / 确认文档为中英文双语
* [x] Confirm evidence-informed metric mapping / 确认基于证据启发的指标映射
* [x] Confirm final architecture: React + Azure Functions + Azure Service Bus + Docker / 确认最终架构：React + Azure Functions + Azure Service Bus + Docker
* [x] Confirm MVP boundaries / 确认 MVP 边界

Definition of done:

完成标准：

* Repo structure exists / 项目结构已存在
* Three bilingual markdown files exist / 三个中英文双语 Markdown 文件已存在
* Client and API folders exist / client 和 api 文件夹已存在
* Final architecture is documented as React + Azure Functions + Azure Service Bus + Docker / 最终架构已记录为 React + Azure Functions + Azure Service Bus + Docker

---

## Phase 1: Static Frontend UI

## Phase 1：静态前端 UI

Estimated time:

预计时间：

```txt
14-22 hours / 14-22 小时
```

Goal:

目标：

```txt
Create a static React frontend with mock data only.
只使用 mock 数据创建静态 React 前端。
```

Checklist:

清单：

* [x] Create React + TypeScript + Vite app / 创建 React + TypeScript + Vite 应用
* [x] Install and configure Tailwind CSS / 安装并配置 Tailwind CSS
* [x] Optionally install Recharts / 可选安装 Recharts
* [x] Create basic app shell / 创建基础应用布局
* [x] Create landing page / 创建首页
* [x] Create executive dashboard page / 创建总览 Dashboard 页面
* [x] Create plan and forecast page / 创建计划与预测页面
* [x] Create core/non-core page / 创建核心与非核心页面
* [x] Create capacity page / 创建容量页面
* [x] Create efficiency/productivity page / 创建效率与生产率页面
* [x] Create daily check-in page / 创建每日 Check-in 页面
* [x] Create trends page / 创建趋势页面
* [x] Create weekly review page / 创建每周复盘页面
* [x] Create settings page / 创建设置页面
* [x] Create metric card component / 创建指标卡片组件
* [x] Create core/non-core panel / 创建核心/非核心面板
* [x] Create plan utilisation panel / 创建计划使用率面板
* [x] Create recovery capacity panel / 创建恢复容量面板
* [x] Create forecast risk card / 创建预测风险卡片
* [x] Create training mode card / 创建训练模式卡片
* [x] Create Gantt timeline component / 创建 Gantt 时间线组件
* [x] Create trend line chart component / 创建趋势曲线组件
* [x] Create multi-metric chart component / 创建多指标图表组件
* [x] Create load monotony chart component / 创建负荷单调性图表组件
* [x] Create evidence note component / 创建证据说明组件
* [x] Create mock data file / 创建 mock 数据文件
* [x] Add Docker scaffold for React frontend / 添加 React 前端 Docker 脚手架
* [x] Add architecture documentation / 添加架构说明
* [x] Add responsive layout / 添加响应式布局
* [ ] Review UI manually / 手动 review UI

Definition of done:

完成标准：

* App runs locally / 应用可以本地运行
* All main pages exist / 所有主要页面已存在
* UI uses mock data only / UI 只使用 mock 数据
* Dashboard includes Core/Non-Core / Dashboard 包含 Core/Non-Core
* Dashboard includes Plan/Forecast / Dashboard 包含 Plan/Forecast
* Dashboard includes Utilisation/Capacity / Dashboard 包含 Utilisation/Capacity
* Dashboard includes Efficiency/Productivity proxy labels / Dashboard 包含 Efficiency/Productivity proxy 标签
* Dashboard includes Gantt-style timeline / Dashboard 包含 Gantt 风格时间线
* Trends page includes curve charts / 趋势页面包含曲线图
* Final architecture direction is React + Azure Functions + Azure Service Bus + Docker / 最终架构方向为 React + Azure Functions + Azure Service Bus + Docker
* No localStorage yet / 暂时没有 localStorage
* No backend yet / 暂时没有后端
* No authentication yet / 暂时没有登录认证
* No unsupported formulas / 没有无依据公式

---

## Phase 2: LocalStorage MVP

## Phase 2：LocalStorage MVP

Estimated time:

预计时间：

```txt
14-20 hours / 14-20 小时
```

Checklist:

清单：

* [ ] Add localStorage persistence / 添加 localStorage 持久化
* [ ] Save wellness check-ins / 保存 wellness check-in
* [ ] Save core work plan / 保存核心训练计划
* [ ] Save support load plan / 保存支持负荷计划
* [ ] Save load snapshots / 保存负荷快照
* [ ] Save nutrition snapshots / 保存营养快照
* [ ] Save weekly review / 保存每周复盘
* [ ] Display local history in dashboard / Dashboard 展示本地历史
* [ ] Display local history in trends / 趋势页展示本地历史

Definition of done:

完成标准：

* User can save daily data / 用户可以保存每日数据
* Data survives refresh / 数据刷新后仍存在
* Dashboard uses local data / Dashboard 使用本地数据
* Trends use local data / 趋势图使用本地数据

---

## Phase 3: Domain Logic

## Phase 3：业务逻辑抽离

Estimated time:

预计时间：

```txt
12-18 hours / 12-18 小时
```

Checklist:

清单：

* [ ] Create session-RPE load calculation / 创建 session-RPE 负荷计算
* [ ] Create volume load helper / 创建 volume load helper
* [ ] Create core utilisation calculation / 创建核心训练使用率计算
* [ ] Create support load utilisation calculation / 创建支持负荷使用率计算
* [ ] Create load monotony calculation if included / 如包含则创建 monotony 计算
* [ ] Create training strain calculation if included / 如包含则创建 strain 计算
* [ ] Create recovery capacity proxy / 创建恢复容量 proxy
* [ ] Create forecast watch logic / 创建预测观察逻辑
* [ ] Create deload watch logic / 创建 deload 观察逻辑
* [ ] Create cut pressure watch logic / 创建减脂压力观察逻辑
* [ ] Create training mode logic / 创建训练模式逻辑
* [ ] Move business logic out of React components / 将业务逻辑移出 React 组件
* [ ] Add simple unit tests if useful / 如有必要添加简单单元测试

Definition of done:

完成标准：

* Evidence-backed calculations are centralized / 有依据的计算逻辑已集中
* Heuristic metrics are labelled correctly / 启发式指标标签正确
* Risk watches work / 风险观察可用
* Components remain clean / 组件保持干净

---

## Phase 4: Backend API

## Phase 4：后端 API

Estimated time:

预计时间：

```txt
14-22 hours / 14-22 小时
```

Checklist:

清单：

* [ ] Create .NET 8 Azure Functions project / 创建 .NET 8 Azure Functions 项目
* [ ] Add Azure Functions Dockerfile / 添加 Azure Functions Dockerfile
* [ ] Add API service to Docker Compose / 将 API 服务加入 Docker Compose
* [ ] Document Azure Service Bus message boundaries / 记录 Azure Service Bus 消息边界
* [ ] Create models / 创建模型
* [ ] Create endpoints for check-ins / 创建 check-in API
* [ ] Create endpoints for plans / 创建计划 API
* [ ] Create endpoints for load snapshots / 创建负荷快照 API
* [ ] Create endpoints for nutrition snapshots / 创建营养快照 API
* [ ] Create endpoints for weekly reviews / 创建每周复盘 API
* [ ] Connect frontend to backend / 前端连接后端
* [ ] Add basic error handling / 添加基础错误处理

Definition of done:

完成标准：

* Backend runs locally / 后端可本地运行
* Azure Functions API runs in Docker locally / Azure Functions API 可在 Docker 中本地运行
* Azure Service Bus integration remains documented or implemented only when the phase explicitly includes it / Azure Service Bus 集成仅在对应阶段明确包含时才实现或记录
* Frontend can load and save data through backend / 前端可通过后端读取和保存数据

---

## Phase 5: Reminder System

## Phase 5：提醒系统

Estimated time:

预计时间：

```txt
6-10 hours / 6-10 小时
```

Checklist:

清单：

* [ ] Add daily check-in reminder / 添加每日 check-in 提醒
* [ ] Add weekly review reminder / 添加每周复盘提醒
* [ ] Add deload watch reminder / 添加 deload watch 提醒
* [ ] Add forecast risk reminder / 添加 forecast risk 提醒
* [ ] Plan Azure Service Bus queues or topics for reminder events / 规划用于提醒事件的 Azure Service Bus 队列或主题
* [ ] Add Azure Service Bus message flow for reminder processing / 添加用于提醒处理的 Azure Service Bus 消息流程
* [ ] Optional Azure Timer Trigger as a message producer / 可选使用 Azure Timer Trigger 作为消息生产者

Definition of done:

完成标准：

* User can see reminder states / 用户可以看到提醒状态
* Reminder logic is separate from UI / 提醒逻辑与 UI 分离
* Reminder events can be processed asynchronously through Azure Service Bus when implemented / 实现后提醒事件可通过 Azure Service Bus 异步处理

---

## Phase 6: Polish and Portfolio Readiness

## Phase 6：打磨和作品集准备

Estimated time:

预计时间：

```txt
8-12 hours / 8-12 小时
```

Checklist:

清单：

* [ ] Improve landing page / 优化首页
* [ ] Improve desktop dashboard / 优化桌面 Dashboard
* [ ] Improve mobile dashboard / 优化移动端 Dashboard
* [ ] Improve Gantt chart / 优化 Gantt 图
* [ ] Improve trend charts / 优化趋势图
* [ ] Improve evidence note UI / 优化证据说明 UI
* [ ] Add loading states / 添加 loading 状态
* [ ] Add empty states / 添加空状态
* [ ] Add README screenshots / 添加 README 截图
* [ ] Add architecture explanation / 添加架构说明
* [ ] Final manual testing / 最终手动测试

Definition of done:

完成标准：

* Project looks good in screenshots / 项目截图效果好
* README explains the product clearly / README 清楚解释产品
* Codebase is easy to understand / 代码结构容易理解
* Project is portfolio-ready / 项目适合作品集展示
