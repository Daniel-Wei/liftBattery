import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { FormulaNote } from "./components/FormulaNote";
import { formulaNotes, navItems } from "./data/mockData";
import type { PageKey, UserLevel } from "./types/appTypes";
import { BodyweightPage } from "./pages/BodyweightPage";
import { LandingPage } from "./pages/LandingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { RecoveryPage } from "./pages/RecoveryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TodayPage } from "./pages/TodayPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrendsPage } from "./pages/TrendsPage";
import { WeeklyReviewPage } from "./pages/WeeklyReviewPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("landing");
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>("level1");
  const currentFormula = formulaNotes.find((note) => note.pageKey === currentPage);

  function renderPage() {
    switch (currentPage) {
      case "landing":
        return (
          <LandingPage
            selectedLevel={selectedLevel}
            onSelectLevel={(level) => {
              setSelectedLevel(level);
              setCurrentPage("overview");
            }}
          />
        );
      case "overview":
        return <OverviewPage selectedLevel={selectedLevel} />;
      case "today":
        return <TodayPage selectedLevel={selectedLevel} />;
      case "training":
        return <TrainingPage selectedLevel={selectedLevel} />;
      case "recovery":
        return <RecoveryPage selectedLevel={selectedLevel} />;
      case "bodyweight":
        return <BodyweightPage selectedLevel={selectedLevel} />;
      case "trends":
        return <TrendsPage selectedLevel={selectedLevel} />;
      case "weeklyReview":
        return <WeeklyReviewPage selectedLevel={selectedLevel} />;
      case "settings":
        return <SettingsPage selectedLevel={selectedLevel} />;
      default:
        return <OverviewPage selectedLevel={selectedLevel} />;
    }
  }

  return (
    <AppShell navItems={navItems} currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
      {currentFormula && currentPage !== "landing" ? <FormulaNote note={currentFormula} /> : null}
    </AppShell>
  );
}
