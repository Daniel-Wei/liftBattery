import { createSlice } from "@reduxjs/toolkit";
import { defaultLiftBatteryState } from "../../data/defaultValues";
import { loadInitialLiftBatteryState } from "../../helpers/LiftBatteryContextHelpers";

function getInitialLiftBatteryState() {
  if (typeof window === "undefined") {
    return defaultLiftBatteryState;
  }

  return loadInitialLiftBatteryState();
}

const overviewSlice = createSlice({
  name: "overview",
  initialState: getInitialLiftBatteryState(),
  reducers: {},
});

export const overviewSliceReducer = overviewSlice.reducer;