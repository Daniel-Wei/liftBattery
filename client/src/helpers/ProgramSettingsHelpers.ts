import { PROGRAM_SETTINGS_STORAGE_KEY } from "../data/localStorageKeys";
import { defaultProgramSettings } from "../data/defaultValues";
import { isProgramSettings } from "../types/appTypeChecks";

export function loadProgramSettings() {
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
