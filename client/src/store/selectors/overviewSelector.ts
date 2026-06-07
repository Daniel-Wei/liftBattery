import { calculateReadiness } from "../../domain/readiness";
import { sortLogsNewestFirst } from "../../helpers/LiftBatteryContextHelpers";
import type { RootState } from "../liftBatteryStore";

export const getOverview = (state: RootState) => {
  const sortedLogs = sortLogsNewestFirst(state.overview.preCheckLogs);

  return {
    currentReadiness: calculateReadiness(state.overview.preCheckDraft),
    latestLog: sortedLogs[0] ?? null,
    trainingSessions: state.overview.trainingSessions,
    programSettings: state.overview.programSettings,
  };
};
