import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialPreCheckDetailsInput } from "../../data/defaultValues";
import type {
  PreCheckLog,
  PreCheckDetailsLog,
} from "../../types/appTypes";
import {
  getPreCheckDraftUpdated,
  getTodayPreCheckLog,
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

function getInitialPreCheckState(): PreCheckState {
  const savedPreCheckLogs = [...loadSavedPreCheckLogs()];
  const savedTodayPreCheckLog = getTodayPreCheckLog(savedPreCheckLogs);
  return {
    preCheckDraft: savedTodayPreCheckLog !== undefined ?
      {...savedTodayPreCheckLog.input} : {...initialPreCheckDetailsInput},
    preCheckDraftUpdated: savedTodayPreCheckLog === undefined,
    savedPreCheckLogs: savedPreCheckLogs,
  };
}

const preCheckSlice = createSlice({
  name: "preCheck",
  initialState: getInitialPreCheckState(),
  reducers: {
    updatePreCheckDraft: (state, action: PayloadAction<UpdatePreCheckDetailsPayload>) => {
      state.preCheckDraft[action.payload.field] = action.payload.value;
      state.preCheckDraftUpdated = getPreCheckDraftUpdated(
        state.savedPreCheckLogs,
        state.preCheckDraft,
      );
    },

    resetPreCheckDraft: () =>  {
      return getInitialPreCheckState();
    },

    savePreCheckLogDraft: (state) => {
      let todayLog = getTodayPreCheckLog(state.savedPreCheckLogs);
      if(todayLog){
        todayLog.input = {...state.preCheckDraft};
        state.preCheckDraftUpdated = false;
      }
      else {
        const today = getTodayDate();
        const newLog: PreCheckLog = {
          id: `log-${today}-${Date.now()}`,
          date: today,
          input: {...state.preCheckDraft},
          readiness: calculateReadiness(state.preCheckDraft),
        };
        state.savedPreCheckLogs.unshift(newLog);
        state.preCheckDraftUpdated = false;
      }
    },
    deletePreCheckLog: (state, action: PayloadAction<string>) => {
      const deletedLog = state.savedPreCheckLogs.find(log => log.id === action.payload);
      state.savedPreCheckLogs = state.savedPreCheckLogs.filter(log => log.id !== action.payload);
      const todayPreCheckLogDeleted = deletedLog?.date === getTodayDate();
      if(todayPreCheckLogDeleted){
        state.preCheckDraftUpdated = true;
        state.preCheckDraft = {...initialPreCheckDetailsInput};
      }
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
