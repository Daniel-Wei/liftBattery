import type { TrainingSession, TrendPoint } from "../types/appTypes";

type TrainingTrendWeek = {
  label: string;
  startDate: string;
  endDate: string;
};

// Preset training weeks for chart grouping. Later this should come from user program settings.
const presetTrainingTrendWeeks: TrainingTrendWeek[] = [
  { label: "W1", startDate: "2026-04-27", endDate: "2026-05-03" },
  { label: "W2", startDate: "2026-05-04", endDate: "2026-05-10" },
  { label: "W3", startDate: "2026-05-11", endDate: "2026-05-17" },
  { label: "W4", startDate: "2026-05-18", endDate: "2026-05-24" },
  { label: "W5", startDate: "2026-05-25", endDate: "2026-05-31" },
  { label: "W6", startDate: "2026-06-01", endDate: "2026-06-07" },
];

function getSessionLoad(session: TrainingSession) {
  return session.durationMinutes * session.sessionRpe;
}

function getSessionVolumeLoad(session: TrainingSession) {
  return session.sets
    .filter((set) => !set.isWarmup)
    .reduce((totalVolume, set) => totalVolume + (set.reps * set.weightKg), 0);
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

export function getWeeklySessionLoadTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  return getWeekGroupedTrainingTrend(trainingSessions, getSessionLoad);
}

export function getWeeklyVolumeLoadTrend(trainingSessions: TrainingSession[]): TrendPoint[] {
  return getWeekGroupedTrainingTrend(trainingSessions, getSessionVolumeLoad);
}
