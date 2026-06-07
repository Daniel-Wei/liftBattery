import { configureStore } from "@reduxjs/toolkit";
import { preCheckSliceReducer } from "./slices/preCheckSlice";

export const liftBatteryStore = configureStore({
  reducer: {
    preCheck: preCheckSliceReducer,
  },
});

export type RootState = ReturnType<typeof liftBatteryStore.getState>;
export type AppDispatch = typeof liftBatteryStore.dispatch;
