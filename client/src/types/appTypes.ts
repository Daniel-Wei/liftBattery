export type PageKey =
  | "landing"
  | "overview"
  | "today"
  | "training"
  | "recovery"
  | "bodyweight"
  | "trends"
  | "weeklyReview"
  | "settings";

export type NavItem = {
  key: PageKey;
  label: string;
  labelZh: string;
};

export type UserLevel = "level1" | "level2" | "level3";

export type ReadinessStatus =
  | "ready"
  | "steady"
  | "caution"
  | "recovery";

export type TrainingInput = {
  sleepHours: number;
  soreness: number;
  motivation: number;
  restingHeartRateDelta: number;
  previousSessionRpe: number;
  previousSessionDurationMinutes: number;
};

export type MainDriverId =
  | "shortSleep"
  | "highSoreness"
  | "lowMotivation"
  | "restingHeartRateAboveBaseline"
  | "hardPreviousSessionLoad"
  | "noMajorIssues";

export type MainDriver = {
  id: MainDriverId;
  message: string;
  reason: string;
};

export type ReadinessResult = {
  score: number;
  status: ReadinessStatus;
  statusLabel: string;
  statusLabelZh: string;
  badgeStatus: MetricStatus;
  recommendation: string;
  recommendationZh: string;
  mainDrivers: MainDriver[];
};

export type LevelProfile = {
  level: UserLevel;
  label: string;
  labelZh: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
};

export type MetricStatus = "good" | "watch" | "risk" | "neutral";

export type TrendDirection = "up" | "down" | "stable";

export type EvidenceType =
  | "established"
  | "simpleArithmetic"
  | "heuristic"
  | "proxy"
  | "watch";

export type Metric = {
  label: string;
  labelZh: string;
  value: string;
  trend: TrendDirection;
  status: MetricStatus;
  evidenceType: EvidenceType;
  explanation: string;
  explanationZh: string;
};

export type RiskWatch = {
  title: string;
  titleZh: string;
  severity: "low" | "medium" | "high";
  signals: string[];
  signalsZh: string[];
  recommendation: string;
  recommendationZh: string;
};

export type WorkItem = {
  name: string;
  nameZh: string;
  planned: string;
  completed: string;
  utilisation: string;
  status: MetricStatus;
};

export type TrendPoint = {
  label: string;
  value: number;
};

export type TrainingBlock = {
  name: string;
  subtitle: string;
  currentWeek: number;
  totalWeeks: number;
  mode: string;
  trainingMode: string;
};

export type UserCase = {
  name: string;
  age: number;
  trainingAge: string;
  scenario: string;
  scenarioZh: string;
  currentDay: string;
  shortStory: string;
  shortStoryZh: string;
};

export type TimelinePhase = {
  name: string;
  nameZh: string;
  startWeek: number;
  endWeek: number;
  status: "done" | "active" | "upcoming";
};

export type CheckInItem = {
  label: string;
  labelZh: string;
  value: number;
  output: string;
  outputZh: string;
};

export type RecordOutputItem = {
  input: string;
  inputZh: string;
  output: string;
  outputZh: string;
  basis: string;
  basisZh: string;
};

export type SettingsMock = {
  modePreset: string;
  cycleLength: string;
  trainingGoal: string;
  targetMuscles: string[];
  units: string;
};

export type WeeklyReviewMock = {
  summary: string;
  summaryZh: string;
  weeklyLoad: string;
  monotony: string;
  strain: string;
  bodyweightRate: string;
  riskChanges: string[];
  nextWeek: string;
  nextWeekZh: string;
};

export type LevelMockData = {
  level: UserLevel;
  userCase: UserCase;
  trainingBlock: TrainingBlock;
  overviewMetrics: Metric[];
  loadMetrics: Metric[];
  effortMetrics: Metric[];
  volumeMetrics: Metric[];
  recoveryMetrics: Metric[];
  nutritionMetrics: Metric[];
  primaryStimulusItems: WorkItem[];
  supportWorkItems: WorkItem[];
  riskWatches: RiskWatch[];
  timelinePhases: TimelinePhase[];
  loadTrend: TrendPoint[];
  recoveryTrend: TrendPoint[];
  volumeTrend: TrendPoint[];
  bodyweightTrend: TrendPoint[];
  nutritionTrend: TrendPoint[];
  quickLogItems: CheckInItem[];
  optionalLogItems: CheckInItem[];
  advancedLogItems: CheckInItem[];
  recordOutputItems: RecordOutputItem[];
  weeklyReview: WeeklyReviewMock;
  settingsMock: SettingsMock;
};

export type FormulaReference = {
  label: string;
  url: string;
};

export type FormulaNoteData = {
  pageKey: PageKey;
  title: string;
  titleZh: string;
  formula: string;
  formulaZh: string;
  concept: string;
  conceptZh: string;
  evidenceType: EvidenceType;
  references: FormulaReference[];
};
