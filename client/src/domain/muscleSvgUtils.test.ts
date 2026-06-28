import { describe, expect, it } from "vitest";
import {
  getActivationRoleMap,
  getMuscleAssetPath,
  muscleRoleStyles,
} from "./muscleSvgUtils";

describe("muscleSvgUtils", () => {
  it("returns the local public asset path for each view", () => {
    expect(getMuscleAssetPath("front")).toBe("/assets/anatomy/muscle-front.svg");
    expect(getMuscleAssetPath("back")).toBe("/assets/anatomy/muscle-back.svg");
  });

  it("centralizes visual role colors", () => {
    expect(muscleRoleStyles.primary.fill).toBe("#DC2626");
    expect(muscleRoleStyles.secondary.fill).toBe("#F97316");
    expect(muscleRoleStyles.supporting.fill).toBe("#FACC15");
    expect(muscleRoleStyles.inactive.fill).toBe("#E5E7EB");
  });

  it("turns activation arrays into a role lookup map", () => {
    expect(getActivationRoleMap([
      { muscle: "chest", role: "primary" },
      { muscle: "triceps", role: "secondary" },
    ])).toEqual({
      chest: "primary",
      triceps: "secondary",
    });
  });
});

