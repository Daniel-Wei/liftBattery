import {
  EvidenceType,
  MetricStatus,
  ReadinessStatus,
  TrendDirection,
  type BodyweightEntry,
  type Metric,
  type MuscleGroup,
  type NutritionEntry,
  type ProgramSettings,
  type ReadinessResult,
  type SetEntry,
  type TrainingSession,
} from "../types/appTypes";

// This file is intentionally React-free.
// It converts saved user data into the Metric[] shape that Overview cards already understand.
// Keeping this logic here makes the formulas easier to test and keeps OverviewPage from becoming crowded.

// These thresholds are product heuristics for watch labels, not medical rules.
const HIGH_SESSION_LOAD_THRESHOLD = 600;
const CUT_PRESSURE_RATE_THRESHOLD = -0.0075;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

// All inputs needed to build the six live Overview cards.
type DerivedOverviewMetricArgs = {
  trainingSessions: TrainingSession[];
  bodyweightEntries: BodyweightEntry[];
  nutritionEntries: NutritionEntry[];
  programSettings: ProgramSettings;
  currentReadiness: ReadinessResult;
};

// Smaller argument type for the final combined watch-state card.
type WatchStateMetricArgs = {
  currentReadiness: ReadinessResult;
  latestSessionLoad: number | null;
  bodyweightRate: number | null;
  priorityHardSetCount: number;
  weeklyPriorityHardSetTarget: number;
  latestHunger: number | null;
};

// Converts the app's YYYY-MM-DD date string into a timestamp for window comparisons.
function getDateTime(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00`);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

// Newest-first sorting keeps "latest session" deterministic even if multiple records share dates.
function sortTrainingSessionsNewestFirst(trainingSessions: TrainingSession[]) {
  return [...trainingSessions].sort((firstSession, secondSession) => (
    secondSession.date.localeCompare(firstSession.date)
    || secondSession.updatedAt.localeCompare(firstSession.updatedAt)
  ));
}

// Bodyweight is sorted separately because it uses updatedAt as the tie-breaker too.
function sortBodyweightEntriesNewestFirst(bodyweightEntries: BodyweightEntry[]) {
  return [...bodyweightEntries].sort((firstEntry, secondEntry) => (
    secondEntry.date.localeCompare(firstEntry.date)
    || secondEntry.updatedAt.localeCompare(firstEntry.updatedAt)
  ));
}

// Returns null instead of 0 for empty arrays so callers can show honest empty states.
function getAverage(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

// Overview cards display rounded human-readable numbers instead of raw decimals.
function formatWholeNumber(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

// Bodyweight rate is stored as a decimal but shown as a weekly percentage.
function formatPercentRate(rate: number) {
  const percentage = rate * 100;
  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(1)}% / wk`;
}

// RPE/RIR values may be whole numbers or half steps, so avoid noisy trailing decimals.
function formatRpe(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

// Latest training session drives the Session Load card.
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

// Hard-set rule:
// 1. exclude warmups
// 2. use RIR <= 3 when RIR exists
// 3. otherwise use RPE >= 7 when RPE exists
// 4. otherwise count a real non-warmup working set with reps
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

// Counts hard sets for priority muscles only, across the provided training-session window.
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

// Top-set effort prefers RPE because it is easier to display directly.
// If no set RPE exists, it falls back to the lowest RIR as the best available effort signal.
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

// Requires 14 bodyweight entries so both current and previous 7-day averages are available.
// Formula: (current 7-day average - previous 7-day average) / previous 7-day average.
export function getSevenDayAverageBodyweightRate(bodyweightEntries: BodyweightEntry[]) {
  const latest14Entries = sortBodyweightEntriesNewestFirst(bodyweightEntries).slice(0, 14);

  if (latest14Entries.length < 14) {
    return null;
  }

  const current7DayAverage = getAverage(
    latest14Entries.slice(0, 7).map((entry) => entry.weightKg),
  );
  const previous7DayAverage = getAverage(
    latest14Entries.slice(7, 14).map((entry) => entry.weightKg),
  );

  if (current7DayAverage === null || previous7DayAverage === null || previous7DayAverage === 0) {
    return null;
  }

  return (current7DayAverage - previous7DayAverage) / previous7DayAverage;
}

// Hunger is optional nutrition context, so this function returns null when no hunger value exists.
function getLatestHunger(nutritionEntries: NutritionEntry[]) {
  const latestEntryWithHunger = [...nutritionEntries]
    .filter((entry) => entry.hunger !== undefined)
    .sort((firstEntry, secondEntry) => (
      secondEntry.date.localeCompare(firstEntry.date)
      || secondEntry.updatedAt.localeCompare(firstEntry.updatedAt)
    ))[0];

  return latestEntryWithHunger?.hunger ?? null;
}

// Converts a display string like "RPE 9.5" or "0-1 RIR" into a card status.
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

// This is only a UI trend direction for the card; it is not a statistical trend.
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

// Combines several signals into one human-readable watch state for the Overview.
// The order matters: recovery and high load should be surfaced before productivity.
export function getWatchStateMetric(args: WatchStateMetricArgs): Metric {
  const {
    currentReadiness,
    latestSessionLoad,
    bodyweightRate,
    priorityHardSetCount,
    weeklyPriorityHardSetTarget,
    latestHunger,
  } = args;

  // Recovery watch: low readiness or a high latest session load should be noticed first.
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
      explanation: "Readiness is low or the latest session load is high.",
      explanationZh: "训练前状态偏低，或最近一次训练课负荷偏高。",
    };
  }

  // Cut pressure watch: bodyweight is dropping faster than the product watch threshold.
  if (bodyweightRate !== null && bodyweightRate <= CUT_PRESSURE_RATE_THRESHOLD) {
    return {
      label: "Watch State",
      labelZh: "观察状态",
      value: "Cut pressure watch",
      trend: TrendDirection.Down,
      status: MetricStatus.Watch,
      evidenceType: EvidenceType.Watch,
      explanation: "The current 7-day bodyweight average is dropping faster than the watch threshold.",
      explanationZh: "当前 7 日平均体重下降速度超过观察阈值。",
    };
  }

  // Hunger watch: nutrition is optional, but high hunger is useful context when present.
  if (latestHunger !== null && latestHunger >= 4) {
    return {
      label: "Watch State",
      labelZh: "观察状态",
      value: "Hunger watch",
      trend: TrendDirection.Up,
      status: MetricStatus.Watch,
      evidenceType: EvidenceType.Watch,
      explanation: "Latest nutrition context shows high hunger.",
      explanationZh: "最近一次营养语境显示饥饿感偏高。",
    };
  }

  // Productive week: readiness is good and priority hard sets are on target.
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
      explanationZh: "训练前状态较好，重点肌群 hard sets 已达到目标。",
    };
  }

  // Default state when no stronger watch condition is present.
  return {
    label: "Watch State",
    labelZh: "观察状态",
    value: "Normal watch",
    trend: TrendDirection.Stable,
    status: MetricStatus.Neutral,
    evidenceType: EvidenceType.Watch,
    explanation: "No strong recovery, cut-pressure, or priority-volume watch state is present.",
    explanationZh: "当前没有明显恢复、减脂压力或重点训练量观察状态。",
  };
}

// Main public selector for OverviewPage.
// It returns exactly the six cards requested in Step 6.4 and keeps mockData out of the formula path.
export function getDerivedOverviewMetrics(args: DerivedOverviewMetricArgs): Metric[] {
  const {
    trainingSessions,
    bodyweightEntries,
    nutritionEntries,
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
  const bodyweightRate = getSevenDayAverageBodyweightRate(bodyweightEntries);
  const latestHunger = getLatestHunger(nutritionEntries);

  return [
    // A. Session Load: latest session RPE x duration.
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
    // B. Priority Hard Sets: useful hard-set count against the user's weekly target.
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
    // C. Top Set Effort: highest RPE first, then lowest RIR if RPE is missing.
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
    // D. Wellness Readiness: today's live pre-workout readiness score.
    {
      label: "Wellness Readiness",
      labelZh: "训练前状态",
      value: `${currentReadiness.score} / 100`,
      trend: getReadinessTrendDirection(currentReadiness),
      status: currentReadiness.badgeStatus,
      evidenceType: EvidenceType.Proxy,
      explanation: "Uses the current Today pre-workout readiness calculation.",
      explanationZh: "使用 Today 页面当前训练前状态计算结果。",
    },
    // E. Bodyweight Rate: current 7-day average compared with the previous 7-day average.
    {
      label: "Bodyweight Rate",
      labelZh: "体重变化速度",
      value: bodyweightRate === null ? "Need 14 days" : formatPercentRate(bodyweightRate),
      trend: bodyweightRate === null
        ? TrendDirection.Stable
        : bodyweightRate <= CUT_PRESSURE_RATE_THRESHOLD
          ? TrendDirection.Down
          : TrendDirection.Stable,
      status: bodyweightRate !== null && bodyweightRate <= CUT_PRESSURE_RATE_THRESHOLD
        ? MetricStatus.Watch
        : MetricStatus.Neutral,
      evidenceType: EvidenceType.SimpleArithmetic,
      explanation: "Compares the current 7-day average bodyweight against the previous 7-day average.",
      explanationZh: "比较当前 7 日平均体重和前 7 日平均体重。",
    },
    // F. Watch State: combined summary from readiness, training, bodyweight, and hunger signals.
    getWatchStateMetric({
      currentReadiness,
      latestSessionLoad,
      bodyweightRate,
      priorityHardSetCount,
      weeklyPriorityHardSetTarget: programSettings.weeklyPriorityHardSetTarget,
      latestHunger,
    }),
  ];
}
