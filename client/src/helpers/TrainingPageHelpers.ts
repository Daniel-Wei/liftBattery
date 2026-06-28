import type { SetEntry, TrainingSessionDraft, TrainingSessionRecord } from "../types/appTypes";

export function isHardSet(set: SetEntry) {
  if (set.isWarmup) return false;
  if (set.rir !== undefined) return set.rir <= 3;
  return set.reps > 0;
}

export function getTrainingFormError(form: TrainingSessionDraft) {
  if (!form.date) return "请选择训练日期。";
  if (!form.startTime) return "请选择开始时间。";
  if (!Number.isInteger(form.durationMinutes) || form.durationMinutes <= 0) {
    return "训练时长必须是大于 0 的分钟数。";
  }
  if (!Number.isFinite(form.sessionRpe) || form.sessionRpe < 1 || form.sessionRpe > 10) {
    return "Session RPE 必须在 1 到 10 之间。";
  }
  if (form.exercises.length === 0) return "至少需要一个 Exercise。";

  for (const exercise of form.exercises) {
    if (!exercise.exerciseName.trim()) return "请选择每个 Exercise 的动作。";
    if (exercise.sets.length === 0) return "每个 Exercise 至少需要一个 Set。";

    for (const set of exercise.sets) {
      if (!Number.isFinite(set.reps) || set.reps <= 0) return "每组次数必须大于 0。";
      if (!Number.isFinite(set.weightKg) || set.weightKg < 0) return "重量不能小于 0 kg。";
      if (set.rir !== undefined && set.rir < 0) return "RIR 不能小于 0。";
    }
  }

  return null;
}

export function getLatestTrainingDayDetails(trainingSessions: TrainingSessionRecord[]) {
  const latest = [...trainingSessions].sort((a, b) => (
    b.date.localeCompare(a.date)
    || b.startTime.localeCompare(a.startTime)
  ))[0];

  if (!latest) return null;

  return {
    date: latest.date,
    sessionRpe: latest.sessionRpe,
    durationMinutes: latest.durationMinutes,
  };
}
