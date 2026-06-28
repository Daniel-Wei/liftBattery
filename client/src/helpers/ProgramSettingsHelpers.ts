import { PROGRAM_SETTINGS_STORAGE_KEY } from "../data/localStorageKeys";
import { defaultProgramSettings } from "../data/defaultValues";
import { isNumber, isProgramSettings, isStringKeyValuePairObjectRecord } from "../types/appTypeChecks";
import type { ProgramSettings } from "../types/appTypes";

function migrateProgramSettings(value: unknown): ProgramSettings | null {
  if (isProgramSettings(value)) {
    return value;
  }

  if (!isStringKeyValuePairObjectRecord(value)) {
    return null;
  }

  if (
    (isNumber(value.currentWeek) && isNumber(value.totalWeeks))
    || (isNumber(value.currentCycle) && isNumber(value.totalCycles))
  ) {
    return {
      ...defaultProgramSettings,
    };
  }

  return null;
}

export function loadProgramSettings() {
  try {
    const savedValue = localStorage.getItem(PROGRAM_SETTINGS_STORAGE_KEY);

    if (savedValue === null) {
      return defaultProgramSettings;
    }

    const parsedValue: unknown = JSON.parse(savedValue);
    const migratedValue = migrateProgramSettings(parsedValue);

    if (migratedValue) {
      saveProgramSettings(migratedValue);
      return migratedValue;
    }

    return defaultProgramSettings;
  } catch {
    return defaultProgramSettings;
  }
}

export function saveProgramSettings(programSettings: ProgramSettings) {
  localStorage.setItem(PROGRAM_SETTINGS_STORAGE_KEY, JSON.stringify(programSettings));
}
