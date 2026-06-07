import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { defaultLiftBatteryState } from "../../data/defaultValues";
import { loadInitialLiftBatteryState } from "../../helpers/LiftBatteryContextHelpers";
import type {
  LiftBatteryState,
} from "../../types/appTypes";

function getInitialLiftBatteryState() {
  if (typeof window === "undefined") {
    return defaultLiftBatteryState;
  }

  return loadInitialLiftBatteryState();
}

const overviewSlice = createSlice({
  name: "overview",
  initialState: getInitialLiftBatteryState(),
  reducers: {
    setOverviewSnapshot(_state, action: PayloadAction<LiftBatteryState>) {
      return action.payload;
    },
  },
});

export const { setOverviewSnapshot } = overviewSlice.actions;

export default overviewSlice.reducer;