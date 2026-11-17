import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defaultProgramSettings } from "../data/defaultValues";
import { accountStorageKey, PROGRAM_SETTINGS_STORAGE_KEY, TREND_REPORT_JOB_ID_STORAGE_KEY } from "../data/localStorageKeys";
import type { AuthUser, TrainingDay } from "../types/appTypes";
import { createLiftBatteryStore } from "./liftBatteryStore";
import { fetchCurrentUser, loginUser, logoutUser, registerUser, updateCurrentUser } from "./slices/authSlice";
import { updateProgramSettings } from "./slices/programSettingsSlice";
import { fetchTrainingDays, updateTrainingSessionDraft } from "./slices/trainingSlice";
import { fetchTrendReportJob } from "./slices/trendReportSlice";

function user(id: number): AuthUser {
  return { id, displayName: `Coach ${id}`, email: `coach${id}@example.com`, weeklyTargetTrainingDays: 3, preferredUnit: "kg", createdAtUtc: "2026-10-20T00:00:00Z" };
}

function login(store: ReturnType<typeof createLiftBatteryStore>, id: number) {
  store.dispatch(loginUser.fulfilled(user(id), `login-${id}`, { email: user(id).email, password: "test-password" }));
}

function trainingDay(userId: number, date: string): TrainingDay {
  return { id: userId, userId, date, sessions: [], createdAtUtc: `${date}T00:00:00Z`, updatedAtUtc: `${date}T00:00:00Z` };
}

describe("personal data account isolation", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => { values.set(key, value); },
      removeItem: (key: string) => { values.delete(key); },
    });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("clears account A's draft on logout and keeps B's session separate", () => {
    const store = createLiftBatteryStore();
    login(store, 1);
    const original = store.getState().training.trainingSessionDraft.durationMinutes;
    store.dispatch(updateTrainingSessionDraft({ field: "durationMinutes", value: 123 }));
    expect(store.getState().training.trainingSessionDraft.durationMinutes).toBe(123);
    store.dispatch(logoutUser.fulfilled(undefined, "logout", undefined));
    expect(store.getState().training.trainingSessionDraft.durationMinutes).toBe(original);
    login(store, 2);
    expect(store.getState().auth.user?.id).toBe(2);
    expect(store.getState().training.trainingSessionDraft.durationMinutes).toBe(original);
    expect(store.getState().trendReport.job).toBeNull();
  });

  it("resets data when restored authentication changes user but preserves a same-user refresh", () => {
    const store = createLiftBatteryStore();
    login(store, 1);
    store.dispatch(updateTrainingSessionDraft({ field: "durationMinutes", value: 123 }));
    store.dispatch(fetchCurrentUser.fulfilled(user(1), "refresh-same", undefined));
    expect(store.getState().training.trainingSessionDraft.durationMinutes).toBe(123);
    store.dispatch(fetchCurrentUser.fulfilled(user(2), "refresh-different", undefined));
    expect(store.getState().training.trainingSessionDraft.durationMinutes).not.toBe(123);
    store.dispatch(updateTrainingSessionDraft({ field: "durationMinutes", value: 124 }));
    store.dispatch(fetchCurrentUser.fulfilled(null, "expired", undefined));
    expect(store.getState().training.trainingSessionDraft.durationMinutes).not.toBe(124);
  });

  it("resets personal data when registration switches to another account", () => {
    const store = createLiftBatteryStore();
    login(store, 1);
    store.dispatch(updateTrainingSessionDraft({ field: "durationMinutes", value: 123 }));
    store.dispatch(registerUser.fulfilled(user(2), "register", { email: user(2).email, password: "test-password", confirmPassword: "test-password", betaInviteCode: "test-invite", displayName: user(2).displayName }));
    expect(store.getState().auth.user?.id).toBe(2);
    expect(store.getState().training.trainingSessionDraft.durationMinutes).not.toBe(123);
  });

  it("drops old fulfilled and rejected requests after switching accounts", () => {
    const store = createLiftBatteryStore();
    const range = { from: "2026-10-01", to: "2026-10-20" };
    login(store, 1);
    store.dispatch(fetchTrainingDays.pending("old-fetch", range));
    store.dispatch(fetchTrainingDays.pending("old-error", range));
    login(store, 2);
    store.dispatch(fetchTrainingDays.fulfilled([trainingDay(1, "2026-10-01")], "old-fetch", range));
    store.dispatch(fetchTrainingDays.rejected(null, "old-error", range, "A's error"));
    expect(store.getState().training.trainingDays).toEqual([]);
    expect(store.getState().training.error).toBeNull();
    store.dispatch(fetchTrainingDays.pending("b-fetch", range));
    store.dispatch(fetchTrainingDays.fulfilled([trainingDay(2, "2026-10-20")], "b-fetch", range));
    expect(store.getState().training.trainingDays).toHaveLength(1);
  });

  it("also rejects a request from an earlier login of the same account", () => {
    const store = createLiftBatteryStore();
    const range = { from: "2026-10-01", to: "2026-10-20" };
    login(store, 1);
    store.dispatch(fetchTrainingDays.pending("prior-session", range));
    store.dispatch(logoutUser.fulfilled(undefined, "logout", undefined));
    login(store, 1);
    store.dispatch(fetchTrainingDays.fulfilled([trainingDay(1, "2026-10-01")], "prior-session", range));
    expect(store.getState().training.trainingDays).toEqual([]);
  });

  it("does not let an old profile update switch authentication back to account A", () => {
    const store = createLiftBatteryStore();
    const input = { displayName: "Updated coach A", weeklyTargetTrainingDays: 4, preferredUnit: "kg" as const };
    login(store, 1);
    store.dispatch(updateCurrentUser.pending("old-profile", input));
    login(store, 2);
    store.dispatch(updateCurrentUser.fulfilled({ ...user(1), ...input }, "old-profile", input));
    expect(store.getState().auth.user?.id).toBe(2);
  });

  it("preserves account-specific settings and report IDs without deleting legacy caches", () => {
    const legacy = { ...defaultProgramSettings, cycleStartDate: "2025-01-01" };
    localStorage.setItem(PROGRAM_SETTINGS_STORAGE_KEY, JSON.stringify(legacy));
    localStorage.setItem(TREND_REPORT_JOB_ID_STORAGE_KEY, "legacy-owner-unknown");
    const store = createLiftBatteryStore();
    login(store, 1);
    const aSettings = { ...defaultProgramSettings, cycleStartDate: "2026-10-05" };
    store.dispatch(updateProgramSettings(aSettings));
    store.dispatch(fetchTrendReportJob.fulfilled({ id: "report-a", runId: "run-a", dataVersion: "v1", status: "Completed", progressPercent: 100, currentStage: "Done", createdAtUtc: "2026-10-20T00:00:00Z", updatedAtUtc: "2026-10-20T00:00:00Z" }, "a-report", "report-a"));
    login(store, 2);
    expect(store.getState().programSettings.programSettingDetails).toEqual(defaultProgramSettings);
    expect(store.getState().trendReport.job).toBeNull();
    expect(localStorage.getItem(accountStorageKey(TREND_REPORT_JOB_ID_STORAGE_KEY, 2))).toBeNull();
    login(store, 1);
    expect(store.getState().programSettings.programSettingDetails).toEqual(aSettings);
    expect(localStorage.getItem(accountStorageKey(TREND_REPORT_JOB_ID_STORAGE_KEY, 1))).toBe("report-a");
    expect(localStorage.getItem(TREND_REPORT_JOB_ID_STORAGE_KEY)).toBe("legacy-owner-unknown");
    // The pre-existing slice still writes its legacy setting key for backward
    // compatibility; switching accounts must not remove or repurpose that key.
    expect(localStorage.getItem(PROGRAM_SETTINGS_STORAGE_KEY)).toBe(JSON.stringify(aSettings));
  });
});
