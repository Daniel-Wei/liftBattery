import type { MuscleMapKey } from "../types/appTypes";

type MuscleModelDefinition = {
  labels: string[];
};

const muscleModelMap: Record<MuscleMapKey, MuscleModelDefinition> = {
  chest: {
    labels: [
      "pectoralis major",
      "clavicular head of pectoralis major",
      "sternocostal head of pectoralis major",
      "abdominal part of pectoralis major",
    ],
  },
  back: {
    labels: [
      "latissimus dorsi",
      "trapezius",
      "rhomboid major",
      "rhomboid minor",
      "teres major",
      "teres minor",
      "infraspinatus",
      "iliocostalis",
      "longissimus",
      "spinalis",
    ],
  },
  frontDeltoid: {
    labels: ["clavicular part of deltoid"],
  },
  sideDeltoid: {
    labels: ["acromial part of deltoid"],
  },
  rearDeltoid: {
    labels: ["scapular spinal part of deltoid"],
  },
  biceps: {
    labels: [
      "long head of biceps brachii",
      "short head of biceps brachii",
      "brachialis",
    ],
  },
  triceps: {
    labels: [
      "medial head of triceps brachii",
      "lateral head of triceps brachii",
      "long head of triceps brachii",
    ],
  },
  abs: {
    labels: [
      "rectus abdominis",
      "external abdominal oblique",
      "internal abdominal oblique",
      "transversus abdominis",
    ],
  },
  glutes: {
    labels: [
      "gluteus maximus",
      "gluteus medius",
      "gluteus minimus",
    ],
  },
  quads: {
    labels: [
      "rectus femoris",
      "vastus lateralis",
      "vastus medialis",
      "vastus intermedius",
    ],
  },
  hamstrings: {
    labels: [
      "long head of biceps femoris",
      "short head of biceps femoris",
      "semimembranosus",
      "semitendinosus",
    ],
  },
  calves: {
    labels: [
      "gastrocnemius",
      "lateral head of gastrocnemius",
      "medial head of gastrocnemius",
      "soleus",
    ],
  },
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[().#]/g, " ")
    .replace(/\.\d+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getModelSearchText(name: string, userData: Record<string, unknown>) {
  const userDataName = typeof userData.name === "string" ? userData.name : "";
  const nameDetail = typeof userData.nameDetail === "string" ? userData.nameDetail : "";

  return normalize([name, userDataName, nameDetail].join(" "));
}

export function getMuscleKeyForModelObject(name: string, userData: Record<string, unknown>) {
  const searchText = getModelSearchText(name, userData);

  return Object.entries(muscleModelMap).find(([, definition]) => (
    definition.labels.some((label) => searchText.includes(normalize(label)))
  ))?.[0] as MuscleMapKey | undefined;
}

export function getModelLabelsForMuscle(muscle: MuscleMapKey) {
  return muscleModelMap[muscle].labels;
}

