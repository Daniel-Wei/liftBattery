export const PRE_CHECK_DRAFT_STORAGE_KEY = "liftBattery.preCheckDraft";
export const TRAINING_SESSIONS_STORAGE_KEY = "liftBattery.trainingSessions";
export const PROGRAM_SETTINGS_STORAGE_KEY = "liftBattery.programSettings";
export const TREND_REPORT_JOB_ID_STORAGE_KEY = "liftBattery.trendReportJobId";

export function accountStorageKey(key: string, userId: number) {
  return `${key}:user:${userId}`;
}
