import {
  combineReducers,
  configureStore,
  createListenerMiddleware,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
  type Middleware,
  type UnknownAction,
} from "@reduxjs/toolkit";
import { defaultProgramSettings } from "../data/defaultValues";
import { accountStorageKey, PROGRAM_SETTINGS_STORAGE_KEY, TREND_REPORT_JOB_ID_STORAGE_KEY } from "../data/localStorageKeys";
import { isProgramSettings } from "../types/appTypeChecks";
import {
  deletePreCheckLog,
  preCheckSliceReducer,
  savePreCheck,
} from "./slices/preCheckSlice";
import {
  deleteTrainingSession,
  saveTrainingSession,
  trainingSliceReducer,
} from "./slices/trainingSlice";
import { programSettingsSliceReducer, updateProgramSettings } from "./slices/programSettingsSlice";
import {
  fetchTrendReportJob,
  trendReportSliceReducer,
} from "./slices/trendReportSlice";
import { authSliceReducer, logoutUser, updateCurrentUser } from "./slices/authSlice";

const combinedReducer = combineReducers({
  preCheck: preCheckSliceReducer,
  training: trainingSliceReducer,
  programSettings: programSettingsSliceReducer,
  trendReport: trendReportSliceReducer,
  auth: authSliceReducer,
});

export type RootState = ReturnType<typeof combinedReducer>;

function loadAccountSettings(userId: number | null) {
  if (userId !== null) {
    try {
      const saved = localStorage.getItem(accountStorageKey(PROGRAM_SETTINGS_STORAGE_KEY, userId));
      const value: unknown = saved ? JSON.parse(saved) : null;
      if (isProgramSettings(value)) return value;
    } catch { /* An unavailable cache must not block switching accounts. */ }
  }
  return structuredClone(defaultProgramSettings);
}

function rootReducer(state: RootState | undefined, action: UnknownAction): RootState {
  const next = combinedReducer(state, action);
  const previousUserId = state?.auth.user?.id ?? null;
  const nextUserId = next.auth.user?.id ?? null;
  if (state && (previousUserId !== nextUserId || logoutUser.fulfilled.match(action))) {
    // Keep the new auth result, but never carry another account's drafts or
    // backend records into this session. Legacy global caches remain untouched:
    // without a recorded owner their contents cannot safely be assigned a user.
    return {
      ...combinedReducer(undefined, { type: "account/resetPersonalData" }),
      auth: next.auth,
      programSettings: { programSettingDetails: loadAccountSettings(nextUserId) },
    };
  }
  return next;
}

function cacheAccountData(state: RootState) {
  const userId = state.auth.user?.id;
  if (userId === undefined) return;
  try {
    localStorage.setItem(accountStorageKey(PROGRAM_SETTINGS_STORAGE_KEY, userId), JSON.stringify(state.programSettings.programSettingDetails));
    if (state.trendReport.job) {
      localStorage.setItem(accountStorageKey(TREND_REPORT_JOB_ID_STORAGE_KEY, userId), state.trendReport.job.id);
    }
  } catch { /* The Redux session remains usable without browser storage. */ }
}

export function createLiftBatteryStore() {
  const trendReportRefreshListener = createListenerMiddleware<RootState>();
  // A generation also rejects a response from an earlier login of the same
  // account (A -> sign out -> A), rather than comparing user IDs alone.
  let generation = 0;
  const pendingRequests = new Map<string, number>();
  const accountIsolation: Middleware<{}, RootState> = (api) => (next) => (action) => {
    const isPersonalRequest = (isPending(action) || isFulfilled(action) || isRejected(action))
      && (!action.type.startsWith("auth/") || isAnyOf(updateCurrentUser.pending, updateCurrentUser.fulfilled, updateCurrentUser.rejected)(action));
    if (isPersonalRequest && isPending(action)) pendingRequests.set(action.meta.requestId, generation);
    if (isPersonalRequest && (isFulfilled(action) || isRejected(action))) {
      const origin = pendingRequests.get(action.meta.requestId);
      pendingRequests.delete(action.meta.requestId);
      if (origin !== undefined && origin !== generation) return action;
    }
    const before = api.getState();
    const previousUserId = before.auth.user?.id ?? null;
    const result = next(action);
    const after = api.getState();
    const nextUserId = after.auth.user?.id ?? null;
    if (previousUserId !== nextUserId || logoutUser.fulfilled.match(action)) {
      // Persist only data whose owner is known; never delete the old global
      // settings/job keys or copy them into a different account's namespace.
      cacheAccountData(before);
      generation += 1;
    } else if (updateProgramSettings.match(action) || before.trendReport.job !== after.trendReport.job) {
      cacheAccountData(after);
    }
    return result;
  };
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
      .prepend(accountIsolation, trendReportRefreshListener.middleware),
  });

  trendReportRefreshListener.startListening({
    matcher: isAnyOf(
      saveTrainingSession.fulfilled,
      deleteTrainingSession.fulfilled,
      savePreCheck.fulfilled,
      deletePreCheckLog.fulfilled,
    ),
    effect: async (_action, listenerApi) => {
      // The CRUD request returns only after SQL DataVersion is committed and the
      // backend has eagerly superseded any older active report. Never synthesize
      // a client-only status; reload the displayed Job from the authority.
      const currentJobId = listenerApi.getState().trendReport.job?.id;
      if (currentJobId) await listenerApi.dispatch(fetchTrendReportJob(currentJobId));
    },
  });
  return store;
}

export const liftBatteryStore = createLiftBatteryStore();
export type AppDispatch = typeof liftBatteryStore.dispatch;
