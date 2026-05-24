import type {
  CheckInItem,
  EvidenceType,
  FormulaNoteData,
  Metric,
  NavItem,
  RecordOutputItem,
  RiskWatch,
  SettingsMock,
  TimelinePhase,
  TrainingBlock,
  TrendPoint,
  WorkItem,
} from "../types/appTypes";

const referenceLinks = {
  sessionRpe: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5673663/",
  rirRpe: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4961270/",
  wellness: "https://pubmed.ncbi.nlm.nih.gov/26423706/",
  loadFatigue: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4213373/",
  volumeLoad: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4215195/",
  weeklyVolume: "https://pubmed.ncbi.nlm.nih.gov/27433992/",
  naturalBodybuilding: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5769537/",
};

export const navItems: NavItem[] = [
  { key: "landing", label: "Home", labelZh: "首页" },
  { key: "overview", label: "Overview", labelZh: "总览" },
  { key: "dailyLog", label: "Daily Log", labelZh: "每日记录" },
  { key: "trainingLoad", label: "Training Load", labelZh: "训练负荷" },
  { key: "effortRir", label: "Effort / RIR", labelZh: "努力程度" },
  { key: "volume", label: "Volume", labelZh: "训练量" },
  { key: "recovery", label: "Recovery", labelZh: "恢复" },
  { key: "nutrition", label: "Nutrition", labelZh: "饮食压力" },
  { key: "trends", label: "Trends", labelZh: "趋势" },
  { key: "weeklyReview", label: "Weekly Review", labelZh: "每周复盘" },
  { key: "settings", label: "Settings", labelZh: "设置" },
];

export const trainingBlock: TrainingBlock = {
  name: "Cut Block 03",
  subtitle: "Hypertrophy retention during a controlled cut",
  currentWeek: 9,
  totalWeeks: 16,
  mode: "Cut / hypertrophy retention",
  trainingMode: "Maintain",
};

export const overviewMetrics: Metric[] = [
  {
    label: "Session Load",
    labelZh: "训练课负荷",
    value: "610 AU",
    trend: "up",
    status: "neutral",
    evidenceType: "established",
    explanation: "Session-RPE load uses session RPE x duration.",
    explanationZh: "Session-RPE 负荷使用 session RPE x 训练时长。",
  },
  {
    label: "Priority Hard Sets",
    labelZh: "重点 Hard Sets",
    value: "45 / 48",
    trend: "stable",
    status: "good",
    evidenceType: "simpleArithmetic",
    explanation: "Completed priority hard sets compared with planned hard sets.",
    explanationZh: "用已完成重点 hard sets 对比计划 hard sets。",
  },
  {
    label: "Top Set Effort",
    labelZh: "顶组努力程度",
    value: "RPE 9",
    trend: "up",
    status: "watch",
    evidenceType: "established",
    explanation: "RIR-based RPE helps describe proximity to failure.",
    explanationZh: "RIR-based RPE 用来描述接近力竭程度。",
  },
  {
    label: "Wellness Readiness",
    labelZh: "Wellness 状态",
    value: "68 / 100",
    trend: "down",
    status: "watch",
    evidenceType: "proxy",
    explanation: "A subjective readiness proxy based on fatigue, sleep, soreness, stress, and mood.",
    explanationZh: "基于疲劳、睡眠、酸痛、压力和情绪的主观状态 proxy。",
  },
  {
    label: "Bodyweight Rate",
    labelZh: "体重变化速度",
    value: "-0.7% / wk",
    trend: "stable",
    status: "good",
    evidenceType: "watch",
    explanation: "Uses 7-day average bodyweight change as cut-context information.",
    explanationZh: "用 7 日平均体重变化观察减脂语境。",
  },
  {
    label: "Watch State",
    labelZh: "观察状态",
    value: "Load watch",
    trend: "up",
    status: "watch",
    evidenceType: "watch",
    explanation: "A pattern label from load, recovery, and effort signals.",
    explanationZh: "来自负荷、恢复和努力程度信号的模式标签。",
  },
];

export const loadMetrics: Metric[] = [
  {
    label: "Daily sRPE Load",
    labelZh: "每日 sRPE 负荷",
    value: "610 AU",
    trend: "up",
    status: "neutral",
    evidenceType: "established",
    explanation: "RPE x duration gives a practical internal load estimate.",
    explanationZh: "RPE x 时长给出实用内部负荷估计。",
  },
  {
    label: "Weekly Load",
    labelZh: "周负荷",
    value: "3,980 AU",
    trend: "up",
    status: "watch",
    evidenceType: "simpleArithmetic",
    explanation: "Sum of daily session-RPE loads.",
    explanationZh: "每日 session-RPE 负荷总和。",
  },
  {
    label: "Monotony",
    labelZh: "单调性",
    value: "1.9",
    trend: "up",
    status: "watch",
    evidenceType: "watch",
    explanation: "Mean daily load divided by the standard deviation of daily load.",
    explanationZh: "每日负荷均值除以每日负荷标准差。",
  },
  {
    label: "Training Strain",
    labelZh: "训练 Strain",
    value: "7,562",
    trend: "up",
    status: "watch",
    evidenceType: "watch",
    explanation: "Weekly load multiplied by monotony.",
    explanationZh: "周负荷乘以 monotony。",
  },
];

export const effortMetrics: Metric[] = [
  {
    label: "Top Set RIR",
    labelZh: "顶组 RIR",
    value: "1 rep",
    trend: "down",
    status: "watch",
    evidenceType: "established",
    explanation: "Lower RIR means the set is closer to failure.",
    explanationZh: "RIR 越低，说明该组越接近力竭。",
  },
  {
    label: "Top Set RPE",
    labelZh: "顶组 RPE",
    value: "9 / 10",
    trend: "up",
    status: "watch",
    evidenceType: "established",
    explanation: "RIR-based RPE is used to describe resistance-training effort.",
    explanationZh: "RIR-based RPE 用于描述阻力训练努力程度。",
  },
  {
    label: "Performance Signal",
    labelZh: "表现信号",
    value: "-2%",
    trend: "down",
    status: "watch",
    evidenceType: "watch",
    explanation: "Mock trend from top-set load and reps, not a strength diagnosis.",
    explanationZh: "来自顶组重量和次数的 mock 趋势，不是力量诊断。",
  },
];

export const volumeMetrics: Metric[] = [
  {
    label: "Hard Sets",
    labelZh: "Hard Sets",
    value: "45",
    trend: "stable",
    status: "good",
    evidenceType: "simpleArithmetic",
    explanation: "Counts challenging sets for priority muscle groups.",
    explanationZh: "统计重点肌群有挑战性的训练组。",
  },
  {
    label: "Volume Load",
    labelZh: "Volume Load",
    value: "42,600 kg",
    trend: "up",
    status: "neutral",
    evidenceType: "established",
    explanation: "Volume load is commonly represented as sets x reps x load.",
    explanationZh: "Volume load 常用 sets x reps x load 表示。",
  },
  {
    label: "Priority Share",
    labelZh: "重点训练占比",
    value: "72%",
    trend: "stable",
    status: "good",
    evidenceType: "simpleArithmetic",
    explanation: "Priority hard sets divided by total hard sets.",
    explanationZh: "重点 hard sets 除以总 hard sets。",
  },
];

export const recoveryMetrics: Metric[] = [
  { label: "Fatigue", labelZh: "疲劳", value: "4 / 5", trend: "up", status: "watch", evidenceType: "watch", explanation: "Subjective wellness self-report.", explanationZh: "主观 wellness 自评。" },
  { label: "Sleep Quality", labelZh: "睡眠质量", value: "3 / 5", trend: "down", status: "watch", evidenceType: "watch", explanation: "Subjective sleep quality input.", explanationZh: "主观睡眠质量输入。" },
  { label: "Soreness", labelZh: "酸痛", value: "4 / 5", trend: "up", status: "watch", evidenceType: "watch", explanation: "Subjective soreness input.", explanationZh: "主观酸痛输入。" },
  { label: "Stress", labelZh: "压力", value: "3 / 5", trend: "stable", status: "neutral", evidenceType: "watch", explanation: "Subjective stress input.", explanationZh: "主观压力输入。" },
  { label: "Mood", labelZh: "情绪", value: "3 / 5", trend: "stable", status: "neutral", evidenceType: "watch", explanation: "Subjective mood input.", explanationZh: "主观情绪输入。" },
  { label: "Readiness Proxy", labelZh: "Readiness Proxy", value: "68 / 100", trend: "down", status: "watch", evidenceType: "proxy", explanation: "A simple display proxy from wellness signals.", explanationZh: "来自 wellness 信号的简单展示 proxy。" },
];

export const nutritionMetrics: Metric[] = [
  {
    label: "Bodyweight Rate",
    labelZh: "体重变化速度",
    value: "-0.7% / wk",
    trend: "stable",
    status: "good",
    evidenceType: "watch",
    explanation: "Uses 7-day average bodyweight change.",
    explanationZh: "使用 7 日平均体重变化。",
  },
  {
    label: "Calories",
    labelZh: "热量",
    value: "2,110 kcal",
    trend: "stable",
    status: "neutral",
    evidenceType: "watch",
    explanation: "Nutrition context for interpreting cut pressure.",
    explanationZh: "用于理解减脂压力的饮食语境。",
  },
  {
    label: "Carbs",
    labelZh: "碳水",
    value: "215 g",
    trend: "down",
    status: "neutral",
    evidenceType: "watch",
    explanation: "Carb trend can affect perceived training quality for some users.",
    explanationZh: "碳水趋势可能影响部分用户的主观训练质量。",
  },
  {
    label: "Hunger",
    labelZh: "饥饿感",
    value: "4 / 5",
    trend: "up",
    status: "watch",
    evidenceType: "watch",
    explanation: "Hunger is a cut-pressure signal, not a diagnosis.",
    explanationZh: "饥饿感是减脂压力信号，不是诊断。",
  },
];

export const primaryStimulusItems: WorkItem[] = [
  { name: "Back priority hard sets", nameZh: "背部重点 hard sets", planned: "18 sets", completed: "17 sets", utilisation: "94%", status: "good" },
  { name: "Glutes priority hard sets", nameZh: "臀部重点 hard sets", planned: "16 sets", completed: "15 sets", utilisation: "94%", status: "good" },
  { name: "Delts target volume", nameZh: "三角肌目标训练量", planned: "14 sets", completed: "13 sets", utilisation: "93%", status: "good" },
];

export const supportWorkItems: WorkItem[] = [
  { name: "Cardio", nameZh: "有氧", planned: "180 min", completed: "215 min", utilisation: "119%", status: "watch" },
  { name: "Optional accessories", nameZh: "可选辅助训练", planned: "10 sets", completed: "15 sets", utilisation: "150%", status: "watch" },
  { name: "Mobility", nameZh: "活动度", planned: "4 sessions", completed: "3 sessions", utilisation: "75%", status: "neutral" },
];

export const riskWatches: RiskWatch[] = [
  {
    title: "Load Accumulation Watch",
    titleZh: "负荷累积观察",
    severity: "medium",
    signals: ["Weekly load up", "Monotony up", "Top set RPE rising"],
    signalsZh: ["周负荷上升", "Monotony 上升", "顶组 RPE 上升"],
    recommendation: "Review load variation before adding extra hard sets.",
    recommendationZh: "增加额外 hard sets 前，先 review 负荷波动。",
  },
  {
    title: "Cut Pressure Watch",
    titleZh: "减脂压力观察",
    severity: "medium",
    signals: ["Hunger rising", "Bodyweight rate near target", "Cardio above plan"],
    signalsZh: ["饥饿感上升", "体重变化速度接近目标", "有氧超过计划"],
    recommendation: "Treat this as a watch signal and review nutrition context.",
    recommendationZh: "把它当作观察信号，并 review 饮食语境。",
  },
  {
    title: "Support Work Drift",
    titleZh: "支持性训练偏移",
    severity: "low",
    signals: ["Optional accessories above plan", "Cardio above plan"],
    signalsZh: ["可选辅助训练超过计划", "有氧超过计划"],
    recommendation: "Keep helpful work from crowding recovery.",
    recommendationZh: "避免支持性训练挤占恢复。",
  },
];

export const timelinePhases: TimelinePhase[] = [
  { name: "Base Block", nameZh: "基础阶段", startWeek: 1, endWeek: 4, status: "done" },
  { name: "Progressive Deficit", nameZh: "逐步赤字", startWeek: 5, endWeek: 8, status: "done" },
  { name: "High Compliance", nameZh: "高执行阶段", startWeek: 9, endWeek: 12, status: "active" },
  { name: "Fatigue Watch", nameZh: "疲劳观察", startWeek: 13, endWeek: 15, status: "upcoming" },
  { name: "Peak / Test Week", nameZh: "峰值/测试周", startWeek: 16, endWeek: 16, status: "upcoming" },
  { name: "Recovery", nameZh: "恢复阶段", startWeek: 17, endWeek: 20, status: "upcoming" },
];

export const loadTrend: TrendPoint[] = [
  { label: "Mon", value: 520 },
  { label: "Tue", value: 580 },
  { label: "Wed", value: 610 },
  { label: "Thu", value: 560 },
  { label: "Fri", value: 640 },
  { label: "Sat", value: 590 },
  { label: "Sun", value: 610 },
];

export const recoveryTrend: TrendPoint[] = [
  { label: "Mon", value: 76 },
  { label: "Tue", value: 74 },
  { label: "Wed", value: 70 },
  { label: "Thu", value: 72 },
  { label: "Fri", value: 66 },
  { label: "Sat", value: 68 },
  { label: "Sun", value: 68 },
];

export const volumeTrend: TrendPoint[] = [
  { label: "W5", value: 36 },
  { label: "W6", value: 40 },
  { label: "W7", value: 42 },
  { label: "W8", value: 44 },
  { label: "W9", value: 45 },
];

export const bodyweightTrend: TrendPoint[] = [
  { label: "W1", value: 68.8 },
  { label: "W2", value: 68.4 },
  { label: "W3", value: 68.0 },
  { label: "W4", value: 67.7 },
  { label: "W5", value: 67.2 },
  { label: "W6", value: 66.9 },
];

export const nutritionTrend: TrendPoint[] = [
  { label: "Mon", value: 2150 },
  { label: "Tue", value: 2120 },
  { label: "Wed", value: 2100 },
  { label: "Thu", value: 2180 },
  { label: "Fri", value: 2090 },
  { label: "Sat", value: 2140 },
  { label: "Sun", value: 2110 },
];

export const quickLogItems: CheckInItem[] = [
  { label: "Session RPE", labelZh: "训练课 RPE", value: 8, output: "Session load", outputZh: "训练课负荷" },
  { label: "Session Duration", labelZh: "训练时长", value: 75, output: "Session load", outputZh: "训练课负荷" },
  { label: "Fatigue", labelZh: "疲劳", value: 4, output: "Readiness proxy", outputZh: "Readiness proxy" },
  { label: "Sleep Quality", labelZh: "睡眠质量", value: 3, output: "Recovery trend", outputZh: "恢复趋势" },
];

export const optionalLogItems: CheckInItem[] = [
  { label: "Top Set RIR", labelZh: "顶组 RIR", value: 1, output: "Effort/RIR trend", outputZh: "努力程度趋势" },
  { label: "Hard Sets", labelZh: "有效训练组", value: 12, output: "Volume trend", outputZh: "训练量趋势" },
  { label: "Bodyweight", labelZh: "体重", value: 67, output: "Bodyweight rate", outputZh: "体重变化速度" },
  { label: "Hunger", labelZh: "饥饿感", value: 4, output: "Cut pressure watch", outputZh: "减脂压力观察" },
];

export const advancedLogItems: CheckInItem[] = [
  { label: "Rep Velocity", labelZh: "动作速度", value: 42, output: "Velocity loss", outputZh: "速度损失" },
  { label: "HRV", labelZh: "心率变异性", value: 62, output: "HRV readiness", outputZh: "HRV readiness" },
  { label: "CMJ Height", labelZh: "反向跳高度", value: 34, output: "Neuromuscular readiness", outputZh: "神经肌肉状态" },
];

export const recordOutputItems: RecordOutputItem[] = [
  {
    input: "Quick: Session RPE + duration",
    inputZh: "快速记录：训练课 RPE + 训练时长",
    output: "Session load, weekly load, monotony, strain",
    outputZh: "训练课负荷、周负荷、monotony、strain",
    basis: "Session-RPE is a practical internal load monitoring method.",
    basisZh: "Session-RPE 是实用的内部训练负荷监控方法。",
  },
  {
    input: "Optional: Top set RPE / RIR",
    inputZh: "可选：顶组 RPE / RIR",
    output: "Effort trend and training-mode watch",
    outputZh: "努力程度趋势和训练模式观察",
    basis: "RIR-based RPE describes proximity to failure in resistance training.",
    basisZh: "RIR-based RPE 描述阻力训练接近力竭程度。",
  },
  {
    input: "Optional: Hard sets and load",
    inputZh: "可选：Hard sets 和重量",
    output: "Volume load and priority-volume trend",
    outputZh: "Volume load 和重点训练量趋势",
    basis: "Volume can be represented through hard sets and sets x reps x load.",
    basisZh: "训练量可通过 hard sets 和 sets x reps x load 表示。",
  },
  {
    input: "Quick: fatigue and sleep; optional: soreness, stress, mood",
    inputZh: "快速记录：疲劳和睡眠；可选：酸痛、压力、情绪",
    output: "Wellness readiness and recovery watch",
    outputZh: "Wellness readiness 和恢复观察",
    basis: "Subjective self-report is widely used in athlete monitoring.",
    basisZh: "主观自评常用于运动员监控。",
  },
  {
    input: "Optional: bodyweight, calories, carbs, hunger",
    inputZh: "可选：体重、热量、碳水、饥饿感",
    output: "Cut pressure and bodyweight-rate context",
    outputZh: "减脂压力和体重变化速度语境",
    basis: "Bodyweight trend and nutrition pressure help interpret training state during a cut.",
    basisZh: "减脂期需要结合体重趋势和饮食压力理解训练状态。",
  },
];

export const weeklyReview = {
  summary: "Load rose while wellness readiness drifted down; priority volume stayed close to plan.",
  summaryZh: "负荷上升，wellness readiness 下滑；重点训练量基本贴近计划。",
  weeklyLoad: "3,980 AU",
  monotony: "1.9",
  strain: "7,562",
  bodyweightRate: "-0.7% / wk",
  riskChanges: ["Load accumulation watch moved to medium", "Cut pressure watch stayed medium", "Support work drift appeared"],
  nextWeek: "Review load variation and support work before adding more volume.",
  nextWeekZh: "下周增加训练量前，先 review 负荷波动和支持性训练。",
};

export const settingsMock: SettingsMock = {
  modePreset: "Cut / hypertrophy retention",
  cycleLength: "16 weeks",
  trainingGoal: "Maintain performance while reducing bodyweight",
  targetMuscles: ["Back", "Glutes", "Delts"],
  units: "Metric",
};

export const formulaNotes: FormulaNoteData[] = [
  {
    pageKey: "landing",
    title: "LiftOps starts from training records, not business formulas.",
    titleZh: "LiftOps 从训练记录出发，不从商业公式出发。",
    formula: "Training state = load + effort + volume + recovery + nutrition context",
    formulaZh: "训练状态 = 负荷 + 努力程度 + 训练量 + 恢复 + 饮食语境",
    concept: "The product language stays simple, but the tabs are grounded in training monitoring concepts.",
    conceptZh: "产品语言保持简单，但 tab 直接落在训练监控概念上。",
    evidenceType: "heuristic",
    references: [
      { label: "sRPE review", url: referenceLinks.sessionRpe },
      { label: "Self-report review", url: referenceLinks.wellness },
    ],
  },
  {
    pageKey: "overview",
    title: "Overview combines the major daily signals.",
    titleZh: "总览汇总每日关键训练信号。",
    formula: "Daily state = sRPE load + RIR/RPE + hard sets + wellness + bodyweight trend",
    formulaZh: "每日状态 = sRPE 负荷 + RIR/RPE + hard sets + wellness + 体重趋势",
    concept: "Overview should summarize interpretable signals instead of hiding them inside one black-box score.",
    conceptZh: "总览应总结可解释信号，而不是藏进一个黑箱分数。",
    evidenceType: "proxy",
    references: [
      { label: "Session-RPE method", url: referenceLinks.sessionRpe },
      { label: "RIR-based RPE", url: referenceLinks.rirRpe },
      { label: "Athlete self-report", url: referenceLinks.wellness },
    ],
  },
  {
    pageKey: "dailyLog",
    title: "Daily log records inputs that change specific outputs.",
    titleZh: "每日记录只记录会改变输出的输入。",
    formula: "Input -> derived output -> watch state",
    formulaZh: "输入 -> 派生输出 -> 观察状态",
    concept: "A daily log should show what each input affects, so the user is not filling forms blindly.",
    conceptZh: "每日记录应显示每个输入会影响什么，用户不是盲目填表。",
    evidenceType: "heuristic",
    references: [
      { label: "Self-report review", url: referenceLinks.wellness },
      { label: "Session-RPE method", url: referenceLinks.sessionRpe },
    ],
  },
  {
    pageKey: "trainingLoad",
    title: "Training load is built from perceived exertion and duration.",
    titleZh: "训练负荷来自主观用力程度和训练时长。",
    formula: "Session load = session RPE x duration; strain = weekly load x monotony",
    formulaZh: "训练课负荷 = session RPE x 时长；strain = 周负荷 x monotony",
    concept: "Training load tabs should show load size and load pattern, not just whether the week looks busy.",
    conceptZh: "训练负荷页应显示负荷大小和负荷模式，而不只是这一周忙不忙。",
    evidenceType: "established",
    references: [
      { label: "Session-RPE method", url: referenceLinks.sessionRpe },
      { label: "Training load fatigue", url: referenceLinks.loadFatigue },
    ],
  },
  {
    pageKey: "effortRir",
    title: "Effort is about proximity to failure.",
    titleZh: "努力程度关注接近力竭程度。",
    formula: "RIR lower -> effort higher; RPE higher -> effort higher",
    formulaZh: "RIR 越低 -> 努力程度越高；RPE 越高 -> 努力程度越高",
    concept: "RIR-based RPE is more specific to resistance training than generic effort language.",
    conceptZh: "RIR-based RPE 比泛泛的努力程度更适合阻力训练。",
    evidenceType: "established",
    references: [
      { label: "RIR-based RPE", url: referenceLinks.rirRpe },
      { label: "Resistance monitoring methods", url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7706636/" },
    ],
  },
  {
    pageKey: "volume",
    title: "Volume should separate priority stimulus from support work.",
    titleZh: "训练量应区分重点刺激和支持性训练。",
    formula: "Volume load = sets x reps x load; priority share = priority hard sets / total hard sets",
    formulaZh: "Volume load = 组数 x 次数 x 重量；重点占比 = 重点 hard sets / 总 hard sets",
    concept: "This uses priority stimulus and support work instead of copying business terminology.",
    conceptZh: "这里使用重点刺激和支持性训练，而不是照搬商业术语。",
    evidenceType: "simpleArithmetic",
    references: [
      { label: "Volume load study", url: referenceLinks.volumeLoad },
      { label: "Weekly volume meta-analysis", url: referenceLinks.weeklyVolume },
    ],
  },
  {
    pageKey: "recovery",
    title: "Recovery is tracked through subjective wellness signals.",
    titleZh: "恢复通过主观 wellness 信号观察。",
    formula: "Readiness proxy = trend(fatigue, sleep, soreness, stress, mood)",
    formulaZh: "Readiness proxy = 疲劳、睡眠、酸痛、压力、情绪的趋势",
    concept: "Subjective self-report can be useful for monitoring training response, but this is not diagnosis.",
    conceptZh: "主观自评可用于观察训练反应，但这不是诊断。",
    evidenceType: "proxy",
    references: [
      { label: "Athlete self-report review", url: referenceLinks.wellness },
      { label: "Training load fatigue", url: referenceLinks.loadFatigue },
    ],
  },
  {
    pageKey: "nutrition",
    title: "Nutrition context explains cut pressure.",
    titleZh: "饮食语境解释减脂压力。",
    formula: "Bodyweight rate = change in 7-day average / previous 7-day average",
    formulaZh: "体重变化速度 = 7 日平均变化 / 上一个 7 日平均",
    concept: "During a cut, bodyweight trend, calories, carbs, hunger, and cardio help explain why training feels different.",
    conceptZh: "减脂期中，体重趋势、热量、碳水、饥饿和有氧能解释训练感受变化。",
    evidenceType: "watch",
    references: [
      { label: "Natural bodybuilding prep", url: referenceLinks.naturalBodybuilding },
      { label: "Self-report review", url: referenceLinks.wellness },
    ],
  },
  {
    pageKey: "trends",
    title: "Trends compare load, effort, recovery, volume, and nutrition.",
    titleZh: "趋势页对比负荷、努力、恢复、训练量和饮食。",
    formula: "Trend review = load trend + wellness trend + volume trend + bodyweight trend",
    formulaZh: "趋势复盘 = 负荷趋势 + wellness 趋势 + 训练量趋势 + 体重趋势",
    concept: "A trend page should help users connect changes across systems instead of staring at isolated charts.",
    conceptZh: "趋势页应帮助用户连接不同系统的变化，而不是看孤立图表。",
    evidenceType: "watch",
    references: [
      { label: "Training load fatigue", url: referenceLinks.loadFatigue },
      { label: "Athlete self-report", url: referenceLinks.wellness },
    ],
  },
  {
    pageKey: "weeklyReview",
    title: "Weekly review summarizes training stress and response.",
    titleZh: "每周复盘总结训练压力和反应。",
    formula: "Weekly load = sum(daily sRPE loads); monotony = mean / SD; strain = load x monotony",
    formulaZh: "周负荷 = 每日 sRPE 总和；monotony = 均值 / 标准差；strain = 负荷 x monotony",
    concept: "A week can feel hard because total load rose, variation fell, or recovery signals worsened.",
    conceptZh: "一周变难可能来自总负荷上升、波动减少，或恢复信号变差。",
    evidenceType: "watch",
    references: [
      { label: "Training load fatigue", url: referenceLinks.loadFatigue },
      { label: "Session-RPE method", url: referenceLinks.sessionRpe },
    ],
  },
  {
    pageKey: "settings",
    title: "Settings define the training context.",
    titleZh: "设置定义训练语境。",
    formula: "Context = goal + block length + target muscles + units + volume landmark language",
    formulaZh: "语境 = 目标 + 周期长度 + 重点肌群 + 单位 + 训练量 landmarks 语言",
    concept: "Volume landmarks like MV/MEV/MAV/MRV can be useful heuristics, but they are not universal equations.",
    conceptZh: "MV/MEV/MAV/MRV 等 volume landmarks 可以作为启发式框架，但不是统一方程。",
    evidenceType: "heuristic",
    references: [
      { label: "Weekly volume meta-analysis", url: referenceLinks.weeklyVolume },
      { label: "Volume load study", url: referenceLinks.volumeLoad },
    ],
  },
];

export const evidenceLabels: { type: EvidenceType; label: string }[] = [
  { type: "established", label: "Established" },
  { type: "simpleArithmetic", label: "Simple arithmetic" },
  { type: "heuristic", label: "Heuristic" },
  { type: "proxy", label: "Proxy" },
  { type: "watch", label: "Watch" },
];
