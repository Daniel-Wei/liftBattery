import type {
  SaveTrainingSessionDto,
  TrainingDayDto,
  TrainingExerciseDto,
  TrainingSessionDto,
  TrainingSetDto,
} from "./dtos";
import type {
  TrainingDay,
  TrainingExercise,
  TrainingSession,
  TrainingSessionDraft,
  TrainingSessionRecord,
  TrainingSet,
} from "../types/appTypes";
import { createId } from "../helpers/GenericHelpers";

const nowFallback = "1970-01-01T00:00:00.000Z";

export function toSaveTrainingSessionDto(input: TrainingSessionDraft): SaveTrainingSessionDto {
  return {
    date: input.date,
    startTime: input.startTime,
    durationMinutes: input.durationMinutes,
    sessionRpe: input.sessionRpe,
    exercises: input.exercises.map((exercise, exerciseIndex) => ({
      exerciseOrder: exerciseIndex + 1,
      muscleGroup: exercise.muscleGroup,
      exerciseName: exercise.exerciseName,
      sets: exercise.sets.map((set, index) => ({
        setOrder: index + 1,
        reps: set.reps,
        weightKg: set.weightKg,
        rir: set.rir,
        isWarmup: set.isWarmup,
      })),
    })),
  };
}

function fromSetDto(dto: TrainingSetDto): TrainingSet {
  return {
    id: dto.id ?? createId("set"),
    trainingExerciseId: dto.trainingExerciseId,
    setOrder: dto.setOrder,
    reps: dto.reps,
    weightKg: dto.weightKg,
    rir: dto.rir,
    isWarmup: dto.isWarmup,
    createdAtUtc: dto.createdAtUtc ?? nowFallback,
    updatedAtUtc: dto.updatedAtUtc ?? nowFallback,
  };
}

function fromExerciseDto(dto: TrainingExerciseDto): TrainingExercise {
  return {
    id: dto.id ?? createId("exercise"),
    trainingSessionId: dto.trainingSessionId,
    exerciseOrder: dto.exerciseOrder,
    muscleGroup: dto.muscleGroup,
    exerciseName: dto.exerciseName,
    sets: [...dto.sets].sort((left, right) => left.setOrder - right.setOrder).map(fromSetDto),
    createdAtUtc: dto.createdAtUtc ?? nowFallback,
    updatedAtUtc: dto.updatedAtUtc ?? nowFallback,
  };
}

function fromSessionDto(dto: TrainingSessionDto): TrainingSession {
  return {
    id: dto.id ?? createId("session"),
    trainingDayId: dto.trainingDayId,
    startTime: dto.startTime,
    durationMinutes: dto.durationMinutes,
    sessionRpe: dto.sessionRpe,
    exercises: [...dto.exercises]
      .sort((left, right) => left.exerciseOrder - right.exerciseOrder)
      .map(fromExerciseDto),
    createdAtUtc: dto.createdAtUtc ?? nowFallback,
    updatedAtUtc: dto.updatedAtUtc ?? nowFallback,
  };
}

export function fromTrainingDayDto(dto: TrainingDayDto): TrainingDay {
  return {
    id: dto.id,
    userId: dto.userId,
    date: dto.date,
    sessions: dto.sessions.map(fromSessionDto),
    createdAtUtc: dto.createdAtUtc,
    updatedAtUtc: dto.updatedAtUtc,
  };
}

export function flattenTrainingDays(days: TrainingDay[]): TrainingSessionRecord[] {
  return days.flatMap((day) => day.sessions.map((session) => ({
    ...session,
    userId: day.userId,
    date: day.date,
    sets: session.exercises.flatMap((exercise) => exercise.sets.map((set) => ({
      ...set,
      exerciseName: exercise.exerciseName,
      muscleGroup: exercise.muscleGroup,
    }))),
  })));
}
