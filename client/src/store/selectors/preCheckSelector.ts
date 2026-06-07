import type { RootState } from "../liftBatteryStore";
import { calculateReadiness } from "../../domain/readiness";
import { sortPreCheckLogsNewestFirst } from "../../helpers/PreCheckHelpers";

export const getPreCheckData = (state: RootState) => {
  return {
    preCheckDraft: state.preCheck.preCheckDraft,
    preCheckDraftUpdated: state.preCheck.preCheckDraftUpdated,
    savedPreCheckLogs: state.preCheck.savedPreCheckLogs,
    latest7Logs: sortPreCheckLogsNewestFirst(state.preCheck.savedPreCheckLogs).slice(0, 7),
  };
};

export const selectCurrentReadiness = (state: RootState) => {
  return calculateReadiness(state.preCheck.preCheckDraft);
}
