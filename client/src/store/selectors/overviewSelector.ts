import { sortLogsNewestFirst } from "../../helpers/LiftBatteryContextHelpers";
import type { RootState } from "../liftBatteryStore";

export const getOverviewData = (state: RootState) => {
  const sortedLogs = sortLogsNewestFirst(state.overview.preCheckLogs);

  return {
    latestLog: sortedLogs[0] ?? null,
    trainingSessions: state.overview.trainingSessions,
    programSettings: state.overview.programSettings,
  };
};
