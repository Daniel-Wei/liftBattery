import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  TrainingSession,
} from "../../types/appTypes";
import { loadSavedTrainingSessions } from "../../helpers/TrainingPageHelpers";

type UpdateTrainingPayload = TrainingSession;

type TrainingState = {
  trainingSessions: TrainingSession[]
};

function getInitialTrainingState(): TrainingState {
  const savedTrainingSessions = [...loadSavedTrainingSessions()];
  return {
    trainingSessions: savedTrainingSessions,
  };
}

const trainingSlice = createSlice({
  name: "training",
  initialState: getInitialTrainingState(),
  reducers: {
    saveTrainingSession: (state, action: PayloadAction<UpdateTrainingPayload>) => {
      const existingSessionIndex = state.trainingSessions.findIndex((session) => (
        session.id === action.payload.id
      ));

      if (existingSessionIndex === -1) {
        state.trainingSessions.push(action.payload);
        return;
      }

      state.trainingSessions[existingSessionIndex] = action.payload;
    },
    
    deleteTrainingSession: (state, action: PayloadAction<string>) => {
      state.trainingSessions = state.trainingSessions.filter(ts => ts.id !== action.payload);
    },
  },
});

export const { 
  saveTrainingSession,
  deleteTrainingSession
} = trainingSlice.actions;

export const trainingSliceReducer = trainingSlice.reducer;
