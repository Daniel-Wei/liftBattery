import type { MuscleMapKey } from "../types/appTypes";
import type { MusclePathDefinition, MuscleView } from "./muscleAssetTypes";

// The current anatomy assets are bitmap-backed SVG wrappers. They do not expose
// real per-muscle SVG paths yet, so this map must stay empty until the assets are
// replaced with professional SVGs containing stable `.muscle` path ids.
export const musclePathMap: Record<MuscleMapKey, MusclePathDefinition> = {
  chest: {},
  back: {},
  frontDeltoid: {},
  sideDeltoid: {},
  rearDeltoid: {},
  biceps: {},
  triceps: {},
  abs: {},
  glutes: {},
  quads: {},
  hamstrings: {},
  calves: {},
};

export const pathIdToMuscleId = Object.entries(musclePathMap).reduce<Record<string, MuscleMapKey>>(
  (index, [muscleId, definition]) => {
    const typedMuscleId = muscleId as MuscleMapKey;
    [...(definition.front ?? []), ...(definition.back ?? [])].forEach((pathId) => {
      index[pathId] = typedMuscleId;
    });
    return index;
  },
  {},
);

export function getPathIdsForMuscle(muscleId: MuscleMapKey, view: MuscleView) {
  return musclePathMap[muscleId]?.[view] ?? [];
}

export function getRequiredPathIdsByView(view: MuscleView) {
  return Object.values(musclePathMap).flatMap((definition) => definition[view] ?? []);
}

export function getMuscleIdForPathId(pathId: string) {
  return pathIdToMuscleId[pathId];
}
