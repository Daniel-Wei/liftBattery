export type PrepPhase = "building" | "prep" | "peak" | "recovery";
export type CoachTone = "cyan" | "mint" | "purple" | "yellow";

export type CoachClient = {
  id: string;
  name: string;
  division: string;
  showName: string;
  showDate: string;
  prepStartDate: string;
  phase: PrepPhase;
  status: "active" | "paused";
  goal: string;
  notes: string;
  tone: CoachTone;
};

export type MacroValues = { protein: number; carbs: number; fat: number };
export type NutritionTarget = MacroValues & { id: string; clientId: string; effectiveDate: string };
export type NutritionLog = {
  id: string;
  clientId: string;
  date: string;
  protein?: number;
  carbs?: number;
  fat?: number;
  weightKg?: number;
  notes: string;
};

export type CoachAppointment = {
  id: string;
  clientId: string;
  title: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  location: string;
  status: "scheduled" | "completed" | "cancelled";
  notes: string;
};

export type CreditEntry = {
  id: string;
  clientId: string;
  date: string;
  amount: number;
  type: "purchase" | "deduction" | "refund";
  appointmentId?: string;
  note: string;
};

export type CoachReview = {
  id: string;
  clientId: string;
  weekOf: string;
  status: "pending" | "reviewed";
  checkIn: string;
  feedback: string;
  nextFocus: string;
};

export type CoachWorkspaceData = {
  version: 1;
  clients: CoachClient[];
  appointments: CoachAppointment[];
  credits: CreditEntry[];
  nutritionTargets: NutritionTarget[];
  nutritionLogs: NutritionLog[];
  reviews: CoachReview[];
};

export type CoachActionResult = { ok: boolean; message: string };
