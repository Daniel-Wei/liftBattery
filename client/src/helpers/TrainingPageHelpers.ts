import {
  formatDecimal,
  formatWholeNumber,
} from "./GenericHelpers";
import {
  EvidenceType,
  MetricStatus,
  TrendDirection,
  type ExerciseSummary,
  type Metric,
  type MuscleGroup,
  type MuscleGroupFilter,
  type MuscleSummary,
  type SetEntry,
  type TrainingSession,
  type TrainingSessionDetails,
} from "../types/appTypes";
import { TRAINING_SESSIONS_STORAGE_KEY } from "../data/localStorageKeys";
import {
  isMuscleGroup,
  isNumber,
  isSetArray,
  isString,
  isStringKeyValuePairObjectRecord,
} from "../types/appTypeChecks";

export type TrainingExerciseGroup = {
  key: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  sessionIds: string[];
  sets: SetEntry[];
  setCount: number;
  workingSetCount: number;
  hardSetCount: number;
  volumeLoad: number;
  workingVolumeLoad: number;
};

export type TrainingMuscleGroupSummary = {
  muscleGroup: MuscleGroup;
  exercises: TrainingExerciseGroup[];
  setCount: number;
  workingSetCount: number;
  hardSetCount: number;
  volumeLoad: number;
  workingVolumeLoad: number;
};

export type TrainingDayGroup = {
  date: string;
  sessions: TrainingSession[];
  muscles: TrainingMuscleGroupSummary[];
  sessionRpe: number;
  setCount: number;
  workingSetCount: number;
  hardSetCount: number;
  volumeLoad: number;
  workingVolumeLoad: number;
  updatedAt: string;
};

function getSetVolumeLoad(set: SetEntry) {
  return set.reps * set.weightKg;
}

// Hard set is a product rule for display, not a medical or physiological diagnosis.
export function isHardSet(set: SetEntry) {
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

export function getWorkingSets(session: TrainingSession) {
  return session.sets.filter((set) => !set.isWarmup);
}

function getSessionVolumeLoad(session: TrainingSession) {
  return session.sets.reduce((totalVolume, set) => (
    totalVolume + getSetVolumeLoad(set)
  ), 0);
}

function getSessionWorkingVolumeLoad(session: TrainingSession) {
  return getWorkingSets(session).reduce((totalVolume, set) => (
    totalVolume + getSetVolumeLoad(set)
  ), 0);
}

function getTotalHardSetCount(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalSets, session) => (
    totalSets + getWorkingSets(session).filter(isHardSet).length
  ), 0);
}

function getTotalVolumeLoad(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalVolume, session) => (
    totalVolume + getSessionVolumeLoad(session)
  ), 0);
}

function getTotalWorkingVolumeLoad(trainingSessions: TrainingSession[]) {
  return trainingSessions.reduce((totalVolume, session) => (
    totalVolume + getSessionWorkingVolumeLoad(session)
  ), 0);
}

function getTopSetEffortValue(trainingSessions: TrainingSession[]) {
  const workingSets = trainingSessions.flatMap(getWorkingSets);
  const rpeValues = workingSets
    .filter((set) => set.rpe !== undefined)
    .map((set) => set.rpe ?? 0);

  if (rpeValues.length > 0) {
    return `单组难度 ${formatDecimal(Math.max(...rpeValues))}`;
  }

  const rirValues = workingSets
    .filter((set) => set.rir !== undefined)
    .map((set) => set.rir ?? 0);

  if (rirValues.length > 0) {
    return `力竭前剩余 ${formatDecimal(Math.min(...rirValues))} 次`;
  }

  return "暂无努力程度数据";
}

function getTopSetEffortStatus(topSetEffort: string) {
  if (topSetEffort === "暂无努力程度数据") {
    return MetricStatus.Neutral;
  }

  if (topSetEffort.startsWith("单组难度 ")) {
    const rpe = Number(topSetEffort.replace("单组难度 ", ""));
    return rpe >= 9 ? MetricStatus.Watch : MetricStatus.Good;
  }

  const rir = Number(topSetEffort.replace("力竭前剩余 ", "").replace(" 次", ""));
  return rir <= 1 ? MetricStatus.Watch : MetricStatus.Good;
}

export function getTrainingFormError(form: TrainingSessionDetails) {
  if (form.date.trim() === "") {
    return "请选择训练日期。";
  }

  if (form.exerciseName.trim() === "") {
    return "请选择训练动作。";
  }

  if (!Number.isFinite(form.sessionRpe) || form.sessionRpe < 1 || form.sessionRpe > 10) {
    return "训练总体难度必须在 1 到 10 之间。";
  }

  if (!Number.isInteger(form.sets) || form.sets <= 0) {
    return "组数必须是大于 0 的整数。";
  }

  if (!Number.isFinite(form.reps) || form.reps <= 0) {
    return "每组次数必须大于 0。";
  }

  if (!Number.isFinite(form.weightKg) || form.weightKg < 0) {
    return "重量必须大于或等于 0 千克。";
  }

  if (form.rpe !== undefined && (!Number.isFinite(form.rpe) || form.rpe < 1 || form.rpe > 10)) {
    return "单组难度可以留空，填写时必须在 1 到 10 之间。";
  }

  if (form.rir !== undefined && (!Number.isFinite(form.rir) || form.rir < 0)) {
    return "力竭前剩余次数可以留空，填写时必须大于或等于 0。";
  }

  return null;
}

export function getSessionExerciseName(session: TrainingSession) {
  const exerciseNames = [...new Set(getWorkingSets(session).map((set) => set.exerciseName))];

  if (exerciseNames.length === 0) {
    return "暂无动作";
  }

  return exerciseNames.length === 1 ? exerciseNames[0] : `${exerciseNames.length} 个动作`;
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

  return session.sets.some((set) => set.muscleGroup === selectedMuscleGroup);
}

// Converts saved sessions into the metric-card shape used by the Training page.
export function buildRealTrainingMetrics(trainingSessions: TrainingSession[]): Metric[] {
  const sortedSessions = sortTrainingSessionsNewestFirst(trainingSessions);
  const latestTrainingDay = getTrainingDayGroups(sortedSessions)[0] ?? null;
  const hardSets = getTotalHardSetCount(sortedSessions);
  const volumeLoad = getTotalVolumeLoad(sortedSessions);
  const workingVolumeLoad = getTotalWorkingVolumeLoad(sortedSessions);
  const topSetEffort = getTopSetEffortValue(sortedSessions);

  return [
    {
      label: "Latest Training Day",
      labelZh: "最近训练日",
      value: latestTrainingDay ? `${latestTrainingDay.setCount} 组` : "暂无训练记录",
      trend: latestTrainingDay ? TrendDirection.Up : TrendDirection.Stable,
      status: latestTrainingDay ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Uses saved sets from the latest training day; duration is captured only in Pre-check.",
      explanationZh: "使用最近训练日保存的组数；训练总时长只在练前检查中记录。",
    },
    {
      label: "Latest Session RPE",
      labelZh: "最近训练总体难度",
      value: latestTrainingDay ? `${latestTrainingDay.sessionRpe} / 10` : "暂无训练记录",
      trend: latestTrainingDay && latestTrainingDay.sessionRpe >= 8
        ? TrendDirection.Up
        : TrendDirection.Stable,
      status: latestTrainingDay && latestTrainingDay.sessionRpe >= 8
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Uses the session RPE from the latest saved training day.",
      explanationZh: "使用最近训练日的总体难度。",
    },
    {
      label: "Saved Hard Sets",
      labelZh: "已保存高强度组",
      value: `${hardSets}`,
      trend: hardSets > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: hardSets > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Counts saved non-warmup sets that are hard enough by RPE or RIR.",
      explanationZh: "统计已保存训练中按单组难度或力竭前剩余次数判断足够接近力竭的非热身组。",
    },
    {
      label: "Saved Total Volume",
      labelZh: "已保存总训练量",
      value: `${formatWholeNumber(volumeLoad)} 千克`,
      trend: volumeLoad > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: volumeLoad > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Sums reps x weight across all saved sets, including warm-ups.",
      explanationZh: "汇总所有已保存组的次数乘以重量，包括热身组。",
    },
    {
      label: "Saved Working Volume",
      labelZh: "已保存正式组训练量",
      value: `${formatWholeNumber(workingVolumeLoad)} 千克`,
      trend: workingVolumeLoad > 0 ? TrendDirection.Up : TrendDirection.Stable,
      status: workingVolumeLoad > 0 ? MetricStatus.Good : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Sums reps x weight across saved working sets only.",
      explanationZh: "只汇总已保存正式组的次数乘以重量。",
    },
    {
      label: "Top Set Effort",
      labelZh: "顶组努力程度",
      value: topSetEffort,
      trend: topSetEffort === "暂无努力程度数据" ? TrendDirection.Stable : TrendDirection.Up,
      status: getTopSetEffortStatus(topSetEffort),
      evidenceType: EvidenceType.Established,
      explanation: "Uses saved set RPE first, then saved RIR if RPE is missing.",
      explanationZh: "优先使用已保存的单组难度；没有单组难度时使用力竭前剩余次数。",
    },
  ];
}

// Groups saved sessions by exercise so the page can show what the user actually trained.
export function getExerciseSummaries(trainingSessions: TrainingSession[]) {
  const summaryMap = new Map<string, ExerciseSummary>();

  trainingSessions.forEach((session) => {
    session.sets.forEach((set) => {
      const key = `${set.exerciseName}-${set.muscleGroup}`;
      const existingSummary = summaryMap.get(key);
      const volumeLoad = getSetVolumeLoad(set);

      if (existingSummary) {
        existingSummary.sets += 1;
        existingSummary.volumeLoad += volumeLoad;
        return;
      }

      summaryMap.set(key, {
        key,
        exerciseName: set.exerciseName,
        muscleGroups: set.muscleGroup,
        sessions: 1,
        sets: 1,
        volumeLoad,
      });
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
      const muscleSets = getWorkingSets(session).filter((set) => set.muscleGroup === muscleGroup);

      currentSummary.hardSets += muscleSets.filter(isHardSet).length;
      currentSummary.volumeLoad += muscleSets.reduce((totalVolume, set) => (
        totalVolume + getSetVolumeLoad(set)
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

export function getTrainingDayGroups(trainingSessions: TrainingSession[]): TrainingDayGroup[] {
  const sortedSessions = sortTrainingSessionsNewestFirst(trainingSessions);
  const dayMap = new Map<string, TrainingDayGroup>();

  sortedSessions.forEach((session) => {
    let dayGroup = dayMap.get(session.date);

    if (!dayGroup) {
      dayGroup = {
        date: session.date,
        sessions: [],
        muscles: [],
        sessionRpe: session.sessionRpe,
        setCount: 0,
        workingSetCount: 0,
        hardSetCount: 0,
        volumeLoad: 0,
        workingVolumeLoad: 0,
        updatedAt: session.updatedAt,
      };
      dayMap.set(session.date, dayGroup);
    }

    dayGroup.sessions.push(session);

    if (session.updatedAt > dayGroup.updatedAt) {
      dayGroup.sessionRpe = session.sessionRpe;
      dayGroup.updatedAt = session.updatedAt;
    }

    session.sets.forEach((set) => {
      let muscleGroup = dayGroup.muscles.find((group) => group.muscleGroup === set.muscleGroup);

      if (!muscleGroup) {
        muscleGroup = {
          muscleGroup: set.muscleGroup,
          exercises: [],
          setCount: 0,
          workingSetCount: 0,
          hardSetCount: 0,
          volumeLoad: 0,
          workingVolumeLoad: 0,
        };
        dayGroup.muscles.push(muscleGroup);
      }

      let exerciseGroup = muscleGroup.exercises.find((group) => group.exerciseName === set.exerciseName);

      if (!exerciseGroup) {
        exerciseGroup = {
          key: `${dayGroup.date}-${set.muscleGroup}-${set.exerciseName}`,
          exerciseName: set.exerciseName,
          muscleGroup: set.muscleGroup,
          sessionIds: [],
          sets: [],
          setCount: 0,
          workingSetCount: 0,
          hardSetCount: 0,
          volumeLoad: 0,
          workingVolumeLoad: 0,
        };
        muscleGroup.exercises.push(exerciseGroup);
      }

      if (!exerciseGroup.sessionIds.includes(session.id)) {
        exerciseGroup.sessionIds.push(session.id);
      }

      const volumeLoad = getSetVolumeLoad(set);
      const workingVolumeLoad = set.isWarmup ? 0 : volumeLoad;
      const workingSetCount = set.isWarmup ? 0 : 1;
      const isHard = isHardSet(set);

      exerciseGroup.sets.push(set);
      exerciseGroup.setCount += 1;
      exerciseGroup.workingSetCount += workingSetCount;
      exerciseGroup.hardSetCount += isHard ? 1 : 0;
      exerciseGroup.volumeLoad += volumeLoad;
      exerciseGroup.workingVolumeLoad += workingVolumeLoad;
      muscleGroup.setCount += 1;
      muscleGroup.workingSetCount += workingSetCount;
      muscleGroup.hardSetCount += isHard ? 1 : 0;
      muscleGroup.volumeLoad += volumeLoad;
      muscleGroup.workingVolumeLoad += workingVolumeLoad;
      dayGroup.setCount += 1;
      dayGroup.workingSetCount += workingSetCount;
      dayGroup.hardSetCount += isHard ? 1 : 0;
      dayGroup.volumeLoad += volumeLoad;
      dayGroup.workingVolumeLoad += workingVolumeLoad;
    });
  });

  return [...dayMap.values()];
}

export function getLatestTrainingDayDetails(trainingSessions: TrainingSession[]) {
  const latestTrainingDay = getTrainingDayGroups(trainingSessions)[0] ?? null;

  if (latestTrainingDay === null) {
    return null;
  }

  return {
    date: latestTrainingDay.date,
    sessionRpe: latestTrainingDay.sessionRpe,
  };
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

  return null;
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
    && isSetArray(value.sets)
    && isString(value.createdAt)
    && isString(value.updatedAt)
  );
}
