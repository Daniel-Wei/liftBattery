import type { PreCheckLog, TrendPoint } from "../types/appTypes";

export function sortLogsOldestFirst(logs: PreCheckLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    firstLog.date.localeCompare(secondLog.date)
    || firstLog.updatedAt.localeCompare(secondLog.updatedAt)
  ));
}

export function getPreCheckReadinessTrend(logs: PreCheckLog[]): TrendPoint[] {
  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: log.readiness.score,
  }));
}

export function getSleepTrend(logs: PreCheckLog[]): TrendPoint[] {
  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: log.input.sleepHours,
  }));
}
