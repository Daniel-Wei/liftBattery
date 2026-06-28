import type { MuscleActivation, MuscleMapKey } from "../types/appTypes";

export type MuscleView = "front" | "back";

export type MuscleVisualRole = MuscleActivation["role"] | "inactive";

export type MuscleSvgActivation = {
  muscle: MuscleMapKey;
  role: MuscleVisualRole;
  contribution?: number;
};

export type MusclePathDefinition = {
  front?: string[];
  back?: string[];
};

