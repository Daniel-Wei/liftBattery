import { describe, expect, it } from "vitest";
import {
  addTrainingSet,
  trainingSliceReducer,
  updateTrainingSet,
} from "./trainingSlice";

describe("training set draft IDs", () => {
  it("updates the third set without changing the first set", () => {
    let state = trainingSliceReducer(undefined, { type: "test/init" });
    const exerciseId = state.trainingSessionDraft.exercises[0].id;

    state = trainingSliceReducer(state, addTrainingSet(exerciseId));
    state = trainingSliceReducer(state, addTrainingSet(exerciseId));

    const sets = state.trainingSessionDraft.exercises[0].sets;
    const firstSetId = sets[0].id;
    const thirdSetId = sets[2].id;

    expect(new Set(sets.map((set) => set.id)).size).toBe(3);
    expect(thirdSetId).not.toBe(firstSetId);

    // Also cover an already-open draft produced before the ID-range fix.
    state = structuredClone(state);
    state.trainingSessionDraft.exercises[0].sets[2].id = firstSetId;
    state = trainingSliceReducer(state, updateTrainingSet({
      exerciseId,
      setId: thirdSetId,
      setIndex: 2,
      field: "weightKg",
      value: 75,
    }));

    expect(state.trainingSessionDraft.exercises[0].sets[0].weightKg).toBe(60);
    expect(state.trainingSessionDraft.exercises[0].sets[2].weightKg).toBe(75);
  });
});
