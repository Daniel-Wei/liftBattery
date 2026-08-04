import type { TrainingDay, TrainingExercise, TrainingSession } from "../types/appTypes";

export type DatedTrainingSession = TrainingSession & { date: string };

export type ExerciseComparison = {
  key: string;
  exerciseName: string;
  benchAngleDegrees?: number;
  currentVolume: number;
  previousVolume?: number;
  volumeChangePercent?: number;
  currentBestEstimatedOneRepMax?: number;
  previousBestEstimatedOneRepMax?: number;
  workingSets: number;
};

function exerciseKey(exercise: TrainingExercise) {
  return `${exercise.exerciseName.trim().toLowerCase()}@${exercise.benchAngleDegrees ?? "flat"}`;
}

function sessionSignature(session: TrainingSession) {
  return session.exercises.map(exerciseKey).sort().join("|");
}

function workingSets(exercise: TrainingExercise) {
  return exercise.sets.filter((set) => !set.isWarmup);
}

function volume(exercise: TrainingExercise) {
  return workingSets(exercise).reduce((total, set) => total + set.weightKg * set.reps, 0);
}

function bestEstimatedOneRepMax(exercise: TrainingExercise) {
  const values = workingSets(exercise)
    .filter((set) => set.weightKg > 0 && set.reps > 0)
    .map((set) => set.weightKg * (1 + set.reps / 30));
  return values.length > 0 ? Math.max(...values) : undefined;
}

function percentChange(current: number, previous?: number) {
  if (previous === undefined || previous === 0) return undefined;
  return ((current - previous) / previous) * 100;
}

export function flattenDatedSessions(days: TrainingDay[]) {
  return days.flatMap((day) => day.sessions.map((session) => ({ ...session, date: day.date })));
}

export function sortSessionsNewestFirst(sessions: DatedTrainingSession[]) {
  return [...sessions].sort((left, right) => (
    right.date.localeCompare(left.date)
    || right.startTime.localeCompare(left.startTime)
    || right.id - left.id
  ));
}

export function buildDailyTrainingReport(
  selected: DatedTrainingSession,
  allSessions: DatedTrainingSession[],
) {
  const selectedIndex = sortSessionsNewestFirst(allSessions).findIndex((session) => session.id === selected.id);
  const ordered = sortSessionsNewestFirst(allSessions);
  const signature = sessionSignature(selected);
  const previous = ordered.slice(selectedIndex + 1).find((session) => sessionSignature(session) === signature);
  const previousByExercise = new Map(previous?.exercises.map((exercise) => [exerciseKey(exercise), exercise]));

  const exercises: ExerciseComparison[] = selected.exercises.map((exercise) => {
    const previousExercise = previousByExercise.get(exerciseKey(exercise));
    const currentVolume = volume(exercise);
    const previousVolume = previousExercise ? volume(previousExercise) : undefined;

    return {
      key: exerciseKey(exercise),
      exerciseName: exercise.exerciseName,
      benchAngleDegrees: exercise.benchAngleDegrees,
      currentVolume,
      previousVolume,
      volumeChangePercent: percentChange(currentVolume, previousVolume),
      currentBestEstimatedOneRepMax: bestEstimatedOneRepMax(exercise),
      previousBestEstimatedOneRepMax: previousExercise ? bestEstimatedOneRepMax(previousExercise) : undefined,
      workingSets: workingSets(exercise).length,
    };
  });

  const currentVolume = exercises.reduce((total, exercise) => total + exercise.currentVolume, 0);
  const previousVolume = previous?.exercises.reduce((total, exercise) => total + volume(exercise), 0);

  return {
    selected,
    previous,
    exercises,
    currentVolume,
    previousVolume,
    volumeChangePercent: percentChange(currentVolume, previousVolume),
    workingSets: exercises.reduce((total, exercise) => total + exercise.workingSets, 0),
    previousWorkingSets: previous?.exercises.reduce((total, exercise) => total + workingSets(exercise).length, 0),
  };
}
