import { describe, expect, it } from "vitest";
import type { TrainingDay, TrainingSession } from "../types/appTypes";
import { buildDailyTrainingReport, flattenDatedSessions, sortSessionsNewestFirst } from "./dailyTrainingReport";

function session(id: number, weightKg: number, angle: number): TrainingSession {
  return {
    id,
    startTime: "18:00",
    durationMinutes: id === 2 ? 65 : 60,
    sessionRpe: id === 2 ? 8 : 7,
    createdAtUtc: "2026-01-01T00:00:00Z",
    updatedAtUtc: "2026-01-01T00:00:00Z",
    exercises: [
      {
        id: id * 10,
        exerciseOrder: 1,
        muscleGroup: "Chest",
        exerciseName: "Incline Bench Press",
        benchAngleDegrees: angle,
        createdAtUtc: "2026-01-01T00:00:00Z",
        updatedAtUtc: "2026-01-01T00:00:00Z",
        sets: [
          {
            id: id * 100,
            setOrder: 1,
            reps: 10,
            weightKg,
            rir: 2,
            isWarmup: false,
            createdAtUtc: "2026-01-01T00:00:00Z",
            updatedAtUtc: "2026-01-01T00:00:00Z",
          },
        ],
      },
    ],
  };
}

function day(id: number, date: string, trainingSession: TrainingSession): TrainingDay {
  return {
    id,
    userId: 1,
    date,
    sessions: [trainingSession],
    createdAtUtc: "2026-01-01T00:00:00Z",
    updatedAtUtc: "2026-01-01T00:00:00Z",
  };
}

describe("daily training report", () => {
  it("compares the latest session with the previous session that has matching actions and angles", () => {
    const sessions = sortSessionsNewestFirst(flattenDatedSessions([
      day(1, "2026-07-01", session(1, 50, 30)),
      day(2, "2026-07-08", session(2, 60, 30)),
      day(3, "2026-07-05", session(3, 70, 45)),
    ]));

    const report = buildDailyTrainingReport(sessions[0], sessions);

    expect(report.previous?.id).toBe(1);
    expect(report.currentVolume).toBe(600);
    expect(report.previousVolume).toBe(500);
    expect(report.volumeChangePercent).toBe(20);
    expect(report.exercises[0].benchAngleDegrees).toBe(30);
  });

  it("uses the first session at a new angle as a baseline", () => {
    const sessions = sortSessionsNewestFirst(flattenDatedSessions([
      day(1, "2026-07-01", session(1, 50, 30)),
      day(2, "2026-07-08", session(2, 60, 45)),
    ]));

    const report = buildDailyTrainingReport(sessions[0], sessions);

    expect(report.previous).toBeUndefined();
    expect(report.volumeChangePercent).toBeUndefined();
  });
});
