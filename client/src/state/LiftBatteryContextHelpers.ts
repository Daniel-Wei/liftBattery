import {
  isTrainingSession,
  isString,
  isNumber,
  isStringKeyValuePairObjectRecord,
  isPreCheckInput,
  isProgramSettings,
  isMuscleGroup,
  isSetArray,
  isDailyPreCheckLogArray,
} from "../types/appTypeChecks";
import {
  initialPreCheckInput,
  defaultProgramSettings,
} from "../data/defaultValues";
import { 
    PRE_CHECK_DRAFT_STORAGE_KEY,
    PRE_CHECK_LOGS_STORAGE_KEY,
    TRAINING_SESSIONS_STORAGE_KEY,
    PROGRAM_SETTINGS_STORAGE_KEY,
 } from "./LiftBatteryContextLocalStorageKeys";
import { DailyPreCheckLog, LiftBatteryState, PreCheckInput, TrainingSession } from "../types/appTypes";

// #region: helper functions for pre-check
// Loads the current unsaved draft, falling back safely if storage is empty or invalid.
function loadPreCheck() {
  try {
    const savedValue = localStorage.getItem(PRE_CHECK_DRAFT_STORAGE_KEY);

    if (savedValue === null) {
      return initialPreCheckInput;
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isPreCheckInput(parsedValue)) {
      return parsedValue;
    }

    return initialPreCheckInput;
  } catch {
    return initialPreCheckInput;
  }
}

// Loads saved history logs, falling back to an empty history if storage is empty or invalid.
function loadPreCheckLogs() {
  try {
    const savedValue = localStorage.getItem(PRE_CHECK_LOGS_STORAGE_KEY);

    if (savedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isDailyPreCheckLogArray(parsedValue)) {
      return parsedValue;
    }

    return [];
  } catch {
    return [];
  }
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}
    
export function getTodayPreCheck(logs: DailyPreCheckLog[]) {
  const today = getTodayDate();
  return logs.find((log) => log.date === today);
}

function isSamePreCheckInput(firstInput: PreCheckInput, secondInput: PreCheckInput) {
  return (
    firstInput.sleepHours === secondInput.sleepHours
    && firstInput.soreness === secondInput.soreness
    && firstInput.motivation === secondInput.motivation
    && firstInput.restingHeartRateDelta === secondInput.restingHeartRateDelta
    && firstInput.previousSessionRpe === secondInput.previousSessionRpe
    && firstInput.previousSessionDurationMinutes === secondInput.previousSessionDurationMinutes
  );
}

export function getPreCheckDraftUpdated(todayDraft: PreCheckInput, logs: DailyPreCheckLog[]) {
  const todayLog = getTodayPreCheck(logs);

  if (!todayLog) {
    return true;
  }

  return !isSamePreCheckInput(todayDraft, todayLog.input);
}

// Keeps latestLog and last7Logs consistent without mutating the original logs array.
export function sortLogsNewestFirst(logs: DailyPreCheckLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    secondLog.date.localeCompare(firstLog.date)
    || secondLog.updatedAt.localeCompare(firstLog.updatedAt)
  ));
}
// #endregion

//#region: helper functions for training sessions
function getTrainingSessionFromStorage(value: unknown): TrainingSession | null {
  if (isTrainingSession(value)) {
    return value;
  }

  if (!isStringKeyValuePairObjectRecord(value)) {
    return null;
  }

  if (
    !isString(value.id)
    || !isString(value.date)
    || !isNumber(value.durationMinutes)
    || !isNumber(value.sessionRpe)
    || !isString(value.exerciseName)
    || !isSetArray(value.sets)
    || !isString(value.createdAt)
    || !isString(value.updatedAt)
    || !isMuscleGroup(value.MuscleGroup)
  ) {
    return null;
  }

  return {
    id: value.id,
    date: value.date,
    durationMinutes: value.durationMinutes,
    sessionRpe: value.sessionRpe,
    exerciseName: value.exerciseName,
    primaryMuscleGroup: value.MuscleGroup,
    sets: value.sets,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function getTrainingSessionArrayFromStorage(value: unknown): TrainingSession[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const trainingSessions: TrainingSession[] = [];

  for (const storedSession of value) {
    const trainingSession = getTrainingSessionFromStorage(storedSession);

    if (trainingSession === null) {
      return null;
    }

    trainingSessions.push(trainingSession);
  }

  return trainingSessions;
}

function loadTrainingSessions() {
  try {
    const savedValue = localStorage.getItem(TRAINING_SESSIONS_STORAGE_KEY);

    if (savedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    const trainingSessions = getTrainingSessionArrayFromStorage(parsedValue);

    if (trainingSessions !== null) {
      return trainingSessions;
    }

    return [];
  } catch {
    return [];
  }
}
// #endregion

// #region: helper functions for program settings
function loadProgramSettings() {
  try {
    const savedValue = localStorage.getItem(PROGRAM_SETTINGS_STORAGE_KEY);

    if (savedValue === null) {
      return defaultProgramSettings;
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isProgramSettings(parsedValue)) {
      return parsedValue;
    }

    return defaultProgramSettings;
  } catch {
    return defaultProgramSettings;
  }
}
// #endregion

// #region: helper functions for training log state management
// Builds the initial reducer state from separate localStorage keys.
export function loadInitialLiftBatteryState(): LiftBatteryState {
  const todayDraft = loadPreCheck();
  const preCheckLogs = loadPreCheckLogs();

  return {
    preCheckDraft: todayDraft,
    preCheckDraftUpdated: getPreCheckDraftUpdated(todayDraft, preCheckLogs),
    preCheckLogs: preCheckLogs,
    trainingSessions: loadTrainingSessions(),
    programSettings: loadProgramSettings(),
  };
}
// #endregion
