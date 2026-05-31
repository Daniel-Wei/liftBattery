import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { navItems } from "./data/mockData";
import { PageKey, UserLevel } from "./types/appTypes";
import { BodyweightPage } from "./pages/BodyweightPage";
import { LandingPage } from "./pages/LandingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { RecoveryPage } from "./pages/RecoveryPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TodayPage } from "./pages/TodayPage";
import { TrainingPage } from "./pages/TrainingPage";
import { WeeklyReviewPage } from "./pages/WeeklyReviewPage";
import { TrainingLogProvider } from "./state/TrainingLogContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>(PageKey.Landing);
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>(UserLevel.Level1);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  function renderPage() {
    switch (currentPage) {
      case PageKey.Landing:
        return (
          <LandingPage
            selectedLevel={selectedLevel}
            onSelectLevel={(level) => {
              setSelectedLevel(level);
              setCurrentPage(PageKey.Overview);
            }}
          />
        );
      case PageKey.Overview:
        return <OverviewPage selectedLevel={selectedLevel} />;
      case PageKey.Today:
        return <TodayPage selectedLevel={selectedLevel} />;
      case PageKey.Training:
        return <TrainingPage selectedLevel={selectedLevel} />;
      case PageKey.Recovery:
        return <RecoveryPage selectedLevel={selectedLevel} />;
      case PageKey.Bodyweight:
        return <BodyweightPage selectedLevel={selectedLevel} />;
      case PageKey.WeeklyReview:
        return <WeeklyReviewPage selectedLevel={selectedLevel} />;
      case PageKey.Settings:
        return <SettingsPage selectedLevel={selectedLevel} />;
      default:
        return <OverviewPage selectedLevel={selectedLevel} />;
    }
  }

  return (
    <AppShell navItems={navItems} currentPage={currentPage} onNavigate={setCurrentPage}>
      {currentPage === PageKey.Landing ? (
        renderPage()
      ) : (
        <TrainingLogProvider>
          {renderPage()}
        </TrainingLogProvider>
      )}
    </AppShell>
  );
}
