import type { ReactNode } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Home,
  LogOut,
  Settings,
  User,
  Zap,
} from "lucide-react";
import { PageKey, type AuthUser, type NavItem } from "../types/appTypes";

type AppShellProps = {
  navItems: NavItem[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  user: AuthUser | null;
  onLogout: () => void;
  children: ReactNode;
};

const navIconByPage: Record<PageKey, ReactNode> = {
  [PageKey.Login]: null,
  [PageKey.Register]: null,
  [PageKey.Overview]: <Home size={17} />,
  [PageKey.PreCheck]: <CalendarCheck size={17} />,
  [PageKey.Training]: <Dumbbell size={17} />,
  [PageKey.ExerciseGuide]: <BookOpen size={17} />,
  [PageKey.DailyReport]: <ClipboardList size={17} />,
  [PageKey.Trends]: <BarChart3 size={17} />,
  [PageKey.Profile]: <Settings size={17} />,
};

function formatToday() {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(new Date());
}

export function AppShell({
  navItems,
  currentPage,
  onNavigate,
  user,
  onLogout,
  children,
}: AppShellProps) {
  // Public entry screens are standalone, so they skip the dashboard sidebar and topbar.
  if ([PageKey.Login, PageKey.Register].includes(currentPage)) {
    return <>{children}</>;
  }

  const activeItem = navItems.find((item) => item.key === currentPage);
  const mainNavItems = navItems.filter((item) => item.key !== PageKey.Profile);
  const workspaceNavItems = navItems.filter((item) => item.key === PageKey.Profile);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button
          type="button"
          onClick={() => onNavigate(PageKey.Overview)}
          className="app-brand"
        >
          <span className="app-brand-mark">
            <Zap size={18} />
          </span>
          <span>
            <span className="brand-title">Lift Bettery</span>
            <span className="brand-subtitle">Training intelligence</span>
          </span>
        </button>

        <nav className="side-nav" aria-label="Main navigation">
          <p className="side-nav-heading">MAIN</p>
          {mainNavItems.map((item) => {
            const isActive = item.key === currentPage;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={isActive ? "side-nav-button side-nav-button--active" : "side-nav-button"}
              >
                <span className="side-nav-icon">{navIconByPage[item.key]}</span>
                <span className="side-nav-label">{item.labelZh}</span>
              </button>
            );
          })}

          <p className="side-nav-heading side-nav-heading--workspace">WORKSPACE</p>
          {workspaceNavItems.map((item) => {
            const isActive = item.key === currentPage;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={isActive ? "side-nav-button side-nav-button--active" : "side-nav-button"}
              >
                <span className="side-nav-icon">{navIconByPage[item.key]}</span>
                <span className="side-nav-label">{item.labelZh}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <div>
            <p className="topbar-eyebrow">LIFT BETTERY</p>
            <h1 className="topbar-title">{activeItem?.labelZh}</h1>
          </div>

          <div className="topbar-actions">
            <span className="topbar-date">{formatToday()}</span>
            {user ? (
              <>
                <button type="button" className="user-chip" onClick={() => onNavigate(PageKey.Profile)}>
                  <span className="user-avatar">
                    {user.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="user-chip-copy">
                    <strong>{user.displayName}</strong>
                  </span>
                </button>
                <button type="button" className="icon-button" onClick={onLogout} aria-label="退出">
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(PageKey.Login)}
                className="button-secondary topbar-login-button"
              >
                <User size={16} />
                登录
              </button>
            )}
          </div>
        </header>

        <main className="app-main">{children}</main>
      </div>

      <nav className="mobile-nav">
        {mainNavItems.map((item) => {
          const isActive = item.key === currentPage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={isActive ? "mobile-nav-button mobile-nav-button--active" : "mobile-nav-button"}
            >
              <span className="mobile-nav-label">{item.labelZh}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
