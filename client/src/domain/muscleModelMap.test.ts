import { describe, expect, it } from "vitest";
import { getMuscleKeyForModelObject } from "./muscleModelMap";

describe("muscleModelMap", () => {
  it("maps exact GLB muscle names to business muscle ids", () => {
    expect(getMuscleKeyForModelObject("Gluteus maximus muscle.005", {
      name: "Gluteus Maximus",
      nameDetail: "Gluteus Maximus Muscle",
    })).toBe("glutes");

    expect(getMuscleKeyForModelObject("Long head of biceps femoris.003", {
      name: "Biceps Femoris",
      nameDetail: "Long Head Of Biceps Femoris",
    })).toBe("hamstrings");

    expect(getMuscleKeyForModelObject("Lateral head of gastrocnemius.003", {
      name: "Gastrocnemius",
      nameDetail: "Lateral Head Of Gastrocnemius",
    })).toBe("calves");
  });

  it("separates deltoid heads instead of coloring the entire shoulder", () => {
    expect(getMuscleKeyForModelObject("Clavicular part of deltoid muscle.003", {
      name: "Deltoid",
      nameDetail: "Clavicular Part Of Deltoid Muscle",
    })).toBe("frontDeltoid");

    expect(getMuscleKeyForModelObject("Acromial part of deltoid muscle.003", {
      name: "Deltoid",
      nameDetail: "Acromial Part Of Deltoid Muscle",
    })).toBe("sideDeltoid");

    expect(getMuscleKeyForModelObject("Scapular spinal part of deltoid muscle.003", {
      name: "Deltoid",
      nameDetail: "Scapular Spinal Part Of Deltoid Muscle",
    })).toBe("rearDeltoid");
  });
});

