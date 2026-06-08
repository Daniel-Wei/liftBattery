import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { AppShell } from "./components/AppShell";
import { navItems } from "./data/mockData";
import { PageKey } from "./types/appTypes";
import { LandingPage } from "./pages/LandingPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PreCheckPage } from "./pages/PreCheckPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrendsPage } from "./pages/TrendsPage";
import { liftBatteryStore } from "./store/liftBatteryStore";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>(PageKey.Landing);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  function renderPage() {
    switch (currentPage) {
      case PageKey.Landing:
        return <LandingPage onStart={() => setCurrentPage(PageKey.Overview)} />;
      case PageKey.PreCheck:
        return <PreCheckPage />;
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
    <ReduxProvider store={liftBatteryStore}>
        <AppShell navItems={navItems} currentPage={currentPage} onNavigate={setCurrentPage}>
          {renderPage()}
        </AppShell>
    </ReduxProvider>
  );
}
