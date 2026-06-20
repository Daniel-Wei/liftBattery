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
          <p className="brand-title">训练电量</p>
          <p className="brand-subtitle">训练状态与记录</p>
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
                <span className="side-nav-label">{item.labelZh}</span>
              </button>
            );
          })}
        </nav>

        <div className="phase-note">
          <p className="phase-note-title">第一阶段</p>
          <p className="phase-note-body">练前检查与训练记录</p>
        </div>
      </aside>

      <header className="app-topbar">
        <div className="topbar-inner">
          <div>
            <p className="topbar-eyebrow">训练电量</p>
            <h1 className="topbar-title">{activeItem?.labelZh}</h1>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(PageKey.Landing)}
            className="button-dark"
          >
            首页
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
              <span className="mobile-nav-label">{item.labelZh}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
