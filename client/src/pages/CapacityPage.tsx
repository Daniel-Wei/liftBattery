/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/CapacityPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { RecoveryCapacityPanel } from "../components/RecoveryCapacityPanel";
中文：导入本 React 文件运行时需要的依赖。 代码：import { RecoveryCapacityPanel } from "../components/RecoveryCapacityPanel";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { TrendLineChart } from "../components/TrendLineChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { TrendLineChart } from "../components/TrendLineChart";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { mockCapacity, mockTrendData, mockWellnessCheckIns } from "../data/mockData";
中文：导入本 React 文件运行时需要的依赖。 代码：import { mockCapacity, mockTrendData, mockWellnessCheckIns } from "../data/mockData";
Line 5:
EN: Declares a local constant used by the component rendering logic. Code: const latest = mockWellnessCheckIns[mockWellnessCheckIns.length - 1];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const latest = mockWellnessCheckIns[mockWellnessCheckIns.length - 1];
Line 7:
EN: Exports a reusable React component or page component. Code: export function CapacityPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function CapacityPage() {
Line 8:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 9:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 10:
EN: Opens a JSX element or component in the UI layout. Code: <header>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header>
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Capacity / 容量</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Capacity / 容量</p>
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Recovery capacity as a proxy, not a verdict.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Recovery capacity as a proxy, not a verdict.</h1>
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 max-w-2xl text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 max-w-2xl text-slate-500">
Line 14:
EN: Reads static mock data for the Phase 1 UI. Code: Uses mock wellness self-report dimensions: fatigue, sleep, soreness, stress, hunger, mood, and drive.
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：Uses mock wellness self-report dimensions: fatigue, sleep, soreness, stress, hunger, mood, and drive.
Line 15:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 16:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 18:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
Line 19:
EN: Renders a self-closing JSX component or element. Code: <RecoveryCapacityPanel capacity={mockCapacity} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<RecoveryCapacityPanel capacity={mockCapacity} />
Line 20:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Capacity trend" titleZh="容量趋势" data={mockTrendData} dataKey="recoveryCapacity" color="#10b981" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Capacity trend" titleZh="容量趋势" data={mockTrendData} dataKey="recoveryCapacity" color="#10b981" />
Line 21:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
Line 24:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {[
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{[
Line 25:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Fatigue", "疲劳", latest.fatigue],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Fatigue", "疲劳", latest.fatigue],
Line 26:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Sleep", "睡眠", latest.sleepQuality],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Sleep", "睡眠", latest.sleepQuality],
Line 27:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Soreness", "酸痛", latest.soreness],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Soreness", "酸痛", latest.soreness],
Line 28:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Stress", "压力", latest.stress],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Stress", "压力", latest.stress],
Line 29:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Hunger", "饥饿", latest.hunger],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Hunger", "饥饿", latest.hunger],
Line 30:
EN: Iterates over mock data to render repeated UI elements. Code: ].map(([label, zh, value]) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：].map(([label, zh, value]) => (
Line 31:
EN: Opens a JSX element or component in the UI layout. Code: <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
Line 33:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs text-slate-400">{zh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs text-slate-400">{zh}</p>
Line 34:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-4 text-3xl font-black text-slate-950">{value}/5</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-4 text-3xl font-black text-slate-950">{value}/5</p>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 36:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 38:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 39:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 40:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { RecoveryCapacityPanel } from "../components/RecoveryCapacityPanel";
import { TrendLineChart } from "../components/TrendLineChart";
import { mockCapacity, mockTrendData, mockWellnessCheckIns } from "../data/mockData";

const latest = mockWellnessCheckIns[mockWellnessCheckIns.length - 1];

export function CapacityPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Capacity / 容量</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Recovery capacity as a proxy, not a verdict.</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Uses mock wellness self-report dimensions: fatigue, sleep, soreness, stress, hunger, mood, and drive.
        </p>
      </header>

      <section className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <RecoveryCapacityPanel capacity={mockCapacity} />
        <TrendLineChart title="Capacity trend" titleZh="容量趋势" data={mockTrendData} dataKey="recoveryCapacity" color="#10b981" />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Fatigue", "疲劳", latest.fatigue],
          ["Sleep", "睡眠", latest.sleepQuality],
          ["Soreness", "酸痛", latest.soreness],
          ["Stress", "压力", latest.stress],
          ["Hunger", "饥饿", latest.hunger],
        ].map(([label, zh, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="text-xs text-slate-400">{zh}</p>
            <p className="mt-4 text-3xl font-black text-slate-950">{value}/5</p>
          </article>
        ))}
      </section>
    </div>
  );
}
