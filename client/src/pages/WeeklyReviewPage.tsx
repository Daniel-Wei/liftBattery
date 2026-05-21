/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/WeeklyReviewPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { WeeklyReviewCard } from "../components/WeeklyReviewCard";
中文：导入本 React 文件运行时需要的依赖。 代码：import { WeeklyReviewCard } from "../components/WeeklyReviewCard";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { ForecastRiskCard } from "../components/ForecastRiskCard";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ForecastRiskCard } from "../components/ForecastRiskCard";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "../components/EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "../components/EvidenceNote";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { mockRiskWatches, mockWeeklyReview } from "../data/mockData";
中文：导入本 React 文件运行时需要的依赖。 代码：import { mockRiskWatches, mockWeeklyReview } from "../data/mockData";
Line 6:
EN: Exports a reusable React component or page component. Code: export function WeeklyReviewPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function WeeklyReviewPage() {
Line 7:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 8:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 9:
EN: Opens a JSX element or component in the UI layout. Code: <header>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header>
Line 10:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Weekly Review / 每周复盘</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Weekly Review / 每周复盘</p>
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Run the weekly operating review.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Run the weekly operating review.</h1>
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 max-w-2xl text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 max-w-2xl text-slate-500">
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Summarize core utilisation, support ratio, capacity change, risk watch changes, and next-week review focus.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Summarize core utilisation, support ratio, capacity change, risk watch changes, and next-week review focus.
Line 14:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 15:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 17:
EN: Renders a self-closing JSX component or element. Code: <WeeklyReviewCard review={mockWeeklyReview} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<WeeklyReviewCard review={mockWeeklyReview} />
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 lg:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 lg:grid-cols-3">
Line 20:
EN: Iterates over mock data to render repeated UI elements. Code: {mockRiskWatches.map((risk) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockRiskWatches.map((risk) => (
Line 21:
EN: Renders a self-closing JSX component or element. Code: <ForecastRiskCard key={risk.id} risk={risk} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<ForecastRiskCard key={risk.id} risk={risk} />
Line 22:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 23:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote
Line 26:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="watch"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="watch"
Line 27:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Review language"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Review language"
Line 28:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="复盘语言"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="复盘语言"
Line 29:
EN: Passes a prop or HTML attribute into the JSX element. Code: childrenZh="每周复盘应保持趋势和观察语言，不把 risk watch 写成医学结论。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：childrenZh="每周复盘应保持趋势和观察语言，不把 risk watch 写成医学结论。"
Line 30:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 31:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Weekly review should use trend and watch language, not convert risk watches into medical conclusions.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Weekly review should use trend and watch language, not convert risk watches into medical conclusions.
Line 32:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 33:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 34:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 35:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { WeeklyReviewCard } from "../components/WeeklyReviewCard";
import { ForecastRiskCard } from "../components/ForecastRiskCard";
import { EvidenceNote } from "../components/EvidenceNote";
import { mockRiskWatches, mockWeeklyReview } from "../data/mockData";

export function WeeklyReviewPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Weekly Review / 每周复盘</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Run the weekly operating review.</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Summarize core utilisation, support ratio, capacity change, risk watch changes, and next-week review focus.
        </p>
      </header>

      <WeeklyReviewCard review={mockWeeklyReview} />

      <section className="grid gap-4 lg:grid-cols-3">
        {mockRiskWatches.map((risk) => (
          <ForecastRiskCard key={risk.id} risk={risk} />
        ))}
      </section>

      <EvidenceNote
        type="watch"
        title="Review language"
        titleZh="复盘语言"
        childrenZh="每周复盘应保持趋势和观察语言，不把 risk watch 写成医学结论。"
      >
        Weekly review should use trend and watch language, not convert risk watches into medical conclusions.
      </EvidenceNote>
    </div>
  );
}
