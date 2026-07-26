import { describe, expect, it } from "vitest";
import type { ProgramSettings } from "../types/appTypes";
import { getCurrentTrainingCycle } from "./trainingTrendCharts";

const programSettings: ProgramSettings = {
  cycleStartDate: "2026-04-29",
  weeksPerCycle: 4,
  mode: "Strength / hypertrophy",
  priorityMuscles: ["Back"],
  weeklyPriorityHardSetTarget: 16,
};

describe("getCurrentTrainingCycle", () => {
  it("normalizes the configured start to Monday and returns the containing cycle", () => {
    const cycle = getCurrentTrainingCycle(programSettings, "2026-06-01");

    expect(cycle).toEqual({
      cycleNumber: 2,
      label: "第 2 个训练周期",
      startDate: "2026-05-25",
      endWeekStartDate: "2026-06-15",
      endDate: "2026-06-21",
    });
  });

  it("returns the first cycle before the configured cycle starts", () => {
    const cycle = getCurrentTrainingCycle(programSettings, "2026-04-01");

    expect(cycle.cycleNumber).toBe(1);
    expect(cycle.startDate).toBe("2026-04-27");
  });
});
