import {
  EvidenceType,
  MetricStatus,
  ReadinessStatus,
  TrendDirection,
  type Metric,
  type MuscleGroup,
  type ProgramSettings,
  type ReadinessResult,
  type SetEntry,
  type TrainingSession,
} from "../types/appTypes";

// This file is intentionally React-free.
// It turns saved 1.0 app data into the Metric[] shape that Overview cards already understand.

const HIGH_SESSION_LOAD_THRESHOLD = 600;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

type DerivedOverviewMetricArgs = {
  trainingSessions: TrainingSession[];
  programSettings: ProgramSettings;
  currentReadiness: ReadinessResult;
};

type WatchStateMetricArgs = {
  currentReadiness: ReadinessResult;
  latestSessionLoad: number | null;
  priorityHardSetCount: number;
  weeklyPriorityHardSetTarget: number;
};

function getDateTime(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function sortTrainingSessionsNewestFirst(trainingSessions: TrainingSession[]) {
  return [...trainingSessions].sort((firstSession, secondSession) => (
    secondSession.date.localeCompare(firstSession.date)
    || secondSession.updatedAt.localeCompare(firstSession.updatedAt)
  ));
}

function formatWholeNumber(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

function formatRpe(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export function getLatestTrainingSession(trainingSessions: TrainingSession[]) {
  return sortTrainingSessionsNewestFirst(trainingSessions)[0] ?? null;
}

// Uses the latest saved training session as the anchor for the 7-day training window.
export function getTrainingSessionsInLast7Days(trainingSessions: TrainingSession[]) {
  const latestSession = getLatestTrainingSession(trainingSessions);

  if (!latestSession) {
    return [];
  }

  const latestDateTime = getDateTime(latestSession.date);
  const sevenDayWindowStart = latestDateTime - (6 * ONE_DAY_IN_MS);

  return trainingSessions.filter((session) => {
    const sessionDateTime = getDateTime(session.date);
    return sessionDateTime >= sevenDayWindowStart && sessionDateTime <= latestDateTime;
  });
}

// Session load uses the common session-RPE formula: session RPE x session duration.
export function getSessionLoad(session: TrainingSession) {
  return session.sessionRpe * session.durationMinutes;
}

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

export function getPriorityHardSetCount(
  trainingSessions: TrainingSession[],
  priorityMuscles: MuscleGroup[],
) {
  return trainingSessions.reduce((sessionTotal, session) => {
    if (!priorityMuscles.includes(session.primaryMuscleGroup)) {
      return sessionTotal;
    }

    return sessionTotal + session.sets.filter(isHardSet).length;
  }, 0);
}

export function getTopSetEffort(trainingSessions: TrainingSession[]) {
  const allSets = trainingSessions.flatMap((session) => session.sets);
  const rpeValues = allSets
    .filter((set) => !set.isWarmup && set.rpe !== undefined)
    .map((set) => set.rpe ?? 0);

  if (rpeValues.length > 0) {
    return `RPE ${formatRpe(Math.max(...rpeValues))}`;
  }

  const rirValues = allSets
    .filter((set) => !set.isWarmup && set.rir !== undefined)
    .map((set) => set.rir ?? 0);

  if (rirValues.length > 0) {
    const lowestRir = Math.min(...rirValues);
    return lowestRir <= 1 ? "0-1 RIR" : `${formatRpe(lowestRir)} RIR`;
  }

  return "No top set";
}

function getTopSetEffortStatus(topSetEffort: string) {
  if (topSetEffort === "No top set") {
    return MetricStatus.Neutral;
  }

  if (topSetEffort.includes("0-1 RIR")) {
    return MetricStatus.Watch;
  }

  if (topSetEffort.startsWith("RPE")) {
    const rpeValue = Number(topSetEffort.replace("RPE", "").trim());
    return rpeValue >= 9 ? MetricStatus.Watch : MetricStatus.Good;
  }

  return MetricStatus.Neutral;
}

function getReadinessTrendDirection(currentReadiness: ReadinessResult) {
  if (currentReadiness.status === ReadinessStatus.Ready) {
    return TrendDirection.Up;
  }

  if (
    currentReadiness.status === ReadinessStatus.Caution
    || currentReadiness.status === ReadinessStatus.Recovery
  ) {
    return TrendDirection.Down;
  }

  return TrendDirection.Stable;
}

export function getWatchStateMetric(args: WatchStateMetricArgs): Metric {
  const {
    currentReadiness,
    latestSessionLoad,
    priorityHardSetCount,
    weeklyPriorityHardSetTarget,
  } = args;

  if (
    currentReadiness.status === ReadinessStatus.Caution
    || currentReadiness.status === ReadinessStatus.Recovery
    || (latestSessionLoad !== null && latestSessionLoad >= HIGH_SESSION_LOAD_THRESHOLD)
  ) {
    return {
      label: "Watch State",
      labelZh: "观察状态",
      value: "Recovery watch",
      trend: TrendDirection.Down,
      status: currentReadiness.badgeStatus,
      evidenceType: EvidenceType.Watch,
      explanation: "Readiness is low or the latest saved session load is high.",
      explanationZh: "练前状态偏低，或最近一次已保存训练课负荷偏高。",
    };
  }

  if (
    currentReadiness.badgeStatus === MetricStatus.Good
    && priorityHardSetCount >= weeklyPriorityHardSetTarget
  ) {
    return {
      label: "Watch State",
      labelZh: "观察状态",
      value: "Productive week",
      trend: TrendDirection.Up,
      status: MetricStatus.Good,
      evidenceType: EvidenceType.Watch,
      explanation: "Readiness is good and priority hard sets are on track.",
      explanationZh: "练前状态较好，重点肌群 hard sets 已接近或达到目标。",
    };
  }

  return {
    label: "Watch State",
    labelZh: "观察状态",
    value: "Normal watch",
    trend: TrendDirection.Stable,
    status: MetricStatus.Neutral,
    evidenceType: EvidenceType.Watch,
    explanation: "No strong recovery or priority-volume watch state is present.",
    explanationZh: "当前没有明显恢复或重点训练量观察状态。",
  };
}

export function getDerivedOverviewMetrics(args: DerivedOverviewMetricArgs): Metric[] {
  const {
    trainingSessions,
    programSettings,
    currentReadiness,
  } = args;
  const latestSession = getLatestTrainingSession(trainingSessions);
  const latestSessionLoad = latestSession ? getSessionLoad(latestSession) : null;
  const recentTrainingSessions = getTrainingSessionsInLast7Days(trainingSessions);
  const priorityHardSetCount = getPriorityHardSetCount(
    recentTrainingSessions,
    programSettings.priorityMuscles,
  );
  const topSetEffort = getTopSetEffort(recentTrainingSessions);

  return [
    {
      label: "Session Load",
      labelZh: "训练课负荷",
      value: latestSessionLoad === null ? "No session" : `${formatWholeNumber(latestSessionLoad)} AU`,
      trend: latestSessionLoad !== null && latestSessionLoad >= HIGH_SESSION_LOAD_THRESHOLD
        ? TrendDirection.Up
        : TrendDirection.Stable,
      status: latestSessionLoad !== null && latestSessionLoad >= HIGH_SESSION_LOAD_THRESHOLD
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.Established,
      explanation: "Uses the latest saved training session: session RPE x duration minutes.",
      explanationZh: "使用最近一次已保存训练课：session RPE x 训练时长。",
    },
    {
      label: "Priority Hard Sets",
      labelZh: "重点 hard sets",
      value: `${priorityHardSetCount} / ${programSettings.weeklyPriorityHardSetTarget}`,
      trend: priorityHardSetCount >= programSettings.weeklyPriorityHardSetTarget
        ? TrendDirection.Up
        : TrendDirection.Stable,
      status: priorityHardSetCount >= programSettings.weeklyPriorityHardSetTarget
        ? MetricStatus.Good
        : MetricStatus.Watch,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Counts non-warmup hard sets for priority muscles in the latest 7-day window.",
      explanationZh: "统计最近 7 天重点肌群的非热身 hard sets。",
    },
    {
      label: "Top Set Effort",
      labelZh: "顶组努力程度",
      value: topSetEffort,
      trend: topSetEffort === "No top set" ? TrendDirection.Stable : TrendDirection.Up,
      status: getTopSetEffortStatus(topSetEffort),
      evidenceType: EvidenceType.Established,
      explanation: "Uses the highest set RPE in the latest 7 days, then falls back to lowest RIR.",
      explanationZh: "优先使用最近 7 天最高 set RPE；没有 RPE 时使用最低 RIR。",
    },
    {
      label: "Wellness Readiness",
      labelZh: "练前状态",
      value: `${currentReadiness.score} / 100`,
      trend: getReadinessTrendDirection(currentReadiness),
      status: currentReadiness.badgeStatus,
      evidenceType: EvidenceType.Proxy,
      explanation: "Uses the current Today pre-workout readiness calculation.",
      explanationZh: "使用 Today 页面当前练前状态计算结果。",
    },
    getWatchStateMetric({
      currentReadiness,
      latestSessionLoad,
      priorityHardSetCount,
      weeklyPriorityHardSetTarget: programSettings.weeklyPriorityHardSetTarget,
    }),
  ];
}
