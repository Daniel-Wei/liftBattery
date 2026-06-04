import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { calculateReadiness } from "../domain/readiness";
import { LiftBatteryActionType } from "../types/appTypes";
import type {
  DailyPreCheckLog,
  ProgramSettings,
  ReadinessResult,
  PreCheckInput,
  LiftBatteryAction,
  LiftBatteryState,
  TrainingSession,
} from "../types/appTypes";
import {
  initialPreCheckInput,
  defaultLiftBatteryState,
} from "../data/defaultValues";
import {
  getPreCheckDraftUpdated,
  getTodayPreCheck,
  getTodayDate,
  loadInitialLiftBatteryState,
  sortLogsNewestFirst,
} from "./LiftBatteryContextHelpers";
import { 
    PRE_CHECK_DRAFT_STORAGE_KEY,
    PRE_CHECK_LOGS_STORAGE_KEY,
    TRAINING_SESSIONS_STORAGE_KEY,
    PROGRAM_SETTINGS_STORAGE_KEY,
 } from "./LiftBatteryContextLocalStorageKeys";

type LiftBatteryContextValue = {
  todayDraft: PreCheckInput;
  todayDraftUpdated: boolean;
  currentReadiness: ReadinessResult;
  preCheckLogs: DailyPreCheckLog[];
  latestLog: DailyPreCheckLog | null;
  last7Logs: DailyPreCheckLog[];
  trainingSessions: TrainingSession[];
  programSettings: ProgramSettings;
  updateTodayDraft: (field: keyof PreCheckInput, value: number) => void;
  resetTodayDraft: () => void;
  saveTodayLog: () => void;
  deleteLog: (id: string) => void;
  saveTrainingSession: (session: TrainingSession) => void;
  deleteTrainingSession: (id: string) => void;
  updateProgramSettings: (settings: ProgramSettings) => void;
};

type LiftBatteryProviderProps = {
  children: ReactNode;
};

const LiftBatteryContext = createContext<LiftBatteryContextValue | null>(null)

function liftBatteryReducer(
  state: LiftBatteryState,
  action: LiftBatteryAction,
): LiftBatteryState {
  switch (action.type) {
    case LiftBatteryActionType.UpdatePreCheckDraft: {
      const nextTodayDraft = {
        ...state.preCheckDraft,
        [action.field]: action.value,
      };

      return {
        ...state,
        preCheckDraft: nextTodayDraft,
        preCheckDraftUpdated: getPreCheckDraftUpdated(nextTodayDraft, state.preCheckLogs),
      };
    }

    case LiftBatteryActionType.ResetPreCheckDraft: {
      const savedTodayDraft = getTodayPreCheck(state.preCheckLogs)?.input ?? initialPreCheckInput;

      return {
        ...state,
        preCheckDraft: savedTodayDraft,
        preCheckDraftUpdated: false,
      };
    }

    case LiftBatteryActionType.SavePreCheckLog: {
      const now = new Date().toISOString();
      const today = getTodayDate();
      const currentReadiness = calculateReadiness(state.preCheckDraft);
      const existingTodayPreCheck = getTodayPreCheck(state.preCheckLogs);

      if (existingTodayPreCheck) {
        return {
          ...state,
          preCheckDraftUpdated: false,
          preCheckLogs: state.preCheckLogs.map((log) => {
            if (log.date !== today) {
              return log;
            }

            return {
              ...log,
              input: state.preCheckDraft,
              readiness: currentReadiness,
              updatedAt: now,
            };
          }),
        };
      }

      const newLog: DailyPreCheckLog = {
        id: `log-${today}-${Date.now()}`,
        date: today,
        input: state.preCheckDraft,
        readiness: currentReadiness,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        preCheckDraftUpdated: false,
        preCheckLogs: [newLog, ...state.preCheckLogs],
      };
    }

    case LiftBatteryActionType.DeletePreCheckLog:
      const nextLogs = state.preCheckLogs.filter((log) => log.id !== action.id);

      return {
        ...state,
        preCheckLogs: nextLogs,
        preCheckDraftUpdated: getPreCheckDraftUpdated(state.preCheckDraft, nextLogs),
      };

    case LiftBatteryActionType.SaveTrainingSession: {
      const sessionExists = state.trainingSessions.some((session) => (
        session.id === action.session.id
      ));

      if (sessionExists) {
        return {
          ...state,
          trainingSessions: state.trainingSessions.map((session) => (
            session.id === action.session.id ? action.session : session
          )),
        };
      }

      return {
        ...state,
        trainingSessions: [action.session, ...state.trainingSessions],
      };
    }

    case LiftBatteryActionType.DeleteTrainingSession:
      return {
        ...state,
        trainingSessions: state.trainingSessions.filter((session) => session.id !== action.id),
      };

    case LiftBatteryActionType.UpdateProgramSettings:
      return {
        ...state,
        programSettings: action.settings,
      };
  }
}

export function LiftBatteryProvider({ children }: LiftBatteryProviderProps) {
  const [state, dispatch] = useReducer(
    liftBatteryReducer,
    defaultLiftBatteryState,
    loadInitialLiftBatteryState,
  );
  const currentReadiness = calculateReadiness(state.preCheckDraft);
  const sortedLogs = sortLogsNewestFirst(state.preCheckLogs);
  const latestLog = sortedLogs[0] ?? null;
  const last7Logs = sortedLogs.slice(0, 7);

  useEffect(() => {
    try {
      localStorage.setItem(PRE_CHECK_DRAFT_STORAGE_KEY, JSON.stringify(state.preCheckDraft));
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }
  }, [state.preCheckDraft]);

  useEffect(() => {
    try {
      localStorage.setItem(PRE_CHECK_LOGS_STORAGE_KEY, JSON.stringify(state.preCheckLogs));
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }
  }, [state.preCheckLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(
        TRAINING_SESSIONS_STORAGE_KEY,
        JSON.stringify(state.trainingSessions),
      );
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }
  }, [state.trainingSessions]);

  useEffect(() => {
    try {
      localStorage.setItem(PROGRAM_SETTINGS_STORAGE_KEY, JSON.stringify(state.programSettings));
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }
  }, [state.programSettings]);

  function updatePreCheckDraft(field: keyof PreCheckInput, value: number) {
    dispatch({ type: LiftBatteryActionType.UpdatePreCheckDraft, field, value });
  }

  function resetPreCheckDraft() {
    dispatch({ type: LiftBatteryActionType.ResetPreCheckDraft });
  }

  function savePreCheckLog() {
    dispatch({ type: LiftBatteryActionType.SavePreCheckLog });
  }

  function deletePreCheckLog(id: string) {
    dispatch({ type: LiftBatteryActionType.DeletePreCheckLog, id });
  }

  // Saves a post-workout lifting session. Multiple sessions can share one date.
  function saveTrainingSession(session: TrainingSession) {
    dispatch({ type: LiftBatteryActionType.SaveTrainingSession, session });
  }

  // Removes one post-workout lifting session by id.
  function deleteTrainingSession(id: string) {
    dispatch({ type: LiftBatteryActionType.DeleteTrainingSession, id });
  }

  // Updates the target context used by derived dashboard metrics.
  function updateProgramSettings(settings: ProgramSettings) {
    dispatch({ type: LiftBatteryActionType.UpdateProgramSettings, settings });
  }

  const contextValue: LiftBatteryContextValue = {
    todayDraft: state.preCheckDraft,
    todayDraftUpdated: state.preCheckDraftUpdated,
    currentReadiness,
    preCheckLogs: state.preCheckLogs,
    latestLog,
    last7Logs,
    trainingSessions: state.trainingSessions,
    programSettings: state.programSettings,
    updateTodayDraft: updatePreCheckDraft,
    resetTodayDraft: resetPreCheckDraft,
    saveTodayLog: savePreCheckLog,
    deleteLog: deletePreCheckLog,
    saveTrainingSession,
    deleteTrainingSession,
    updateProgramSettings,
  };

  return (
    <LiftBatteryContext.Provider value={contextValue}>
      {children}
    </LiftBatteryContext.Provider>
  );
}

// Consumer hook for pages that need lift battery state.
export function useLiftBattery() {
  const context = useContext(LiftBatteryContext);

  if (context === null) {
    throw new Error("useLiftBattery must be used inside LiftBatteryProvider.");
  }

  return context;
}
