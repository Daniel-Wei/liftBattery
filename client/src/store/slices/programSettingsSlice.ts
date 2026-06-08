import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  ProgramSettings,
} from "../../types/appTypes";
import { loadProgramSettings } from "../../helpers/ProgramSettingsHelpers";

type UpdateProgramSettingsPayload = ProgramSettings;

type ProgramSettingsState = {
  programSettingDetails: ProgramSettings;
};

function getInitialProgramSettingsState(): ProgramSettingsState {
  const savedProgramSettings = {...loadProgramSettings()};
  return {
    programSettingDetails:  savedProgramSettings
  };
}

const programSettingsSlice = createSlice({
  name: "programSettings",
  initialState: getInitialProgramSettingsState(),
  reducers: {
    updateProgramSettings: (state, action: PayloadAction<UpdateProgramSettingsPayload>) => {
      state.programSettingDetails = action.payload;
    },
  },
});

export const { 
  updateProgramSettings,
} = programSettingsSlice.actions;

export const programSettingsSliceReducer = programSettingsSlice.reducer;
