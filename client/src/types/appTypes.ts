export enum PageKey {
  Landing = "landing",
  Overview = "overview",
  PreCheck = "preCheck",
  Training = "training",
  Trends = "trends",
}

export type NavItem = {
  key: PageKey;
  label: string;
  labelZh: string;
};

export enum UserLevel {
  Level1 = "level1",
  Level2 = "level2",
  Level3 = "level3",
}

export enum ReadinessStatus {
  Ready = "ready",
  Steady = "steady",
  Caution = "caution",
  Recovery = "recovery",
}

export type PreCheckDetailsLog = {
  sleepHours: number;
  soreness: number;
  motivation: number;
  restingHeartRateDelta: number;
  previousSessionRpe: number;
  previousSessionDurationMinutes: number;
};

export enum MainDriverId {
  ShortSleep = "shortSleep",
  HighSoreness = "highSoreness",
  LowMotivation = "lowMotivation",
  RestingHeartRateAboveBaseline = "restingHeartRateAboveBaseline",
  HardPreviousSessionLoad = "hardPreviousSessionLoad",
  NoMajorIssues = "noMajorIssues",
}

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

// DailyPreCheckLog stores pre-workout readiness check-ins from TodayPage.
export type PreCheckLog = {
  id: string;
  date: string;
  input: PreCheckDetailsLog;
  readiness: ReadinessResult;
  createdAt: string;
  updatedAt: string;
};

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abs"
  | "All";

export type SetEntry = {
  id: string;
  reps: number;
  weightKg: number;
  rpe?: number;
  rir?: number;
  isWarmup: boolean;
};

// TrainingSession stores one quick-saved post-workout exercise, separate from readiness check-ins.
export type TrainingSession = {
  id: string;
  date: string;
  durationMinutes: number;
  sessionRpe: number;
  exerciseName: string;
  primaryMuscleGroup: MuscleGroup;
  sets: SetEntry[];
  createdAt: string;
  updatedAt: string;
};

// BodyweightEntry stores scale-weight data for weight trend calculations.
export type BodyweightEntry = {
  id: string;
  date: string;
  weightKg: number;
  createdAt: string;
  updatedAt: string;
};

// NutritionEntry stores optional nutrition context for cut-pressure interpretation.
export type NutritionEntry = {
  id: string;
  date: string;
  calories?: number;
  carbsGrams?: number;
  hunger?: number;
  createdAt: string;
  updatedAt: string;
};

// ProgramSettings gives Overview metrics their target context.
export type ProgramSettings = {
  currentWeek: number;
  totalWeeks: number;
  mode: string;
  priorityMuscles: MuscleGroup[];
  weeklyPriorityHardSetTarget: number;
};

export type LiftBatteryState = {
  // preCheckDraft is the current unsaved input the user is editing on TodayPage.
  preCheckDraft: PreCheckDetailsLog;
  // preCheckDraftUpdated tracks whether the current editing draft has unsaved changes.
  preCheckDraftUpdated: boolean;
  // preCheckLogs are saved history records that other pages can analyze later.
  preCheckLogs: PreCheckLog[];
  // trainingSessions are real post-workout lifting logs.
  trainingSessions: TrainingSession[];
  // programSettings provide targets for derived dashboard metrics.
  programSettings: ProgramSettings;
};

export enum LiftBatteryActionType {
  UpdatePreCheckDraft = "updatePreCheckDraft",
  ResetPreCheckDraft = "resetPreCheckDraft",
  SavePreCheckLog = "savePreCheckLog",
  DeletePreCheckLog = "deletePreCheckLog",
  SaveTrainingSession = "saveTrainingSession",
  DeleteTrainingSession = "deleteTrainingSession",
  UpdateProgramSettings = "updateProgramSettings",
}

// Future pages should consume derived results from logs instead of treating TodayPage as the data owner.
export type LiftBatteryAction =
  | {
      type: LiftBatteryActionType.UpdatePreCheckDraft;
      field: keyof PreCheckDetailsLog;
      value: number;
    }
  | {
      type: LiftBatteryActionType.ResetPreCheckDraft;
    }
  | {
      type: LiftBatteryActionType.SavePreCheckLog;
    }
  | {
      type: LiftBatteryActionType.DeletePreCheckLog;
      id: string;
    }
  | {
      type: LiftBatteryActionType.SaveTrainingSession;
      session: TrainingSession;
    }
  | {
      type: LiftBatteryActionType.DeleteTrainingSession;
      id: string;
    }
  | {
      type: LiftBatteryActionType.UpdateProgramSettings;
      settings: ProgramSettings;
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

export enum MetricStatus {
  Good = "good",
  Watch = "watch",
  Risk = "risk",
  Neutral = "neutral",
}

export enum TrendDirection {
  Up = "up",
  Down = "down",
  Stable = "stable",
}

export enum EvidenceType {
  Established = "established",
  SimpleArithmetic = "simpleArithmetic",
  Heuristic = "heuristic",
  Proxy = "proxy",
  Watch = "watch",
}

export enum RiskSeverity {
  Low = "low",
  Medium = "medium",
  High = "high",
}

export enum TimelinePhaseStatus {
  Done = "done",
  Active = "active",
  Upcoming = "upcoming",
}

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
  severity: RiskSeverity;
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
  status: TimelinePhaseStatus;
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

export type ReadinessControl = {
  field: keyof PreCheckDetailsLog;
  label: string;
  labelZh: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  output: string;
};

// #region TrainingPage types
// The form keeps input values as strings so users can freely edit number fields before saving.
export type TrainingSessionForm = {
  date: string;
  durationMinutes: string;
  sessionRpe: string;
  exerciseName: string;
  primaryMuscleGroup: MuscleGroup;
  setsCount: string;
  reps: string;
  weightKg: string;
  setRpe: string;
  rir: string;
};

export type TrainingSessionTextField =
  | "date"
  | "durationMinutes"
  | "sessionRpe"
  | "exerciseName"
  | "setsCount"
  | "reps"
  | "weightKg"
  | "setRpe"
  | "rir";

export type ExerciseSummary = {
  key: string;
  exerciseName: string;
  muscleGroups: string;
  sessions: number;
  sets: number;
  volumeLoad: number;
};

export type MuscleSummary = {
  muscleGroup: MuscleGroup;
  hardSets: number;
  volumeLoad: number;
};

export type MuscleGroupFilter = "All" | MuscleGroup;
// #endregion
