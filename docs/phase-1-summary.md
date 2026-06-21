# liftBattery Phase 1 Summary / liftBattery Phase 1 阶段总结

## English

Phase 1 creates a static React + TypeScript + Vite + Tailwind frontend for liftBattery. It uses mock data only and presents a SaaS-style training operations dashboard for serious lifters.

No localStorage, backend API, authentication, AI coach, payment, subscription, social feed, medical diagnosis, or unsupported formula logic was added.

The final target architecture is now documented as React + .NET 8 Azure Functions + Azure Service Bus + Docker. Phase 1 includes Docker scaffolding for the React frontend only; the Azure Functions API and Azure Service Bus integration remain planned for later phases.

## 中文

Phase 1 创建了 liftBattery 的静态 React + TypeScript + Vite + Tailwind 前端。当前只使用 mock 数据，并呈现面向认真训练者的 SaaS 风格训练运营 Dashboard。

没有添加 localStorage、后端 API、登录认证、AI 教练、支付、订阅、社交动态流、医学诊断或无依据公式逻辑。

最终目标架构已明确为 React + .NET 8 Azure Functions + Azure Service Bus + Docker。Phase 1 只加入 React 前端 Docker 脚手架；Azure Functions API 和 Azure Service Bus 集成仍规划在后续阶段。

---

## Static Pages Completed / 已完成静态页面

- Landing Page / 首页
- Executive Dashboard / 总览 Dashboard
- Plan & Forecast / 计划与预测
- Core / Non-Core / 核心与非核心
- Capacity / 容量
- Efficiency & Productivity / 效率与生产率
- Daily Check-in / 每日 Check-in
- Trends / 趋势
- Weekly Review / 每周复盘
- Settings / 设置

Settings now includes a final architecture card for React + Azure Functions + Azure Service Bus + Docker.

Settings 页面现在包含 React + Azure Functions + Azure Service Bus + Docker 的最终架构卡片。

## Reusable Components Completed / 已完成可复用组件

- AppShell
- Sidebar
- TopBar
- MetricCard
- StatusBadge
- CoreNonCorePanel
- PlanUtilisationPanel
- RecoveryCapacityPanel
- ForecastRiskCard
- TrainingModeCard
- PrepTimelineGantt
- TrendLineChart
- MultiMetricChart
- LoadMonotonyChart
- CheckInSlider
- WeeklyReviewCard
- EvidenceNote
- EmptyState

## Architecture / 架构

- Final architecture documented in `README.md`, `docs/codex-instructions.md`, and `docs/architecture.md`.
- React frontend Docker scaffold added with `client/Dockerfile`, `client/nginx.conf`, `.dockerignore`, and `docker-compose.yml`.
- API folder remains a planned .NET 8 Azure Functions backend; Azure Service Bus remains planned for later asynchronous event, reminder, and watch-state workflows.

- 最终架构已写入 `README.md`、`docs/codex-instructions.md` 和 `docs/architecture.md`。
- React 前端 Docker 脚手架已添加：`client/Dockerfile`、`client/nginx.conf`、`.dockerignore` 和 `docker-compose.yml`。
- API 文件夹仍为后续 .NET 8 Azure Functions 后端规划；Azure Service Bus 仍规划用于后续异步事件、提醒和观察状态流程。

## Mock Data Added / 已添加 mock 数据

- mock user profile / mock 用户资料
- mock training block / mock 训练周期
- mock training phases / mock 训练阶段
- mock core work plans / mock 核心训练计划
- mock support load plans / mock 支持负荷计划
- mock wellness check-ins / mock wellness check-in
- mock load snapshots / mock 负荷快照
- mock nutrition snapshots / mock 营养快照
- mock ops metrics / mock 运营指标
- mock risk watches / mock 风险观察
- mock training mode / mock 训练模式
- mock weekly review / mock 每周复盘
- mock trend data / mock 趋势数据

## Evidence-Informed Metric Mapping / 基于证据启发的指标映射

- Core Utilisation: completed hard sets / planned hard sets; simple arithmetic.
- Support Load Utilisation: completed support work / planned support work; simple arithmetic.
- sRPE Training Load: session RPE x duration; established internal load monitoring method.
- Recovery Capacity: wellness self-report proxy using fatigue, sleep, soreness, stress, hunger, mood, and training drive.
- Forecast Risk: trend-based watch state using load, wellness, capacity, and performance patterns.
- Efficiency Proxy: stimulus-to-fatigue style heuristic; not exact physiology.
- Productivity Trend: core completion and performance trend proxy; not muscle growth measurement.
- MV/MEV/MAV/MRV: expert heuristic volume landmark language only.

- Core Utilisation：实际 hard sets / 计划 hard sets；简单算术。
- Support Load Utilisation：实际支持工作 / 计划支持工作；简单算术。
- sRPE Training Load：session RPE x duration；已有内部负荷监控方法。
- Recovery Capacity：基于疲劳、睡眠、酸痛、压力、饥饿、情绪和训练动力的 wellness 自评 proxy。
- Forecast Risk：基于负荷、wellness、容量和表现趋势的 watch 状态。
- Efficiency Proxy：stimulus-to-fatigue 风格启发式；不是精确生理测量。
- Productivity Trend：核心完成度和表现趋势 proxy；不是肌肉增长测量。
- MV/MEV/MAV/MRV：仅作为专家启发式 volume landmark 语言。

## What Remains Static or Mocked / 仍然静态或 mock 的内容

- All app data is imported from `client/src/data/mockData.ts`.
- Page navigation uses React state only.
- Check-in controls are static visualizations and do not save input.
- Forecast, capacity, efficiency, productivity, monotony, and strain are displayed as mock trend/proxy/watch examples.
- 所有应用数据都来自 `client/src/data/mockData.ts`。
- 页面导航只使用 React state。
- Check-in 控件是静态展示，不保存输入。
- Forecast、Capacity、Efficiency、Productivity、Monotony 和 Strain 都是 mock 的 trend/proxy/watch 示例。

## What to Review Manually / 建议手动 Review

- Whether the UI feels like modern enterprise SaaS applied to training, not a generic gym app.
- Whether Core/Non-Core, Plan/Forecast, Utilisation/Capacity, Efficiency/Productivity, and Risk are visible enough.
- Whether proxy/heuristic/watch labels are clear and not overclaiming.
- Whether the density is SaaS-like but still readable on mobile.
- Whether any wording feels like diagnosis, coach replacement, or unsupported formula science.
- UI 是否像现代企业 SaaS 应用于训练，而不是普通健身 App。
- Core/Non-Core、Plan/Forecast、Utilisation/Capacity、Efficiency/Productivity 和 Risk 是否足够明显。
- proxy/heuristic/watch 标签是否清楚，是否避免过度宣称。
- 信息密度是否有 SaaS 感，同时移动端仍可读。
- 文案是否有诊断、教练替代或无依据公式感。

## Phase 2 Later / Phase 2 后续方向

- Add localStorage persistence for wellness check-ins, core work plans, support load plans, load snapshots, nutrition snapshots, and weekly reviews.
- Generate dashboard and trends from local saved data.
- Add editable setup for mode, cycle length, training goal, target muscles, and units.
- Keep evidence-backed formulas and heuristic proxy labels separate.
- 添加 localStorage 保存 wellness check-in、核心训练计划、支持负荷计划、负荷快照、营养快照和每周复盘。
- 让 Dashboard 和趋势图读取本地保存数据。
- 添加可编辑的模式、周期长度、训练目标、重点肌群和单位设置。
- 继续区分有依据公式和启发式 proxy 标签。

---

# Code File Explanations / 代码文件说明

## Client Setup / 客户端配置

| File / 文件 | EN | 中文 |
|---|---|---|
| `client/package.json` | Added React, Vite, TypeScript, Tailwind v4, Recharts, lucide-react, and scripts for dev/build/preview. Exists to define the frontend app and commands. Review dependency choices and ports. | 添加 React、Vite、TypeScript、Tailwind v4、Recharts、lucide-react 和 dev/build/preview 脚本。用于定义前端应用和命令。请 review 依赖选择和端口。 |
| `client/package-lock.json` | Generated by npm install to lock exact dependency versions. Exists for reproducible installs. Review only if dependency versions matter. | 由 npm install 生成，用于锁定依赖版本，保证安装可复现。只有依赖版本敏感时需要 review。 |
| `client/index.html` | Added Vite HTML entry and product metadata. Exists as the browser entry point. Review title and description copy. | 添加 Vite HTML 入口和产品 metadata。作为浏览器入口。请 review 标题和描述文案。 |
| `client/tsconfig.json` | Added TypeScript project references. Exists to coordinate app and config builds. Review if project references change later. | 添加 TypeScript 项目引用。用于协调应用和配置构建。后续项目引用变化时 review。 |
| `client/tsconfig.app.json` | Added strict React app compiler settings. Exists to type-check `src`. Review strictness expectations. | 添加严格 React 应用编译配置。用于检查 `src`。请 review 类型严格度预期。 |
| `client/tsconfig.node.json` | Added TypeScript settings for Vite config. Exists so tooling config type-checks. Review if tooling changes. | 添加 Vite 配置的 TypeScript 设置。用于让工具配置可类型检查。工具链变化时 review。 |
| `client/vite.config.ts` | Added Vite React and Tailwind plugins. Exists to run dev/build. Review Tailwind v4 plugin use. | 添加 Vite React 和 Tailwind 插件。用于运行开发和构建。请 review Tailwind v4 插件用法。 |
| `client/src/vite-env.d.ts` | Added Vite client type reference. Exists for Vite environment typing. Review when env vars are added. | 添加 Vite client 类型引用。用于 Vite 环境类型。后续添加 env 变量时 review。 |
| `.dockerignore` | Added Docker build ignore rules for node modules, build output, IDE files, and env files. Exists to keep Docker build context clean. Review whether additional local files should be excluded. | 添加 Docker 构建忽略规则，排除 node modules、构建产物、IDE 文件和 env 文件。用于保持 Docker build context 干净。请 review 是否还要排除其他本地文件。 |
| `docker-compose.yml` | Added a frontend Docker Compose service and commented Phase 4 API service direction. Exists to make Docker part of the final architecture without pretending the API exists yet. Review port `8080` and Phase 4 comments. | 添加前端 Docker Compose 服务，并用注释标出 Phase 4 API 服务方向。用于把 Docker 纳入最终架构，同时不假装 API 已存在。请 review `8080` 端口和 Phase 4 注释。 |
| `client/Dockerfile` | Added a multi-stage Docker build for the React frontend using Node and Nginx. Exists to containerize the frontend. Review base image choices. | 添加 React 前端多阶段 Docker 构建，使用 Node 和 Nginx。用于容器化前端。请 review 基础镜像选择。 |
| `client/nginx.conf` | Added Nginx config for serving the Vite static build and SPA fallback. Exists for the frontend Docker runtime image. Review caching and fallback behavior. | 添加用于提供 Vite 静态构建和 SPA fallback 的 Nginx 配置。用于前端 Docker 运行镜像。请 review 缓存和 fallback 行为。 |
| `api/README.md` | Added API architecture placeholder for future .NET 8 Azure Functions and Azure Service Bus work. Exists to clarify that backend and asynchronous messaging are planned but not implemented in Phase 1. Review Phase 4 API scope and later Service Bus boundaries. | 添加未来 .NET 8 Azure Functions 和 Azure Service Bus 工作的 API 架构占位说明。用于明确后端和异步消息规划已存在但 Phase 1 尚未实现。请 review Phase 4 API 范围和后续 Service Bus 边界。 |

## App Entry / 应用入口

| File / 文件 | EN | 中文 |
|---|---|---|
| `client/src/main.tsx` | Added React root rendering and global CSS import. Exists as the React entry point. Review if providers or routing are added later. | 添加 React 根渲染和全局 CSS 引入。作为 React 入口。后续添加 provider 或 routing 时 review。 |
| `client/src/App.tsx` | Added static page navigation for all Phase 1 pages and scroll-to-top on page change. Exists to switch pages without a router. Review nav labels and default landing behavior. | 添加所有 Phase 1 页面的静态导航，并在切页时回到顶部。用于无 router 的页面切换。请 review 导航标签和默认首页行为。 |
| `client/src/styles.css` | Added Tailwind import and global browser styles. Exists for base typography, selection, and scrollbar polish. Review global visual feel. | 添加 Tailwind 引入和全局浏览器样式。用于基础字体、选区和滚动条打磨。请 review 全局视觉感觉。 |

## Types / 类型文件

| File / 文件 | EN | 中文 |
|---|---|---|
| `client/src/types/training.ts` | Added training mode, block, phase, core work, support load, load snapshot, and today's mode types. Exists to model training operations. Review type names and phase categories. | 添加训练模式、训练周期、阶段、核心训练、支持负荷、负荷快照和今日训练模式类型。用于建模训练运营。请 review 类型命名和阶段分类。 |
| `client/src/types/wellness.ts` | Added wellness check-in and check-in dimension types. Exists for subjective readiness and RIR/RPE fields. Review included dimensions. | 添加 wellness check-in 和 check-in 维度类型。用于主观 readiness 和 RIR/RPE 字段。请 review 维度是否合适。 |
| `client/src/types/nutrition.ts` | Added nutrition snapshot type. Exists for calories, macros, and bodyweight trend mock data. Review nutrition fields. | 添加营养快照类型。用于热量、宏量和体重趋势 mock 数据。请 review 营养字段。 |
| `client/src/types/operations.ts` | Added ops metric, utilisation, capacity, efficiency, and weekly review types. Exists for SaaS-style training metrics. Review evidence type labels. | 添加运营指标、使用率、容量、效率和每周复盘类型。用于 SaaS 风格训练指标。请 review 证据类型标签。 |
| `client/src/types/forecast.ts` | Added risk watch, trend point, and forecast point types. Exists for risk cards and chart data. Review watch type taxonomy. | 添加风险观察、趋势点和预测点类型。用于风险卡片和图表数据。请 review watch 类型分类。 |
| `client/src/types/user.ts` | Added user profile/settings type. Exists for mode, goal, priority muscles, and units. Review settings scope. | 添加用户资料和设置类型。用于模式、目标、重点肌群和单位。请 review 设置范围。 |

## Mock Data / Mock 数据

| File / 文件 | EN | 中文 |
|---|---|---|
| `client/src/data/mockData.ts` | Added all mock user, block, phase, core/support plans, wellness, load, nutrition, ops metrics, risk watches, training mode, weekly review, trends, and forecast data. Exists as the only Phase 1 data source. Review realism, evidence labels, and copy tone. | 添加所有 mock 用户、训练周期、阶段、核心/支持计划、wellness、负荷、营养、运营指标、风险观察、训练模式、每周复盘、趋势和预测数据。作为 Phase 1 唯一数据源。请 review 真实感、证据标签和文案语气。 |

## Components / 组件

| File / 文件 | EN | 中文 |
|---|---|---|
| `client/src/components/AppShell.tsx` | Added layout wrapper combining sidebar, top bar, and page content. Exists for consistent SaaS layout. Review desktop/mobile spacing. | 添加组合侧边栏、顶部栏和页面内容的布局壳。用于统一 SaaS 布局。请 review 桌面和移动间距。 |
| `client/src/components/Sidebar.tsx` | Added dark desktop sidebar navigation. Exists to create the enterprise SaaS navigation feel. Review label density and hierarchy. | 添加深色桌面侧边导航。用于营造企业 SaaS 导航感。请 review 标签密度和层级。 |
| `client/src/components/TopBar.tsx` | Added sticky top bar and mobile bottom navigation. Exists for responsive navigation. Review mobile nav comfort with 10 pages. | 添加 sticky 顶部栏和移动端底部导航。用于响应式导航。请 review 10 个页面下移动导航是否顺手。 |
| `client/src/components/MetricCard.tsx` | Added reusable SaaS metric card with status, trend, icon, and evidence note. Exists for Core, Capacity, Load, Forecast, Efficiency, and Productivity metrics. Review evidence clarity. | 添加可复用 SaaS 指标卡，包含状态、趋势、图标和证据说明。用于 Core、Capacity、Load、Forecast、Efficiency 和 Productivity 指标。请 review 证据说明清晰度。 |
| `client/src/components/StatusBadge.tsx` | Added reusable status, training mode, and evidence-type badges. Exists to label proxy/trend/watch concepts clearly. Review wording and colors. | 添加可复用状态、训练模式和证据类型标签。用于清楚标注 proxy/trend/watch 概念。请 review 文案和颜色。 |
| `client/src/components/CoreNonCorePanel.tsx` | Added Core vs Support Load allocation panel. Exists to visualize core completion and non-core overload. Review support load interpretation. | 添加 Core vs Support Load 分配面板。用于展示核心完成和非核心超载。请 review 支持负荷解读。 |
| `client/src/components/PlanUtilisationPanel.tsx` | Added completed vs planned progress bars. Exists for utilisation concepts. Review metric selection. | 添加实际 vs 计划进度条。用于 utilisation 概念。请 review 指标选择。 |
| `client/src/components/RecoveryCapacityPanel.tsx` | Added recovery capacity proxy panel with capacity gap and evidence note. Exists for capacity page/dashboard. Review proxy disclaimer. | 添加恢复容量 proxy 面板，包含容量缺口和证据说明。用于容量页和 Dashboard。请 review proxy 免责声明。 |
| `client/src/components/ForecastRiskCard.tsx` | Added risk watch card with signals and recommendations. Exists for deload/cut/capacity/non-core watches. Review non-diagnostic wording. | 添加风险观察卡，包含信号和建议。用于 deload、减脂、容量、非核心观察。请 review 非诊断文案。 |
| `client/src/components/TrainingModeCard.tsx` | Added Push/Maintain/Lighter/Recovery Priority mode card. Exists for today's training mode. Review mode descriptions. | 添加 Push/Maintain/Lighter/Recovery Priority 模式卡。用于今日训练模式。请 review 模式描述。 |
| `client/src/components/PrepTimelineGantt.tsx` | Added static Gantt-style training block timeline. Exists for block phase context. Review phase colors and mobile scroll. | 添加静态 Gantt 风格训练周期时间线。用于训练阶段上下文。请 review 阶段颜色和移动端滚动。 |
| `client/src/components/TrendLineChart.tsx` | Added reusable single-metric Recharts line chart. Exists for trend pages. Review labels and axis readability. | 添加可复用单指标 Recharts 曲线图。用于趋势页面。请 review 标签和坐标轴可读性。 |
| `client/src/components/MultiMetricChart.tsx` | Added generic multi-line chart for trend/forecast data. Exists for dashboard, forecast, and efficiency comparisons. Review color contrast. | 添加通用多指标曲线图，用于趋势和预测数据。用于 Dashboard、Forecast 和 Efficiency 对比。请 review 颜色对比。 |
| `client/src/components/LoadMonotonyChart.tsx` | Added monotony/strain bar chart with evidence note. Exists for load-pattern watch. Review whether monotony/strain should remain Phase 1 display-only. | 添加 monotony/strain 柱状图和证据说明。用于负荷模式观察。请 review monotony/strain 是否保持 Phase 1 仅展示。 |
| `client/src/components/CheckInSlider.tsx` | Added static check-in slider visualization. Exists for wellness, RIR/RPE, and sRPE fields. Review daily check-in length. | 添加静态 check-in slider 展示。用于 wellness、RIR/RPE 和 sRPE 字段。请 review 每日记录长度。 |
| `client/src/components/WeeklyReviewCard.tsx` | Added weekly operating review card. Exists for weekly summary, utilisation, support ratio, capacity change, and next review focus. Review review structure. | 添加每周运营复盘卡。用于周总结、使用率、支持负荷比例、容量变化和下周重点。请 review 复盘结构。 |
| `client/src/components/EvidenceNote.tsx` | Added reusable bilingual evidence/disclaimer note. Exists to keep proxy/heuristic/watch boundaries visible. Review copy tone. | 添加可复用双语证据/免责声明模块。用于保持 proxy/heuristic/watch 边界可见。请 review 文案语气。 |
| `client/src/components/EmptyState.tsx` | Added reusable static/empty-state block. Exists for Phase 1 mock-only surfaces. Review whether empty states are too explanatory. | 添加可复用静态/空状态模块。用于 Phase 1 mock-only 区域。请 review 空状态是否解释过多。 |

## Pages / 页面

| File / 文件 | EN | 中文 |
|---|---|---|
| `client/src/pages/LandingPage.tsx` | Added dark SaaS-style product landing page and dashboard preview. Exists to introduce liftBattery positioning. Review whether it feels enterprise SaaS but still fitness-specific. | 添加深色 SaaS 风格产品首页和 Dashboard 预览。用于介绍 liftBattery 定位。请 review 是否既有企业 SaaS 感又有训练产品感。 |
| `client/src/pages/ExecutiveDashboardPage.tsx` | Added main dashboard with metrics, Core/Non-Core, Capacity, Plan Utilisation, trends, Gantt, training mode, and risk watches. Exists as the core app screen. Review dashboard hierarchy. | 添加主 Dashboard，包含指标、Core/Non-Core、Capacity、Plan Utilisation、趋势、Gantt、训练模式和风险观察。作为核心页面。请 review Dashboard 层级。 |
| `client/src/pages/PlanForecastPage.tsx` | Added weekly plan, 7-day forecast chart, and risk cards. Exists for Plan/Forecast workflows. Review forecast boundary language. | 添加每周计划、7 天预测图和风险卡。用于 Plan/Forecast 工作流。请 review 预测边界文案。 |
| `client/src/pages/CoreNonCorePage.tsx` | Added core/support detail page and heuristic boundary note. Exists to explain work allocation. Review examples of core and support work. | 添加核心/支持负荷详情页和启发式边界说明。用于解释训练分配。请 review 核心和支持训练示例。 |
| `client/src/pages/CapacityPage.tsx` | Added recovery capacity proxy page with wellness metrics. Exists for capacity monitoring. Review whether proxy labels are clear. | 添加恢复容量 proxy 页面和 wellness 指标。用于容量监控。请 review proxy 标签是否清楚。 |
| `client/src/pages/EfficiencyProductivityPage.tsx` | Added efficiency/productivity proxy page with charts and heuristic disclaimer. Exists for output vs fatigue review. Review overclaim risk. | 添加效率/生产率 proxy 页面，包含图表和启发式免责声明。用于产出 vs 疲劳复盘。请 review 是否有过度宣称风险。 |
| `client/src/pages/DailyCheckInPage.tsx` | Added static wellness, RIR/RPE, and sRPE check-in page. Exists for daily inputs in future phases. Review friction and field count. | 添加静态 wellness、RIR/RPE 和 sRPE check-in 页面。用于后续每日输入。请 review 使用阻力和字段数量。 |
| `client/src/pages/TrendsPage.tsx` | Added trend charts for load, recovery, bodyweight, cardio, calories, carbs, monotony, and strain. Exists for pattern review. Review chart count and readability. | 添加负荷、恢复、体重、有氧、热量、碳水、monotony 和 strain 趋势图。用于模式复盘。请 review 图表数量和可读性。 |
| `client/src/pages/WeeklyReviewPage.tsx` | Added weekly operating review page and risk watch changes. Exists for weekly review workflow. Review summary language. | 添加每周运营复盘页面和风险观察变化。用于周复盘流程。请 review 总结语言。 |
| `client/src/pages/SettingsPage.tsx` | Added static settings preview with mode, goal, priority muscles, units, heuristic disclaimer, and final architecture card. Exists to preview Phase 2 setup and confirm React + Azure Functions + Azure Service Bus + Docker direction. Review setting scope and architecture wording. | 添加静态设置预览，包含模式、目标、重点肌群、单位、启发式免责声明和最终架构卡片。用于预览 Phase 2 设置并确认 React + Azure Functions + Azure Service Bus + Docker 方向。请 review 设置范围和架构文案。 |

---

## Verification / 验证

- `npm install` completed successfully.
- `npm run build` completed successfully.
- Browser checked desktop dashboard and mobile dashboard at `http://127.0.0.1:5192`.
- Fixed React state navigation scroll behavior so pages open at the top on mobile.
- Confirmed no `localStorage`, `fetch`, axios, authentication, payment, or subscription implementation in `client/src`.
- Confirmed no Tailwind `tracking-*` letter-spacing classes in `client/src`.
- `npm run build` still passes after architecture and Docker scaffold changes.
- Docker CLI was not available in this environment, so Docker Compose was not executed locally.

- `npm install` 已成功完成。
- `npm run build` 已成功完成。
- 已在 `http://127.0.0.1:5192` 检查桌面 Dashboard 和移动端 Dashboard。
- 已修复 React state 导航的滚动位置问题，移动端切页会回到顶部。
- 已确认 `client/src` 中没有 `localStorage`、`fetch`、axios、登录、支付或订阅实现。
- 已确认 `client/src` 中没有 Tailwind `tracking-*` 字距类。
- 架构和 Docker 脚手架变更后，`npm run build` 仍然通过。
- 当前环境没有 Docker CLI，因此未在本地执行 Docker Compose。
