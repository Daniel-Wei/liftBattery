import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { AppShell } from "./components/AppShell";
import { navItems } from "./data/navigation";
import { PageKey } from "./types/appTypes";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PreCheckPage } from "./pages/PreCheckPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrendsPage } from "./pages/TrendsPage";
import { ExerciseGuidePage } from "./pages/ExerciseGuidePage";
import { DailyReportPage } from "./pages/DailyReportPage";
import { liftBatteryStore } from "./store/liftBatteryStore";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { clearAuthError, fetchCurrentUser, logoutUser } from "./store/slices/authSlice";

function AppContent() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState<PageKey>(PageKey.Login);
  const [returnPage, setReturnPage] = useState<PageKey>(PageKey.Overview);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  useEffect(() => {
    void dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (hydrated && user && [PageKey.Login, PageKey.Register].includes(currentPage)) {
      setCurrentPage(returnPage);
    }
  }, [currentPage, hydrated, returnPage, user]);

  function navigate(page: PageKey) {
    const protectedPage = ![PageKey.Login, PageKey.Register].includes(page);

    if (protectedPage && !user) {
      setReturnPage(page);
      setCurrentPage(PageKey.Login);
      return;
    }

    setCurrentPage(page);
  }

  function handleAuthenticated() {
    setCurrentPage(returnPage);
  }

  function navigateToAuthPage(page: PageKey.Login | PageKey.Register) {
    // Login and registration share the auth state, but an error from one form
    // must not be presented as though it came from the other form.
    dispatch(clearAuthError());
    setCurrentPage(page);
  }

  async function handleLogout() {
    await dispatch(logoutUser());
    setCurrentPage(PageKey.Login);
  }

  function renderPage() {
    if (!hydrated) {
      return <div className="page page-stack"><section className="empty-card">正在恢复登录状态...</section></div>;
    }

    switch (currentPage) {
      case PageKey.Login:
        return (
          <LoginPage
            onAuthenticated={handleAuthenticated}
            onRegister={() => navigateToAuthPage(PageKey.Register)}
          />
        );
      case PageKey.Register:
        return (
          <RegisterPage
            onAuthenticated={handleAuthenticated}
            onLogin={() => navigateToAuthPage(PageKey.Login)}
          />
        );
      case PageKey.PreCheck:
        return <PreCheckPage />;
      case PageKey.Training:
        return <TrainingPage onSaved={() => navigate(PageKey.DailyReport)} />;
      case PageKey.ExerciseGuide:
        return <ExerciseGuidePage />;
      case PageKey.DailyReport:
        return <DailyReportPage />;
      case PageKey.Trends:
        return <TrendsPage />;
      case PageKey.Profile:
        return <ProfilePage onSignedOut={() => setCurrentPage(PageKey.Login)} />;
      case PageKey.Overview:
      default:
        return (
          <OverviewPage
            onOpenPreCheck={() => navigate(PageKey.PreCheck)}
            onRecordTraining={() => navigate(PageKey.Training)}
          />
        );
    }
  }

  return (
    <AppShell
      navItems={navItems}
      currentPage={currentPage}
      onNavigate={navigate}
      user={user}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AppShell>
  );
}

export default function App() {
  return (
    <ReduxProvider store={liftBatteryStore}>
      <AppContent />
    </ReduxProvider>
  );
}
