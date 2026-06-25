import type { MuscleGroup, TrendReportType } from "../types/appTypes";

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
  type: TrendReportType;
  title: string;
  series: TrendReportSeriesDto[];
};

export type TrendReportResultDto = {
  startWeek: string;
  endWeek: string;
  weekLabels: string[];
  charts: TrendReportChartDto[];
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
