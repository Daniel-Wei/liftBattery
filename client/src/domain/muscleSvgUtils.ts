import { muscleDisplayLabels } from "./exerciseMuscleMap";
import type { MuscleMapKey } from "../types/appTypes";
import { getPathIdsForMuscle, pathIdToMuscleId } from "./musclePathMap";
import type { MuscleSvgActivation, MuscleView, MuscleVisualRole } from "./muscleAssetTypes";

export const muscleRoleStyles: Record<MuscleVisualRole, { fill: string; opacity: string; className: string }> = {
  primary: {
    fill: "#DC2626",
    opacity: "0.62",
    className: "is-primary",
  },
  secondary: {
    fill: "#F97316",
    opacity: "0.56",
    className: "is-secondary",
  },
  supporting: {
    fill: "#FACC15",
    opacity: "0.48",
    className: "is-supporting",
  },
  inactive: {
    fill: "#E5E7EB",
    opacity: "0",
    className: "is-inactive",
  },
};

export function getMuscleAssetPath(view: MuscleView) {
  return `/assets/anatomy/muscle-${view}.svg`;
}

export function getActivationRoleMap(activations: MuscleSvgActivation[]) {
  return activations.reduce<Partial<Record<MuscleMapKey, MuscleVisualRole>>>((map, activation) => {
    map[activation.muscle] = activation.role;
    return map;
  }, {});
}

export function getMissingPathIds(
  svg: SVGSVGElement,
  view: MuscleView,
  activations: MuscleSvgActivation[],
) {
  return activations.flatMap((activation) => (
    getPathIdsForMuscle(activation.muscle, view).filter((pathId) => !svg.querySelector(`#${CSS.escape(pathId)}`))
  ));
}

export function getAvailableMusclePathIds(svg: SVGSVGElement) {
  return Array.from(svg.querySelectorAll<SVGElement>(".muscle[id]"))
    .map((path) => path.id)
    .filter(Boolean);
}

export function getUnmappedMuscleIds(view: MuscleView, activations: MuscleSvgActivation[]) {
  return activations
    .filter((activation) => activation.role !== "inactive")
    .filter((activation) => getPathIdsForMuscle(activation.muscle, view).length === 0)
    .map((activation) => activation.muscle);
}

function resetPath(path: SVGElement) {
  path.classList.remove(
    "is-primary",
    "is-secondary",
    "is-supporting",
    "is-inactive",
    "is-selected",
  );
  path.removeAttribute("data-muscle-id");
  path.removeAttribute("role");
  path.removeAttribute("tabindex");
  path.removeAttribute("aria-label");
  path.style.fill = "";
  path.style.fillOpacity = "";
}

function applyPathStyle(
  path: SVGElement,
  muscleId: MuscleMapKey,
  role: MuscleVisualRole,
  selectedMuscleId?: MuscleMapKey | null,
) {
  const style = muscleRoleStyles[role];
  path.classList.add("muscle-svg-path", style.className);
  path.setAttribute("data-muscle-id", muscleId);
  path.setAttribute("role", "button");
  path.setAttribute("tabindex", "0");
  path.setAttribute("aria-label", muscleDisplayLabels[muscleId]);
  path.style.fill = style.fill;
  path.style.fillOpacity = style.opacity;

  if (selectedMuscleId === muscleId) {
    path.classList.add("is-selected");
  }
}

export function applyMuscleSvgStyles(
  svg: SVGSVGElement,
  view: MuscleView,
  activations: MuscleSvgActivation[],
  selectedMuscleId?: MuscleMapKey | null,
) {
  svg.querySelectorAll<SVGElement>(".muscle[id]").forEach((path) => {
    const muscleId = pathIdToMuscleId[path.id];
    if (!muscleId) return;

    resetPath(path);
    applyPathStyle(path, muscleId, "inactive", selectedMuscleId);
  });

  const activationRoleMap = getActivationRoleMap(activations);

  Object.entries(activationRoleMap).forEach(([muscleId, role]) => {
    if (!role) return;

    getPathIdsForMuscle(muscleId as MuscleMapKey, view).forEach((pathId) => {
      const path = svg.querySelector<SVGElement>(`.muscle#${CSS.escape(pathId)}`);
      if (!path) return;

      resetPath(path);
      applyPathStyle(path, muscleId as MuscleMapKey, role, selectedMuscleId);
    });
  });
}

export function findMuscleIdFromEventTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return undefined;

  const pathElement = target.closest<SVGElement>("[data-muscle-id]");
  if (!pathElement?.id) return undefined;

  return pathIdToMuscleId[pathElement.id];
}
