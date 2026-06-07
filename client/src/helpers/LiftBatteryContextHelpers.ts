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
  initialPreCheckDetailsInput,
  defaultProgramSettings,
} from "../data/defaultValues";
import { 
    PRE_CHECK_DRAFT_STORAGE_KEY,
    PRE_CHECK_LOGS_STORAGE_KEY,
    TRAINING_SESSIONS_STORAGE_KEY,
    PROGRAM_SETTINGS_STORAGE_KEY,
 } from "../state/LiftBatteryContextLocalStorageKeys";
import { PreCheckLog, LiftBatteryState, PreCheckDetailsLog, TrainingSession } from "../types/appTypes";

// #region: helper functions for pre-check
// Loads the current unsaved draft, falling back safely if storage is empty or invalid.
function loadPreCheck() {
  try {
    const savedValue = localStorage.getItem(PRE_CHECK_DRAFT_STORAGE_KEY);

    if (savedValue === null) {
      return initialPreCheckDetailsInput;
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isPreCheckInput(parsedValue)) {
      return parsedValue;
    }

    return initialPreCheckDetailsInput;
  } catch {
    return initialPreCheckDetailsInput;
  }
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
    || !isMuscleGroup(value.primaryMuscleGroup)
  ) {
    return null;
  }

  return {
    id: value.id,
    date: value.date,
    durationMinutes: value.durationMinutes,
    sessionRpe: value.sessionRpe,
    exerciseName: value.exerciseName,
    primaryMuscleGroup: value.primaryMuscleGroup,
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