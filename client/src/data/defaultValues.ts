import type {
  ProgramSettings,
  PreCheckDetailsLog,
  TrainingSessionDraft,
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
  restingHeartRateBpm: 65,
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
