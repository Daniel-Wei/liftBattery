import type { MuscleGroup, TrainingSessionRecord, TrendPoint } from "../types/appTypes";

export type TrainingTrendWeek = {
  label: string;
  startDate: string;
  endDate: string;
};

export type MainLiftEstimatedPrTrend = {
  id: "chest" | "back" | "legs";
  label: string;
  liftName: string;
  variant: "blue" | "green" | "amber";
  data: TrendPoint[];
};

// Preset training weeks for chart grouping. Later this should come from user program settings.
const presetTrainingTrendWeeks: TrainingTrendWeek[] = [
  { label: "W1", startDate: "2026-04-27", endDate: "2026-05-03" },
  { label: "W2", startDate: "2026-05-04", endDate: "2026-05-10" },
  { label: "W3", startDate: "2026-05-11", endDate: "2026-05-17" },
  { label: "W4", startDate: "2026-05-18", endDate: "2026-05-24" },
  { label: "W5", startDate: "2026-05-25", endDate: "2026-05-31" },
  { label: "W6", startDate: "2026-06-01", endDate: "2026-06-07" },
  { label: "W7", startDate: "2026-06-08", endDate: "2026-06-14" },
  { label: "W8", startDate: "2026-06-15", endDate: "2026-06-21" },
];

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

export function getTrainingTrendWeeks(
  startWeek = presetTrainingTrendWeeks[0].startDate,
  endWeek = getDefaultEndWeek(),
) {
  if (startWeek > endWeek) {
    return [];
  }

  const weeks: TrainingTrendWeek[] = [];
  let weekStart = startWeek;

  while (weekStart <= endWeek) {
    weeks.push({
      label: `W${weeks.length + 1}`,
      startDate: weekStart,
      endDate: addDays(weekStart, 6),
    });
    weekStart = addDays(weekStart, 7);
  }

  return weeks;
}

function getMonday(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  const daysFromMonday = (value.getUTCDay() + 6) % 7;
  value.setUTCDate(value.getUTCDate() - daysFromMonday);
  return value.toISOString().slice(0, 10);
}

function getDefaultEndWeek() {
  const presetEnd = presetTrainingTrendWeeks[presetTrainingTrendWeeks.length - 1].startDate;
  const currentWeek = getMonday(new Date().toISOString().slice(0, 10));
  return currentWeek > presetEnd ? currentWeek : presetEnd;
}

export function isSessionInTrainingTrendWeek(
  session: TrainingSessionRecord,
  week: TrainingTrendWeek,
) {
  return session.date >= week.startDate && session.date <= week.endDate;
}

export function getCurrentTrainingTrendWeek() {
  const today = new Date().toISOString().slice(0, 10);
  const weeks = getTrainingTrendWeeks();
  const currentWeek = weeks.find((week) => (
    today >= week.startDate && today <= week.endDate
  ));

  return currentWeek ?? weeks[weeks.length - 1];
}

export function formatTrainingTrendWeekLabel(week: TrainingTrendWeek) {
  return `${formatTrainingTrendWeekShortLabel(week)}：${week.startDate} 至 ${week.endDate}`;
}

export function formatTrainingTrendWeekShortLabel(week: TrainingTrendWeek) {
  return week.label;
}

function getSessionLoad(session: TrainingSessionRecord) {
  return session.durationMinutes * session.sessionRpe;
}

function getLatestSessionRecordPerTrainingDay(trainingSessions: TrainingSessionRecord[]) {
  const sessionByDate = new Map<string, TrainingSessionRecord>();

  trainingSessions.forEach((session) => {
    const existingSession = sessionByDate.get(session.date);

    if (!existingSession || session.updatedAt > existingSession.updatedAt) {
      sessionByDate.set(session.date, session);
    }
  });

  return [...sessionByDate.values()];
}

function getSessionVolumeLoad(session: TrainingSessionRecord) {
  return session.sets
    .reduce((totalVolume, set) => totalVolume + (set.reps * set.weightKg), 0);
}

// Epley e1RM is a simple estimated one-rep max:
// estimated 1RM = weight x (1 + reps / 30).
// This is a trend proxy from saved sets, not a promise of an actual max.
function getSessionEstimatedPr(session: TrainingSessionRecord) {
  const workingSetEstimates = session.sets
    .filter((set) => !set.isWarmup && set.weightKg > 0 && set.reps > 0)
    .map((set) => set.weightKg * (1 + (set.reps / 30)));

  if (workingSetEstimates.length === 0) {
    return 0;
  }

  return Math.max(...workingSetEstimates);
}

function getSetEstimatedPr(weightKg: number, reps: number) {
  return weightKg * (1 + (reps / 30));
}

function getWeekForSession(
  session: TrainingSessionRecord,
  weeks: TrainingTrendWeek[] = presetTrainingTrendWeeks,
) {
  return weeks.find((week) => (
    session.date >= week.startDate && session.date <= week.endDate
  ));
}

function getWeekGroupedTrainingTrend(
  trainingSessions: TrainingSessionRecord[],
  getSessionValue: (session: TrainingSessionRecord) => number,
  weeks: TrainingTrendWeek[] = presetTrainingTrendWeeks,
): TrendPoint[] {
  const valueByWeekLabel = new Map<string, number>();

  trainingSessions.forEach((session) => {
    const week = getWeekForSession(session, weeks);

    if (!week) {
      return;
    }

    valueByWeekLabel.set(
      week.label,
      (valueByWeekLabel.get(week.label) ?? 0) + getSessionValue(session),
    );
  });

  return weeks
    .filter((week) => valueByWeekLabel.has(week.label))
    .map((week) => ({
      label: formatTrainingTrendWeekShortLabel(week),
      value: valueByWeekLabel.get(week.label) ?? 0,
    }));
}

function getWeekGroupedMaxTrainingTrend(
  trainingSessions: TrainingSessionRecord[],
  getSessionValue: (session: TrainingSessionRecord) => number,
  weeks: TrainingTrendWeek[] = presetTrainingTrendWeeks,
): TrendPoint[] {
  const valueByWeekLabel = new Map<string, number>();

  trainingSessions.forEach((session) => {
    const week = getWeekForSession(session, weeks);

    if (!week) {
      return;
    }

    valueByWeekLabel.set(
      week.label,
      Math.max(valueByWeekLabel.get(week.label) ?? 0, getSessionValue(session)),
    );
  });

  return weeks
    .filter((week) => valueByWeekLabel.has(week.label))
    .map((week) => ({
      label: formatTrainingTrendWeekShortLabel(week),
      value: Math.round(valueByWeekLabel.get(week.label) ?? 0),
    }));
}

const mainLiftEstimatedPrConfigs = [
  {
    id: "chest",
    label: "胸部",
    liftName: "胸部主要动作",
    variant: "blue",
    muscleGroups: ["Chest"],
  },
  {
    id: "back",
    label: "背部",
    liftName: "背部主要动作",
    variant: "green",
    muscleGroups: ["Back"],
  },
  {
    id: "legs",
    label: "腿部",
    liftName: "腿部主要动作",
    variant: "amber",
    muscleGroups: ["Quads", "Hamstrings", "Glutes"],
  },
] satisfies Array<{
  id: "chest" | "back" | "legs";
  label: string;
  liftName: string;
  variant: "blue" | "green" | "amber";
  muscleGroups: MuscleGroup[];
}>;

function getWeeklyMainLiftEstimatedPrTrend(
  trainingSessions: TrainingSessionRecord[],
  muscleGroups: MuscleGroup[],
) {
  const targetMuscleGroups = new Set(muscleGroups);
  const valueByWeekLabel = new Map<string, number>();

  trainingSessions.forEach((session) => {
    const week = getWeekForSession(session);

    if (!week) {
      return;
    }

    session.sets.forEach((set) => {
      const isTargetMuscleGroup = targetMuscleGroups.has(set.muscleGroup);

      if (!isTargetMuscleGroup || set.isWarmup || set.weightKg <= 0 || set.reps <= 0) {
        return;
      }

      valueByWeekLabel.set(
        week.label,
        Math.max(
          valueByWeekLabel.get(week.label) ?? 0,
          getSetEstimatedPr(set.weightKg, set.reps),
        ),
      );
    });
  });

  return presetTrainingTrendWeeks
    .filter((week) => valueByWeekLabel.has(week.label))
    .map((week) => ({
      label: formatTrainingTrendWeekShortLabel(week),
      value: Math.round(valueByWeekLabel.get(week.label) ?? 0),
    }));
}

export function getWeeklyExerciseEstimatedPrTrend(
  trainingSessions: TrainingSessionRecord[],
  exerciseName: string,
  weeks: TrainingTrendWeek[] = presetTrainingTrendWeeks,
  muscleGroup?: MuscleGroup,
) {
  const valueByWeekLabel = new Map<string, number>();

  trainingSessions.forEach((session) => {
    const week = getWeekForSession(session, weeks);

    if (!week) {
      return;
    }

    session.sets.forEach((set) => {
      if (
        set.exerciseName !== exerciseName
        || (muscleGroup !== undefined && set.muscleGroup !== muscleGroup)
        || set.isWarmup
        || set.weightKg <= 0
        || set.reps <= 0
      ) {
        return;
      }

      valueByWeekLabel.set(
        week.label,
        Math.max(
          valueByWeekLabel.get(week.label) ?? 0,
          getSetEstimatedPr(set.weightKg, set.reps),
        ),
      );
    });
  });

  return weeks
    .filter((week) => valueByWeekLabel.has(week.label))
    .map((week) => ({
      label: formatTrainingTrendWeekShortLabel(week),
      value: Math.round(valueByWeekLabel.get(week.label) ?? 0),
    }));
}

export function getWeeklySessionLoadTrend(
  trainingSessions: TrainingSessionRecord[],
  weeks: TrainingTrendWeek[] = presetTrainingTrendWeeks,
): TrendPoint[] {
  return getWeekGroupedTrainingTrend(
    getLatestSessionRecordPerTrainingDay(trainingSessions),
    getSessionLoad,
    weeks,
  );
}

export function getWeeklyVolumeLoadTrend(
  trainingSessions: TrainingSessionRecord[],
  weeks: TrainingTrendWeek[] = presetTrainingTrendWeeks,
): TrendPoint[] {
  return getWeekGroupedTrainingTrend(trainingSessions, getSessionVolumeLoad, weeks);
}

export function getWeeklyEstimatedPrTrend(trainingSessions: TrainingSessionRecord[]): TrendPoint[] {
  return getWeekGroupedMaxTrainingTrend(trainingSessions, getSessionEstimatedPr);
}

export function getWeeklyMainLiftEstimatedPrTrends(
  trainingSessions: TrainingSessionRecord[],
): MainLiftEstimatedPrTrend[] {
  return mainLiftEstimatedPrConfigs.map((config) => ({
    id: config.id,
    label: config.label,
    liftName: config.liftName,
    variant: config.variant,
    data: getWeeklyMainLiftEstimatedPrTrend(trainingSessions, config.muscleGroups),
  }));
}
