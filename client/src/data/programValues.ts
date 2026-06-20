import type {
  ReadinessControl,
  MuscleGroup,
} from "../types/appTypes";

export const readinessControls = [
  {
    field: "sleepHours",
    label: "睡眠时长",
    labelZh: "睡眠时长",
    min: 0,
    max: 12,
    step: 0.5,
    unit: "小时",
    output: "影响恢复能力",
  },
  {
    field: "soreness",
    label: "肌肉酸痛",
    labelZh: "肌肉酸痛",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "影响训练耐受度",
  },
  {
    field: "motivation",
    label: "训练动力",
    labelZh: "训练动力",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "影响今日状态分数",
  },
  {
    field: "restingHeartRateDelta",
    label: "静息心率变化",
    labelZh: "静息心率变化",
    min: -5,
    max: 20,
    step: 1,
    unit: "次/分",
    output: "影响恢复观察",
  },
  {
    field: "previousSessionRpe",
    label: "上次训练难度",
    labelZh: "上次训练总体难度",
    min: 1,
    max: 10,
    step: 1,
    unit: "/10",
    output: "影响疲劳程度",
  },
  {
    field: "previousSessionDurationMinutes",
    label: "上次训练时长",
    labelZh: "上次训练时长",
    min: 20,
    max: 120,
    step: 5,
    unit: "分钟",
    output: "用于计算上次训练负荷",
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

export const muscleGroupDisplayLabels: Record<Exclude<MuscleGroup, "All">, string> = {
  Chest: "胸部",
  Back: "背部",
  Shoulders: "肩部",
  Biceps: "肱二头肌",
  Triceps: "肱三头肌",
  Quads: "股四头肌",
  Hamstrings: "腘绳肌",
  Glutes: "臀部",
  Calves: "小腿",
  Abs: "腹部",
};

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

const exerciseDisplayLabels: Record<string, string> = {
  "Bench Press": "杠铃卧推",
  "Incline Bench Press": "上斜杠铃卧推",
  "Dumbbell Bench Press": "哑铃卧推",
  "Dumbbell Incline Press": "上斜哑铃卧推",
  "Chest Press": "器械推胸",
  "Cable Fly": "绳索夹胸",
  "Pec Deck": "蝴蝶机夹胸",
  "Push-up": "俯卧撑",
  Dip: "双杠臂屈伸",
  "Pull-up": "引体向上",
  "Lat Pulldown": "高位下拉",
  "Barbell Row": "杠铃划船",
  "Dumbbell Row": "单臂哑铃划船",
  "Seated Cable Row": "坐姿绳索划船",
  "Chest Supported Row": "胸托划船",
  "T-Bar Row": "胸托器械划船",
  Deadlift: "硬拉",
  "Straight-arm Pulldown": "直臂下压",
  "Overhead Press": "站姿推举",
  "Dumbbell Shoulder Press": "哑铃肩推",
  "Lateral Raise": "哑铃侧平举",
  "Cable Lateral Raise": "绳索侧平举",
  "Rear Delt Fly": "俯身反向飞鸟",
  "Face Pull": "面拉",
  "Arnold Press": "阿诺德推举",
  "Upright Row": "直立划船",
  "Barbell Curl": "杠铃弯举",
  "Dumbbell Curl": "哑铃弯举",
  "Incline Dumbbell Curl": "上斜哑铃弯举",
  "Hammer Curl": "锤式弯举",
  "Cable Curl": "绳索弯举",
  "Preacher Curl": "牧师凳弯举",
  "Concentration Curl": "集中弯举",
  "Cable Triceps Pushdown": "绳索下压",
  "Overhead Triceps Extension": "过顶臂屈伸",
  "Skull Crusher": "仰卧臂屈伸",
  "Close Grip Bench Press": "窄握卧推",
  "Rope Pushdown": "绳索下压",
  "Triceps Kickback": "哑铃臂屈伸",
  "Back Squat": "杠铃深蹲",
  "Front Squat": "前蹲",
  "Leg Press": "腿举",
  "Hack Squat": "哈克深蹲",
  "Bulgarian Split Squat": "保加利亚分腿蹲",
  "Leg Extension": "腿屈伸",
  Lunge: "弓步蹲",
  "Step-up": "登台阶",
  "Romanian Deadlift": "罗马尼亚硬拉",
  "Seated Leg Curl": "坐姿腿弯举",
  "Lying Leg Curl": "俯卧腿弯举",
  "Good Morning": "早安式",
  "Nordic Curl": "北欧腿弯举",
  "Single-leg Romanian Deadlift": "单腿罗马尼亚硬拉",
  "Hip Thrust": "杠铃臀推",
  "Glute Bridge": "臀桥",
  "Cable Kickback": "绳索后踢",
  "Walking Lunge": "行走弓步",
  "Abduction Machine": "髋外展机",
  "Standing Calf Raise": "站姿提踵",
  "Seated Calf Raise": "坐姿提踵",
  "Leg Press Calf Raise": "腿举机提踵",
  "Single-leg Calf Raise": "单腿提踵",
  "Cable Crunch": "绳索卷腹",
  "Hanging Leg Raise": "悬垂举腿",
  Plank: "平板支撑",
  "Ab Wheel Rollout": "健腹轮",
  "Reverse Crunch": "反向卷腹",
  "Pallof Press": "帕洛夫抗旋转推",
};

const normalizedExerciseDisplayLabels = new Map(
  Object.entries(exerciseDisplayLabels).map(([exerciseName, displayLabel]) => (
    [exerciseName.trim().toLowerCase(), displayLabel]
  )),
);

normalizedExerciseDisplayLabels.set("inclcied bench press", "上斜卧推");
normalizedExerciseDisplayLabels.set("inlcied bench press", "上斜卧推");
normalizedExerciseDisplayLabels.set("dumb bell inclcied press", "上斜哑铃卧推");

export function getMuscleGroupDisplayLabel(muscleGroup: MuscleGroup) {
  return muscleGroup === "All" ? "全部" : muscleGroupDisplayLabels[muscleGroup];
}

export function getExerciseDisplayLabel(exerciseName: string) {
  const mappedLabel = exerciseDisplayLabels[exerciseName]
    ?? normalizedExerciseDisplayLabels.get(exerciseName.trim().toLowerCase());

  if (mappedLabel) {
    return mappedLabel;
  }

  return /[\u3400-\u9fff]/.test(exerciseName) ? exerciseName : "其他动作";
}

export function getExerciseOptionsForMuscleGroup(muscleGroup: MuscleGroup) {
  if (muscleGroup === "All") {
    return [];
  }

  return exerciseOptionsByMuscleGroup[muscleGroup];
}

export function getDefaultExerciseForMuscleGroup(muscleGroup: MuscleGroup) {
  return getExerciseOptionsForMuscleGroup(muscleGroup)[0] ?? "";
}
