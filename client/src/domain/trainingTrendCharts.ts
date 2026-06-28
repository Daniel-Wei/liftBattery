import type { MuscleGroup, ProgramSettings, TrainingSessionRecord, TrendPoint } from "../types/appTypes";

export type TrainingTrendWeek = {
  label: string;
  startDate: string;
  endDate: string;
};

export type TrainingCycle = {
  cycleNumber: number;
  label: string;
  startDate: string;
  endWeekStartDate: string;
  endDate: string;
};

export type MainLiftEstimatedPrTrend = {
  id: "chest" | "back" | "legs";
  label: string;
  liftName: string;
  variant: "blue" | "green" | "amber";
  data: TrendPoint[];
};

// Preset training cycles for chart grouping. Each cycle currently spans 7 days.
const presetTrainingTrendWeeks: TrainingTrendWeek[] = [
  { label: "周期 1", startDate: "2026-04-27", endDate: "2026-05-03" },
  { label: "周期 2", startDate: "2026-05-04", endDate: "2026-05-10" },
  { label: "周期 3", startDate: "2026-05-11", endDate: "2026-05-17" },
  { label: "周期 4", startDate: "2026-05-18", endDate: "2026-05-24" },
  { label: "周期 5", startDate: "2026-05-25", endDate: "2026-05-31" },
  { label: "周期 6", startDate: "2026-06-01", endDate: "2026-06-07" },
  { label: "周期 7", startDate: "2026-06-08", endDate: "2026-06-14" },
  { label: "周期 8", startDate: "2026-06-15", endDate: "2026-06-21" },
];

const maxTrainingCycleOptions = 24;

function addDays(date: string, days: number) {
  const nextDate = new Date(`${date}T00:00:00Z`);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate.toISOString().slice(0, 10);
}

function addWeeks(date: string, weeks: number) {
  return addDays(date, weeks * 7);
}

function normalizeToMonday(date: string) {
  const value = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  const daysFromMonday = (value.getUTCDay() + 6) % 7;
  value.setUTCDate(value.getUTCDate() - daysFromMonday);
  return value.toISOString().slice(0, 10);
}

export function getTrainingCycles(
  programSettings: ProgramSettings,
  optionCount = maxTrainingCycleOptions,
): TrainingCycle[] {
  const startDate = normalizeToMonday(programSettings.cycleStartDate);
  const weeksPerCycle = Math.max(1, Math.round(programSettings.weeksPerCycle));

  return Array.from({ length: optionCount }, (_, index) => {
    const cycleStartDate = addWeeks(startDate, index * weeksPerCycle);

    return {
      cycleNumber: index + 1,
      label: `第 ${index + 1} 个训练周期`,
      startDate: cycleStartDate,
      endWeekStartDate: addWeeks(cycleStartDate, weeksPerCycle - 1),
      endDate: addDays(cycleStartDate, (weeksPerCycle * 7) - 1),
    };
  });
}

export function formatTrainingCycleLabel(cycle: TrainingCycle) {
  return `${cycle.label}：${cycle.startDate} 至 ${cycle.endDate}`;
}

export function getCurrentTrainingCycle(programSettings: ProgramSettings) {
  const today = new Date().toISOString().slice(0, 10);
  const cycles = getTrainingCycles(programSettings);
  const currentCycle = cycles.find((cycle) => today >= cycle.startDate && today <= cycle.endDate);

  if (currentCycle) {
    return currentCycle;
  }

  const firstCycle = cycles[0];
  const lastCycle = cycles[cycles.length - 1];
  return today < firstCycle.startDate ? firstCycle : lastCycle;
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
      label: `周期 ${weeks.length + 1}`,
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
  const currentCycleStart = getMonday(new Date().toISOString().slice(0, 10));
  return currentCycleStart > presetEnd ? currentCycleStart : presetEnd;
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
  const currentCycle = weeks.find((week) => (
    today >= week.startDate && today <= week.endDate
  ));

  return currentCycle ?? weeks[weeks.length - 1];
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

    if (!existingSession || session.updatedAtUtc > existingSession.updatedAtUtc) {
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
