import { PreCheckLog, MainDriver, MainDriverId, MetricStatus, MuscleGroup, PreCheckDetailsLog, ProgramSettings, ReadinessResult, ReadinessStatus, SetEntry, TrainingSession } from "./appTypes";

// #region: primitive type guards
export function isStringKeyValuePairObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isMuscleGroup(value: unknown): value is MuscleGroup {
  return value === "Chest"
    || value === "Back"
    || value === "Shoulders"
    || value === "Biceps"
    || value === "Triceps"
    || value === "Quads"
    || value === "Hamstrings"
    || value === "Glutes"
    || value === "Calves"
    || value === "Abs";
}
// #endregion

// #region: type guards for program settings
export function isProgramSettings(value: unknown): value is ProgramSettings {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isNumber(value.currentWeek)
    && isNumber(value.totalWeeks)
    && isString(value.mode)
    && Array.isArray(value.priorityMuscles)
    && value.priorityMuscles.every(isMuscleGroup)
    && isNumber(value.weeklyPriorityHardSetTarget)
  );
}
// #endregion

// #region: type guards for pre-check
export function isPreCheckInput(value: unknown): value is PreCheckDetailsLog {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isNumber(value.sleepHours)
    && isNumber(value.soreness)
    && isNumber(value.motivation)
    && isNumber(value.restingHeartRateDelta)
    && isNumber(value.previousSessionRpe)
    && isNumber(value.previousSessionDurationMinutes)
  );
}

// Verifies that a saved main driver uses one of our known driver ids.
export function isMainDriverId(value: unknown): value is MainDriverId {
  return value === MainDriverId.ShortSleep
    || value === MainDriverId.HighSoreness
    || value === MainDriverId.LowMotivation
    || value === MainDriverId.RestingHeartRateAboveBaseline
    || value === MainDriverId.HardPreviousSessionLoad
    || value === MainDriverId.NoMajorIssues;
}

// Validates one readiness driver stored inside a saved daily log.
export function isMainDriver(value: unknown): value is MainDriver {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isMainDriverId(value.id)
    && isString(value.message)
    && isString(value.reason)
  );
}

export function isReadinessStatus(value: unknown): value is ReadinessStatus {
  return value === ReadinessStatus.Ready
    || value === ReadinessStatus.Steady
    || value === ReadinessStatus.Caution
    || value === ReadinessStatus.Recovery;
}

export function isMetricStatus(value: unknown): value is MetricStatus {
  return value === MetricStatus.Good
    || value === MetricStatus.Watch
    || value === MetricStatus.Risk
    || value === MetricStatus.Neutral;
}

// Validates the calculated readiness result stored with a saved log.
export function isReadinessResult(value: unknown): value is ReadinessResult {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isNumber(value.score)
    && isReadinessStatus(value.status)
    && isString(value.statusLabel)
    && isString(value.statusLabelZh)
    && isMetricStatus(value.badgeStatus)
    && isString(value.recommendation)
    && isString(value.recommendationZh)
    && Array.isArray(value.mainDrivers)
    && value.mainDrivers.every(isMainDriver)
  );
}

// Validates one saved daily log from localStorage.
export function isDailyPreCheckLog(value: unknown): value is PreCheckLog {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isString(value.date)
    && isPreCheckInput(value.input)
    && isReadinessResult(value.readiness)
    && isString(value.createdAt)
    && isString(value.updatedAt)
  );
}

// Validates the full saved log list from localStorage.
export function isDailyPreCheckLogArray(value: unknown): value is PreCheckLog[] {
  return Array.isArray(value) && value.every(isDailyPreCheckLog);
}
// #endregion

// #region: type guards for training
export function isSetEntry(value: unknown): value is SetEntry {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isNumber(value.reps)
    && isNumber(value.weightKg)
    && (value.rpe === undefined || isNumber(value.rpe))
    && (value.rir === undefined || isNumber(value.rir))
    && isBoolean(value.isWarmup)
  );
}

export function isSetArray(value: unknown): value is SetEntry[] {
  return Array.isArray(value) && value.every(isSetEntry);
}

export function isTrainingSession(value: unknown): value is TrainingSession {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isString(value.date)
    && isNumber(value.durationMinutes)
    && isNumber(value.sessionRpe)
    && isString(value.exerciseName)
    && isMuscleGroup(value.primaryMuscleGroup)
    && Array.isArray(value.sets)
    && value.sets.every(isSetEntry)
    && isString(value.createdAt)
    && isString(value.updatedAt)
  );
}
// #endregion