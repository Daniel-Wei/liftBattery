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
import { CoachWorkspaceProvider } from "./store/CoachWorkspaceContext";
import { CoachOverviewPage } from "./pages/CoachOverviewPage";
import { ClientsPage } from "./pages/ClientsPage";
import { PreparationPage } from "./pages/PreparationPage";
import { SchedulePage } from "./pages/SchedulePage";
import { NutritionPage } from "./pages/NutritionPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import "./coach.css";

function AppContent() {
  const dispatch = useAppDispatch();
  const { user, hydrated } = useAppSelector((state) => state.auth);
  const [preview, setPreview] = useState(() => new URLSearchParams(window.location.search).get("workspace") === "demo");
  const [currentPage, setCurrentPage] = useState<PageKey>(() => new URLSearchParams(window.location.search).get("workspace") === "demo" ? PageKey.CoachOverview : PageKey.Login);
  const [returnPage, setReturnPage] = useState<PageKey>(PageKey.CoachOverview);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [currentPage]);

  useEffect(() => {
    if (!preview) void dispatch(fetchCurrentUser());
  }, [dispatch, preview]);

  useEffect(() => {
    if (hydrated && user && [PageKey.Login, PageKey.Register].includes(currentPage)) {
      setCurrentPage(returnPage);
    }
  }, [currentPage, hydrated, returnPage, user]);

  function navigate(page: PageKey) {
    const protectedPage = ![PageKey.Login, PageKey.Register].includes(page);

    if (protectedPage && !user && !preview) {
      setReturnPage(page);
      setCurrentPage(PageKey.Login);
      return;
    }

    setCurrentPage(page);
  }

  function handleAuthenticated() {
    setPreview(false);
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
    setPreview(false);
    setCurrentPage(PageKey.Login);
  }

  function exitPreview() {
    setPreview(false);
    setCurrentPage(PageKey.Login);
    const url = new URL(window.location.href);
    url.searchParams.delete("workspace");
    window.history.replaceState(null, "", url);
  }

  function renderPage() {
    if (!hydrated && !preview) {
      return <div className="page page-stack"><section className="empty-card">正在恢复登录状态...</section></div>;
    }

    if (preview && !user && [PageKey.Overview, PageKey.PreCheck, PageKey.Training, PageKey.DailyReport, PageKey.Trends, PageKey.Profile].includes(currentPage)) {
      return <section className="coach-card coach-preview-personal"><p className="coach-eyebrow">PERSONAL TRAINING · CLOUD RECORDS</p><h2>你的个人训练空间完整保留</h2><p>登录后继续查看个人总览、练前检查、训练记录、每日对比和趋势报告。示例学员不会关联你的个人数据。</p><button type="button" className="coach-button-primary" onClick={exitPreview}>登录并查看个人记录</button></section>;
    }

    switch (currentPage) {
      case PageKey.Login:
        return (
          <LoginPage
            onAuthenticated={handleAuthenticated}
            onRegister={() => navigateToAuthPage(PageKey.Register)}
            onPreview={() => { setPreview(true); setCurrentPage(PageKey.CoachOverview); }}
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
      case PageKey.CoachOverview:
        return <CoachOverviewPage onNavigate={navigate} coachName={user?.displayName ?? "教练"} />;
      case PageKey.Clients:
        return <ClientsPage onNavigate={navigate} />;
      case PageKey.Preparation:
        return <PreparationPage onNavigate={navigate} />;
      case PageKey.Schedule:
        return <SchedulePage onNavigate={navigate} />;
      case PageKey.Nutrition:
        return <NutritionPage onNavigate={navigate} />;
      case PageKey.Reviews:
        return <ReviewsPage onNavigate={navigate} />;
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
    <CoachWorkspaceProvider key={preview && !user ? "demo" : user ? `user-${user.id}` : "signedout"} ownerKey={preview && !user ? "demo" : user ? `user-${user.id}` : "signedout"} isDemo={preview && !user}>
    <AppShell
      navItems={navItems}
      currentPage={currentPage}
      onNavigate={navigate}
      user={user}
      onLogout={handleLogout}
      onExitPreview={exitPreview}
    >
      {renderPage()}
    </AppShell>
    </CoachWorkspaceProvider>
  );
}

export default function App() {
  return (
    <ReduxProvider store={liftBatteryStore}>
      <AppContent />
    </ReduxProvider>
  );
}
