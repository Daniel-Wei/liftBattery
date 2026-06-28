import type {
  ProgramSettings,
  PreCheckDetailsLog,
  TrainingSessionDraft,
  TrendReportType,
} from "../types/appTypes";
import { getLocalDateString } from "../helpers/GenericHelpers";

export const defaultProgramSettings: ProgramSettings = {
  cycleStartDate: "2026-04-27",
  weeksPerCycle: 4,
  mode: "Strength / hypertrophy",
  priorityMuscles: ["Back", "Glutes", "Quads"],
  weeklyPriorityHardSetTarget: 50,
};

export const initialPreCheckDetailsInput: PreCheckDetailsLog = {
  sleepHours: 7.5,
  soreness: 3,
  motivation: 7,
  restingHeartRateDelta: 1,
  previousSessionRpe: 7,
  previousSessionDurationMinutes: 60,
};

export const initialTrainingSessionDetailsInput: TrainingSessionDraft = {
  date: getLocalDateString(),
  startTime: "18:00",
  durationMinutes: 60,
  sessionRpe: 7,
  exercises: [
    {
      id: -1,
      exerciseName: "Bench Press",
      muscleGroup: "Chest",
      sets: [
        {
          id: -2,
          isWarmup: false,
          reps: 8,
          weightKg: 60,
        },
      ],
    },
  ],
};

export const defaultReportTypeOptions: Array<{ value: TrendReportType; label: string }> = [
  { value: "readiness", label: "练前状态分数趋势" },
  { value: "sleep", label: "睡眠时长趋势" },
  { value: "sessionLoad", label: "训练周期负荷" },
  { value: "volume", label: "训练周期训练量" },
  { value: "estimatedPr", label: "动作预计单次最大重量趋势" },
  { value: "muscleStimulation", label: "肌群刺激分布" },
];
