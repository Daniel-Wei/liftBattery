import { configureStore } from "@reduxjs/toolkit";
import overviewSliceReducer from "./slices/overviewSlice";

export const liftBatteryStore = configureStore({
  reducer: {
    overview: overviewSliceReducer,
  },
});

export type RootState = ReturnType<typeof liftBatteryStore.getState>;
export type AppDispatch = typeof liftBatteryStore.dispatch;
