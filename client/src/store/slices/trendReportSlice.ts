import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CreateTrendReportRequestDto,
  TrendReportJobDto,
} from "../../api/dtos";
import {
  createTrendReport as createTrendReportFromApi,
  getTrendReportJob,
} from "../../api/trendReportApi";
import {
  deleteTrainingSession,
  saveTrainingSession,
} from "./trainingSlice";

type TrendReportRequestStatus = "idle" | "submitting" | "polling" | "success" | "error";

type TrendReportState = {
  job: TrendReportJobDto | null;
  status: TrendReportRequestStatus;
  error: string | null;
};

const initialState: TrendReportState = {
  job: null,
  status: "idle",
  error: null,
};

function markCurrentReportOutdated(state: TrendReportState) {
  if (!state.job) {
    return;
  }

  state.job.status = "Outdated";
  state.job.currentStage = "训练数据已更新，这份报告已过期，请重新生成。";
  state.job.errorMessage = undefined;
  state.status = "success";
  state.error = null;
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
    } catch {
      return thunkApi.rejectWithValue("无法提交报告任务，请检查消息队列配置后重试。");
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTrendReport.pending, (state) => {
        state.status = "submitting";
        state.error = null;
      })
      .addCase(createTrendReport.fulfilled, (state, action) => {
        state.status = "success";
        state.job = action.payload;
        state.error = null;
      })
      .addCase(createTrendReport.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法提交报告任务。";
      })
      .addCase(fetchTrendReportJob.pending, (state) => {
        state.status = "polling";
        state.error = null;
      })
      .addCase(fetchTrendReportJob.fulfilled, (state, action) => {
        state.status = "success";
        state.job = action.payload;
        state.error = null;
      })
      .addCase(fetchTrendReportJob.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? "无法读取报告任务状态。";
      })
      .addCase(saveTrainingSession.fulfilled, (state) => {
        markCurrentReportOutdated(state);
      })
      .addCase(deleteTrainingSession.fulfilled, (state) => {
        markCurrentReportOutdated(state);
      });
  },
});

export const trendReportSliceReducer = trendReportSlice.reducer;
