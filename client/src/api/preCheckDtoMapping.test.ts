import { describe, expect, it } from "vitest";
import { fromPreCheckDto, toPreCheckDto } from "./preCheckDtoMapping";
import type { PreCheckDetailsLog } from "../types/appTypes";

describe("preCheckDtoMapping", () => {
  it("round-trips every PreCheck UI field through the API DTO", () => {
    const input: PreCheckDetailsLog = {
      sleepHours: 7.5,
      soreness: 4,
      motivation: 8,
      restingHeartRateDelta: 3,
      previousSessionRpe: 9,
      previousSessionDurationMinutes: 75,
    };

    const dto = toPreCheckDto(input);
    const restored = fromPreCheckDto({ ...dto, id: 1 });

    expect(restored.id).toBe(1);
    expect(restored.input).toEqual(input);
  });

  it("still reads the legacy score-only DTO contract", () => {
    const restored = fromPreCheckDto({
      id: 2,
      date: "2026-06-21",
      sleepQuality: 4,
      soreness: 2,
      stress: 3,
      motivation: 4,
      energy: 4,
    });

    expect(restored.input.sleepHours).toBe(7.25);
    expect(restored.input.soreness).toBe(4);
    expect(restored.input.motivation).toBe(8);
  });
});
