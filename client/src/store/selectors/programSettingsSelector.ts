import type { RootState } from "../liftBatteryStore";

export const getProgramSettings = (state: RootState) => {
  return {
    programSettings: state.programSettings.programSettingDetails
  };
};
