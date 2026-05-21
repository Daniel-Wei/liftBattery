/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/App.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { useEffect, useState } from "react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { useEffect, useState } from "react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import {
中文：导入本 React 文件运行时需要的依赖。 代码：import {
Line 3:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: BarChart3,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：BarChart3,
Line 4:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Boxes,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Boxes,
Line 5:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: CalendarClock,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：CalendarClock,
Line 6:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Gauge,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Gauge,
Line 7:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Home,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Home,
Line 8:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: LayoutDashboard,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：LayoutDashboard,
Line 9:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: LineChart,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：LineChart,
Line 10:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Settings,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Settings,
Line 11:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: SlidersHorizontal,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：SlidersHorizontal,
Line 12:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: TrendingUp,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：TrendingUp,
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: } from "lucide-react";
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：} from "lucide-react";
Line 14:
EN: Imports a runtime dependency used by this React file. Code: import { AppShell } from "./components/AppShell";
中文：导入本 React 文件运行时需要的依赖。 代码：import { AppShell } from "./components/AppShell";
Line 15:
EN: Imports TypeScript-only types used by this React file. Code: import type { NavItem } from "./components/Sidebar";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { NavItem } from "./components/Sidebar";
Line 16:
EN: Imports a runtime dependency used by this React file. Code: import { CapacityPage } from "./pages/CapacityPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { CapacityPage } from "./pages/CapacityPage";
Line 17:
EN: Imports a runtime dependency used by this React file. Code: import { CoreNonCorePage } from "./pages/CoreNonCorePage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { CoreNonCorePage } from "./pages/CoreNonCorePage";
Line 18:
EN: Imports a runtime dependency used by this React file. Code: import { DailyCheckInPage } from "./pages/DailyCheckInPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { DailyCheckInPage } from "./pages/DailyCheckInPage";
Line 19:
EN: Imports a runtime dependency used by this React file. Code: import { EfficiencyProductivityPage } from "./pages/EfficiencyProductivityPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EfficiencyProductivityPage } from "./pages/EfficiencyProductivityPage";
Line 20:
EN: Imports a runtime dependency used by this React file. Code: import { ExecutiveDashboardPage } from "./pages/ExecutiveDashboardPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ExecutiveDashboardPage } from "./pages/ExecutiveDashboardPage";
Line 21:
EN: Imports a runtime dependency used by this React file. Code: import { LandingPage } from "./pages/LandingPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { LandingPage } from "./pages/LandingPage";
Line 22:
EN: Imports a runtime dependency used by this React file. Code: import { PlanForecastPage } from "./pages/PlanForecastPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { PlanForecastPage } from "./pages/PlanForecastPage";
Line 23:
EN: Imports a runtime dependency used by this React file. Code: import { SettingsPage } from "./pages/SettingsPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { SettingsPage } from "./pages/SettingsPage";
Line 24:
EN: Imports a runtime dependency used by this React file. Code: import { TrendsPage } from "./pages/TrendsPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { TrendsPage } from "./pages/TrendsPage";
Line 25:
EN: Imports a runtime dependency used by this React file. Code: import { WeeklyReviewPage } from "./pages/WeeklyReviewPage";
中文：导入本 React 文件运行时需要的依赖。 代码：import { WeeklyReviewPage } from "./pages/WeeklyReviewPage";
Line 27:
EN: Declares a local TypeScript type so component props stay explicit. Code: type PageKey =
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type PageKey =
Line 28:
EN: Adds another allowed value to a TypeScript union. Code: | "landing"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "landing"
Line 29:
EN: Adds another allowed value to a TypeScript union. Code: | "dashboard"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "dashboard"
Line 30:
EN: Adds another allowed value to a TypeScript union. Code: | "planForecast"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "planForecast"
Line 31:
EN: Adds another allowed value to a TypeScript union. Code: | "coreNonCore"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "coreNonCore"
Line 32:
EN: Adds another allowed value to a TypeScript union. Code: | "capacity"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "capacity"
Line 33:
EN: Adds another allowed value to a TypeScript union. Code: | "efficiency"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "efficiency"
Line 34:
EN: Adds another allowed value to a TypeScript union. Code: | "checkIn"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "checkIn"
Line 35:
EN: Adds another allowed value to a TypeScript union. Code: | "trends"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "trends"
Line 36:
EN: Adds another allowed value to a TypeScript union. Code: | "weeklyReview"
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "weeklyReview"
Line 37:
EN: Adds another allowed value to a TypeScript union. Code: | "settings";
中文：为 TypeScript 联合类型增加一个允许值。 代码：| "settings";
Line 39:
EN: Declares a local constant used by the component rendering logic. Code: const navItems: NavItem<PageKey>[] = [
中文：声明组件渲染逻辑会用到的本地常量。 代码：const navItems: NavItem<PageKey>[] = [
Line 40:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "landing", label: "Home", labelZh: "首页", icon: Home },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "landing", label: "Home", labelZh: "首页", icon: Home },
Line 41:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "dashboard", label: "Executive", labelZh: "总览", icon: LayoutDashboard },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "dashboard", label: "Executive", labelZh: "总览", icon: LayoutDashboard },
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "planForecast", label: "Plan & Forecast", labelZh: "计划预测", icon: CalendarClock },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "planForecast", label: "Plan & Forecast", labelZh: "计划预测", icon: CalendarClock },
Line 43:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "coreNonCore", label: "Core / Non-Core", labelZh: "核心非核心", icon: Boxes },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "coreNonCore", label: "Core / Non-Core", labelZh: "核心非核心", icon: Boxes },
Line 44:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "capacity", label: "Capacity", labelZh: "容量", icon: Gauge },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "capacity", label: "Capacity", labelZh: "容量", icon: Gauge },
Line 45:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "efficiency", label: "Efficiency", labelZh: "效率", icon: TrendingUp },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "efficiency", label: "Efficiency", labelZh: "效率", icon: TrendingUp },
Line 46:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "checkIn", label: "Daily Check-in", labelZh: "每日记录", icon: SlidersHorizontal },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "checkIn", label: "Daily Check-in", labelZh: "每日记录", icon: SlidersHorizontal },
Line 47:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "trends", label: "Trends", labelZh: "趋势", icon: LineChart },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "trends", label: "Trends", labelZh: "趋势", icon: LineChart },
Line 48:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "weeklyReview", label: "Weekly Review", labelZh: "每周复盘", icon: BarChart3 },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "weeklyReview", label: "Weekly Review", labelZh: "每周复盘", icon: BarChart3 },
Line 49:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "settings", label: "Settings", labelZh: "设置", icon: Settings },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "settings", label: "Settings", labelZh: "设置", icon: Settings },
Line 50:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ];
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：];
Line 52:
EN: Exports the default React component for this file. Code: export default function App() {
中文：导出本文件的默认 React 组件。 代码：export default function App() {
Line 53:
EN: Declares a local constant used by the component rendering logic. Code: const [currentPage, setCurrentPage] = useState<PageKey>("landing");
中文：声明组件渲染逻辑会用到的本地常量。 代码：const [currentPage, setCurrentPage] = useState<PageKey>("landing");
Line 55:
EN: Runs a React effect for page-level behavior. Code: useEffect(() => {
中文：运行 React effect，处理页面级行为。 代码：useEffect(() => {
Line 56:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: window.scrollTo({ top: 0, left: 0 });
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：window.scrollTo({ top: 0, left: 0 });
Line 57:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }, [currentPage]);
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}, [currentPage]);
Line 59:
EN: Declares a local constant used by the component rendering logic. Code: const pages: Record<PageKey, JSX.Element> = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const pages: Record<PageKey, JSX.Element> = {
Line 60:
EN: Defines one field on a TypeScript object shape. Code: landing: <LandingPage onOpenDashboard={() => setCurrentPage("dashboard")} />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：landing: <LandingPage onOpenDashboard={() => setCurrentPage("dashboard")} />,
Line 61:
EN: Defines one field on a TypeScript object shape. Code: dashboard: <ExecutiveDashboardPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：dashboard: <ExecutiveDashboardPage />,
Line 62:
EN: Defines one field on a TypeScript object shape. Code: planForecast: <PlanForecastPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：planForecast: <PlanForecastPage />,
Line 63:
EN: Defines one field on a TypeScript object shape. Code: coreNonCore: <CoreNonCorePage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：coreNonCore: <CoreNonCorePage />,
Line 64:
EN: Defines one field on a TypeScript object shape. Code: capacity: <CapacityPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：capacity: <CapacityPage />,
Line 65:
EN: Defines one field on a TypeScript object shape. Code: efficiency: <EfficiencyProductivityPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：efficiency: <EfficiencyProductivityPage />,
Line 66:
EN: Defines one field on a TypeScript object shape. Code: checkIn: <DailyCheckInPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：checkIn: <DailyCheckInPage />,
Line 67:
EN: Defines one field on a TypeScript object shape. Code: trends: <TrendsPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：trends: <TrendsPage />,
Line 68:
EN: Defines one field on a TypeScript object shape. Code: weeklyReview: <WeeklyReviewPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：weeklyReview: <WeeklyReviewPage />,
Line 69:
EN: Defines one field on a TypeScript object shape. Code: settings: <SettingsPage />,
中文：定义 TypeScript 对象结构中的一个字段。 代码：settings: <SettingsPage />,
Line 70:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 72:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 73:
EN: Opens a JSX element or component in the UI layout. Code: <AppShell
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<AppShell
Line 74:
EN: Passes a prop or HTML attribute into the JSX element. Code: navItems={navItems}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：navItems={navItems}
Line 75:
EN: Passes a prop or HTML attribute into the JSX element. Code: currentPage={currentPage}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：currentPage={currentPage}
Line 76:
EN: Passes a prop or HTML attribute into the JSX element. Code: onNavigate={setCurrentPage}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：onNavigate={setCurrentPage}
Line 77:
EN: Passes a prop or HTML attribute into the JSX element. Code: immersive={currentPage === "landing"}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：immersive={currentPage === "landing"}
Line 78:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 79:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {pages[currentPage]}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{pages[currentPage]}
Line 80:
EN: Closes a JSX element opened earlier in the layout. Code: </AppShell>
中文：关闭前面打开的 JSX 元素。 代码：</AppShell>
Line 81:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 82:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  Gauge,
  Home,
  LayoutDashboard,
  LineChart,
  Settings,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "./components/AppShell";
import type { NavItem } from "./components/Sidebar";
import { CapacityPage } from "./pages/CapacityPage";
import { CoreNonCorePage } from "./pages/CoreNonCorePage";
import { DailyCheckInPage } from "./pages/DailyCheckInPage";
import { EfficiencyProductivityPage } from "./pages/EfficiencyProductivityPage";
import { ExecutiveDashboardPage } from "./pages/ExecutiveDashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { PlanForecastPage } from "./pages/PlanForecastPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TrendsPage } from "./pages/TrendsPage";
import { WeeklyReviewPage } from "./pages/WeeklyReviewPage";

type PageKey =
  | "landing"
  | "dashboard"
  | "planForecast"
  | "coreNonCore"
  | "capacity"
  | "efficiency"
  | "checkIn"
  | "trends"
  | "weeklyReview"
  | "settings";

const navItems: NavItem<PageKey>[] = [
  { key: "landing", label: "Home", labelZh: "首页", icon: Home },
  { key: "dashboard", label: "Executive", labelZh: "总览", icon: LayoutDashboard },
  { key: "planForecast", label: "Plan & Forecast", labelZh: "计划预测", icon: CalendarClock },
  { key: "coreNonCore", label: "Core / Non-Core", labelZh: "核心非核心", icon: Boxes },
  { key: "capacity", label: "Capacity", labelZh: "容量", icon: Gauge },
  { key: "efficiency", label: "Efficiency", labelZh: "效率", icon: TrendingUp },
  { key: "checkIn", label: "Daily Check-in", labelZh: "每日记录", icon: SlidersHorizontal },
  { key: "trends", label: "Trends", labelZh: "趋势", icon: LineChart },
  { key: "weeklyReview", label: "Weekly Review", labelZh: "每周复盘", icon: BarChart3 },
  { key: "settings", label: "Settings", labelZh: "设置", icon: Settings },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("landing");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, [currentPage]);

  const pages: Record<PageKey, JSX.Element> = {
    landing: <LandingPage onOpenDashboard={() => setCurrentPage("dashboard")} />,
    dashboard: <ExecutiveDashboardPage />,
    planForecast: <PlanForecastPage />,
    coreNonCore: <CoreNonCorePage />,
    capacity: <CapacityPage />,
    efficiency: <EfficiencyProductivityPage />,
    checkIn: <DailyCheckInPage />,
    trends: <TrendsPage />,
    weeklyReview: <WeeklyReviewPage />,
    settings: <SettingsPage />,
  };

  return (
    <AppShell
      navItems={navItems}
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      immersive={currentPage === "landing"}
    >
      {pages[currentPage]}
    </AppShell>
  );
}
