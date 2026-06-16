import type { TrainingSessionDto } from "./dtos";
import type { TrainingSession, TrainingSessionDetails } from "../types/appTypes";
import { getTodayDate } from "../helpers/GenericHelpers";

function getDtoString(dto: TrainingSessionDto, camelKey: keyof TrainingSessionDto, pascalKey: string) {
  const dtoRecord = dto as unknown as Record<string, unknown>;
  const value = dtoRecord[camelKey] ?? dtoRecord[pascalKey];
  return typeof value === "string" ? value : undefined;
}

function getDtoNumber(dto: TrainingSessionDto, camelKey: keyof TrainingSessionDto, pascalKey: string) {
  const dtoRecord = dto as unknown as Record<string, unknown>;
  const value = dtoRecord[camelKey] ?? dtoRecord[pascalKey];
  return typeof value === "number" ? value : undefined;
}

export function toTrainingDto(input: TrainingSessionDetails, savedSession?: TrainingSession): TrainingSessionDto {
  return {
    id: savedSession?.id,
    date: savedSession?.date ?? getTodayDate(),
    durationMinutes: input.durationMinutes,
    sessionRpe: input.sessionRpe,
    exerciseName: input.exerciseName,
    muscleGroup: input.muscleGroup,
    reps: input.reps,
    sets: input.sets,
    weightKg: input.weightKg,
    rir: input.rir,
    rpe: input.rpe,
    notes: input.notes,
  };
}

export function fromTrainingDto(dto: TrainingSessionDto): TrainingSession {
  const dtoDate = getDtoString(dto, "date", "Date") ?? getTodayDate();
  const dtoNotes = getDtoString(dto, "notes", "Notes");

  return {
    id: getDtoString(dto, "id", "Id") ?? `trainingSession-${dtoDate}`,
    date: dtoDate,
    details: {
      durationMinutes: getDtoNumber(dto, "durationMinutes", "DurationMinutes") ?? 0,
      sessionRpe: getDtoNumber(dto, "sessionRpe", "SessionRpe") ?? 0,
      exerciseName: getDtoString(dto, "exerciseName", "ExerciseName") ?? "",
      muscleGroup: dto.muscleGroup,
      reps: getDtoNumber(dto, "reps", "Reps") ?? 0,
      rpe: getDtoNumber(dto, "rpe", "Rpe"),
      sets: getDtoNumber(dto, "sets", "Sets") ?? 0,
      weightKg: getDtoNumber(dto, "weightKg", "WeightKg") ?? 0,
      rir: getDtoNumber(dto, "rir", "Rir"),
      notes: dtoNotes,
    },
  };
}
