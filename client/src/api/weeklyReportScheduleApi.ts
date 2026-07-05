import type {
  UpdateWeeklyReportScheduleRequestDto,
  WeeklyReportScheduleDto,
} from "./dtos";
import { requestJson } from "./httpClient";

export function getWeeklyReportSchedule() {
  return requestJson<WeeklyReportScheduleDto>("/users/me/weekly-report-schedule");
}

export function updateWeeklyReportSchedule(request: UpdateWeeklyReportScheduleRequestDto) {
  return requestJson<WeeklyReportScheduleDto>("/users/me/weekly-report-schedule", {
    method: "PUT",
    body: request,
  });
}
