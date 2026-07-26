import { describe, expect, it, vi } from "vitest";
import type { TrendReportJobDto } from "../api/dtos";
import { getTrendReportJob } from "../api/trendReportApi";
import { liftBatteryStore } from "./liftBatteryStore";
import { deleteTrainingSession } from "./slices/trainingSlice";
import { fetchTrendReportJob } from "./slices/trendReportSlice";

vi.mock("../api/trendReportApi", () => ({
  cancelTrendReport: vi.fn(),
  createTrendReport: vi.fn(),
  getTrendReportJob: vi.fn(),
}));

function createJob(status: TrendReportJobDto["status"]): TrendReportJobDto {
  return {
    id: "00000000-0000-0000-0000-000000000123",
    runId: "trend-report:test",
    dataVersion: "v1",
    status,
    progressPercent: 0,
    currentStage: "Testing",
    createdAtUtc: "2026-07-06T00:00:00Z",
    updatedAtUtc: "2026-07-06T00:00:00Z",
  };
}

describe("trend report source-data refresh listener", () => {
  it("reloads the displayed backend Job after Training CRUD succeeds", async () => {
    const activeJob = createJob("Processing");
    const supersededJob = createJob("Superseded");
    liftBatteryStore.dispatch(
      fetchTrendReportJob.fulfilled(activeJob, "seed-job", activeJob.id),
    );
    vi.mocked(getTrendReportJob).mockResolvedValueOnce(supersededJob);

    liftBatteryStore.dispatch(
      deleteTrainingSession.fulfilled(42, "delete-session", 42),
    );

    await vi.waitFor(() => {
      expect(getTrendReportJob).toHaveBeenCalledWith(activeJob.id);
      expect(liftBatteryStore.getState().trendReport.job?.status)
        .toBe("Superseded");
    });
  });
});
