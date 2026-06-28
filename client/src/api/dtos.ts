import type { AuthUser, MuscleGroup, TrendReportType } from "../types/appTypes";

export type PreCheckDto = {
  id?: number;
  date: string;
  sleepQuality: number;
  soreness: number;
  stress: number;
  motivation: number;
  energy: number;
  sleepHours?: number;
  sorenessRating?: number;
  motivationRating?: number;
  restingHeartRateDelta?: number;
  previousSessionRpe?: number;
  previousSessionDurationMinutes?: number;
};

export type TrainingSetDto = {
  id?: number;
  trainingExerciseId?: number;
  setOrder: number;
  reps: number;
  weightKg: number;
  rpe?: number;
  rir?: number;
  isWarmup: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type TrainingExerciseDto = {
  id?: number;
  trainingSessionId?: number;
  exerciseOrder: number;
  muscleGroup: MuscleGroup;
  exerciseName: string;
  sets: TrainingSetDto[];
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type TrainingSessionDto = {
  id?: number;
  trainingDayId?: number;
  startTime: string;
  durationMinutes: number;
  sessionRpe: number;
  exercises: TrainingExerciseDto[];
  createdAtUtc?: string;
  updatedAtUtc?: string;
};

export type TrainingDayDto = {
  id: number;
  userId: number;
  date: string;
  sessions: TrainingSessionDto[];
  createdAtUtc: string;
  updatedAtUtc: string;
};

export type SaveTrainingSessionDto = Omit<
  TrainingSessionDto,
  "id" | "trainingDayId" | "createdAtUtc" | "updatedAtUtc"
> & {
  date: string;
};

export type TrendReportSelectionDto = {
  muscleGroup: MuscleGroup;
  exerciseName: string;
};

export type CreateTrendReportRequestDto = {
  startWeek: string;
  endWeek: string;
  comparisonStartWeek?: string;
  comparisonEndWeek?: string;
  selections: TrendReportSelectionDto[];
  reportTypes: TrendReportType[];
};

export type TrendReportPointDto = {
  label: string;
  value: number;
};

export type TrendReportSeriesDto = {
  id: string;
  label: string;
  detail?: string;
  variant: "dark" | "green" | "blue" | "purple" | "amber";
  data: TrendReportPointDto[];
};

export type TrendReportChartDto = {
  type: Exclude<TrendReportType, "muscleStimulation">;
  title: string;
  series: TrendReportSeriesDto[];
};

export type MuscleStimulationItemDto = {
  muscle: MuscleGroup;
  score: number;
  percentage: number;
  change: number;
  level: "high" | "medium" | "low" | "none";
};

export type MuscleStimulationReportDto = {
  totalScore: number;
  changeFromPreviousPeriod: number;
  highStimulusMuscleCount: number;
  lowStimulusMuscleCount: number;
  muscles: MuscleStimulationItemDto[];
};

export type TrendReportResultDto = {
  startWeek: string;
  endWeek: string;
  comparisonStartWeek?: string;
  comparisonEndWeek?: string;
  weekLabels: string[];
  charts: TrendReportChartDto[];
  muscleStimulation?: MuscleStimulationReportDto;
};

export type TrendReportJobStatus =
  | "Queued"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Cancelled";

export type TrendReportJobDto = {
  id: number;
  status: TrendReportJobStatus;
  progressPercent: number;
  currentStage: string;
  errorMessage?: string;
  createdAtUtc: string;
  startedAtUtc?: string;
  completedAtUtc?: string;
  updatedAtUtc: string;
  result?: TrendReportResultDto;
};

export type RegisterRequestDto = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  betaInviteCode: string;
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type UpdateProfileRequestDto = {
  displayName: string;
  trainingGoal?: string;
  weeklyTargetTrainingDays: number;
  preferredUnit: "kg" | "lb";
};

export type AuthResultDto = {
  user: AuthUser;
};
