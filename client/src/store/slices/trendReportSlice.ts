import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CreateTrendReportRequestDto,
  TrendReportJobDto,
} from "../../api/dtos";
import {
  createTrendReport as createTrendReportFromApi,
  getTrendReportJob,
} from "../../api/trendReportApi";

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

export const createTrendReport = createAsyncThunk<
  TrendReportJobDto,
  CreateTrendReportRequestDto,
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
  number,
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
      });
  },
});

export const trendReportSliceReducer = trendReportSlice.reducer;
