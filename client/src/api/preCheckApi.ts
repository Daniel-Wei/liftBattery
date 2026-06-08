import { requestJson } from "./httpClient";
import type { PreCheckDto } from "./dtos";

export function getTodayPreCheck() {
  return requestJson<PreCheckDto | null>("/precheck/today");
}

export function savePreCheck(dto: PreCheckDto) {
  return requestJson<PreCheckDto>("/precheck", {
    method: "POST",
    body: dto,
  });
}
