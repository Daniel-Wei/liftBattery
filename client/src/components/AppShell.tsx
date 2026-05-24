import type { ReactNode } from "react";
import type { NavItem, PageKey } from "../types/appTypes";

type AppShellProps = {
  navItems: NavItem[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
};

export function AppShell({ navItems, currentPage, onNavigate, children }: AppShellProps) {
  if (currentPage === "landing") {
    // The landing page uses its own full-screen layout, so it skips the dashboard shell.
    return <>{children}</>;
  }

  const appNavItems = navItems.filter((item) => item.key !== "landing");
  const activeItem = navItems.find((item) => item.key === currentPage);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button
          type="button"
          onClick={() => onNavigate("landing")}
          className="brand-card"
        >
          <p className="brand-title">LiftOps</p>
          <p className="brand-subtitle">Training science log</p>
        </button>

        <nav className="side-nav">
          {appNavItems.map((item) => {
            const isActive = item.key === currentPage;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate(item.key)}
                className={isActive ? "side-nav-button side-nav-button--active" : "side-nav-button"}
              >
                <span className="side-nav-label">{item.label}</span>
                <span className="side-nav-sub">{item.labelZh}</span>
              </button>
            );
          })}
        </nav>

        <div className="phase-note">
          <p className="phase-note-title">Phase 1</p>
          <p className="phase-note-body">Static UI with mock data only.</p>
        </div>
      </aside>

      <header className="app-topbar">
        <div className="topbar-inner">
          <div>
            <p className="topbar-eyebrow">LiftOps</p>
            <h1 className="topbar-title">{activeItem?.label}</h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("landing")}
            className="button-dark"
          >
            Home
          </button>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <nav className="mobile-nav">
        {appNavItems.map((item) => {
          const isActive = item.key === currentPage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={isActive ? "mobile-nav-button mobile-nav-button--active" : "mobile-nav-button"}
            >
              <span className="mobile-nav-label">{item.label}</span>
              <span className="mobile-nav-sub">{item.labelZh}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
