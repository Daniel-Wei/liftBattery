import type { MuscleGroup, TrainingSession, TrendPoint } from "../types/appTypes";

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

export function getTrainingTrendWeeks() {
  return presetTrainingTrendWeeks;
}

export function isSessionInTrainingTrendWeek(
  session: TrainingSession,
  week: TrainingTrendWeek,
) {
  return session.date >= week.startDate && session.date <= week.endDate;
}

export function getCurrentTrainingTrendWeek() {
  const today = new Date().toISOString().slice(0, 10);
  const currentWeek = presetTrainingTrendWeeks.find((week) => (
    today >= week.startDate && today <= week.endDate
  ));

  return currentWeek ?? presetTrainingTrendWeeks[presetTrainingTrendWeeks.length - 1];
}

export function formatTrainingTrendWeekLabel(week: TrainingTrendWeek) {
  return `${week.label}: ${week.startDate} to ${week.endDate}`;
}

function getSessionLoad(session: TrainingSession) {
  return session.durationMinutes * session.sessionRpe;
}

function getLatestSessionRecordPerTrainingDay(trainingSessions: TrainingSession[]) {
  const sessionByDate = new Map<string, TrainingSession>();

  trainingSessions.forEach((session) => {
    const existingSession = sessionByDate.get(session.date);

    if (!existingSession || session.updatedAt > existingSession.updatedAt) {
      sessionByDate.set(session.date, session);
    }
  });

  return [...sessionByDate.values()];
}

function getSessionVolumeLoad(session: TrainingSession) {
  return session.sets
    .reduce((totalVolume, set) => totalVolume + (set.reps * set.weightKg), 0);
}

// Epley e1RM is a simple estimated one-rep max:
// estimated 1RM = weight x (1 + reps / 30).
// This is a trend proxy from saved sets, not a promise of an actual max.
function getSessionEstimatedPr(session: TrainingSession) {
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

function getWeekForSession(session: TrainingSession) {
  return presetTrainingTrendWeeks.find((week) => (
    session.date >= week.startDate && session.date <= week.endDate
  ));
}

function getWeekGroupedTrainingTrend(
  trainingSessions: TrainingSession[],
  getSessionValue: (session: TrainingSession) => number,
): TrendPoint[] {
  const valueByWeekLabel = new Map<string, number>();

  trainingSessions.forEach((session) => {
    const week = getWeekForSession(session);

    if (!week) {
      return;
    }

    valueByWeekLabel.set(
      week.label,
      (valueByWeekLabel.get(week.label) ?? 0) + getSessionValue(session),
    );
  });

  return presetTrainingTrendWeeks
    .filter((week) => valueByWeekLabel.has(week.label))
    .map((week) => ({
      label: week.label,
      value: valueByWeekLabel.get(week.label) ?? 0,
    }));
}

function getWeekGroupedMaxTrainingTrend(
  trainingSessions: TrainingSession[],
  getSessionValue: (session: TrainingSession) => number,
): TrendPoint[] {
  const valueByWeekLabel = new Map<string, number>();

  trainingSessions.forEach((session) => {
    const week = getWeekForSession(session);

    if (!week) {
      return;
    }

    valueByWeekLabel.set(
      week.label,
      Math.max(valueByWeekLabel.get(week.label) ?? 0, getSessionValue(session)),
    );
  });

  return presetTrainingTrendWeeks
    .filter((week) => valueByWeekLabel.has(week.label))
    .map((week) => ({
      label: week.label,
      value: Math.round(valueByWeekLabel.get(week.label) ?? 0),
    }));
}

const mainLiftEstimatedPrConfigs = [
  {
    id: "chest",
    label: "Chest",
    liftName: "Chest lifts",
    variant: "blue",
    muscleGroups: ["Chest"],
  },
  {
    id: "back",
    label: "Back",
    liftName: "Back lifts",
    variant: "green",
    muscleGroups: ["Back"],
  },
  {
    id: "legs",
    label: "Legs",
    liftName: "Leg lifts",
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
  trainingSessions: TrainingSession[],
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
      label: week.label,
      value: Math.round(valueByWeekLabel.get(week.label) ?? 0),
    }));
}

export function getWeeklySessionLoadTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  return getWeekGroupedTrainingTrend(
    getLatestSessionRecordPerTrainingDay(trainingSessions),
    getSessionLoad,
  );
}

export function getWeeklyVolumeLoadTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  return getWeekGroupedTrainingTrend(trainingSessions, getSessionVolumeLoad);
}

export function getWeeklyEstimatedPrTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  return getWeekGroupedMaxTrainingTrend(trainingSessions, getSessionEstimatedPr);
}

export function getWeeklyMainLiftEstimatedPrTrends(
  trainingSessions: TrainingSession[],
): MainLiftEstimatedPrTrend[] {
  return mainLiftEstimatedPrConfigs.map((config) => ({
    id: config.id,
    label: config.label,
    liftName: config.liftName,
    variant: config.variant,
    data: getWeeklyMainLiftEstimatedPrTrend(trainingSessions, config.muscleGroups),
  }));
}
