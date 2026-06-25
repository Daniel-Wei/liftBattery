import type {
  CreateTrendReportRequestDto,
  TrendReportJobDto,
} from "./dtos";
import { requestJson } from "./httpClient";

export function createTrendReport(request: CreateTrendReportRequestDto) {
  return requestJson<TrendReportJobDto>("/trendreports", {
    method: "POST",
    body: request,
  });
}

export function getTrendReportJob(jobId: number) {
  return requestJson<TrendReportJobDto>(`/trendreports/${encodeURIComponent(jobId)}`);
}
