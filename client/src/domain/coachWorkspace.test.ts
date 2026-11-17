import { describe, expect, it } from "vitest";
import { appointmentsOverlap, clientCredits, completeCoachAppointment, emptyCoachWorkspace, estimatedCalories, isCompleteNutrition, targetForDate } from "./coachWorkspace";
import type { CoachAppointment, CoachWorkspaceData, NutritionLog, NutritionTarget } from "../types/coach";

function appointment(overrides: Partial<CoachAppointment> = {}): CoachAppointment {
  return { id: "lesson-1", clientId: "client-1", title: "力量训练", date: "2026-10-20", startTime: "09:00", durationMinutes: 60, location: "训练馆", status: "scheduled", notes: "", ...overrides };
}

function paidWorkspace(): CoachWorkspaceData {
  return { ...emptyCoachWorkspace(), appointments: [appointment()], credits: [{ id: "credit-1", clientId: "client-1", date: "2026-10-01", amount: 10, type: "purchase", note: "十次课包" }] };
}

describe("course completion and credit ledger", () => {
  it("debits exactly one lesson and repeated completion cannot charge twice", () => {
    const original = paidWorkspace();
    const completed = completeCoachAppointment(original, "lesson-1", "debit-1");
    expect(completed.error).toBeNull();
    expect(completed.data.appointments[0].status).toBe("completed");
    expect(clientCredits(completed.data.credits, "client-1")).toBe(9);
    const retry = completeCoachAppointment(completed.data, "lesson-1", "debit-2");
    expect(retry.error).toBeTruthy();
    expect(retry.data.credits.filter((entry) => entry.type === "deduction")).toHaveLength(1);
    expect(clientCredits(retry.data.credits, "client-1")).toBe(9);
    expect(original.appointments[0].status).toBe("scheduled");
    expect(original.credits).toHaveLength(1);
  });

  it("does not complete or debit a lesson with no remaining credits", () => {
    const original = { ...paidWorkspace(), credits: [] };
    const result = completeCoachAppointment(original, "lesson-1", "debit-1");
    expect(result.error).toContain("课时不足");
    expect(result.data.appointments[0].status).toBe("scheduled");
    expect(result.data.credits).toHaveLength(0);
  });

  it("cannot turn a cancelled lesson into a charged completion", () => {
    const original = paidWorkspace();
    original.appointments[0].status = "cancelled";
    const result = completeCoachAppointment(original, "lesson-1", "debit-1");
    expect(result.error).toBeTruthy();
    expect(result.data.appointments[0].status).toBe("cancelled");
    expect(clientCredits(result.data.credits, "client-1")).toBe(10);
  });

  it("rejects completion when a pre-existing debit already references the appointment", () => {
    const original = paidWorkspace();
    original.credits.push({ id: "existing", clientId: "client-1", date: "2026-10-20", amount: -1, type: "deduction", appointmentId: "lesson-1", note: "已有扣课" });
    const result = completeCoachAppointment(original, "lesson-1", "new-debit");
    expect(result.error).toBeTruthy();
    expect(result.data.credits).toHaveLength(2);
    expect(result.data.appointments[0].status).toBe("scheduled");
  });
});

describe("appointment conflicts", () => {
  it("allows consecutive lessons that share only the boundary minute", () => {
    expect(appointmentsOverlap(appointment(), appointment({ id: "lesson-2", startTime: "10:00" }))).toBe(false);
  });

  it("detects one-minute overlaps and contained appointments", () => {
    expect(appointmentsOverlap(appointment(), appointment({ id: "lesson-2", startTime: "09:59" }))).toBe(true);
    expect(appointmentsOverlap(appointment(), appointment({ id: "lesson-2", startTime: "09:15", durationMinutes: 15 }))).toBe(true);
  });

  it("ignores another date, cancelled lessons, and an appointment compared with itself", () => {
    expect(appointmentsOverlap(appointment(), appointment({ id: "lesson-2", date: "2026-10-21" }))).toBe(false);
    expect(appointmentsOverlap(appointment(), appointment({ id: "lesson-2", status: "cancelled" }))).toBe(false);
    expect(appointmentsOverlap(appointment(), appointment())).toBe(false);
  });
});

describe("nutrition target history", () => {
  const targets: NutritionTarget[] = [
    { id: "future", clientId: "client-1", effectiveDate: "2026-11-01", protein: 170, carbs: 180, fat: 50 },
    { id: "baseline", clientId: "client-1", effectiveDate: "2026-10-01", protein: 150, carbs: 250, fat: 70 },
    { id: "different-client", clientId: "client-2", effectiveDate: "2026-10-20", protein: 100, carbs: 200, fat: 40 },
    { id: "revised", clientId: "client-1", effectiveDate: "2026-10-20", protein: 160, carbs: 220, fat: 60 },
  ];

  it("uses the target effective on each historical date and excludes future targets", () => {
    expect(targetForDate(targets, "client-1", "2026-10-19")?.id).toBe("baseline");
    expect(targetForDate(targets, "client-1", "2026-10-20")?.id).toBe("revised");
    expect(targetForDate(targets, "client-1", "2026-10-31")?.id).toBe("revised");
    expect(targetForDate(targets, "client-1", "2026-11-01")?.id).toBe("future");
  });

  it("does not invent a baseline or borrow another client's targets", () => {
    expect(targetForDate(targets, "client-1", "2026-09-30")).toBeUndefined();
    expect(targetForDate(targets, "new-client", "2026-11-01")).toBeUndefined();
    expect(targetForDate(targets, "client-2", "2026-10-20")?.id).toBe("different-client");
  });

  it("does not reorder stored target history when resolving dates", () => {
    const order = targets.map((target) => target.id);
    targetForDate(targets, "client-1", "2026-10-20");
    expect(targets.map((target) => target.id)).toEqual(order);
  });
});

describe("nutrition check-in semantics", () => {
  const base: NutritionLog = { id: "log", clientId: "client-1", date: "2026-10-20", notes: "" };

  it("does not count missing or partial macros as a complete check-in", () => {
    expect(isCompleteNutrition(undefined)).toBe(false);
    expect(isCompleteNutrition(base)).toBe(false);
    expect(isCompleteNutrition({ ...base, protein: 150, carbs: 200 })).toBe(false);
    expect(isCompleteNutrition({ ...base, weightKg: 72.5, notes: "仅体重" })).toBe(false);
  });

  it("treats explicitly entered zero intake as a value, not a missing field", () => {
    const record = { ...base, protein: 0, carbs: 0, fat: 0 };
    expect(isCompleteNutrition(record)).toBe(true);
    expect(estimatedCalories(record)).toBe(0);
    expect(isCompleteNutrition({ ...record, fat: undefined })).toBe(false);
  });

  it("rejects negative and non-finite nutrient values", () => {
    for (const fat of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(isCompleteNutrition({ ...base, protein: 150, carbs: 200, fat })).toBe(false);
    }
  });

  it("estimates energy from grams using protein/carbs 4 and fat 9 kcal", () => {
    expect(estimatedCalories({ protein: 150, carbs: 220, fat: 60 })).toBe(2020);
  });
});
