import { requestJson } from "./httpClient";
import type { TrainingSessionDto } from "./dtos";

export function getTrainingLogs(from: string, to: string) {
  const query = new URLSearchParams({ from, to });

  return requestJson<TrainingSessionDto[]>(`/traininglogs?${query.toString()}`);
}

export function saveTrainingLog(dto: TrainingSessionDto) {
  return requestJson<TrainingSessionDto>("/traininglogs", {
    method: "POST",
    body: dto,
  });
}
