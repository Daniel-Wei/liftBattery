import { requestJson } from "./httpClient";
import type { SaveTrainingSessionDto, TrainingDayDto, TrainingSessionDto } from "./dtos";

export function getTrainingDays(from: string, to: string) {
  const query = new URLSearchParams({ from, to });
  return requestJson<TrainingDayDto[]>(`/trainingdays?${query.toString()}`);
}

export function saveTrainingSession(dto: SaveTrainingSessionDto) {
  return requestJson<TrainingDayDto>("/trainingdays/sessions", {
    method: "POST",
    body: dto,
  });
}

export function deleteTrainingSession(id: number) {
  return requestJson<TrainingSessionDto>(`/trainingsessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
