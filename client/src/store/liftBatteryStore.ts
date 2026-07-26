import {
  configureStore,
  createListenerMiddleware,
  isAnyOf,
  type TypedStartListening,
} from "@reduxjs/toolkit";
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
import { programSettingsSliceReducer } from "./slices/programSettingsSlice";
import {
  fetchTrendReportJob,
  trendReportSliceReducer,
} from "./slices/trendReportSlice";
import { authSliceReducer } from "./slices/authSlice";

const trendReportRefreshListener = createListenerMiddleware();
export const liftBatteryStore = configureStore({
  reducer: {
    preCheck: preCheckSliceReducer,
    training: trainingSliceReducer,
    programSettings: programSettingsSliceReducer,
    trendReport: trendReportSliceReducer,
    auth: authSliceReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .prepend(trendReportRefreshListener.middleware),
});

export type RootState = ReturnType<typeof liftBatteryStore.getState>;
export type AppDispatch = typeof liftBatteryStore.dispatch;

type AppStartListening = TypedStartListening<RootState, AppDispatch>;
const startAppListening = trendReportRefreshListener.startListening as AppStartListening;

startAppListening({
  matcher: isAnyOf(
    saveTrainingSession.fulfilled,
    deleteTrainingSession.fulfilled,
    savePreCheck.fulfilled,
    deletePreCheckLog.fulfilled,
  ),
  effect: async (_action, listenerApi) => {
    // The CRUD request returns only after SQL DataVersion is committed and the
    // backend has eagerly superseded any older active report. Never synthesize a
    // client-only status; reload the currently displayed Job from the authority.
    const currentJobId = listenerApi.getState().trendReport.job?.id;

    if (currentJobId) {
      await listenerApi.dispatch(fetchTrendReportJob(currentJobId));
    }
  },
});
