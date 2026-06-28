import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  MuscleGroup,
  TrainingDay,
  TrainingExerciseDraft,
  TrainingSessionDraft,
  TrainingSetDraft,
} from "../../types/appTypes";
import { getDefaultExerciseForMuscleGroup } from "../../data/programValues";
import { initialTrainingSessionDetailsInput } from "../../data/defaultValues";
import { createId } from "../../helpers/GenericHelpers";
import { fromTrainingDayDto, toSaveTrainingSessionDto } from "../../api/trainingSessionDtoMapping";
import {
  deleteTrainingSession as deleteTrainingSessionFromApi,
  getTrainingDays,
  saveTrainingSession as saveTrainingSessionToApi,
} from "../../api/trainingSessionApi";
import type { RequestStatus } from "./sliceHelpers";

type TrainingState = {
  trainingSessionDraft: TrainingSessionDraft;
  trainingDays: TrainingDay[];
  status: RequestStatus;
  error: string | null;
  pendingMessage: string | null;
  successMessage: string | null;
  operationErrorMessage: string | null;
};

const initialState: TrainingState = {
  trainingSessionDraft: structuredClone(initialTrainingSessionDetailsInput),
  trainingDays: [],
  status: "idle",
  error: null,
  pendingMessage: null,
  successMessage: null,
  operationErrorMessage: null,
};

export const fetchTrainingDays = createAsyncThunk<
  TrainingDay[],
  { from: string; to: string },
  { rejectValue: string }
>("training/fetchTrainingDays", async ({ from, to }, thunkApi) => {
  try {
    return (await getTrainingDays(from, to)).map(fromTrainingDayDto);
  } catch {
    return thunkApi.rejectWithValue("无法读取训练记录，请稍后重试。");
  }
});

export const saveTrainingSession = createAsyncThunk<
  TrainingDay,
  void,
  { state: { training: TrainingState }; rejectValue: string }
>("training/saveTrainingSession", async (_payload, thunkApi) => {
  try {
    const dto = toSaveTrainingSessionDto(thunkApi.getState().training.trainingSessionDraft);
    return fromTrainingDayDto(await saveTrainingSessionToApi(dto));
  } catch {
    return thunkApi.rejectWithValue("无法保存训练 Session，请稍后重试。");
  }
});

export const deleteTrainingSession = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("training/deleteTrainingSession", async (id, thunkApi) => {
  try {
    await deleteTrainingSessionFromApi(id);
    return id;
  } catch {
    return thunkApi.rejectWithValue("无法删除训练 Session，请稍后重试。");
  }
});

const trainingSlice = createSlice({
  name: "training",
  initialState,
  reducers: {
    updateTrainingSessionDraft: (
      state,
      action: PayloadAction<{
        field: "date" | "startTime" | "durationMinutes" | "sessionRpe";
        value: string | number;
      }>,
    ) => {
      const { field, value } = action.payload;

      if (field === "date" || field === "startTime") {
        state.trainingSessionDraft[field] = String(value);
      } else {
        state.trainingSessionDraft[field] = Number(value);
      }
    },
    addTrainingExercise: (state) => {
      const muscleGroup: Exclude<MuscleGroup, "All"> = "Chest";
      state.trainingSessionDraft.exercises.push({
        id: createId("draft-exercise"),
        muscleGroup,
        exerciseName: getDefaultExerciseForMuscleGroup(muscleGroup),
        sets: [{
          id: createId("draft-set"),
          reps: 8,
          weightKg: 60,
          isWarmup: false,
        }],
      });
    },
    removeTrainingExercise: (state, action: PayloadAction<number>) => {
      if (state.trainingSessionDraft.exercises.length > 1) {
        state.trainingSessionDraft.exercises = state.trainingSessionDraft.exercises
          .filter((exercise) => exercise.id !== action.payload);
      }
    },
    updateTrainingExercise: (
      state,
      action: PayloadAction<{
        exerciseId: number;
        field: "muscleGroup" | "exerciseName";
        value: string;
      }>,
    ) => {
      const exercise = state.trainingSessionDraft.exercises
        .find((candidate) => candidate.id === action.payload.exerciseId);

      if (!exercise) return;

      if (action.payload.field === "muscleGroup") {
        const muscleGroup = action.payload.value as TrainingExerciseDraft["muscleGroup"];
        exercise.muscleGroup = muscleGroup;
        exercise.exerciseName = getDefaultExerciseForMuscleGroup(muscleGroup);
      } else {
        exercise.exerciseName = action.payload.value;
      }
    },
    addTrainingSet: (state, action: PayloadAction<number>) => {
      const exercise = state.trainingSessionDraft.exercises
        .find((candidate) => candidate.id === action.payload);

      if (!exercise) return;

      const previous = exercise.sets[exercise.sets.length - 1];
      exercise.sets.push({
        id: createId("draft-set"),
        reps: previous?.reps ?? 8,
        weightKg: previous?.weightKg ?? 60,
        rir: previous?.rir,
        isWarmup: previous?.isWarmup ?? false,
      });
    },
    removeTrainingSet: (
      state,
      action: PayloadAction<{ exerciseId: number; setId: number }>,
    ) => {
      const exercise = state.trainingSessionDraft.exercises
        .find((candidate) => candidate.id === action.payload.exerciseId);

      if (exercise && exercise.sets.length > 1) {
        exercise.sets = exercise.sets.filter((set) => set.id !== action.payload.setId);
      }
    },
    updateTrainingSet: (
      state,
      action: PayloadAction<{
        exerciseId: number;
        setId: number;
        field: keyof Omit<TrainingSetDraft, "id">;
        value: number | boolean | undefined;
      }>,
    ) => {
      const set = state.trainingSessionDraft.exercises
        .find((exercise) => exercise.id === action.payload.exerciseId)
        ?.sets.find((candidate) => candidate.id === action.payload.setId);

      if (!set) return;
      const { field, value } = action.payload;

      if (field === "isWarmup") {
        set.isWarmup = Boolean(value);
      } else if (field === "rir") {
        set[field] = value === undefined ? undefined : Number(value);
      } else {
        set[field] = Number(value);
      }
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
      .addCase(fetchTrainingDays.pending, (state) => {
        state.status = "loading";
        state.pendingMessage = "正在读取训练记录...";
        state.operationErrorMessage = null;
      })
      .addCase(fetchTrainingDays.fulfilled, (state, action) => {
        state.status = "success";
        state.trainingDays = action.payload;
        state.pendingMessage = null;
      })
      .addCase(fetchTrainingDays.rejected, (state, action) => {
        state.status = "error";
        state.pendingMessage = null;
        state.operationErrorMessage = action.payload ?? "无法读取训练记录。";
      })
      .addCase(saveTrainingSession.pending, (state) => {
        state.status = "saving";
        state.pendingMessage = "正在保存完整 Session...";
        state.operationErrorMessage = null;
      })
      .addCase(saveTrainingSession.fulfilled, (state, action) => {
        state.status = "success";
        state.pendingMessage = null;
        state.successMessage = "训练 Session 已保存";
        const index = state.trainingDays.findIndex((day) => day.id === action.payload.id);

        if (index >= 0) state.trainingDays[index] = action.payload;
        else state.trainingDays.push(action.payload);

        state.trainingSessionDraft = structuredClone(initialTrainingSessionDetailsInput);
      })
      .addCase(saveTrainingSession.rejected, (state, action) => {
        state.status = "error";
        state.pendingMessage = null;
        state.operationErrorMessage = action.payload ?? "无法保存训练 Session。";
      })
      .addCase(deleteTrainingSession.fulfilled, (state, action) => {
        state.trainingDays = state.trainingDays
          .map((day) => ({
            ...day,
            sessions: day.sessions.filter((session) => session.id !== action.payload),
          }))
          .filter((day) => day.sessions.length > 0);
        state.successMessage = "训练 Session 已删除";
      });
  },
});

export const {
  addTrainingExercise,
  addTrainingSet,
  clearTrainingErrorMessage,
  clearTrainingSuccessMessage,
  removeTrainingExercise,
  removeTrainingSet,
  updateTrainingExercise,
  updateTrainingSessionDraft,
  updateTrainingSet,
} = trainingSlice.actions;

export const trainingSliceReducer = trainingSlice.reducer;
