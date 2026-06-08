import type { PreCheckLog, TrendPoint } from "../types/appTypes";
import { calculateReadiness } from "../domain/readiness";

export function sortLogsOldestFirst(logs: PreCheckLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    firstLog.date.localeCompare(secondLog.date)
  ));
}

export function getPreCheckReadinessTrend(logs: PreCheckLog[]): TrendPoint[] {
  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: calculateReadiness(log.input).score,
  }));
}

export function getSleepTrend(logs: PreCheckLog[]): TrendPoint[] {
  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: log.input.sleepHours,
  }));
}
