import { requestJson } from "./httpClient";
import type { PreCheckDto } from "./dtos";

export function getPreCheckByDate(date: string) {
  return requestJson<PreCheckDto | null>(`/precheck?date=${encodeURIComponent(date)}`);
}

export function getPreChecks(from: string, to: string) {
  const query = new URLSearchParams({ from, to });
  return requestJson<PreCheckDto[]>(`/prechecks?${query.toString()}`);
}

export function savePreCheck(dto: PreCheckDto) {
  return requestJson<PreCheckDto>("/precheck", {
    method: "POST",
    body: dto,
  });
}

export function deletePreCheck(id: number) {
  return requestJson<PreCheckDto>(`/precheck/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
