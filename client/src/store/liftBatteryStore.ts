import { configureStore } from "@reduxjs/toolkit";
import { preCheckSliceReducer } from "./slices/preCheckSlice";
import { trainingSliceReducer } from "./slices/trainingSlice";
import { programSettingsSliceReducer } from "./slices/programSettingsSlice";

export const liftBatteryStore = configureStore({
  reducer: {
    preCheck: preCheckSliceReducer,
    training: trainingSliceReducer,
    programSettings: programSettingsSliceReducer
  },
});

export type RootState = ReturnType<typeof liftBatteryStore.getState>;
export type AppDispatch = typeof liftBatteryStore.dispatch;
