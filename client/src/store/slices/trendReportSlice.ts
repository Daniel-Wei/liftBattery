import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CreateTrendReportRequestDto,
  TrendReportJobDto,
} from "../../api/dtos";
import {
  cancelTrendReport as cancelTrendReportFromApi,
  createTrendReport as createTrendReportFromApi,
  getTrendReportJob,
} from "../../api/trendReportApi";
import {
  deleteTrainingSession,
  saveTrainingSession,
} from "./trainingSlice";

type TrendReportRequestStatus = "idle" | "submitting" | "cancelling" | "polling" | "success" | "error";

type TrendReportState = {
  job: TrendReportJobDto | null;
  status: TrendReportRequestStatus;
  error: string | null;
  isErrorDialogOpen: boolean;
};

const initialState: TrendReportState = {
  job: null,
  status: "idle",
  error: null,
  isErrorDialogOpen: false,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function markCurrentReportOutdated(state: TrendReportState) {
  if (!state.job) {
    return;
  }

  state.job.status = "Outdated";
  state.job.currentStage = "训练数据已更新，这份报告已过期，请重新生成。";
  state.job.errorMessage = undefined;
  state.status = "success";
  state.error = null;
  state.isErrorDialogOpen = false;
}

export const createTrendReport = createAsyncThunk<
  TrendReportJobDto, // Return type of the payload creator
  CreateTrendReportRequestDto, // First argument to the payload creator
  { rejectValue: string }
>(
  "trendReport/create",
  async (request, thunkApi) => {
    try {
      return await createTrendReportFromApi(request);
    } catch (error) {
      return thunkApi.rejectWithValue(
        getErrorMessage(error, "无法提交报告任务，请稍后重试。"),
      );
    }
  },
);

export const cancelTrendReport = createAsyncThunk<
  TrendReportJobDto,
  string,
  { rejectValue: string }
>(
  "trendReport/cancel",
  async (jobId, thunkApi) => {
    try {
      return await cancelTrendReportFromApi(jobId);
    } catch (error) {
      return thunkApi.rejectWithValue(
        getErrorMessage(error, "无法取消报告任务，请稍后重试。"),
      );
    }
  },
);

export const fetchTrendReportJob = createAsyncThunk<
  TrendReportJobDto,
  string, // First argument to the payload creators
  { rejectValue: string }
>(
  "trendReport/fetchJob",
  async (jobId, thunkApi) => {
    try {
      return await getTrendReportJob(jobId);
    } catch {
      return thunkApi.rejectWithValue("无法读取报告任务状态，请稍后重试。");
    }
  },
);

const trendReportSlice = createSlice({
  name: "trendReport",
  initialState,
  reducers: {
    dismissTrendReportError(state) {
      state.isErrorDialogOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTrendReport.pending, (state) => {
        state.status = "submitting";
        state.error = null;
        state.isErrorDialogOpen = false;
      })
      .addCase(createTrendReport.fulfilled, (state, action) => {
        state.status = "success";
        state.job = action.payload;
        state.error = null;
        state.isErrorDialogOpen = false;
      })
      .addCase(createTrendReport.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法提交报告任务。";
        state.isErrorDialogOpen = true;
      })
      .addCase(cancelTrendReport.pending, (state) => {
        state.status = "cancelling";
        state.error = null;
        state.isErrorDialogOpen = false;
      })
      .addCase(cancelTrendReport.fulfilled, (state, action) => {
        state.status = "success";
        state.job = action.payload;
        state.error = null;
        state.isErrorDialogOpen = false;
      })
      .addCase(cancelTrendReport.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法取消报告任务。";
        state.isErrorDialogOpen = true;
      })
      .addCase(fetchTrendReportJob.pending, (state) => {
        if (state.status !== "cancelling") {
          state.status = "polling";
          state.error = null;
        }
      })
      .addCase(fetchTrendReportJob.fulfilled, (state, action) => {
        state.job = action.payload;
        if (state.status !== "cancelling") {
          state.status = "success";
          state.error = null;
        }
      })
      .addCase(fetchTrendReportJob.rejected, (state, action) => {
        if (state.status !== "cancelling") {
          state.status = "error";
          state.error = action.payload ?? "无法读取报告任务状态。";
        }
      })
      .addCase(saveTrainingSession.fulfilled, (state) => {
        markCurrentReportOutdated(state);
      })
      .addCase(deleteTrainingSession.fulfilled, (state) => {
        markCurrentReportOutdated(state);
      });
  },
});

export const { dismissTrendReportError } = trendReportSlice.actions;
export const trendReportSliceReducer = trendReportSlice.reducer;
