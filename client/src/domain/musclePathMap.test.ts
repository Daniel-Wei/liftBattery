import { describe, expect, it } from "vitest";
import {
  getMuscleIdForPathId,
  getPathIdsForMuscle,
  musclePathMap,
  pathIdToMuscleId,
} from "./musclePathMap";

describe("musclePathMap", () => {
  it("does not invent path ids for bitmap-backed anatomy assets", () => {
    expect(Object.values(musclePathMap).every((definition) => (
      (definition.front ?? []).length === 0
      && (definition.back ?? []).length === 0
    ))).toBe(true);
  });

  it("returns empty path lists until real SVG muscle paths exist", () => {
    expect(getPathIdsForMuscle("glutes", "back")).toEqual([]);
    expect(getPathIdsForMuscle("hamstrings", "back")).toEqual([]);
    expect(getPathIdsForMuscle("calves", "back")).toEqual([]);
  });

  it("keeps the reverse index empty when there are no real path ids", () => {
    expect(pathIdToMuscleId).toEqual({});
    expect(getMuscleIdForPathId("glute-left")).toBeUndefined();
  });
});

