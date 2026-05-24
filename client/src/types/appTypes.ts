export type PageKey =
  | "landing"
  | "overview"
  | "dailyLog"
  | "trainingLoad"
  | "effortRir"
  | "volume"
  | "recovery"
  | "nutrition"
  | "trends"
  | "weeklyReview"
  | "settings";

export type NavItem = {
  key: PageKey;
  label: string;
  labelZh: string;
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
