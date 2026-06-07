import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialPreCheckDetailsInput } from "../../data/defaultValues";
import type {
  PreCheckLog,
  PreCheckDetailsLog,
} from "../../types/appTypes";
import {
  getPreCheckDraftUpdated,
  getSavedTodayPreCheckLog,
  loadSavedPreCheckLogs,
} from "../../helpers/PreCheckHelpers";
import { getTodayDate } from "../../helpers/GenericHelpers";
import { calculateReadiness } from "../../domain/readiness";

type UpdatePreCheckDetailsPayload = {
  field: keyof PreCheckDetailsLog;
  value: number;
};

type PreCheckState = {
  preCheckDraft: PreCheckDetailsLog;
  preCheckDraftUpdated: boolean;
  savedPreCheckLogs: PreCheckLog[];
};

function getInitialPreCheckState() {
  return {
    preCheckDraft: getSavedTodayPreCheckLog()?.input?? initialPreCheckDetailsInput,
    preCheckDraftUpdated: false,
    savedPreCheckLogs: loadSavedPreCheckLogs(),
  } as PreCheckState;
}

const preCheckSlice = createSlice({
  name: "preCheck",
  initialState: getInitialPreCheckState(),
  reducers: {
    updatePreCheckDraft: (state, action: PayloadAction<UpdatePreCheckDetailsPayload>) => {
      state.preCheckDraft[action.payload.field] = action.payload.value;
      state.preCheckDraftUpdated = getPreCheckDraftUpdated(
        state.preCheckDraft,
      );
    },

    resetPreCheckDraft: (state) =>  {
      state.preCheckDraft = getSavedTodayPreCheckLog()?.input?? initialPreCheckDetailsInput;
      state.preCheckDraftUpdated = false;
    },

    savePreCheckLogDraft: (state, _) => {
      let todayLog = getSavedTodayPreCheckLog() ?.input ?? null;
      if(todayLog){
        todayLog = state.preCheckDraft;
        state.preCheckDraftUpdated = false;
      }
      else {
        const newLog: PreCheckLog = {
          id: `log-${getTodayDate()}-${Date.now()}`,
          date: getTodayDate(),
          input: state.preCheckDraft,
          readiness: calculateReadiness(state.preCheckDraft),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.savedPreCheckLogs.unshift(newLog);
        state.preCheckDraftUpdated = false;
      }
    },
    deletePreCheckLog: (state, action: PayloadAction<string>) => {
      state.savedPreCheckLogs = state.savedPreCheckLogs.filter(log => log.id !== action.payload);
    },
  },
});

export const { 
  updatePreCheckDraft,
  resetPreCheckDraft,
  savePreCheckLogDraft,
  deletePreCheckLog
} = preCheckSlice.actions;

export const preCheckSliceReducer = preCheckSlice.reducer;
