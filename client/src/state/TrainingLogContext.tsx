import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { calculateReadiness } from "../domain/readiness";
import type {
  DailyTrainingLog,
  MainDriver,
  MuscleGroup,
  ProgramSettings,
  ReadinessResult,
  SetEntry,
  TrainingInput,
  TrainingLogAction,
  TrainingLogState,
  TrainingSession,
} from "../types/appTypes";
import {
  MainDriverId,
  MetricStatus,
  ReadinessStatus,
  TrainingLogActionType,
} from "../types/appTypes";

const TODAY_DRAFT_STORAGE_KEY = "liftops.todayDraft";
const TRAINING_LOGS_STORAGE_KEY = "liftops.trainingLogs";
const TRAINING_SESSIONS_STORAGE_KEY = "liftops.trainingSessions";
const PROGRAM_SETTINGS_STORAGE_KEY = "liftops.programSettings";

const initialTrainingInput: TrainingInput = {
  sleepHours: 7.5,
  soreness: 3,
  motivation: 7,
  restingHeartRateDelta: 1,
  previousSessionRpe: 7,
  previousSessionDurationMinutes: 60,
};

const defaultProgramSettings: ProgramSettings = {
  currentWeek: 1,
  totalWeeks: 12,
  mode: "Strength / hypertrophy",
  priorityMuscles: ["Back", "Glutes", "Quads"],
  weeklyPriorityHardSetTarget: 50,
};

const defaultTrainingLogState: TrainingLogState = {
  todayDraft: initialTrainingInput,
  todayDraftUpdated: true,
  logs: [],
  trainingSessions: [],
  programSettings: defaultProgramSettings,
};

type TrainingLogContextValue = {
  todayDraft: TrainingInput;
  todayDraftUpdated: boolean;
  currentReadiness: ReadinessResult;
  logs: DailyTrainingLog[];
  latestLog: DailyTrainingLog | null;
  last7Logs: DailyTrainingLog[];
  trainingSessions: TrainingSession[];
  programSettings: ProgramSettings;
  updateTodayDraft: (field: keyof TrainingInput, value: number) => void;
  resetTodayDraft: () => void;
  saveTodayLog: () => void;
  deleteLog: (id: string) => void;
  saveTrainingSession: (session: TrainingSession) => void;
  deleteTrainingSession: (id: string) => void;
  updateProgramSettings: (settings: ProgramSettings) => void;
};

type TrainingLogProviderProps = {
  children: ReactNode;
};

type LegacyExerciseEntry = {
  id: string;
  exerciseName: string;
  primaryMuscleGroups: MuscleGroup[];
  sets: SetEntry[];
};

const TrainingLogContext = createContext<TrainingLogContextValue | null>(null);

// Checks that unknown JSON is an object before we read named fields from it.
function isStringKeyValuePairObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// Primitive guards keep localStorage validation small and readable.
function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isMuscleGroup(value: unknown): value is MuscleGroup {
  return value === "Chest"
    || value === "Back"
    || value === "Shoulders"
    || value === "Biceps"
    || value === "Triceps"
    || value === "Quads"
    || value === "Hamstrings"
    || value === "Glutes"
    || value === "Calves"
    || value === "Abs";
}

function isReadinessStatus(value: unknown): value is ReadinessStatus {
  return value === ReadinessStatus.Ready
    || value === ReadinessStatus.Steady
    || value === ReadinessStatus.Caution
    || value === ReadinessStatus.Recovery;
}

function isMetricStatus(value: unknown): value is MetricStatus {
  return value === MetricStatus.Good
    || value === MetricStatus.Watch
    || value === MetricStatus.Risk
    || value === MetricStatus.Neutral;
}

// Verifies that a saved main driver uses one of our known driver ids.
function isMainDriverId(value: unknown): value is MainDriverId {
  return value === MainDriverId.ShortSleep
    || value === MainDriverId.HighSoreness
    || value === MainDriverId.LowMotivation
    || value === MainDriverId.RestingHeartRateAboveBaseline
    || value === MainDriverId.HardPreviousSessionLoad
    || value === MainDriverId.NoMajorIssues;
}

// Validates the editable TodayPage input shape after JSON.parse.
export function isTrainingInput(value: unknown): value is TrainingInput {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isNumber(value.sleepHours)
    && isNumber(value.soreness)
    && isNumber(value.motivation)
    && isNumber(value.restingHeartRateDelta)
    && isNumber(value.previousSessionRpe)
    && isNumber(value.previousSessionDurationMinutes)
  );
}

// Validates one readiness driver stored inside a saved daily log.
function isMainDriver(value: unknown): value is MainDriver {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isMainDriverId(value.id)
    && isString(value.message)
    && isString(value.reason)
  );
}

// Validates the calculated readiness result stored with a saved log.
function isReadinessResult(value: unknown): value is ReadinessResult {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isNumber(value.score)
    && isReadinessStatus(value.status)
    && isString(value.statusLabel)
    && isString(value.statusLabelZh)
    && isMetricStatus(value.badgeStatus)
    && isString(value.recommendation)
    && isString(value.recommendationZh)
    && Array.isArray(value.mainDrivers)
    && value.mainDrivers.every(isMainDriver)
  );
}

// Validates one saved daily log from localStorage.
export function isDailyTrainingLog(value: unknown): value is DailyTrainingLog {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isString(value.date)
    && isTrainingInput(value.input)
    && isReadinessResult(value.readiness)
    && isString(value.createdAt)
    && isString(value.updatedAt)
  );
}

// Validates the full saved log list from localStorage.
export function isDailyTrainingLogArray(value: unknown): value is DailyTrainingLog[] {
  return Array.isArray(value) && value.every(isDailyTrainingLog);
}

function isSetEntry(value: unknown): value is SetEntry {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isNumber(value.reps)
    && isNumber(value.weightKg)
    && (value.rpe === undefined || isNumber(value.rpe))
    && (value.rir === undefined || isNumber(value.rir))
    && isBoolean(value.isWarmup)
  );
}

function isLegacyExerciseEntry(value: unknown): value is LegacyExerciseEntry {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isString(value.exerciseName)
    && Array.isArray(value.primaryMuscleGroups)
    && value.primaryMuscleGroups.every(isMuscleGroup)
    && Array.isArray(value.sets)
    && value.sets.every(isSetEntry)
  );
}

export function isTrainingSession(value: unknown): value is TrainingSession {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isString(value.id)
    && isString(value.date)
    && isNumber(value.durationMinutes)
    && isNumber(value.sessionRpe)
    && isString(value.exerciseName)
    && isMuscleGroup(value.primaryMuscleGroup)
    && Array.isArray(value.sets)
    && value.sets.every(isSetEntry)
    && isString(value.createdAt)
    && isString(value.updatedAt)
  );
}

function getTrainingSessionFromStorage(value: unknown): TrainingSession | null {
  if (isTrainingSession(value)) {
    return value;
  }

  if (!isStringKeyValuePairObjectRecord(value)) {
    return null;
  }

  if (
    !isString(value.id)
    || !isString(value.date)
    || !isNumber(value.durationMinutes)
    || !isNumber(value.sessionRpe)
    || !Array.isArray(value.exercises)
    || value.exercises.length === 0
    || !isLegacyExerciseEntry(value.exercises[0])
    || !isString(value.createdAt)
    || !isString(value.updatedAt)
  ) {
    return null;
  }

  const legacyExercise = value.exercises[0];
  const primaryMuscleGroup = legacyExercise.primaryMuscleGroups[0];

  if (!isMuscleGroup(primaryMuscleGroup)) {
    return null;
  }

  return {
    id: value.id,
    date: value.date,
    durationMinutes: value.durationMinutes,
    sessionRpe: value.sessionRpe,
    exerciseName: legacyExercise.exerciseName,
    primaryMuscleGroup,
    sets: legacyExercise.sets,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function getTrainingSessionArrayFromStorage(value: unknown): TrainingSession[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const trainingSessions: TrainingSession[] = [];

  for (const storedSession of value) {
    const trainingSession = getTrainingSessionFromStorage(storedSession);

    if (trainingSession === null) {
      return null;
    }

    trainingSessions.push(trainingSession);
  }

  return trainingSessions;
}

export function isProgramSettings(value: unknown): value is ProgramSettings {
  if (!isStringKeyValuePairObjectRecord(value)) {
    return false;
  }

  return (
    isNumber(value.currentWeek)
    && isNumber(value.totalWeeks)
    && isString(value.mode)
    && Array.isArray(value.priorityMuscles)
    && value.priorityMuscles.every(isMuscleGroup)
    && isNumber(value.weeklyPriorityHardSetTarget)
  );
}

// Loads the current unsaved draft, falling back safely if storage is empty or invalid.
function loadTodayDraft() {
  try {
    const savedValue = localStorage.getItem(TODAY_DRAFT_STORAGE_KEY);

    if (savedValue === null) {
      return initialTrainingInput;
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isTrainingInput(parsedValue)) {
      return parsedValue;
    }

    return initialTrainingInput;
  } catch {
    return initialTrainingInput;
  }
}

// Loads saved history logs, falling back to an empty history if storage is empty or invalid.
function loadTrainingLogs() {
  try {
    const savedValue = localStorage.getItem(TRAINING_LOGS_STORAGE_KEY);

    if (savedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isDailyTrainingLogArray(parsedValue)) {
      return parsedValue;
    }

    return [];
  } catch {
    return [];
  }
}

function loadTrainingSessions() {
  try {
    const savedValue = localStorage.getItem(TRAINING_SESSIONS_STORAGE_KEY);

    if (savedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    const trainingSessions = getTrainingSessionArrayFromStorage(parsedValue);

    if (trainingSessions !== null) {
      return trainingSessions;
    }

    return [];
  } catch {
    return [];
  }
}

function loadProgramSettings() {
  try {
    const savedValue = localStorage.getItem(PROGRAM_SETTINGS_STORAGE_KEY);

    if (savedValue === null) {
      return defaultProgramSettings;
    }

    const parsedValue: unknown = JSON.parse(savedValue);

    if (isProgramSettings(parsedValue)) {
      return parsedValue;
    }

    return defaultProgramSettings;
  } catch {
    return defaultProgramSettings;
  }
}

// Builds the initial reducer state from separate localStorage keys.
function loadInitialTrainingLogState(): TrainingLogState {
  const todayDraft = loadTodayDraft();
  const logs = loadTrainingLogs();

  return {
    todayDraft,
    todayDraftUpdated: getTodayDraftUpdated(todayDraft, logs),
    logs,
    trainingSessions: loadTrainingSessions(),
    programSettings: loadProgramSettings(),
  };
}

// Uses the browser date as the saved daily log date key.
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getTodayLog(logs: DailyTrainingLog[]) {
  const today = getTodayDate();
  return logs.find((log) => log.date === today);
}

function isSameTrainingInput(firstInput: TrainingInput, secondInput: TrainingInput) {
  return (
    firstInput.sleepHours === secondInput.sleepHours
    && firstInput.soreness === secondInput.soreness
    && firstInput.motivation === secondInput.motivation
    && firstInput.restingHeartRateDelta === secondInput.restingHeartRateDelta
    && firstInput.previousSessionRpe === secondInput.previousSessionRpe
    && firstInput.previousSessionDurationMinutes === secondInput.previousSessionDurationMinutes
  );
}

function getTodayDraftUpdated(todayDraft: TrainingInput, logs: DailyTrainingLog[]) {
  const todayLog = getTodayLog(logs);

  if (!todayLog) {
    return true;
  }

  return !isSameTrainingInput(todayDraft, todayLog.input);
}

// Keeps latestLog and last7Logs consistent without mutating the original logs array.
function sortLogsNewestFirst(logs: DailyTrainingLog[]) {
  return [...logs].sort((firstLog, secondLog) => (
    secondLog.date.localeCompare(firstLog.date)
    || secondLog.updatedAt.localeCompare(firstLog.updatedAt)
  ));
}

// Central reducer for app-level training draft and saved log history.
function trainingLogReducer(
  state: TrainingLogState,
  action: TrainingLogAction,
): TrainingLogState {
  switch (action.type) {
    case TrainingLogActionType.UpdateTodayDraft: {
      const nextTodayDraft = {
        ...state.todayDraft,
        [action.field]: action.value,
      };

      return {
        ...state,
        todayDraft: nextTodayDraft,
        todayDraftUpdated: getTodayDraftUpdated(nextTodayDraft, state.logs),
      };
    }

    case TrainingLogActionType.ResetTodayDraft: {
      const savedTodayDraft = getTodayLog(state.logs)?.input ?? initialTrainingInput;

      return {
        ...state,
        todayDraft: savedTodayDraft,
        todayDraftUpdated: false,
      };
    }

    case TrainingLogActionType.SaveTodayLog: {
      const now = new Date().toISOString();
      const today = getTodayDate();
      const currentReadiness = calculateReadiness(state.todayDraft);
      const existingTodayLog = getTodayLog(state.logs);

      if (existingTodayLog) {
        return {
          ...state,
          todayDraftUpdated: false,
          logs: state.logs.map((log) => {
            if (log.date !== today) {
              return log;
            }

            return {
              ...log,
              input: state.todayDraft,
              readiness: currentReadiness,
              updatedAt: now,
            };
          }),
        };
      }

      const newLog: DailyTrainingLog = {
        id: `log-${today}-${Date.now()}`,
        date: today,
        input: state.todayDraft,
        readiness: currentReadiness,
        createdAt: now,
        updatedAt: now,
      };

      return {
        ...state,
        todayDraftUpdated: false,
        logs: [newLog, ...state.logs],
      };
    }

    case TrainingLogActionType.DeleteLog:
      const nextLogs = state.logs.filter((log) => log.id !== action.id);

      return {
        ...state,
        logs: nextLogs,
        todayDraftUpdated: getTodayDraftUpdated(state.todayDraft, nextLogs),
      };

    case TrainingLogActionType.SaveTrainingSession: {
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

    case TrainingLogActionType.DeleteTrainingSession:
      return {
        ...state,
        trainingSessions: state.trainingSessions.filter((session) => session.id !== action.id),
      };

    case TrainingLogActionType.UpdateProgramSettings:
      return {
        ...state,
        programSettings: action.settings,
      };
  }
}

// Provides training draft, saved logs, and derived readiness data to dashboard pages.
export function TrainingLogProvider({ children }: TrainingLogProviderProps) {
  const [state, dispatch] = useReducer(
    trainingLogReducer,
    defaultTrainingLogState,
    loadInitialTrainingLogState,
  );
  const currentReadiness = calculateReadiness(state.todayDraft);
  const sortedLogs = sortLogsNewestFirst(state.logs);
  const latestLog = sortedLogs[0] ?? null;
  const last7Logs = sortedLogs.slice(0, 7);

  useEffect(() => {
    try {
      localStorage.setItem(TODAY_DRAFT_STORAGE_KEY, JSON.stringify(state.todayDraft));
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }
  }, [state.todayDraft]);

  useEffect(() => {
    try {
      localStorage.setItem(TRAINING_LOGS_STORAGE_KEY, JSON.stringify(state.logs));
    } catch {
      // Keep the UI usable if browser storage is unavailable.
    }
  }, [state.logs]);

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

  // Updates one numeric field in the current unsaved Today draft.
  function updateTodayDraft(field: keyof TrainingInput, value: number) {
    dispatch({ type: TrainingLogActionType.UpdateTodayDraft, field, value });
  }

  // Restores the Today draft to the default input values.
  function resetTodayDraft() {
    dispatch({ type: TrainingLogActionType.ResetTodayDraft });
  }

  // Saves or updates today's log using the current draft and readiness result.
  function saveTodayLog() {
    dispatch({ type: TrainingLogActionType.SaveTodayLog });
  }

  // Removes one saved log from history by id.
  function deleteLog(id: string) {
    dispatch({ type: TrainingLogActionType.DeleteLog, id });
  }

  // Saves a post-workout lifting session. Multiple sessions can share one date.
  function saveTrainingSession(session: TrainingSession) {
    dispatch({ type: TrainingLogActionType.SaveTrainingSession, session });
  }

  // Removes one post-workout lifting session by id.
  function deleteTrainingSession(id: string) {
    dispatch({ type: TrainingLogActionType.DeleteTrainingSession, id });
  }

  // Updates the target context used by derived dashboard metrics.
  function updateProgramSettings(settings: ProgramSettings) {
    dispatch({ type: TrainingLogActionType.UpdateProgramSettings, settings });
  }

  const contextValue: TrainingLogContextValue = {
    todayDraft: state.todayDraft,
    todayDraftUpdated: state.todayDraftUpdated,
    currentReadiness,
    logs: state.logs,
    latestLog,
    last7Logs,
    trainingSessions: state.trainingSessions,
    programSettings: state.programSettings,
    updateTodayDraft,
    resetTodayDraft,
    saveTodayLog,
    deleteLog,
    saveTrainingSession,
    deleteTrainingSession,
    updateProgramSettings,
  };

  return (
    <TrainingLogContext.Provider value={contextValue}>
      {children}
    </TrainingLogContext.Provider>
  );
}

// Consumer hook for pages that need training log state.
export function useTrainingLog() {
  const context = useContext(TrainingLogContext);

  if (context === null) {
    throw new Error("useTrainingLog must be used inside TrainingLogProvider.");
  }

  return context;
}
