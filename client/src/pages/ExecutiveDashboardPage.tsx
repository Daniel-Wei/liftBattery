/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/ExecutiveDashboardPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Activity, BatteryMedium, Dumbbell, Gauge, LineChart, Target, TrendingUp } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Activity, BatteryMedium, Dumbbell, Gauge, LineChart, Target, TrendingUp } from "lucide-react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { CoreNonCorePanel } from "../components/CoreNonCorePanel";
中文：导入本 React 文件运行时需要的依赖。 代码：import { CoreNonCorePanel } from "../components/CoreNonCorePanel";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { ForecastRiskCard } from "../components/ForecastRiskCard";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ForecastRiskCard } from "../components/ForecastRiskCard";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { MetricCard } from "../components/MetricCard";
中文：导入本 React 文件运行时需要的依赖。 代码：import { MetricCard } from "../components/MetricCard";
Line 5:
EN: Imports a runtime dependency used by this React file. Code: import { MultiMetricChart } from "../components/MultiMetricChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { MultiMetricChart } from "../components/MultiMetricChart";
Line 6:
EN: Imports a runtime dependency used by this React file. Code: import { PlanUtilisationPanel } from "../components/PlanUtilisationPanel";
中文：导入本 React 文件运行时需要的依赖。 代码：import { PlanUtilisationPanel } from "../components/PlanUtilisationPanel";
Line 7:
EN: Imports a runtime dependency used by this React file. Code: import { PrepTimelineGantt } from "../components/PrepTimelineGantt";
中文：导入本 React 文件运行时需要的依赖。 代码：import { PrepTimelineGantt } from "../components/PrepTimelineGantt";
Line 8:
EN: Imports a runtime dependency used by this React file. Code: import { RecoveryCapacityPanel } from "../components/RecoveryCapacityPanel";
中文：导入本 React 文件运行时需要的依赖。 代码：import { RecoveryCapacityPanel } from "../components/RecoveryCapacityPanel";
Line 9:
EN: Imports a runtime dependency used by this React file. Code: import { TrainingModeCard } from "../components/TrainingModeCard";
中文：导入本 React 文件运行时需要的依赖。 代码：import { TrainingModeCard } from "../components/TrainingModeCard";
Line 10:
EN: Imports a runtime dependency used by this React file. Code: import {
中文：导入本 React 文件运行时需要的依赖。 代码：import {
Line 11:
EN: Reads static mock data for the Phase 1 UI. Code: mockCapacity,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockCapacity,
Line 12:
EN: Reads static mock data for the Phase 1 UI. Code: mockCoreWorkPlans,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockCoreWorkPlans,
Line 13:
EN: Reads static mock data for the Phase 1 UI. Code: mockOpsMetrics,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockOpsMetrics,
Line 14:
EN: Reads static mock data for the Phase 1 UI. Code: mockRiskWatches,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockRiskWatches,
Line 15:
EN: Reads static mock data for the Phase 1 UI. Code: mockSupportLoadPlans,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockSupportLoadPlans,
Line 16:
EN: Reads static mock data for the Phase 1 UI. Code: mockTrainingBlock,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockTrainingBlock,
Line 17:
EN: Reads static mock data for the Phase 1 UI. Code: mockTrainingMode,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockTrainingMode,
Line 18:
EN: Reads static mock data for the Phase 1 UI. Code: mockTrainingPhases,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockTrainingPhases,
Line 19:
EN: Reads static mock data for the Phase 1 UI. Code: mockTrendData,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockTrendData,
Line 20:
EN: Reads static mock data for the Phase 1 UI. Code: mockUtilisation,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockUtilisation,
Line 21:
EN: Reads static mock data for the Phase 1 UI. Code: } from "../data/mockData";
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：} from "../data/mockData";
Line 23:
EN: Declares a local constant used by the component rendering logic. Code: const icons = [Dumbbell, Gauge, BatteryMedium, Activity, LineChart, Target, TrendingUp];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const icons = [Dumbbell, Gauge, BatteryMedium, Activity, LineChart, Target, TrendingUp];
Line 25:
EN: Exports a reusable React component or page component. Code: export function ExecutiveDashboardPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function ExecutiveDashboardPage() {
Line 26:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Executive dashboard / 总览 Dashboard</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Executive dashboard / 总览 Dashboard</p>
Line 31:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">{mockTrainingBlock.name}</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">{mockTrainingBlock.name}</h1>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-slate-500">
Line 33:
EN: Reads static mock data for the Phase 1 UI. Code: Week {mockTrainingBlock.currentWeek} · {mockTrainingBlock.currentPhase} · {mockTrainingBlock.nameZh}
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：Week {mockTrainingBlock.currentWeek} · {mockTrainingBlock.currentPhase} · {mockTrainingBlock.nameZh}
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 36:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 38:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
Line 39:
EN: Iterates over mock data to render repeated UI elements. Code: {mockOpsMetrics.slice(0, 4).map((metric, index) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockOpsMetrics.slice(0, 4).map((metric, index) => {
Line 40:
EN: Declares a local constant used by the component rendering logic. Code: const Icon = icons[index];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const Icon = icons[index];
Line 41:
EN: Returns a compact JSX element directly. Code: return <MetricCard key={metric.id} metric={metric} icon={<Icon size={18} />} compact />;
中文：直接返回一个紧凑的 JSX 元素。 代码：return <MetricCard key={metric.id} metric={metric} icon={<Icon size={18} />} compact />;
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
Line 46:
EN: Renders a self-closing JSX component or element. Code: <CoreNonCorePanel core={mockCoreWorkPlans} support={mockSupportLoadPlans} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CoreNonCorePanel core={mockCoreWorkPlans} support={mockSupportLoadPlans} />
Line 47:
EN: Renders a self-closing JSX component or element. Code: <RecoveryCapacityPanel capacity={mockCapacity} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<RecoveryCapacityPanel capacity={mockCapacity} />
Line 48:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 50:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
Line 51:
EN: Renders a self-closing JSX component or element. Code: <PlanUtilisationPanel utilisation={mockUtilisation} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<PlanUtilisationPanel utilisation={mockUtilisation} />
Line 52:
EN: Opens a JSX element or component in the UI layout. Code: <MultiMetricChart
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<MultiMetricChart
Line 53:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Operations trend"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Operations trend"
Line 54:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="训练运营趋势"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="训练运营趋势"
Line 55:
EN: Passes a prop or HTML attribute into the JSX element. Code: data={mockTrendData}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：data={mockTrendData}
Line 56:
EN: Passes a prop or HTML attribute into the JSX element. Code: lines={[
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：lines={[
Line 57:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "trainingLoad", name: "Load", color: "#0f172a" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "trainingLoad", name: "Load", color: "#0f172a" },
Line 58:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "recoveryCapacity", name: "Capacity", color: "#10b981" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "recoveryCapacity", name: "Capacity", color: "#10b981" },
Line 59:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "efficiency", name: "Efficiency proxy", color: "#8b5cf6" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "efficiency", name: "Efficiency proxy", color: "#8b5cf6" },
Line 60:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "performance", name: "Performance", color: "#0284c7" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "performance", name: "Performance", color: "#0284c7" },
Line 61:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ]}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：]}
Line 62:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 63:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 65:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
Line 66:
EN: Opens a JSX element or component in the UI layout. Code: <PrepTimelineGantt
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<PrepTimelineGantt
Line 67:
EN: Passes a prop or HTML attribute into the JSX element. Code: phases={mockTrainingPhases}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：phases={mockTrainingPhases}
Line 68:
EN: Passes a prop or HTML attribute into the JSX element. Code: currentWeek={mockTrainingBlock.currentWeek}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：currentWeek={mockTrainingBlock.currentWeek}
Line 69:
EN: Passes a prop or HTML attribute into the JSX element. Code: totalWeeks={mockTrainingBlock.totalWeeks}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：totalWeeks={mockTrainingBlock.totalWeeks}
Line 70:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 71:
EN: Opens a JSX element or component in the UI layout. Code: <TrainingModeCard
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<TrainingModeCard
Line 72:
EN: Passes a prop or HTML attribute into the JSX element. Code: mode={mockTrainingMode.mode}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：mode={mockTrainingMode.mode}
Line 73:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Today: Maintain"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Today: Maintain"
Line 74:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="今日：维持"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="今日：维持"
Line 75:
EN: Passes a prop or HTML attribute into the JSX element. Code: description={mockTrainingMode.reason}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：description={mockTrainingMode.reason}
Line 76:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: active
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：active
Line 77:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 78:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 80:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 lg:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 lg:grid-cols-3">
Line 81:
EN: Iterates over mock data to render repeated UI elements. Code: {mockRiskWatches.map((risk) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockRiskWatches.map((risk) => (
Line 82:
EN: Renders a self-closing JSX component or element. Code: <ForecastRiskCard key={risk.id} risk={risk} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<ForecastRiskCard key={risk.id} risk={risk} />
Line 83:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 84:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 85:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 86:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 87:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { Activity, BatteryMedium, Dumbbell, Gauge, LineChart, Target, TrendingUp } from "lucide-react";
import { CoreNonCorePanel } from "../components/CoreNonCorePanel";
import { ForecastRiskCard } from "../components/ForecastRiskCard";
import { MetricCard } from "../components/MetricCard";
import { MultiMetricChart } from "../components/MultiMetricChart";
import { PlanUtilisationPanel } from "../components/PlanUtilisationPanel";
import { PrepTimelineGantt } from "../components/PrepTimelineGantt";
import { RecoveryCapacityPanel } from "../components/RecoveryCapacityPanel";
import { TrainingModeCard } from "../components/TrainingModeCard";
import {
  mockCapacity,
  mockCoreWorkPlans,
  mockOpsMetrics,
  mockRiskWatches,
  mockSupportLoadPlans,
  mockTrainingBlock,
  mockTrainingMode,
  mockTrainingPhases,
  mockTrendData,
  mockUtilisation,
} from "../data/mockData";

const icons = [Dumbbell, Gauge, BatteryMedium, Activity, LineChart, Target, TrendingUp];

export function ExecutiveDashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Executive dashboard / 总览 Dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">{mockTrainingBlock.name}</h1>
          <p className="mt-2 text-slate-500">
            Week {mockTrainingBlock.currentWeek} · {mockTrainingBlock.currentPhase} · {mockTrainingBlock.nameZh}
          </p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {mockOpsMetrics.slice(0, 4).map((metric, index) => {
          const Icon = icons[index];
          return <MetricCard key={metric.id} metric={metric} icon={<Icon size={18} />} compact />;
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <CoreNonCorePanel core={mockCoreWorkPlans} support={mockSupportLoadPlans} />
        <RecoveryCapacityPanel capacity={mockCapacity} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <PlanUtilisationPanel utilisation={mockUtilisation} />
        <MultiMetricChart
          title="Operations trend"
          titleZh="训练运营趋势"
          data={mockTrendData}
          lines={[
            { key: "trainingLoad", name: "Load", color: "#0f172a" },
            { key: "recoveryCapacity", name: "Capacity", color: "#10b981" },
            { key: "efficiency", name: "Efficiency proxy", color: "#8b5cf6" },
            { key: "performance", name: "Performance", color: "#0284c7" },
          ]}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.85fr]">
        <PrepTimelineGantt
          phases={mockTrainingPhases}
          currentWeek={mockTrainingBlock.currentWeek}
          totalWeeks={mockTrainingBlock.totalWeeks}
        />
        <TrainingModeCard
          mode={mockTrainingMode.mode}
          title="Today: Maintain"
          titleZh="今日：维持"
          description={mockTrainingMode.reason}
          active
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {mockRiskWatches.map((risk) => (
          <ForecastRiskCard key={risk.id} risk={risk} />
        ))}
      </section>
    </div>
  );
}
