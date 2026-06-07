import type {
  ProgramSettings,
  LiftBatteryState,
  PreCheckDetailsLog,
} from "../types/appTypes";

export const defaultProgramSettings: ProgramSettings = {
  currentWeek: 1,
  totalWeeks: 12,
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

export const defaultLiftBatteryState: LiftBatteryState = {
  preCheckDraft: initialPreCheckDetailsInput,
  preCheckDraftUpdated: true,
  preCheckLogs: [],
  trainingSessions: [],
  programSettings: defaultProgramSettings,
};