import { describe, expect, it } from "vitest";
import type { TrainingDayDto } from "./dtos";
import { fromTrainingDayDto, toSaveTrainingSessionDto } from "./trainingSessionDtoMapping";

describe("training session DTO mapping", () => {
  it("derives one-based exercise and set order from the draft", () => {
    const dto = toSaveTrainingSessionDto({
      date: "2026-06-24",
      startTime: "18:00",
      durationMinutes: 60,
      sessionRpe: 7,
      exercises: [
        {
          id: -1,
          muscleGroup: "Chest",
          exerciseName: "Bench Press",
          sets: [
            { id: -2, reps: 8, weightKg: 60, isWarmup: true },
            { id: -3, reps: 6, weightKg: 70, isWarmup: false },
          ],
        },
        {
          id: -4,
          muscleGroup: "Back",
          exerciseName: "Row",
          sets: [
            { id: -5, reps: 10, weightKg: 50, isWarmup: false },
          ],
        },
      ],
    });

    expect(dto.exercises.map((exercise) => exercise.exerciseOrder)).toEqual([1, 2]);
    expect(dto.exercises[0].sets.map((set) => set.setOrder)).toEqual([1, 2]);
    expect(dto.exercises[1].sets.map((set) => set.setOrder)).toEqual([1]);
  });

  it("maps parent ids and UTC timestamps and respects explicit ordering", () => {
    const dto: TrainingDayDto = {
      id: 1,
      userId: 10,
      date: "2026-06-24",
      createdAtUtc: "2026-06-24T08:00:00.000Z",
      updatedAtUtc: "2026-06-24T09:00:00.000Z",
      sessions: [{
        id: 11,
        trainingDayId: 1,
        startTime: "18:00",
        durationMinutes: 60,
        sessionRpe: 7,
        createdAtUtc: "2026-06-24T08:00:00.000Z",
        updatedAtUtc: "2026-06-24T09:00:00.000Z",
        exercises: [
          {
            id: 22,
            trainingSessionId: 11,
            exerciseOrder: 2,
            muscleGroup: "Back",
            exerciseName: "Row",
            sets: [{
              id: 32,
              trainingExerciseId: 22,
              setOrder: 1,
              reps: 10,
              weightKg: 50,
              isWarmup: false,
            }],
          },
          {
            id: 21,
            trainingSessionId: 11,
            exerciseOrder: 1,
            muscleGroup: "Chest",
            exerciseName: "Bench Press",
            sets: [
              {
                id: 33,
                trainingExerciseId: 21,
                setOrder: 2,
                reps: 6,
                weightKg: 70,
                isWarmup: false,
              },
              {
                id: 31,
                trainingExerciseId: 21,
                setOrder: 1,
                reps: 8,
                weightKg: 60,
                isWarmup: true,
              },
            ],
          },
        ],
      }],
    };

    const day = fromTrainingDayDto(dto);

    expect(day.createdAtUtc).toBe(dto.createdAtUtc);
    expect(day.sessions[0].trainingDayId).toBe(1);
    expect(day.sessions[0].exercises.map((exercise) => exercise.id)).toEqual([
      21,
      22,
    ]);
    expect(day.sessions[0].exercises[0].sets.map((set) => set.id)).toEqual([
      31,
      33,
    ]);
    expect(day.sessions[0].exercises[0].sets[0].trainingExerciseId).toBe(21);
  });
});
