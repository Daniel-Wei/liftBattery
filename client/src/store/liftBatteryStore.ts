import { configureStore } from "@reduxjs/toolkit";
import { preCheckSliceReducer } from "./slices/preCheckSlice";
import { trainingSliceReducer } from "./slices/trainingSlice";
import { programSettingsSliceReducer } from "./slices/programSettingsSlice";
import { trendReportSliceReducer } from "./slices/trendReportSlice";
import { authSliceReducer } from "./slices/authSlice";

export const liftBatteryStore = configureStore({
  reducer: {
    preCheck: preCheckSliceReducer,
    training: trainingSliceReducer,
    programSettings: programSettingsSliceReducer,
    trendReport: trendReportSliceReducer,
    auth: authSliceReducer,
  },
});

export type RootState = ReturnType<typeof liftBatteryStore.getState>;
export type AppDispatch = typeof liftBatteryStore.dispatch;
