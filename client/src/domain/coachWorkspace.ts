import type { CoachAppointment, CoachWorkspaceData, CreditEntry, MacroValues, NutritionLog, NutritionTarget, PrepPhase } from "../types/coach";

export const prepPhaseLabels: Record<PrepPhase, string> = {
  building: "增肌准备", prep: "减脂备赛", peak: "赛前周", recovery: "赛后恢复",
};

export function localDate(date = new Date()) {
  const value = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return value.toISOString().slice(0, 10);
}

export function shiftDate(date: string, offset: number) {
  const value = new Date(`${date}T12:00:00`);
  value.setDate(value.getDate() + offset);
  return localDate(value);
}

export function daysUntil(date: string, from = localDate()) {
  if (!date) return undefined;
  const difference = (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000;
  return Number.isFinite(difference) ? Math.round(difference) : undefined;
}

export function shortDate(date: string) {
  if (!date) return "待设置";
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(new Date(`${date}T12:00:00`));
}

export function clientCredits(credits: CreditEntry[], clientId: string) {
  return credits.filter((entry) => entry.clientId === clientId).reduce((sum, entry) => sum + entry.amount, 0);
}

export function targetForDate(targets: NutritionTarget[], clientId: string, date: string) {
  return targets.filter((target) => target.clientId === clientId && target.effectiveDate <= date)
    .sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
}

export function isCompleteNutrition(log?: NutritionLog): log is NutritionLog & MacroValues {
  return !!log && [log.protein, log.carbs, log.fat].every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0);
}

export function estimatedCalories(values: MacroValues) {
  return Math.round(values.protein * 4 + values.carbs * 4 + values.fat * 9);
}

export function emptyCoachWorkspace(): CoachWorkspaceData {
  return { version: 1, clients: [], appointments: [], credits: [], nutritionTargets: [], nutritionLogs: [], reviews: [] };
}

// A completed appointment posts one credit debit. Retrying completion is a no-op.
export function completeCoachAppointment(data: CoachWorkspaceData, appointmentId: string, creditId: string) {
  const appointment = data.appointments.find((item) => item.id === appointmentId);
  if (!appointment || appointment.status !== "scheduled") return { data, error: "仅待上课预约可以确认完成。" };
  if (clientCredits(data.credits, appointment.clientId) < 1) return { data, error: "剩余课时不足，请先登记课包。" };
  const hasDebit = data.credits.some((item) => item.appointmentId === appointmentId && item.type === "deduction");
  if (hasDebit) return { data, error: "该课程已有扣课记录，请检查课时流水。" };
  return {
    data: {
      ...data,
      appointments: data.appointments.map((item): CoachAppointment => item.id === appointmentId ? { ...item, status: "completed" } : item),
      credits: [...data.credits, { id: creditId, clientId: appointment.clientId, date: appointment.date, amount: -1, type: "deduction" as const, appointmentId, note: appointment.title }],
    },
    error: null,
  };
}

export function appointmentsOverlap(first: CoachAppointment, second: CoachAppointment) {
  if (first.date !== second.date || first.id === second.id || first.status === "cancelled" || second.status === "cancelled") return false;
  const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  return minutes(first.startTime) < minutes(second.startTime) + second.durationMinutes
    && minutes(second.startTime) < minutes(first.startTime) + first.durationMinutes;
}
