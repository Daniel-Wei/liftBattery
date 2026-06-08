import { requestJson } from "./httpClient";
import type { TrainingLogDto } from "./dtos";

export function getTrainingLogs(from: string, to: string) {
  const query = new URLSearchParams({ from, to });

  return requestJson<TrainingLogDto[]>(`/traininglogs?${query.toString()}`);
}

export function saveTrainingLog(dto: TrainingLogDto) {
  return requestJson<TrainingLogDto>("/traininglogs", {
    method: "POST",
    body: dto,
  });
}
