import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { FormulaNote } from "./components/FormulaNote";
import { formulaNotes, navItems } from "./data/mockData";
import type { PageKey } from "./types/appTypes";
import { DailyLogPage } from "./pages/DailyLogPage";
import { EffortRirPage } from "./pages/EffortRirPage";
import { LandingPage } from "./pages/LandingPage";
import { NutritionPage } from "./pages/NutritionPage";
import { OverviewPage } from "./pages/OverviewPage";
import { RecoveryPage } from "./pages/RecoveryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TrainingLoadPage } from "./pages/TrainingLoadPage";
import { TrendsPage } from "./pages/TrendsPage";
import { VolumePage } from "./pages/VolumePage";
import { WeeklyReviewPage } from "./pages/WeeklyReviewPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("landing");
  const currentFormula = formulaNotes.find((note) => note.pageKey === currentPage);

  function renderPage() {
    switch (currentPage) {
      case "landing":
        return <LandingPage onOpenOverview={() => setCurrentPage("overview")} />;
      case "overview":
        return <OverviewPage />;
      case "dailyLog":
        return <DailyLogPage />;
      case "trainingLoad":
        return <TrainingLoadPage />;
      case "effortRir":
        return <EffortRirPage />;
      case "volume":
        return <VolumePage />;
      case "recovery":
        return <RecoveryPage />;
      case "nutrition":
        return <NutritionPage />;
      case "trends":
        return <TrendsPage />;
      case "weeklyReview":
        return <WeeklyReviewPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <OverviewPage />;
    }
  }

  return (
    <AppShell navItems={navItems} currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentFormula ? <FormulaNote note={currentFormula} /> : null}
      {renderPage()}
    </AppShell>
  );
}
