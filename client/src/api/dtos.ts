import { MuscleGroup } from "../types/appTypes";

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

export type TrainingSessionDto = {
  id?: string;
  date: string;
  durationMinutes: number;
  sessionRpe: number;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  reps: number;
  weightKg: number;
  rpe?: number;
  rir?: number;
  sets: number;
  notes?: string;
};
