import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { initialPreCheckDetailsInput } from "../../data/defaultValues";
import type {
  PreCheckLog,
  PreCheckDetailsLog,
} from "../../types/appTypes";
import {
  getPreCheckDraftUpdated,
  getTodayPreCheckLog,
} from "../../helpers/PreCheckHelpers";
import {
  getLatestTrainingDayDetails,
} from "../../helpers/TrainingPageHelpers";
import { getTodayDate } from "../../helpers/GenericHelpers";
import {
  getPreCheckByDate as getPreCheckByDateFromApi,
  getPreChecks as getPreChecksFromApi,
  savePreCheck as savePreCheckToApi,
  deletePreCheck as deletePreCheckFromApi,
} from "../../api/preCheckApi";
import { getTrainingDays as getTrainingDaysFromApi } from "../../api/trainingSessionApi";
import { fromPreCheckDto, toPreCheckDto } from "../../api/preCheckDtoMapping";
import { flattenTrainingDays, fromTrainingDayDto } from "../../api/trainingSessionDtoMapping";
import { RequestStatus } from "./sliceHelpers";

type UpdatePreCheckDetailsPayload = {
  field: keyof PreCheckDetailsLog;
  value: number;
};

type PreCheckState = {
  preCheckDraft: PreCheckDetailsLog;
  preCheckDraftUpdated: boolean;
  savedPreCheckLogs: PreCheckLog[];
  status: RequestStatus;
  error: string | null;
};

type FetchTodayPreCheckResult = {
  todayLog: PreCheckLog | null;
  logs: PreCheckLog[];
  defaultDraft: PreCheckDetailsLog;
};

const previousTrainingLookbackDays = 90;

function upsertPreCheckLog(logs: PreCheckLog[], nextLog: PreCheckLog) {
  const existingLogIndex = logs.findIndex((log) => log.date === nextLog.date);

  if (existingLogIndex === -1) {
    logs.unshift(nextLog);
    return;
  }

  logs[existingLogIndex] = nextLog;
}

function getDateDaysAgo(daysAgo: number) {
  const date = new Date(`${getTodayDate()}T00:00:00`);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function getPreCheckDraftWithPreviousTrainingDefaults(trainingSessions: ReturnType<typeof flattenTrainingDays> = []) {
  const latestTrainingDay = getLatestTrainingDayDetails(trainingSessions);

  if (latestTrainingDay === null) {
    return { ...initialPreCheckDetailsInput };
  }

  return {
    ...initialPreCheckDetailsInput,
    previousSessionRpe: latestTrainingDay.sessionRpe,
  };
}

async function getBackendPreviousTrainingDefaultDraft() {
  const to = getTodayDate();
  const from = getDateDaysAgo(previousTrainingLookbackDays);
  const trainingDays = (await getTrainingDaysFromApi(from, to)).map(fromTrainingDayDto);
  return getPreCheckDraftWithPreviousTrainingDefaults(flattenTrainingDays(trainingDays));
}

// (Return type, Argument type, Thunk api config)
export const fetchTodayPreCheck = createAsyncThunk<
  FetchTodayPreCheckResult,
  void, 
  { rejectValue: string }
>(
  "preCheck/fetchTodayPreCheck", // type prefix: pending, fulfilled, rejected generated
  async (_payload, thunkApi) => {
    try {
      const today = getTodayDate();
      const historyFrom = getDateDaysAgo(previousTrainingLookbackDays);
      const [dto, historyDtos] = await Promise.all([
        getPreCheckByDateFromApi(today),
        getPreChecksFromApi(historyFrom, today),
      ]);
      const todayLog = dto === null ? null : fromPreCheckDto(dto);
      const logs = historyDtos.map((historyDto) => fromPreCheckDto(historyDto));

      if (todayLog !== null) {
        upsertPreCheckLog(logs, todayLog);
        return {
          todayLog,
          logs,
          defaultDraft: todayLog.input,
        };
      }

      try {
        return {
          todayLog: null,
          logs,
          defaultDraft: await getBackendPreviousTrainingDefaultDraft(),
        };
      } catch {
        return {
          todayLog: null,
          logs,
          defaultDraft: getPreCheckDraftWithPreviousTrainingDefaults(),
        };
      }
    } catch {
      return thunkApi.rejectWithValue("无法读取今日练前检查，请稍后重试。");
    }
  },
);

export const savePreCheck = createAsyncThunk<
  PreCheckLog,
  void,
  { state: { preCheck: PreCheckState }; rejectValue: string }
>(
  "preCheck/savePreCheck",
  async (_payload, thunkApi) => {
    const state = thunkApi.getState();
    const savedTodayLog = getTodayPreCheckLog(state.preCheck.savedPreCheckLogs);

    try {
      const dto = toPreCheckDto(state.preCheck.preCheckDraft, savedTodayLog);
      const savedDto = await savePreCheckToApi(dto);
      return fromPreCheckDto(savedDto, state.preCheck.preCheckDraft);
    } catch {
      return thunkApi.rejectWithValue("无法保存练前检查，请稍后重试。");
    }
  },
);

export const deletePreCheckLog = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>(
  "preCheck/deletePreCheck",
  async (id, thunkApi) => {
    try {
      await deletePreCheckFromApi(id);
      return id;
    } catch {
      return thunkApi.rejectWithValue("无法删除练前检查，请稍后重试。");
    }
  },
);

function getInitialPreCheckState(): PreCheckState {
  const defaultPreCheckDraft = getPreCheckDraftWithPreviousTrainingDefaults();
  return {
    preCheckDraft: defaultPreCheckDraft,
    preCheckDraftUpdated: true,
    savedPreCheckLogs: [],
    status: "idle",
    error: null,
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

    resetPreCheckDraft: (state) =>  {
      const savedTodayLog = getTodayPreCheckLog(state.savedPreCheckLogs);
      state.preCheckDraft = savedTodayLog === undefined
        ? getPreCheckDraftWithPreviousTrainingDefaults()
        : { ...savedTodayLog.input };
      state.preCheckDraftUpdated = savedTodayLog === undefined;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodayPreCheck.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTodayPreCheck.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        state.savedPreCheckLogs = action.payload.logs;

        if (action.payload.todayLog === null) {
          state.preCheckDraft = { ...action.payload.defaultDraft };
          state.preCheckDraftUpdated = true;
          return;
        }

        upsertPreCheckLog(state.savedPreCheckLogs, action.payload.todayLog);
        state.preCheckDraft = { ...action.payload.todayLog.input };
        state.preCheckDraftUpdated = false;
      })
      .addCase(fetchTodayPreCheck.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法读取今日练前检查，请稍后重试。";
      })
      .addCase(savePreCheck.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(savePreCheck.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;
        upsertPreCheckLog(state.savedPreCheckLogs, action.payload);
        state.preCheckDraft = { ...action.payload.input };
        state.preCheckDraftUpdated = false;
      })
      .addCase(savePreCheck.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法保存练前检查，请稍后重试。";
      })
      .addCase(deletePreCheckLog.pending, (state) => {
        state.status = "saving";
        state.error = null;
      })
      .addCase(deletePreCheckLog.fulfilled, (state, action) => {
        state.status = "success";
        state.error = null;

        const deletedLog = state.savedPreCheckLogs.find((log) => log.id === action.payload);
        state.savedPreCheckLogs = state.savedPreCheckLogs.filter((log) => log.id !== action.payload);

        if (deletedLog?.date === getTodayDate()) {
          state.preCheckDraft = getPreCheckDraftWithPreviousTrainingDefaults();
          state.preCheckDraftUpdated = true;
        }
      })
      .addCase(deletePreCheckLog.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法删除练前检查，请稍后重试。";
      });
  },
});

export const { 
  updatePreCheckDraft,
  resetPreCheckDraft,
} = preCheckSlice.actions;

export const preCheckSliceReducer = preCheckSlice.reducer;
