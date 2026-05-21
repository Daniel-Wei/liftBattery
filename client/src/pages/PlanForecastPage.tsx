/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/PlanForecastPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { CalendarClock } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { CalendarClock } from "lucide-react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "../components/EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "../components/EvidenceNote";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { ForecastRiskCard } from "../components/ForecastRiskCard";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ForecastRiskCard } from "../components/ForecastRiskCard";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { MultiMetricChart } from "../components/MultiMetricChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { MultiMetricChart } from "../components/MultiMetricChart";
Line 5:
EN: Imports a runtime dependency used by this React file. Code: import { PlanUtilisationPanel } from "../components/PlanUtilisationPanel";
中文：导入本 React 文件运行时需要的依赖。 代码：import { PlanUtilisationPanel } from "../components/PlanUtilisationPanel";
Line 6:
EN: Imports a runtime dependency used by this React file. Code: import {
中文：导入本 React 文件运行时需要的依赖。 代码：import {
Line 7:
EN: Reads static mock data for the Phase 1 UI. Code: mockForecastData,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockForecastData,
Line 8:
EN: Reads static mock data for the Phase 1 UI. Code: mockRiskWatches,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockRiskWatches,
Line 9:
EN: Reads static mock data for the Phase 1 UI. Code: mockTrainingBlock,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockTrainingBlock,
Line 10:
EN: Reads static mock data for the Phase 1 UI. Code: mockUtilisation,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockUtilisation,
Line 11:
EN: Reads static mock data for the Phase 1 UI. Code: } from "../data/mockData";
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：} from "../data/mockData";
Line 13:
EN: Exports a reusable React component or page component. Code: export function PlanForecastPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function PlanForecastPage() {
Line 14:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 16:
EN: Opens a JSX element or component in the UI layout. Code: <header>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header>
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Plan & Forecast / 计划与预测</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Plan & Forecast / 计划与预测</p>
Line 18:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Plan the week. Watch the trend.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Plan the week. Watch the trend.</h1>
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-slate-500">
Line 20:
EN: Reads static mock data for the Phase 1 UI. Code: {mockTrainingBlock.currentPhase} · Week {mockTrainingBlock.currentWeek}
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：{mockTrainingBlock.currentPhase} · Week {mockTrainingBlock.currentWeek}
Line 21:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 22:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
Line 25:
EN: Renders a self-closing JSX component or element. Code: <PlanUtilisationPanel utilisation={mockUtilisation} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<PlanUtilisationPanel utilisation={mockUtilisation} />
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <MultiMetricChart
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<MultiMetricChart
Line 27:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="7-day forecast"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="7-day forecast"
Line 28:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="7 天趋势估计"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="7 天趋势估计"
Line 29:
EN: Passes a prop or HTML attribute into the JSX element. Code: data={mockForecastData}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：data={mockForecastData}
Line 30:
EN: Passes a prop or HTML attribute into the JSX element. Code: lines={[
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：lines={[
Line 31:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "plannedLoad", name: "Planned load", color: "#0f172a" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "plannedLoad", name: "Planned load", color: "#0f172a" },
Line 32:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "forecastLoad", name: "Forecast load", color: "#0284c7" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "forecastLoad", name: "Forecast load", color: "#0284c7" },
Line 33:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "fatigueForecast", name: "Fatigue watch", color: "#f59e0b" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "fatigueForecast", name: "Fatigue watch", color: "#f59e0b" },
Line 34:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "recoveryForecast", name: "Recovery estimate", color: "#10b981" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "recoveryForecast", name: "Recovery estimate", color: "#10b981" },
Line 35:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ]}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：]}
Line 36:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 lg:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 lg:grid-cols-3">
Line 40:
EN: Iterates over mock data to render repeated UI elements. Code: {mockRiskWatches.map((risk) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockRiskWatches.map((risk) => (
Line 41:
EN: Renders a self-closing JSX component or element. Code: <ForecastRiskCard key={risk.id} risk={risk} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<ForecastRiskCard key={risk.id} risk={risk} />
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote
Line 46:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="watch"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="watch"
Line 47:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Forecast boundary"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Forecast boundary"
Line 48:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="预测边界"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="预测边界"
Line 49:
EN: Passes a prop or HTML attribute into the JSX element. Code: childrenZh="Forecast 是趋势观察，不是确定性预测，也不是医学或恢复诊断。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：childrenZh="Forecast 是趋势观察，不是确定性预测，也不是医学或恢复诊断。"
Line 50:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 51:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Forecast is a trend watch, not a deterministic prediction and not a medical or recovery diagnosis.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Forecast is a trend watch, not a deterministic prediction and not a medical or recovery diagnosis.
Line 52:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 54:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 55:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-3">
Line 56:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
Line 57:
EN: Renders a self-closing JSX component or element. Code: <CalendarClock size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CalendarClock size={18} />
Line 58:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 59:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 60:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Weekly plan / 每周计划</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Weekly plan / 每周计划</h2>
Line 61:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">Static plan preview only. Phase 2 can make this editable.</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">Static plan preview only. Phase 2 can make this editable.</p>
Line 62:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 63:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 64:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 65:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 66:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 67:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { CalendarClock } from "lucide-react";
import { EvidenceNote } from "../components/EvidenceNote";
import { ForecastRiskCard } from "../components/ForecastRiskCard";
import { MultiMetricChart } from "../components/MultiMetricChart";
import { PlanUtilisationPanel } from "../components/PlanUtilisationPanel";
import {
  mockForecastData,
  mockRiskWatches,
  mockTrainingBlock,
  mockUtilisation,
} from "../data/mockData";

export function PlanForecastPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Plan & Forecast / 计划与预测</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Plan the week. Watch the trend.</h1>
        <p className="mt-2 text-slate-500">
          {mockTrainingBlock.currentPhase} · Week {mockTrainingBlock.currentWeek}
        </p>
      </header>

      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <PlanUtilisationPanel utilisation={mockUtilisation} />
        <MultiMetricChart
          title="7-day forecast"
          titleZh="7 天趋势估计"
          data={mockForecastData}
          lines={[
            { key: "plannedLoad", name: "Planned load", color: "#0f172a" },
            { key: "forecastLoad", name: "Forecast load", color: "#0284c7" },
            { key: "fatigueForecast", name: "Fatigue watch", color: "#f59e0b" },
            { key: "recoveryForecast", name: "Recovery estimate", color: "#10b981" },
          ]}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {mockRiskWatches.map((risk) => (
          <ForecastRiskCard key={risk.id} risk={risk} />
        ))}
      </section>

      <EvidenceNote
        type="watch"
        title="Forecast boundary"
        titleZh="预测边界"
        childrenZh="Forecast 是趋势观察，不是确定性预测，也不是医学或恢复诊断。"
      >
        Forecast is a trend watch, not a deterministic prediction and not a medical or recovery diagnosis.
      </EvidenceNote>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <CalendarClock size={18} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-950">Weekly plan / 每周计划</h2>
            <p className="text-sm text-slate-500">Static plan preview only. Phase 2 can make this editable.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
