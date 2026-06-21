# liftBattery

## English

liftBattery is a SaaS-style training operations dashboard for serious lifters.

It translates enterprise management concepts such as Core/Non-Core, Plan, Forecast, Utilisation, Capacity, Efficiency, Productivity, and Risk into evidence-informed training-state management.

The product does not invent scientific formulas from scratch. It maps product metrics to established or commonly used training monitoring concepts such as session-RPE training load, volume load, RIR/RPE autoregulation, subjective wellness monitoring, monotony/strain, periodisation, bodyweight trend, and expert heuristic volume landmarks such as MV, MEV, MAV, and MRV.

liftBattery is not a medical app, not a diagnosis tool, and not a coach replacement.

## Final Architecture

The final intended architecture is:

- React + TypeScript frontend
- .NET 8 Azure Functions backend API
- Azure Service Bus for future asynchronous training events, reminders, and watch-state processing
- Docker for reproducible local development and containerized builds

Phase 1 remains frontend-only and mock-data-only. Azure Functions, Azure Service Bus, persistence, and backend integration belong to later phases.

## 中文

liftBattery 是一个面向认真训练者的 SaaS 风格训练运营 Dashboard。

它把 Core/Non-Core、Plan、Forecast、Utilisation、Capacity、Efficiency、Productivity 和 Risk 等企业管理概念，翻译成基于证据启发的训练状态管理语言。

产品不会从零发明所谓科学公式，而是把产品指标映射到已有或常用的训练监控概念，例如 session-RPE 训练负荷、volume load、RIR/RPE 自我调节、主观 wellness 监控、monotony/strain、周期化、体重趋势，以及 MV、MEV、MAV、MRV 等专家启发式 volume landmarks。

liftBattery 不是医疗 App，不是诊断工具，也不是教练替代品。

## 最终架构

最终目标架构是：

- React + TypeScript 前端
- .NET 8 Azure Functions 后端 API
- Azure Service Bus 用于后续异步训练事件、提醒和观察状态处理
- Docker 用于可复现本地开发和容器化构建

Phase 1 仍然只做前端和 mock 数据。Azure Functions、Azure Service Bus、持久化和前后端集成都属于后续阶段。

---

# 1. Product Overview / 产品概览

## English

Most fitness apps track what the user did:

- sets
- reps
- load
- calories
- bodyweight
- cardio

liftBattery focuses on training operations:

- Did the user complete core work?
- Did support work exceed plan?
- Is recovery capacity falling?
- Is training load becoming monotonous?
- Is cut pressure rising?
- Is productivity trending down?
- Is today a Push, Maintain, Lighter, or Recovery Priority day?

## 中文

大多数健身 App 记录用户做了什么：

- 组数
- 次数
- 重量
- 热量
- 体重
- 有氧

liftBattery 关注的是训练运营：

- 用户是否完成核心训练？
- 支持性训练是否超过计划？
- 恢复容量是否下降？
- 训练负荷是否变得过于单调？
- 减脂压力是否上升？
- 训练生产率是否下降？
- 今天应该 Push、Maintain、Lighter，还是 Recovery Priority？

---

# 2. Core Product Concept / 核心产品概念

## English

liftBattery is a self-coaching dashboard.

It is designed for:

- self-coached serious lifters
- natural bodybuilders
- people in cutting phases
- people in physique prep
- people running high-fatigue strength or hypertrophy blocks
- users who already track training and nutrition but lack state interpretation

## 中文

liftBattery 是一个自我管理型训练 Dashboard。

它适合：

- 自我管理型认真训练者
- 自然健身 / 健美爱好者
- 减脂期用户
- 形体备赛用户
- 正在执行高疲劳力量或增肌周期的人
- 已经记录训练和饮食，但缺少状态解释的人

---

# 3. Evidence-Informed Mapping / 基于证据启发的映射

## English

liftBattery uses enterprise SaaS concepts as product language, but the underlying logic must be mapped to training monitoring concepts.

| SaaS Concept | Training Product Concept | Evidence-Informed Basis |
|---|---|---|
| Core | Core Work | Planned hard sets, priority lifts, specificity |
| Non-Core | Support Load | Accessories, cardio, optional work |
| Plan | Weekly Training Plan | Periodisation, volume load, sRPE load |
| Forecast | Risk Forecast | Load trend, wellness trend, monotony/strain |
| Utilisation | Plan Completion | Completed vs planned work |
| Capacity | Recovery Capacity | Wellness, sleep, fatigue, soreness, stress, MRV heuristic |
| Efficiency | Training Efficiency Proxy | Stimulus-to-fatigue heuristic, output vs fatigue trend |
| Productivity | Productive Training Output | Core completion, performance trend, RIR/RPE adherence |
| Risk | Watch State | Deload Watch, Cut Pressure Watch, Recovery Risk |

## 中文

liftBattery 使用企业 SaaS 概念作为产品语言，但底层逻辑必须映射到训练监控概念。

| SaaS 概念 | 训练产品概念 | 基于证据启发的依据 |
|---|---|---|
| Core | 核心训练 | 计划 hard sets、重点动作、专项性 |
| Non-Core | 支持负荷 | 辅助动作、有氧、可选训练 |
| Plan | 每周训练计划 | 周期化、volume load、sRPE load |
| Forecast | 风险预测 | 负荷趋势、wellness 趋势、monotony/strain |
| Utilisation | 计划完成率 | 实际完成 vs 计划工作 |
| Capacity | 恢复容量 | wellness、睡眠、疲劳、酸痛、压力、MRV 启发式 |
| Efficiency | 训练效率 Proxy | stimulus-to-fatigue 启发式、输出 vs 疲劳趋势 |
| Productivity | 有效训练产出 | 核心完成度、表现趋势、RIR/RPE 目标匹配 |
| Risk | 观察状态 | Deload Watch、Cut Pressure Watch、Recovery Risk |

---

# 4. MVP Features / MVP 功能

## English

MVP features:

- SaaS-style executive training dashboard
- Core vs Non-Core work overview
- Weekly plan and utilisation dashboard
- Recovery capacity panel
- Training load chart
- Gantt-style block timeline
- Forecast risk cards
- Efficiency / Productivity trend cards
- Daily readiness check-in
- Today training mode
- Weekly review
- Mock data only in Phase 1

## 中文

MVP 功能：

- SaaS 风格训练总览 Dashboard
- Core vs Non-Core 训练概览
- 每周计划和使用率 Dashboard
- 恢复容量面板
- 训练负荷图表
- Gantt 风格训练周期时间线
- 预测风险卡片
- 效率 / 生产率趋势卡片
- 每日 readiness check-in
- 今日训练模式
- 每周复盘
- Phase 1 只使用 mock 数据

---

# 5. Status and Watch Types / 状态和观察类型

| Status | English Meaning | 中文含义 |
|---|---|---|
| Push | Good state, progression may be appropriate | 状态较好，可以推进 |
| Maintain | Complete planned work without adding more | 完成计划，不额外加码 |
| Lighter | Lower output, preserve quality | 降低输出，保留动作质量 |
| Recovery Priority | Recovery should be prioritised | 优先恢复 |
| Deload Watch | Accumulated fatigue pattern is emerging | 疲劳累积趋势出现 |
| Cut Pressure Watch | Diet pressure is rising | 减脂压力上升 |
| Non-Core Overload | Support work is exceeding plan | 非核心负荷超过计划 |
| Capacity Gap | Planned load exceeds recovery proxy | 计划负荷超过恢复容量 proxy |
| Efficiency Down | Similar output now costs more fatigue | 相似输出需要更高疲劳成本 |
| Productivity Stable | Core output is maintained | 核心训练产出保持稳定 |

---

# 6. MVP Boundary / MVP 边界

## English

Do not build or claim:

- medical diagnosis
- eating disorder diagnosis
- RED-S diagnosis
- overtraining syndrome diagnosis
- exact muscle growth measurement
- exact hypertrophy productivity
- extreme dieting recommendations
- PED or drug advice
- AI coach
- coach replacement
- social feed
- payment
- subscription

## 中文

不要构建或宣称：

- 医学诊断
- 饮食障碍诊断
- RED-S 诊断
- 过度训练综合征诊断
- 精确肌肉增长测量
- 精确肌肥大生产率
- 极端节食建议
- PED 或药物建议
- AI 教练
- 教练替代品
- 社交动态流
- 支付
- 订阅

---

# 7. Evidence References / 证据参考

## English

Use these references as conceptual grounding:

- Session-RPE training load: session RPE x duration.
- RIR-based RPE autoregulation for resistance training.
- Athlete self-report wellness measures: soreness, fatigue, sleep quality, stress, mood.
- Training monotony and strain for load-pattern monitoring.
- RP volume landmarks: MV, MEV, MAV, MRV as expert heuristic framework.
- Stimulus-to-fatigue ratio as heuristic interpretation, not exact science.

References:

- Haddad et al. 2017, "Session-RPE Method for Training Load Monitoring": https://pmc.ncbi.nlm.nih.gov/articles/PMC5673663/
- Saw et al. 2016, subjective self-reported measures and athlete response monitoring: https://bjsm.bmj.com/content/50/5/281
- RIR/RPE autoregulation overview: https://link.springer.com/article/10.1007/s40279-020-01330-8
- RIR-based RPE in periodized resistance training: https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2018.00247/full

## 中文

使用以下作为概念依据：

- Session-RPE 训练负荷：session RPE x duration。
- RIR-based RPE 用于阻力训练自我调节。
- 运动员主观 wellness 指标：酸痛、疲劳、睡眠质量、压力、情绪。
- Training monotony 和 strain 用于观察负荷模式。
- RP volume landmarks：MV、MEV、MAV、MRV 作为专家启发式框架。
- Stimulus-to-fatigue ratio 作为启发式解释，而不是精确科学。

参考：

- Haddad 等 2017，Session-RPE 训练负荷监控综述：https://pmc.ncbi.nlm.nih.gov/articles/PMC5673663/
- Saw 等 2016，运动员主观自评与训练反应监控：https://bjsm.bmj.com/content/50/5/281
- RIR/RPE 自我调节综述：https://link.springer.com/article/10.1007/s40279-020-01330-8
- RIR-based RPE 周期化阻力训练研究：https://www.frontiersin.org/journals/physiology/articles/10.3389/fphys.2018.00247/full

Important:

重要：

Do not present heuristic metrics as medical truth or exact physiological measurement.

不要把启发式指标展示成医学事实或精确生理测量。
