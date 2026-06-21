# CodeX Development Instructions for liftBattery

# liftBattery 的 CodeX 开发指令

---

## 1. Working Style / 工作方式

### English

CodeX must work phase by phase.

Each phase may include multiple files.

Do not restrict each response to only one file.

However, CodeX must not jump ahead into future phases.

For each created or modified code file, CodeX must provide a bilingual explanation.

### 中文

CodeX 必须按 Phase 阶段推进。

每个 Phase 可以包含多个文件。

不要限制成每次只写一个文件。

但是，CodeX 不能跳到未来 Phase 的功能。

每创建或修改一个代码文件后，CodeX 必须提供中英文双语解释。

---

## 2. File Explanation Rule / 文件解释规则

### English

After creating or modifying each code file, explain:

- File path
- What was added or changed
- Why the file exists
- What the user should review

### 中文

每创建或修改一个代码文件后，需要解释：

- 文件路径
- 添加或修改了什么
- 为什么需要这个文件
- 用户应该 review 什么

### Required Format / 必须格式

```txt
File:
文件：

EN:
What was added or changed:
Why this file exists:
What to review:

中文：
添加或修改了什么：
为什么需要这个文件：
需要 review 什么：
```

---

## 3. Current Task / 当前任务

### English

For this task, start Phase 1 directly after creating the three markdown files.

Phase 1 is Static Frontend UI.

Phase 1 should use mock data only.

Do not add localStorage, backend API, authentication, AI, payment, or medical diagnosis features.

### 中文

本次任务中，在创建三个 Markdown 文档后，直接开始 Phase 1。

Phase 1 是静态前端 UI。

Phase 1 只使用 mock 数据。

不要添加 localStorage、后端 API、登录认证、AI、支付或医学诊断功能。

---

## 3.1 Final Architecture / 最终架构

### English

The final intended architecture for liftBattery is:

* React + TypeScript frontend
* .NET 8 Azure Functions backend API
* Azure Service Bus for future asynchronous events, reminders, and queue-based watch-state processing
* Docker for local development, reproducible builds, and deployment packaging

Phase 1 must still remain static frontend UI with mock data only.

Docker scaffolding may be added in Phase 1, but it must not introduce real backend endpoints, Azure Service Bus queues/topics/subscriptions, persistence, authentication, or AI logic.

### 中文

liftBattery 的最终目标架构是：

* React + TypeScript 前端
* .NET 8 Azure Functions 后端 API
* Azure Service Bus 用于后续异步事件、提醒和基于队列的观察状态处理
* Docker 用于本地开发、可复现构建和部署打包

Phase 1 仍必须保持为静态前端 UI，只使用 mock 数据。

Phase 1 可以添加 Docker 脚手架，但不能引入真实后端 endpoint、Azure Service Bus 队列/主题/订阅、持久化、登录认证或 AI 逻辑。

---

## 4. UI Direction / UI 方向

### English

The UI should look like a modern SaaS-style training operations dashboard.

It should feel like:

* Linear
* Vercel
* modern analytics dashboard
* premium fitness tracking
* TrainingPeaks-like structure but more modern
* AthleteMonitoring concepts but not old-school UI

It should not feel like:

* generic fitness app
* social fitness app
* medical questionnaire
* old athlete monitoring software
* Excel dashboard with rounded corners
* coach admin backend

Design principles:

* clean
* dense but readable
* SaaS-like
* premium
* serious fitness aesthetic
* clear hierarchy
* dashboard-first
* desktop + mobile responsive
* dark sidebar or dark top navigation
* light main analytics canvas
* charts and Gantt timeline
* Core / Non-Core / Plan / Forecast / Utilisation language visible

### 中文

UI 应该像一个现代 SaaS 风格训练运营 Dashboard。

它应该接近：

* Linear
* Vercel
* 现代数据分析 Dashboard
* 高级健身追踪产品
* TrainingPeaks 的结构感，但更现代
* AthleteMonitoring 的概念，但不要老派 UI

它不应该像：

* 普通健身 App
* 社交健身 App
* 医疗问卷
* 老派运动员监控软件
* 带圆角的 Excel Dashboard
* 教练后台管理系统

设计原则：

* 干净
* 信息密度高但可读
* SaaS 感
* 高级
* 严肃健身审美
* 层级清晰
* Dashboard 优先
* 桌面端 + 移动端响应式
* 深色侧边栏或深色顶部导航
* 浅色主分析画布
* 图表和 Gantt 时间线
* 明确展示 Core / Non-Core / Plan / Forecast / Utilisation 语言

---

## 5. Evidence Rules / 证据规则

### English

Do not invent scientific formulas.

Only use:

* established formulas such as session-RPE load = session RPE x duration
* simple arithmetic such as completed work / planned work
* trend/proxy labels for heuristic metrics
* clearly labelled watch states for risk patterns

Metrics like Efficiency, Productivity, Capacity, and Forecast must be labelled as:

* proxy
* trend
* watch
* estimate
* heuristic

Do not present them as exact science.

### 中文

不要发明科学公式。

只能使用：

* 已有公式，例如 session-RPE load = session RPE x duration
* 简单算术，例如 completed work / planned work
* 对启发式指标使用 trend / proxy 标签
* 对风险模式使用 watch 状态

Efficiency、Productivity、Capacity、Forecast 等指标必须标注为：

* proxy
* trend
* watch
* estimate
* heuristic

不要把它们展示成精确科学。

---

## 6. Suggested Frontend Structure / 推荐前端结构

```txt
client/src/
  components/
    AppShell.tsx
    Sidebar.tsx
    TopBar.tsx
    MetricCard.tsx
    StatusBadge.tsx
    CoreNonCorePanel.tsx
    PlanUtilisationPanel.tsx
    RecoveryCapacityPanel.tsx
    ForecastRiskCard.tsx
    TrainingModeCard.tsx
    PrepTimelineGantt.tsx
    TrendLineChart.tsx
    MultiMetricChart.tsx
    LoadMonotonyChart.tsx
    CheckInSlider.tsx
    WeeklyReviewCard.tsx
    EvidenceNote.tsx
    EmptyState.tsx

  pages/
    LandingPage.tsx
    ExecutiveDashboardPage.tsx
    PlanForecastPage.tsx
    CoreNonCorePage.tsx
    CapacityPage.tsx
    EfficiencyProductivityPage.tsx
    DailyCheckInPage.tsx
    TrendsPage.tsx
    WeeklyReviewPage.tsx
    SettingsPage.tsx

  data/
    mockData.ts

  types/
    operations.ts
    training.ts
    wellness.ts
    nutrition.ts
    forecast.ts
    user.ts

  App.tsx
  main.tsx
```

This structure can be adjusted if needed, but do not over-engineer.

这个结构可以根据需要调整，但不要过度工程化。

---

## 7. Phase 1 Pages / Phase 1 页面

Create static UI pages for:

创建以下静态 UI 页面：

1. Landing Page / 首页
2. Executive Dashboard / 总览 Dashboard
3. Plan & Forecast Page / 计划与预测页面
4. Core / Non-Core Page / 核心与非核心页面
5. Capacity Page / 容量页面
6. Efficiency & Productivity Page / 效率与生产率页面
7. Daily Check-in Page / 每日 Check-in 页面
8. Trends Page / 趋势页面
9. Weekly Review Page / 每周复盘页面
10. Settings Page / 设置页面

The dashboard must show Core Utilisation, Support Load Utilisation, Recovery Capacity, Training Load, Forecast Risk, Efficiency Proxy, Productivity Trend, Gantt timeline, multi-metric chart, and risk alerts.

总览 Dashboard 必须展示 Core Utilisation、Support Load Utilisation、Recovery Capacity、Training Load、Forecast Risk、Efficiency Proxy、Productivity Trend、Gantt 时间线、多指标图表和风险提醒。

---

## 8. Data Models / 数据模型

### TrainingMode / 训练模式

```ts
export type TrainingMode =
  | "push"
  | "maintain"
  | "lighter"
  | "recoveryPriority";
```

### TrainingBlock / 训练周期

```ts
export type TrainingBlock = {
  id: string;
  name: string;
  mode:
    | "cut"
    | "contestPrep"
    | "photoshootPrep"
    | "highFatigueBlock"
    | "maintenancePerformance";
  currentWeek: number;
  totalWeeks: number;
  currentPhase: string;
  targetDate?: string;
};
```

### OpsMetric / 运营指标

```ts
export type OpsMetric = {
  id: string;
  label: string;
  labelZh: string;
  value: string;
  trend: "up" | "down" | "stable";
  status: "good" | "watch" | "risk" | "neutral";
  evidenceType:
    | "established"
    | "simpleArithmetic"
    | "heuristic"
    | "proxy"
    | "watch";
  explanation: string;
  explanationZh: string;
};
```

### RiskWatch / 风险观察

```ts
export type RiskWatch = {
  id: string;
  type:
    | "deloadWatch"
    | "cutPressureWatch"
    | "recoveryRisk"
    | "performanceRisk"
    | "nonCoreOverload"
    | "capacityGap";
  severity: "low" | "medium" | "high";
  title: string;
  titleZh: string;
  signals: string[];
  signalsZh: string[];
  recommendation: string;
  recommendationZh: string;
};
```

---

## 9. Do Not Do / 不要做

Do not:

不要：

* Build all phases at once
  一次性完成所有 Phase

* Add localStorage in Phase 1
  Phase 1 添加 localStorage

* Add backend in Phase 1
  Phase 1 添加后端

* Add authentication in Phase 1
  Phase 1 添加登录

* Add AI coach
  添加 AI 教练

* Invent unsupported formulas
  发明没有依据的公式

* Present proxy metrics as exact science
  把 proxy 指标展示成精确科学

* Add medical diagnosis
  添加医学诊断

* Add eating disorder diagnosis
  添加饮食障碍诊断

* Add RED-S diagnosis
  添加 RED-S 诊断

* Add extreme dieting advice
  添加极端节食建议

* Add PED or drug advice
  添加药物或 PED 建议

* Add coach messaging
  添加教练沟通系统

* Add social feed
  添加社交动态流

* Add payment or subscription
  添加支付或订阅
