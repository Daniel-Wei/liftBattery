import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TrainingSession,
  TrainingSessionDetails,
} from "../../types/appTypes";
import { loadSavedTrainingSessions } from "../../helpers/TrainingPageHelpers";
import { getTrainingSessions } from "../../api/trainingSessionApi";
import { RequestStatus } from "./sliceHelpers";
import { fromTrainingDto, toTrainingSessionDto } from "../../api/trainingSessionDtoMapping";
import { initialTrainingSessionDetailsInput } from "../../data/defaultValues";
import { 
  saveTrainingSession as saveTrainingSessionToApi,
  deleteTrainingSession as deleteTrainingSessionFromApi,
} from "../../api/trainingSessionApi";

type UpdateTrainingSessionDetailsPayload = {
  [Field in keyof TrainingSessionDetails] -?: {
    field: Field;
    value: TrainingSessionDetails[Field];
  };
}[keyof TrainingSessionDetails];

type TrainingPendingOperation = "fetch" | "save" | "delete";

function updateDraftField<Field extends keyof TrainingSessionDetails>(
  draft: TrainingSessionDetails,
  field: Field,
  value: TrainingSessionDetails[Field],
) {
  draft[field] = value;
}

type TrainingState = {
  trainingSessionDraft: TrainingSessionDetails;
  trainingSessions: TrainingSession[],
  status: RequestStatus,
  error: string | null,
  pendingOperation: TrainingPendingOperation | null,
  pendingMessage: string | null,
  successMessage: string | null,
  operationErrorMessage: string | null,
};

const artificialTrainingRequestDelayMs = 700;

function waitForTrainingRequestDelay() {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, artificialTrainingRequestDelayMs);
  });
}

function getInitialTrainingState(): TrainingState {
  const savedTrainingSessions = [...loadSavedTrainingSessions()];
  return {
    trainingSessionDraft: initialTrainingSessionDetailsInput,
    trainingSessions: savedTrainingSessions,
    status: "idle",
    error: null,
    pendingOperation: null,
    pendingMessage: null,
    successMessage: null,
    operationErrorMessage: null,
  };
}

// (Return type, Argument type, Thunk api config)
export const fetchTrainingSessions = createAsyncThunk<
  TrainingSession[], 
  {from: string, to: string}, 
  { rejectValue: string }
>(
  "training/getTrainingSessions", // type prefix: pending, fulfilled, rejected generated
  async (payload, thunkApi) => {
    try {
      await waitForTrainingRequestDelay();
      const { from, to } = payload;
      const dto = await getTrainingSessions(from, to);
      return dto.map(fromTrainingDto);
    } catch {
      return thunkApi.rejectWithValue("无法读取训练记录，请稍后重试。");
    }
  },
);

export const saveTrainingSession = createAsyncThunk<
  TrainingSession,
  void,
  { state: { training: TrainingState }; rejectValue: string }
>(
  "training/saveTrainingSession",
  async (_payload, thunkApi) => {
    const state = thunkApi.getState();

    try {
      await waitForTrainingRequestDelay();
      const dto = toTrainingSessionDto(state.training.trainingSessionDraft);
      const savedDto = await saveTrainingSessionToApi(dto);
      return fromTrainingDto(savedDto);
    } catch {
      return thunkApi.rejectWithValue("无法保存训练动作，请稍后重试。");
    }
  },
);

export const deleteTrainingSession = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>(
  "training/deleteTrainingSession",
  async (id, thunkApi) => {
    try {
      await waitForTrainingRequestDelay();
      await deleteTrainingSessionFromApi(id);
      return id;
    } catch {
      return thunkApi.rejectWithValue("无法删除训练动作，请稍后重试。");
    }
  },
);

const trainingSlice = createSlice({
  name: "training",
  initialState: getInitialTrainingState(),
  reducers: {
    updateTrainingSessionDraft: (
      state,
      action: PayloadAction<UpdateTrainingSessionDetailsPayload>,
    ) => {
      updateDraftField(
        state.trainingSessionDraft,
        action.payload.field,
        action.payload.value,
      );
    },
    clearTrainingSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearTrainingErrorMessage: (state) => {
      state.operationErrorMessage = null;
    },
  },
  extraReducers: (builder) => {
      builder
        .addCase(fetchTrainingSessions.pending, (state) => {
          state.status = "loading";
          state.error = null;
          state.pendingOperation = "fetch";
          state.pendingMessage = "正在读取训练记录...";
          state.successMessage = null;
          state.operationErrorMessage = null;
        })
        .addCase(fetchTrainingSessions.fulfilled, (state, action) => {
          state.status = "success";
          state.error = null;
          state.pendingOperation = null;
          state.pendingMessage = null;
          state.successMessage = "训练记录已加载";
          state.operationErrorMessage = null;
  
          state.trainingSessions = action.payload;
        })
        .addCase(fetchTrainingSessions.rejected, (state, action) => {
          const errorMessage = action.payload ?? "无法读取训练记录，请稍后重试。";
          state.status = "error";
          state.pendingOperation = null;
          state.pendingMessage = null;
          state.successMessage = null;
          state.error = errorMessage;
          state.operationErrorMessage = errorMessage;
        })
        .addCase(saveTrainingSession.pending, (state) => {
          state.status = "saving";
          state.error = null;
          state.pendingOperation = "save";
          state.pendingMessage = "正在保存训练动作...";
          state.successMessage = null;
          state.operationErrorMessage = null;
        })
        .addCase(saveTrainingSession.fulfilled, (state, action) => {
          state.status = "success";
          state.error = null;
          state.pendingOperation = null;
          state.pendingMessage = null;
          state.successMessage = "训练动作已保存";
          state.operationErrorMessage = null;
          state.trainingSessions.push(action.payload);
        })
        .addCase(saveTrainingSession.rejected, (state, action) => {
          const errorMessage = action.payload ?? "无法保存训练动作，请稍后重试。";
          state.status = "error";
          state.pendingOperation = null;
          state.pendingMessage = null;
          state.successMessage = null;
          state.error = errorMessage;
          state.operationErrorMessage = errorMessage;
        })
        .addCase(deleteTrainingSession.pending, (state) => {
          state.status = "saving";
          state.error = null;
          state.pendingOperation = "delete";
          state.pendingMessage = "正在删除训练动作...";
          state.successMessage = null;
          state.operationErrorMessage = null;
        })
        .addCase(deleteTrainingSession.fulfilled, (state, action) => {
          state.status = "success";
          state.error = null;
          state.pendingOperation = null;
          state.pendingMessage = null;
          state.successMessage = "训练动作已删除";
          state.operationErrorMessage = null;
          state.trainingSessions = state.trainingSessions.filter(ts => ts.id !== action.payload);
        })
        .addCase(deleteTrainingSession.rejected, (state, action) => {
          const errorMessage = action.payload ?? "无法删除训练动作，请稍后重试。";
          state.status = "error";
          state.pendingOperation = null;
          state.pendingMessage = null;
          state.successMessage = null;
          state.error = errorMessage;
          state.operationErrorMessage = errorMessage;
        });
      }
});

export const {
  clearTrainingErrorMessage,
  clearTrainingSuccessMessage,
  updateTrainingSessionDraft,
} = trainingSlice.actions;

export const trainingSliceReducer = trainingSlice.reducer;
