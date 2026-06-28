import { useEffect, useState } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { AppShell } from "./components/AppShell";
import { navItems } from "./data/mockData";
import { PageKey } from "./types/appTypes";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { OverviewPage } from "./pages/OverviewPage";
import { PreCheckPage } from "./pages/PreCheckPage";
import { ProfilePage } from "./pages/ProfilePage";
import { RegisterPage } from "./pages/RegisterPage";
import { TrainingPage } from "./pages/TrainingPage";
import { TrendsPage } from "./pages/TrendsPage";
import { liftBatteryStore } from "./store/liftBatteryStore";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { fetchCurrentUser, logoutUser } from "./store/slices/authSlice";

function AppContent() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const [currentPage, setCurrentPage] = useState<PageKey>(PageKey.Landing);
  const [returnPage, setReturnPage] = useState<PageKey>(PageKey.Overview);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  useEffect(() => {
    void dispatch(fetchCurrentUser());
  }, [dispatch]);

  function navigate(page: PageKey) {
    const protectedPage = ![
      PageKey.Landing,
      PageKey.Login,
      PageKey.Register,
    ].includes(page);

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

  async function handleLogout() {
    await dispatch(logoutUser());
    setCurrentPage(PageKey.Login);
  }

  function renderPage() {
    if (!hydrated && currentPage !== PageKey.Landing) {
      return <div className="page page-stack"><section className="empty-card">正在恢复登录状态...</section></div>;
    }

    switch (currentPage) {
      case PageKey.Landing:
        return <LandingPage onStart={() => navigate(PageKey.Overview)} />;
      case PageKey.Login:
        return (
          <LoginPage
            onAuthenticated={handleAuthenticated}
            onRegister={() => setCurrentPage(PageKey.Register)}
            onNavigate={navigate}
          />
        );
      case PageKey.Register:
        return (
          <RegisterPage
            onAuthenticated={handleAuthenticated}
            onLogin={() => setCurrentPage(PageKey.Login)}
            onNavigate={navigate}
          />
        );
      case PageKey.PreCheck:
        return <PreCheckPage />;
      case PageKey.Training:
        return <TrainingPage />;
      case PageKey.Trends:
        return <TrendsPage />;
      case PageKey.Profile:
        return <ProfilePage onSignedOut={() => setCurrentPage(PageKey.Login)} />;
      case PageKey.Overview:
      default:
        return <OverviewPage />;
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
