/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/EfficiencyProductivityPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "../components/EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "../components/EvidenceNote";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { MultiMetricChart } from "../components/MultiMetricChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { MultiMetricChart } from "../components/MultiMetricChart";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { TrendLineChart } from "../components/TrendLineChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { TrendLineChart } from "../components/TrendLineChart";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { mockEfficiency, mockTrendData } from "../data/mockData";
中文：导入本 React 文件运行时需要的依赖。 代码：import { mockEfficiency, mockTrendData } from "../data/mockData";
Line 6:
EN: Exports a reusable React component or page component. Code: export function EfficiencyProductivityPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function EfficiencyProductivityPage() {
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
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Efficiency & Productivity / 效率与生产率</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Efficiency & Productivity / 效率与生产率</p>
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Output relative to fatigue cost.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Output relative to fatigue cost.</h1>
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 max-w-2xl text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 max-w-2xl text-slate-500">
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: These are proxy and heuristic views. They do not measure muscle growth directly.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：These are proxy and heuristic views. They do not measure muscle growth directly.
Line 14:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 15:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 sm:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 sm:grid-cols-3">
Line 18:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {[
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{[
Line 19:
EN: Reads static mock data for the Phase 1 UI. Code: ["Efficiency Proxy", "效率 Proxy", mockEfficiency.efficiencyProxy],
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：["Efficiency Proxy", "效率 Proxy", mockEfficiency.efficiencyProxy],
Line 20:
EN: Reads static mock data for the Phase 1 UI. Code: ["Productivity Trend", "生产率趋势", mockEfficiency.productivityTrend],
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：["Productivity Trend", "生产率趋势", mockEfficiency.productivityTrend],
Line 21:
EN: Reads static mock data for the Phase 1 UI. Code: ["Fatigue Cost", "疲劳成本", mockEfficiency.fatigueCost],
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：["Fatigue Cost", "疲劳成本", mockEfficiency.fatigueCost],
Line 22:
EN: Iterates over mock data to render repeated UI elements. Code: ].map(([label, zh, value]) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：].map(([label, zh, value]) => (
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs text-slate-400">{zh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs text-slate-400">{zh}</p>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-4 text-4xl font-black text-slate-950">{value}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-4 text-4xl font-black text-slate-950">{value}</p>
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-xs font-bold text-amber-700">proxy / heuristic</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-xs font-bold text-amber-700">proxy / heuristic</p>
Line 28:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 29:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <MultiMetricChart
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<MultiMetricChart
Line 33:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Proxy comparison"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Proxy comparison"
Line 34:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="Proxy 对比"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="Proxy 对比"
Line 35:
EN: Passes a prop or HTML attribute into the JSX element. Code: data={mockTrendData}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：data={mockTrendData}
Line 36:
EN: Passes a prop or HTML attribute into the JSX element. Code: lines={[
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：lines={[
Line 37:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "efficiency", name: "Efficiency proxy", color: "#8b5cf6" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "efficiency", name: "Efficiency proxy", color: "#8b5cf6" },
Line 38:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "productivity", name: "Productivity trend", color: "#10b981" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "productivity", name: "Productivity trend", color: "#10b981" },
Line 39:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "fatigue", name: "Fatigue cost", color: "#f59e0b" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "fatigue", name: "Fatigue cost", color: "#f59e0b" },
Line 40:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "performance", name: "Performance", color: "#0284c7" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "performance", name: "Performance", color: "#0284c7" },
Line 41:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ]}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：]}
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 44:
EN: Opens a JSX element or component in the UI layout. Code: <div className="grid gap-5 lg:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="grid gap-5 lg:grid-cols-2">
Line 45:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Top output trend" titleZh="有效产出趋势" data={mockTrendData} dataKey="productivity" color="#10b981" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Top output trend" titleZh="有效产出趋势" data={mockTrendData} dataKey="productivity" color="#10b981" />
Line 46:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Fatigue cost" titleZh="疲劳成本" data={mockTrendData} dataKey="fatigue" color="#f59e0b" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Fatigue cost" titleZh="疲劳成本" data={mockTrendData} dataKey="fatigue" color="#f59e0b" />
Line 47:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote
Line 50:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="heuristic"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="heuristic"
Line 51:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Stimulus-to-fatigue boundary"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Stimulus-to-fatigue boundary"
Line 52:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="刺激疲劳比边界"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="刺激疲劳比边界"
Line 53:
EN: Passes a prop or HTML attribute into the JSX element. Code: childrenZh="这里的 Efficiency 是解释性 proxy，不是精确生理测量，也不直接测量肌肥大。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：childrenZh="这里的 Efficiency 是解释性 proxy，不是精确生理测量，也不直接测量肌肥大。"
Line 54:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 55:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Efficiency is an interpretive proxy, not exact physiology and not a direct measurement of hypertrophy.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Efficiency is an interpretive proxy, not exact physiology and not a direct measurement of hypertrophy.
Line 56:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 57:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 58:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 59:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { EvidenceNote } from "../components/EvidenceNote";
import { MultiMetricChart } from "../components/MultiMetricChart";
import { TrendLineChart } from "../components/TrendLineChart";
import { mockEfficiency, mockTrendData } from "../data/mockData";

export function EfficiencyProductivityPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Efficiency & Productivity / 效率与生产率</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Output relative to fatigue cost.</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          These are proxy and heuristic views. They do not measure muscle growth directly.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Efficiency Proxy", "效率 Proxy", mockEfficiency.efficiencyProxy],
          ["Productivity Trend", "生产率趋势", mockEfficiency.productivityTrend],
          ["Fatigue Cost", "疲劳成本", mockEfficiency.fatigueCost],
        ].map(([label, zh, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="text-xs text-slate-400">{zh}</p>
            <p className="mt-4 text-4xl font-black text-slate-950">{value}</p>
            <p className="mt-2 text-xs font-bold text-amber-700">proxy / heuristic</p>
          </article>
        ))}
      </section>

      <MultiMetricChart
        title="Proxy comparison"
        titleZh="Proxy 对比"
        data={mockTrendData}
        lines={[
          { key: "efficiency", name: "Efficiency proxy", color: "#8b5cf6" },
          { key: "productivity", name: "Productivity trend", color: "#10b981" },
          { key: "fatigue", name: "Fatigue cost", color: "#f59e0b" },
          { key: "performance", name: "Performance", color: "#0284c7" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <TrendLineChart title="Top output trend" titleZh="有效产出趋势" data={mockTrendData} dataKey="productivity" color="#10b981" />
        <TrendLineChart title="Fatigue cost" titleZh="疲劳成本" data={mockTrendData} dataKey="fatigue" color="#f59e0b" />
      </div>

      <EvidenceNote
        type="heuristic"
        title="Stimulus-to-fatigue boundary"
        titleZh="刺激疲劳比边界"
        childrenZh="这里的 Efficiency 是解释性 proxy，不是精确生理测量，也不直接测量肌肥大。"
      >
        Efficiency is an interpretive proxy, not exact physiology and not a direct measurement of hypertrophy.
      </EvidenceNote>
    </div>
  );
}
