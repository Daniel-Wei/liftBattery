import { 
    formatDecimal,
    formatWholeNumber,
    getLocalDateString, 
    getOptionalNumber } 
from "./GenericHelpers";
import { 
    MuscleGroup, 
    MuscleGroupFilter, 
    SetEntry, 
    MetricStatus, 
    TrainingSession, 
    TrainingSessionForm,
    ExerciseSummary,
    MuscleSummary,
    Metric, 
    TrendDirection,
    EvidenceType,} 
from "../types/appTypes";
import { TRAINING_SESSIONS_STORAGE_KEY } from "../data/localStorageKeys";
import {
  isString,
  isNumber,
  isStringKeyValuePairObjectRecord,
  isMuscleGroup,
  isSetArray,
  isSetEntry,
} from "../types/appTypeChecks";

export function createDefaultTrainingSessionForm(primaryMuscleGroup: MuscleGroup): TrainingSessionForm {
  return {
    date: getLocalDateString(),
    durationMinutes: "60",
    sessionRpe: "7",
    exerciseName: "Squat",
    primaryMuscleGroup,
    setsCount: "3",
    reps: "8",
    weightKg: "60",
    setRpe: "8",
    rir: "",
  };
}

// #region: internal helpers

// Hard set is a product rule for display, not a medical or physiological diagnosis.
function isHardSet(set: SetEntry) {
  if (set.isWarmup) {
    return false;
  }

  if (set.rir !== undefined) {
    return set.rir <= 3;
  }

  if (set.rpe !== undefined) {
    return set.rpe >= 7;
  }

  return set.reps > 0;
}

function getSessionHardSetCount(session: TrainingSession) {
  return getWorkingSets(session).filter(isHardSet).length;
}

function getSessionVolumeLoad(session: TrainingSession) {
  return getWorkingSets(session).reduce((totalVolume, set) => (
    totalVolume + (set.reps * set.weightKg)
  ), 0);
}

function getTotalHardSetCount(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalSets, session) => (
    totalSets + getSessionHardSetCount(session)
  ), 0);
}

function getTotalVolumeLoad(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalVolume, session) => (
    totalVolume + getSessionVolumeLoad(session)
  ), 0);
}

function getTopSetEffortValue(trainingSessions: TrainingSession[]) {
  const workingSets = trainingSessions.flatMap(getWorkingSets);
  const rpeValues = workingSets
    .filter((set) => set.rpe !== undefined)
    .map((set) => set.rpe ?? 0);

  if (rpeValues.length > 0) {
    return `RPE ${formatDecimal(Math.max(...rpeValues))}`;
  }

  const rirValues = workingSets
    .filter((set) => set.rir !== undefined)
    .map((set) => set.rir ?? 0);

  if (rirValues.length > 0) {
    return `${formatDecimal(Math.min(...rirValues))} RIR`;
  }

  return "No effort data";
}

function getTopSetEffortStatus(topSetEffort: string) {
  if (topSetEffort === "No effort data") {
    return MetricStatus.Neutral;
  }

  if (topSetEffort.startsWith("RPE ")) {
    const rpe = Number(topSetEffort.replace("RPE ", ""));
    return rpe >= 9 ? MetricStatus.Watch : MetricStatus.Good;
  }

  const rir = Number(topSetEffort.replace(" RIR", ""));
  return rir <= 1 ? MetricStatus.Watch : MetricStatus.Good;
}

// #endregion

// Session load follows the common session-RPE method: session RPE x duration minutes.
export function getSessionLoad(session: TrainingSession) {
  return session.durationMinutes * session.sessionRpe;
}

// Validates the simple post-workout form before it becomes a typed TrainingSession.
export function getTrainingFormError(form: TrainingSessionForm) {
  const durationMinutes = Number(form.durationMinutes);
  const sessionRpe = Number(form.sessionRpe);
  const setsCount = Number(form.setsCount);
  const reps = Number(form.reps);
  const weightKg = Number(form.weightKg);
  const setRpe = getOptionalNumber(form.setRpe);
  const rir = getOptionalNumber(form.rir);

  if (form.date.trim() === "") {
    return "Please choose a session date.";
  }

  if (form.exerciseName.trim() === "") {
    return "Please enter an exercise name.";
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
    return "Duration must be greater than 0 minutes.";
  }

  if (!Number.isFinite(sessionRpe) || sessionRpe < 1 || sessionRpe > 10) {
    return "Session RPE must be between 1 and 10.";
  }

  if (!Number.isInteger(setsCount) || setsCount <= 0) {
    return "Sets must be a whole number greater than 0.";
  }

  if (!Number.isFinite(reps) || reps <= 0) {
    return "Reps must be greater than 0.";
  }

  if (!Number.isFinite(weightKg) || weightKg < 0) {
    return "Weight must be 0 kg or higher.";
  }

  if (setRpe !== undefined && (!Number.isFinite(setRpe) || setRpe < 1 || setRpe > 10)) {
    return "Set RPE must be blank or between 1 and 10.";
  }

  if (rir !== undefined && (!Number.isFinite(rir) || rir < 0)) {
    return "RIR must be blank or 0 or higher.";
  }

  return null;
}

export function getSessionExerciseName(session: TrainingSession) {
  return session.exerciseName;
}

export function getWorkingSets(session: TrainingSession) {
  return session.sets.filter((set) => !set.isWarmup);
}

export function getSessionSetCount(session: TrainingSession) {
  return getWorkingSets(session).length;
}

// Newest-first sorting makes the "latest session" card stable and predictable.
export function sortTrainingSessionsNewestFirst(trainingSessions: TrainingSession[]) {
  return [...trainingSessions].sort((firstSession, secondSession) => (
    secondSession.date.localeCompare(firstSession.date)
    || secondSession.updatedAt.localeCompare(firstSession.updatedAt)
  ));
}

export function doesSessionMatchMuscleGroup(
  session: TrainingSession,
  selectedMuscleGroup: MuscleGroupFilter,
) {
  if (selectedMuscleGroup === "All") {
    return true;
  }

  return session.primaryMuscleGroup === selectedMuscleGroup;
}

// Converts saved sessions into the metric-card shape used by the Training page.
export function buildRealTrainingMetrics(trainingSessions: TrainingSession[]): Metric[] {
  const sortedSessions = sortTrainingSessionsNewestFirst(trainingSessions);
  const latestSession = sortedSessions[0] ?? null;
  const hardSets = getTotalHardSetCount(sortedSessions);
  const volumeLoad = getTotalVolumeLoad(sortedSessions);
  const topSetEffort = getTopSetEffortValue(sortedSessions);

  return [
    {
      label: "Latest Session Load",
      labelZh: "最近训练负荷",
      value: latestSession ? `${formatWholeNumber(getSessionLoad(latestSession))} AU` : "No session",
      trend: latestSession ? TrendDirection.Up : TrendDirection.Stable,
      status: latestSession && getSessionLoad(latestSession) >= 600
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Calculated only from saved training sessions: session RPE x duration.",
      explanationZh: "只从已保存训练记录计算：session RPE x 训练时长。",
    },
    {
      label: "Latest Session Time",
      labelZh: "最近训练时长",
      value: latestSession ? `${latestSession.durationMinutes} min` : "No session",
      trend: TrendDirection.Stable,
      status: latestSession ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Uses the duration field from the latest saved session.",
      explanationZh: "使用最近一条已保存训练记录里的训练时长。",
    },
    {
      label: "Latest Session RPE",
      labelZh: "最近训练 RPE",
      value: latestSession ? `${latestSession.sessionRpe} / 10` : "No session",
      trend: latestSession && latestSession.sessionRpe >= 8
        ? TrendDirection.Up
        : TrendDirection.Stable,
      status: latestSession && latestSession.sessionRpe >= 8
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Uses the session RPE field from the latest saved session.",
      explanationZh: "使用最近一条已保存训练记录里的 session RPE。",
    },
    {
      label: "Saved Hard Sets",
      labelZh: "已保存 hard sets",
      value: `${hardSets}`,
      trend: hardSets > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: hardSets > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Counts saved non-warmup sets that are hard enough by RPE or RIR.",
      explanationZh: "统计已保存训练中按 RPE 或 RIR 判断足够接近力竭的非热身组。",
    },
    {
      label: "Saved Volume Load",
      labelZh: "已保存训练量",
      value: `${formatWholeNumber(volumeLoad)} kg`,
      trend: volumeLoad > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: volumeLoad > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Sums reps x weight across saved non-warmup sets.",
      explanationZh: "汇总已保存非热身组的 次数 x 重量。",
    },
    {
      label: "Top Set Effort",
      labelZh: "顶组努力程度",
      value: topSetEffort,
      trend: topSetEffort === "No effort data" ? TrendDirection.Stable : TrendDirection.Up,
      status: getTopSetEffortStatus(topSetEffort),
      evidenceType: EvidenceType.Established,
      explanation: "Uses saved set RPE first, then saved RIR if RPE is missing.",
      explanationZh: "优先使用已保存的单组 RPE；没有 RPE 时使用 RIR。",
    },
  ];
}

// Groups saved sessions by exercise so the page can show what the user actually trained.
export function getExerciseSummaries(trainingSessions: TrainingSession[]) {
  const summaryMap = new Map<string, ExerciseSummary>();

  trainingSessions.forEach((session) => {
    const key = `${session.exerciseName}-${session.primaryMuscleGroup}`;
    const existingSummary = summaryMap.get(key);
    const workingSets = getWorkingSets(session);
    const volumeLoad = workingSets.reduce((totalVolume, set) => (
      totalVolume + (set.reps * set.weightKg)
    ), 0);

    if (existingSummary) {
      existingSummary.sessions += 1;
      existingSummary.sets += workingSets.length;
      existingSummary.volumeLoad += volumeLoad;
      return;
    }

    summaryMap.set(key, {
      key,
      exerciseName: session.exerciseName,
      muscleGroups: session.primaryMuscleGroup,
      sessions: 1,
      sets: workingSets.length,
      volumeLoad,
    });
  });

  return [...summaryMap.values()].sort((firstSummary, secondSummary) => (
    secondSummary.volumeLoad - firstSummary.volumeLoad
  ));
}

// Shows whether saved sets are landing on the user's configured priority muscles.
export function getPriorityMuscleSummaries(
  trainingSessions: TrainingSession[],
  priorityMuscles: MuscleGroup[],
) {
  return priorityMuscles.map((muscleGroup) => {
    const summary = trainingSessions.reduce<MuscleSummary>((currentSummary, session) => {
      if (session.primaryMuscleGroup !== muscleGroup) {
        return currentSummary;
      }

      const workingSets = getWorkingSets(session);
      currentSummary.hardSets += workingSets.filter(isHardSet).length;
      currentSummary.volumeLoad += workingSets.reduce((totalVolume, set) => (
        totalVolume + (set.reps * set.weightKg)
      ), 0);

      return currentSummary;
    }, {
      muscleGroup,
      hardSets: 0,
      volumeLoad: 0,
    });

    return summary;
  });
}

export function loadSavedTrainingSessions() {
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

function getTrainingSessionArrayFromStorage(value: unknown): TrainingSession[] | null {
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

function isTrainingSession(value: unknown): value is TrainingSession {
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
