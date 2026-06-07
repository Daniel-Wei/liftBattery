import {
  isDailyPreCheckLogArray,
} from "../types/appTypeChecks";
import { 
    PRE_CHECK_LOGS_STORAGE_KEY,
 } from "../state/LiftBatteryContextLocalStorageKeys";
import { PreCheckLog, PreCheckDetailsLog } from "../types/appTypes";
import { getTodayDate } from "./GenericHelpers";

export function getSavedTodayPreCheckLog() {
  const today = getTodayDate();
  const savedLogs = loadSavedPreCheckLogs();
  return savedLogs.find((savedLog) => savedLog.date === today);
}

// Loads saved history logs, falling back to an empty history if storage is empty or invalid.
export function loadSavedPreCheckLogs() {
  try {
    const savedValue = localStorage.getItem(PRE_CHECK_LOGS_STORAGE_KEY);

    if (savedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isDailyPreCheckLogArray(parsedValue)) {
      return parsedValue;
    }

    return [];
  } catch {
    return [];
  }
}

export function getPreCheckDraftUpdated(todayDraft: PreCheckDetailsLog) {
  const savedTodayLog = getSavedTodayPreCheckLog();

  if (!savedTodayLog) {
    return true;
  }

  return !isSamePreCheckInput(todayDraft, savedTodayLog.input);
}

// Keeps latestLog and last7Logs consistent without mutating the original logs array.
export function sortPreCheckLogsNewestFirst(logs: PreCheckLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    secondLog.date.localeCompare(firstLog.date)
    || secondLog.updatedAt.localeCompare(firstLog.updatedAt)
  ));
}

function isSamePreCheckInput(firstInput: PreCheckDetailsLog, secondInput: PreCheckDetailsLog) {
  return (
    firstInput.sleepHours === secondInput.sleepHours
    && firstInput.soreness === secondInput.soreness
    && firstInput.motivation === secondInput.motivation
    && firstInput.restingHeartRateDelta === secondInput.restingHeartRateDelta
    && firstInput.previousSessionRpe === secondInput.previousSessionRpe
    && firstInput.previousSessionDurationMinutes === secondInput.previousSessionDurationMinutes
  );
}
