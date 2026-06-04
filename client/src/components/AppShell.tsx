import type { ReactNode } from "react";
import { PageKey, type NavItem } from "../types/appTypes";

type AppShellProps = {
  navItems: NavItem[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
};

export function AppShell({ navItems, currentPage, onNavigate, children }: AppShellProps) {
  // Landing is a standalone first screen, so it skips the dashboard sidebar and topbar.
  if (currentPage === PageKey.Landing) {
    return <>{children}</>;
  }

  const activeItem = navItems.find((item) => item.key === currentPage);

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <button
          type="button"
          onClick={() => onNavigate(PageKey.Landing)}
          className="brand-card"
        >
          <p className="brand-title">Lift Battery</p>
          <p className="brand-subtitle">Training readiness battery</p>
        </button>

        <nav className="side-nav">
          {navItems.map((item) => {
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
            <p className="topbar-eyebrow">Lift Battery</p>
            <h1 className="topbar-title">{activeItem?.label}</h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(PageKey.Landing)}
            className="button-dark"
          >
            Home
          </button>
        </div>
      </header>

      <main className="app-main">{children}</main>

      <nav className="mobile-nav">
        {navItems.map((item) => {
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
