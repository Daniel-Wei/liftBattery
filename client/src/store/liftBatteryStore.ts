import { configureStore } from "@reduxjs/toolkit";
import { overviewSliceReducer} from "./slices/overviewSlice";
import { preCheckSliceReducer } from "./slices/preCheckSlice";

export const liftBatteryStore = configureStore({
  reducer: {
    overview: overviewSliceReducer,
    preCheck: preCheckSliceReducer,
  },
});

export type RootState = ReturnType<typeof liftBatteryStore.getState>;
export type AppDispatch = typeof liftBatteryStore.dispatch;
