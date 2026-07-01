import type { PreCheckLog, TrendPoint } from "../types/appTypes";
import { calculateReadiness } from "../domain/readiness";
import type { TrainingTrendWeek } from "../domain/trainingTrendCharts";


export function sortLogsOldestFirst(logs: PreCheckLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    firstLog.date.localeCompare(secondLog.date)
  ));
}

function getWeeklyAverageTrend(
  logs: PreCheckLog[],
  weeks: TrainingTrendWeek[],
  getValue: (log: PreCheckLog) => number,
) {
  return weeks.flatMap((week) => {
    const weekLogs = logs.filter((log) => (
      log.date >= week.startDate && log.date <= week.endDate
    ));

    if (weekLogs.length === 0) {
      return [];
    }

    return [{
      label: week.label,
      value: weekLogs.reduce((total, log) => total + getValue(log), 0) / weekLogs.length,
    }];
  });
}

export function getPreCheckReadinessTrend(
  logs: PreCheckLog[],
  weeks?: TrainingTrendWeek[],
): TrendPoint[] {
  if (weeks) {
    return getWeeklyAverageTrend(logs, weeks, (log) => calculateReadiness(log.input).score);
  }

  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: calculateReadiness(log.input).score,
  }));
}

export function getSleepTrend(
  logs: PreCheckLog[],
  weeks?: TrainingTrendWeek[],
): TrendPoint[] {
  if (weeks) {
    return getWeeklyAverageTrend(logs, weeks, (log) => log.input.sleepHours);
  }

  return sortLogsOldestFirst(logs).slice(-7).map((log) => ({
    label: log.date.slice(5),
    value: log.input.sleepHours,
  }));
}

export function normalizeToMonday(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - daysSinceMonday);
  return date.toISOString().slice(0, 10);
}

export function getJobStatusLabel(status: string) {
  if (status === "Queued") {
    return "排队中";
  }

  if (status === "Processing") {
    return "生成中";
  }

  if (status === "Completed") {
    return "已完成";
  }

  if (status === "Failed") {
    return "生成失败";
  }

  if (status === "Superseded") {
    return "已被新版本取代";
  }

  return "已取消";
}
