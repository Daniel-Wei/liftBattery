import type { MuscleActivation, MuscleMapKey } from "../types/appTypes";

type ExerciseMuscleContribution = {
  exerciseId: string;
  muscles: MuscleActivation[];
  tip: string;
};

const baseMuscleMap: Record<string, ExerciseMuscleContribution> = {
  "Bench Press": {
    exerciseId: "Bench Press",
    muscles: [
      { muscle: "chest", role: "primary", contribution: 100 },
      { muscle: "triceps", role: "secondary", contribution: 45 },
      { muscle: "frontDeltoid", role: "secondary", contribution: 35 },
    ],
    tip: "保持肩胛稳定，控制下放速度；这里是训练记录估算，不是医学结论。",
  },
  "Incline Bench Press": {
    exerciseId: "Incline Bench Press",
    muscles: [
      { muscle: "chest", role: "primary", contribution: 90 },
      { muscle: "frontDeltoid", role: "secondary", contribution: 55 },
      { muscle: "triceps", role: "secondary", contribution: 40 },
    ],
    tip: "上斜角度会更偏向上胸和前三角，注意别耸肩代偿。",
  },
  "Lat Pulldown": {
    exerciseId: "Lat Pulldown",
    muscles: [
      { muscle: "back", role: "primary", contribution: 95 },
      { muscle: "biceps", role: "secondary", contribution: 45 },
      { muscle: "rearDeltoid", role: "supporting", contribution: 20 },
    ],
    tip: "先让肩胛下沉，再用背部发力把肘拉向身体两侧。",
  },
  "Barbell Row": {
    exerciseId: "Barbell Row",
    muscles: [
      { muscle: "back", role: "primary", contribution: 100 },
      { muscle: "biceps", role: "secondary", contribution: 40 },
      { muscle: "rearDeltoid", role: "secondary", contribution: 35 },
    ],
    tip: "保持躯干角度稳定，避免每次都用身体弹动完成。",
  },
  "Back Squat": {
    exerciseId: "Back Squat",
    muscles: [
      { muscle: "quads", role: "primary", contribution: 90 },
      { muscle: "glutes", role: "secondary", contribution: 60 },
      { muscle: "hamstrings", role: "supporting", contribution: 25 },
    ],
    tip: "全程维持脚掌稳定，按你的训练目标控制深度和节奏。",
  },
  "Romanian Deadlift": {
    exerciseId: "Romanian Deadlift",
    muscles: [
      { muscle: "hamstrings", role: "primary", contribution: 100 },
      { muscle: "glutes", role: "secondary", contribution: 65 },
      { muscle: "back", role: "supporting", contribution: 30 },
    ],
    tip: "髋关节向后折叠，保持背部张力，重量贴近身体。",
  },
};

const groupFallbacks: Record<string, ExerciseMuscleContribution> = {
  Chest: baseMuscleMap["Bench Press"],
  Back: baseMuscleMap["Lat Pulldown"],
  Shoulders: {
    exerciseId: "Shoulders",
    muscles: [
      { muscle: "sideDeltoid", role: "primary", contribution: 90 },
      { muscle: "frontDeltoid", role: "secondary", contribution: 45 },
      { muscle: "triceps", role: "supporting", contribution: 20 },
    ],
    tip: "肩部动作通常需要控制惯性，保持动作路径稳定。",
  },
  Biceps: {
    exerciseId: "Biceps",
    muscles: [{ muscle: "biceps", role: "primary", contribution: 100 }],
    tip: "弯举类动作保持上臂稳定，避免借力摆动。",
  },
  Triceps: {
    exerciseId: "Triceps",
    muscles: [{ muscle: "triceps", role: "primary", contribution: 100 }],
    tip: "臂屈伸类动作注意肘部位置稳定，不追求疼痛感。",
  },
  Quads: baseMuscleMap["Back Squat"],
  Hamstrings: baseMuscleMap["Romanian Deadlift"],
  Glutes: {
    exerciseId: "Glutes",
    muscles: [
      { muscle: "glutes", role: "primary", contribution: 100 },
      { muscle: "hamstrings", role: "secondary", contribution: 35 },
    ],
    tip: "臀部动作重点是髋伸展，不需要把下背压力做得很重。",
  },
  Calves: {
    exerciseId: "Calves",
    muscles: [{ muscle: "calves", role: "primary", contribution: 100 }],
    tip: "提踵动作可以控制顶峰停顿和离心速度。",
  },
  Abs: {
    exerciseId: "Abs",
    muscles: [{ muscle: "abs", role: "primary", contribution: 100 }],
    tip: "核心训练以控制骨盆和躯干位置为主。",
  },
};

export const muscleDisplayLabels: Record<MuscleMapKey, string> = {
  chest: "胸部",
  back: "背部",
  frontDeltoid: "前三角肌",
  sideDeltoid: "中三角肌",
  rearDeltoid: "后三角肌",
  biceps: "肱二头肌",
  triceps: "肱三头肌",
  abs: "腹部",
  glutes: "臀部",
  quads: "股四头肌",
  hamstrings: "腘绳肌",
  calves: "小腿",
};

export function getExerciseMuscleContribution(
  exerciseName: string,
  muscleGroup: string,
) {
  return baseMuscleMap[exerciseName] ?? groupFallbacks[muscleGroup];
}
