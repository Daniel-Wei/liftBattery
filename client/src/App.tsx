import { useEffect, useState } from "react";
import { AppShell } from "./components/AppShell";
import { navItems } from "./data/mockData";
import { PageKey } from "./types/appTypes";
import { LandingPage } from "./pages/LandingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { TodayPage } from "./pages/TodayPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrendsPage } from "./pages/TrendsPage";
import { TrainingLogProvider } from "./state/TrainingLogContext";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>(PageKey.Landing);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  function renderPage() {
    switch (currentPage) {
      case PageKey.Landing:
        return <LandingPage onStart={() => setCurrentPage(PageKey.Overview)} />;
      case PageKey.Today:
        return <TodayPage />;
      case PageKey.Training:
        return <TrainingPage />;
      case PageKey.Trends:
        return <TrendsPage />;
      case PageKey.Overview:
      default:
        return <OverviewPage />;
    }
  }

  return (
    <TrainingLogProvider>
      <AppShell navItems={navItems} currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
    </TrainingLogProvider>
  );
}
