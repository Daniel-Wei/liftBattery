import { useState, type ReactNode } from "react";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  Dumbbell,
  Home,
  LogOut,
  Settings,
  User,
  Zap,
  Users,
  Trophy,
  CalendarDays,
  Utensils,
  LayoutDashboard,
  MoreHorizontal,
  Download,
  Box,
} from "lucide-react";
import { PageKey, type AuthUser, type NavItem } from "../types/appTypes";
import { coachPageKeys } from "../data/navigation";
import { useCoachWorkspace } from "../store/CoachWorkspaceContext";
import { CoachModal } from "./coach/CoachUI";

type AppShellProps = {
  navItems: NavItem[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  user: AuthUser | null;
  onLogout: () => void;
  onExitPreview?: () => void;
  children: ReactNode;
};

const navIconByPage: Record<PageKey, ReactNode> = {
  [PageKey.Login]: null,
  [PageKey.Register]: null,
  [PageKey.CoachOverview]: <LayoutDashboard size={17} />,
  [PageKey.Clients]: <Users size={17} />,
  [PageKey.Preparation]: <Trophy size={17} />,
  [PageKey.Schedule]: <CalendarDays size={17} />,
  [PageKey.Nutrition]: <Utensils size={17} />,
  [PageKey.Reviews]: <ClipboardList size={17} />,
  [PageKey.Overview]: <Home size={17} />,
  [PageKey.PreCheck]: <CalendarCheck size={17} />,
  [PageKey.Training]: <Dumbbell size={17} />,
  [PageKey.ExerciseGuide]: <Box size={17} />,
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
  onExitPreview,
  children,
}: AppShellProps) {
  const { data, isDemo, storageError } = useCoachWorkspace();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Public entry screens are standalone, so they skip the dashboard sidebar and topbar.
  if ([PageKey.Login, PageKey.Register].includes(currentPage)) {
    return <>{children}</>;
  }

  const activeItem = navItems.find((item) => item.key === currentPage);
  const isCoachPage = coachPageKeys.has(currentPage);
  const navGroups = [
    { key: "coach", title: "教练管理", eyebrow: "COACHING" },
    { key: "personal", title: "个人训练", eyebrow: "PERSONAL" },
    { key: "tools", title: "动作教学", eyebrow: "MOVEMENT" },
    { key: "workspace", title: "账户", eyebrow: "ACCOUNT" },
  ];
  function navigate(page: PageKey) { setMobileMenuOpen(false); onNavigate(page); }
  function exportWorkspace() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `liftbattery-workspace-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function renderNavigation() {
    return navGroups.map((group) => <div className="coach-nav-group" key={group.key}><p className="side-nav-heading"><span>{group.title}</span><small>{group.eyebrow}</small></p>{navItems.filter((item) => item.group === group.key).map((item) => <button key={item.key} type="button" onClick={() => navigate(item.key)} aria-current={item.key === currentPage ? "page" : undefined} className={item.key === currentPage ? "side-nav-button side-nav-button--active" : "side-nav-button"}><span className="side-nav-icon">{navIconByPage[item.key]}</span><span className="side-nav-label">{item.labelZh}</span>{item.key === PageKey.ExerciseGuide && <span className="coach-nav-3d">3D</span>}</button>)}</div>);
  }

  return (
    <div className="app-shell coach-app-shell">
      <aside className="app-sidebar">
        <button
          type="button"
          onClick={() => navigate(PageKey.CoachOverview)}
          className="app-brand"
        >
          <span className="app-brand-mark">
            <Zap size={18} />
          </span>
          <span>
            <span className="brand-title">liftBattery</span>
            <span className="brand-subtitle">备赛私教工作台</span>
          </span>
        </button>

        <nav className="side-nav" aria-label="Main navigation">
          {renderNavigation()}
        </nav>
        <div className="coach-sidebar-foot"><span className="coach-live-dot" /><span>{isDemo ? "演示工作区" : "教练工作区"}<small>{isDemo ? "示例数据 · 可自由体验" : "本机保存 · 个人记录云端同步"}</small></span></div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <div>
            <p className="topbar-eyebrow">{isCoachPage ? "COACHING / COMPETITION PREP" : "LIFTBATTERY / PERSONAL"}</p>
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
                onClick={onExitPreview ?? (() => navigate(PageKey.Login))}
                className="button-secondary topbar-login-button"
              >
                <User size={16} />
                登录账户
              </button>
            )}
          </div>
        </header>

        <main className="app-main">{isCoachPage && <div className={`coach-workspace-notice ${isDemo ? "is-demo" : ""}`}><span><span className="coach-live-dot" /><strong>{isDemo ? "演示工作区" : "本机教练工作区"}</strong><span>{storageError ?? (isDemo ? "当前为示例数据，可体验教练建档、排课与备赛管理。" : "新增教练数据保存在此浏览器；原有个人训练仍使用线上账户。")}</span></span><button type="button" onClick={exportWorkspace}><Download size={13} /> 导出备份</button></div>}{children}</main>
      </div>

      <nav className="mobile-nav">
        {navItems.filter((item) => [PageKey.CoachOverview, PageKey.Clients, PageKey.Schedule, PageKey.Nutrition].includes(item.key)).map((item) => {
          const isActive = item.key === currentPage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.key)}
              className={isActive ? "mobile-nav-button mobile-nav-button--active" : "mobile-nav-button"}
            >
              <span className="side-nav-icon">{navIconByPage[item.key]}</span><span className="mobile-nav-label">{item.key === PageKey.CoachOverview ? "工作台" : item.key === PageKey.Clients ? "学员" : item.key === PageKey.Schedule ? "排课" : "营养"}</span>
            </button>
          );
        })}
        <button type="button" className={mobileMenuOpen ? "mobile-nav-button mobile-nav-button--active" : "mobile-nav-button"} onClick={() => setMobileMenuOpen(true)} aria-label="更多导航"><MoreHorizontal size={18} /><span>更多</span></button>
      </nav>
      {mobileMenuOpen && <CoachModal title="全部功能" onClose={() => setMobileMenuOpen(false)}><nav className="coach-mobile-all-nav" aria-label="全部导航">{renderNavigation()}</nav></CoachModal>}
    </div>
  );
}
