import type {
  ReadinessControl,
  MuscleGroup,
} from "../types/appTypes";

export const readinessControls = [
  {
    field: "sleepHours",
    label: "Sleep Hours",
    labelZh: "睡眠时长",
    min: 0,
    max: 12,
    step: 0.5,
    unit: "h",
    output: "Changes: recovery capacity",
  },
  {
    field: "soreness",
    label: "Soreness",
    labelZh: "肌肉酸痛",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "Changes: training tolerance",
  },
  {
    field: "motivation",
    label: "Motivation",
    labelZh: "训练动力",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "Changes: readiness score",
  },
  {
    field: "restingHeartRateDelta",
    label: "Resting HR Delta",
    labelZh: "静息心率变化",
    min: -5,
    max: 20,
    step: 1,
    unit: "bpm",
    output: "Changes: recovery watch",
  },
  {
    field: "previousSessionRpe",
    label: "Previous Session RPE",
    labelZh: "上次训练 RPE",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "Changes: fatigue cost",
  },
  {
    field: "previousSessionDurationMinutes",
    label: "Previous Session Duration",
    labelZh: "上次训练时长",
    min: 20,
    max: 120,
    step: 5,
    unit: "min",
    output: "Feeds: previous session load",
  },
] satisfies ReadinessControl[];

export const muscleGroupOptions: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
];

export const exerciseOptionsByMuscleGroup: Record<Exclude<MuscleGroup, "All">, string[]> = {
  Chest: [
    "Bench Press",
    "Incline Bench Press",
    "Dumbbell Bench Press",
    "Dumbbell Incline Press",
    "Chest Press",
    "Cable Fly",
    "Pec Deck",
    "Push-up",
    "Dip",
  ],
  Back: [
    "Pull-up",
    "Lat Pulldown",
    "Barbell Row",
    "Dumbbell Row",
    "Seated Cable Row",
    "Chest Supported Row",
    "T-Bar Row",
    "Deadlift",
    "Straight-arm Pulldown",
  ],
  Shoulders: [
    "Overhead Press",
    "Dumbbell Shoulder Press",
    "Lateral Raise",
    "Cable Lateral Raise",
    "Rear Delt Fly",
    "Face Pull",
    "Arnold Press",
    "Upright Row",
  ],
  Biceps: [
    "Barbell Curl",
    "Dumbbell Curl",
    "Incline Dumbbell Curl",
    "Hammer Curl",
    "Cable Curl",
    "Preacher Curl",
    "Concentration Curl",
  ],
  Triceps: [
    "Cable Triceps Pushdown",
    "Overhead Triceps Extension",
    "Skull Crusher",
    "Close Grip Bench Press",
    "Dip",
    "Rope Pushdown",
    "Triceps Kickback",
  ],
  Quads: [
    "Back Squat",
    "Front Squat",
    "Leg Press",
    "Hack Squat",
    "Bulgarian Split Squat",
    "Leg Extension",
    "Lunge",
    "Step-up",
  ],
  Hamstrings: [
    "Romanian Deadlift",
    "Seated Leg Curl",
    "Lying Leg Curl",
    "Good Morning",
    "Nordic Curl",
    "Single-leg Romanian Deadlift",
  ],
  Glutes: [
    "Hip Thrust",
    "Glute Bridge",
    "Cable Kickback",
    "Bulgarian Split Squat",
    "Walking Lunge",
    "Romanian Deadlift",
    "Abduction Machine",
  ],
  Calves: [
    "Standing Calf Raise",
    "Seated Calf Raise",
    "Leg Press Calf Raise",
    "Single-leg Calf Raise",
  ],
  Abs: [
    "Cable Crunch",
    "Hanging Leg Raise",
    "Plank",
    "Ab Wheel Rollout",
    "Reverse Crunch",
    "Pallof Press",
  ],
};

export function getExerciseOptionsForMuscleGroup(muscleGroup: MuscleGroup) {
  if (muscleGroup === "All") {
    return [];
  }

  return exerciseOptionsByMuscleGroup[muscleGroup];
}

export function getDefaultExerciseForMuscleGroup(muscleGroup: MuscleGroup) {
  return getExerciseOptionsForMuscleGroup(muscleGroup)[0] ?? "";
}