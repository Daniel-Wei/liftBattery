import { createContext, useContext } from "react";
import type { CoachActionResult, CoachAppointment, CoachClient, CoachReview, CoachWorkspaceData, NutritionLog, NutritionTarget } from "../types/coach";

export type WorkspaceContextValue = {
  data: CoachWorkspaceData;
  isDemo: boolean;
  storageError: string | null;
  selectedClientId: string | null;
  selectClient: (id: string | null) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  saveClient: (input: Omit<CoachClient, "id"> & { id?: string }) => string;
  saveTarget: (input: Omit<NutritionTarget, "id">) => void;
  saveNutrition: (input: Omit<NutritionLog, "id">) => void;
  saveAppointment: (input: Omit<CoachAppointment, "id" | "status"> & { id?: string }) => CoachActionResult;
  completeAppointment: (id: string) => CoachActionResult;
  cancelAppointment: (id: string) => CoachActionResult;
  addCredits: (clientId: string, quantity: number, note: string) => CoachActionResult;
  saveReview: (input: Omit<CoachReview, "id"> & { id?: string }) => void;
};

// Keep the context identity independent from the provider's hot-reloaded JSX.
export const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function useCoachWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("Coach workspace provider is required.");
  return context;
}
