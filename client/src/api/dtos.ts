export type PreCheckDto = {
  id?: string;
  date: string;
  sleepQuality: number;
  soreness: number;
  stress: number;
  motivation: number;
  energy: number;
  notes?: string;
};

export type TrainingLogDto = {
  id?: string;
  date: string;
  muscleGroup: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight: number;
  rir?: number;
  notes?: string;
};
