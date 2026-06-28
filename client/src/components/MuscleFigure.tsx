import type { MuscleMapKey } from "../types/appTypes";
import { MuscleModelViewer } from "./MuscleModelViewer";
import type { MuscleView, MuscleVisualRole } from "../domain/muscleAssetTypes";

type MuscleFigureProps = {
  view: MuscleView;
  getHighlight: (muscle: MuscleMapKey) => string | undefined;
  active?: boolean;
};

const allMuscles: MuscleMapKey[] = [
  "chest",
  "back",
  "frontDeltoid",
  "sideDeltoid",
  "rearDeltoid",
  "biceps",
  "triceps",
  "abs",
  "glutes",
  "quads",
  "hamstrings",
  "calves",
];

function toVisualRole(value: string | undefined): MuscleVisualRole {
  if (value === "primary" || value === "secondary" || value === "supporting") {
    return value;
  }

  if (value === "high") return "primary";
  if (value === "medium") return "secondary";
  if (value === "low") return "supporting";

  return "inactive";
}

export function MuscleFigure({ view, getHighlight, active = true }: MuscleFigureProps) {
  return (
    <MuscleModelViewer
      view={view}
      className={active ? undefined : "muscle-model-viewer--muted"}
      activations={allMuscles.map((muscle) => ({
        muscle,
        role: toVisualRole(getHighlight(muscle)),
      }))}
    />
  );
}
