/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/LandingPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { ArrowRight, BarChart3, Gauge, ShieldCheck } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ArrowRight, BarChart3, Gauge, ShieldCheck } from "lucide-react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "../components/StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "../components/StatusBadge";
Line 4:
EN: Declares a local TypeScript type so component props stay explicit. Code: type LandingPageProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type LandingPageProps = {
Line 5:
EN: Defines one field on a TypeScript object shape. Code: onOpenDashboard: () => void;
中文：定义 TypeScript 对象结构中的一个字段。 代码：onOpenDashboard: () => void;
Line 6:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 8:
EN: Declares a local constant used by the component rendering logic. Code: const conceptCards = [
中文：声明组件渲染逻辑会用到的本地常量。 代码：const conceptCards = [
Line 9:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Core / Non-Core", "核心 / 非核心"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Core / Non-Core", "核心 / 非核心"],
Line 10:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Plan / Forecast", "计划 / 预测"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Plan / Forecast", "计划 / 预测"],
Line 11:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Utilisation / Capacity", "使用率 / 容量"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Utilisation / Capacity", "使用率 / 容量"],
Line 12:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Efficiency / Productivity", "效率 / 生产率"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Efficiency / Productivity", "效率 / 生产率"],
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ];
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：];
Line 15:
EN: Exports a reusable React component or page component. Code: export function LandingPage({ onOpenDashboard }: LandingPageProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function LandingPage({ onOpenDashboard }: LandingPageProps) {
Line 16:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <main className="min-h-screen bg-[#070b12] px-4 py-8 text-white md:px-10 md:py-12">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<main className="min-h-screen bg-[#070b12] px-4 py-8 text-white md:px-10 md:py-12">
Line 18:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <section className="space-y-8">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="space-y-8">
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
Line 21:
EN: Renders a self-closing JSX component or element. Code: <Gauge size={16} className="text-emerald-300" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Gauge size={16} className="text-emerald-300" />
Line 22:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: LiftOps · SaaS-style training operations
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：LiftOps · SaaS-style training operations
Line 23:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="max-w-3xl text-5xl font-black leading-[1.02] md:text-7xl">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="max-w-3xl text-5xl font-black leading-[1.02] md:text-7xl">
Line 26:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Run training like an operations system.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Run training like an operations system.
Line 27:
EN: Closes a JSX element opened earlier in the layout. Code: </h1>
中文：关闭前面打开的 JSX 元素。 代码：</h1>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
Line 29:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: A SaaS-style training operations dashboard for serious lifters.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：A SaaS-style training operations dashboard for serious lifters.
Line 30:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Manage core work, support load, capacity, efficiency, productivity, and risk.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Manage core work, support load, capacity, efficiency, productivity, and risk.
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
Line 33:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: 面向认真训练者的 SaaS 风格训练运营 Dashboard。
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：面向认真训练者的 SaaS 风格训练运营 Dashboard。
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap gap-3">
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <button
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<button
Line 38:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="button"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="button"
Line 39:
EN: Passes a prop or HTML attribute into the JSX element. Code: onClick={onOpenDashboard}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：onClick={onOpenDashboard}
Line 40:
EN: Passes a prop or HTML attribute into the JSX element. Code: className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-950/40"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-950/40"
Line 41:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Open dashboard / 打开 Dashboard
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Open dashboard / 打开 Dashboard
Line 43:
EN: Renders a self-closing JSX component or element. Code: <ArrowRight size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<ArrowRight size={18} />
Line 44:
EN: Closes a JSX element opened earlier in the layout. Code: </button>
中文：关闭前面打开的 JSX 元素。 代码：</button>
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <span className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300">
Line 46:
EN: Reads static mock data for the Phase 1 UI. Code: Phase 1: static mock UI
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：Phase 1: static mock UI
Line 47:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 48:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <div className="grid gap-3 sm:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="grid gap-3 sm:grid-cols-2">
Line 50:
EN: Iterates over mock data to render repeated UI elements. Code: {conceptCards.map(([en, zh]) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{conceptCards.map(([en, zh]) => (
Line 51:
EN: Opens a JSX element or component in the UI layout. Code: <div key={en} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={en} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
Line 52:
EN: Renders a self-closing JSX component or element. Code: <ShieldCheck size={18} className="text-cyan-300" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<ShieldCheck size={18} className="text-cyan-300" />
Line 53:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 text-sm font-bold">{en}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 text-sm font-bold">{en}</p>
Line 54:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs text-slate-400">{zh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs text-slate-400">{zh}</p>
Line 55:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 56:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 57:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 58:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 60:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
Line 61:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-[1.5rem] bg-[#f4f6f8] p-4 text-slate-950">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-[1.5rem] bg-[#f4f6f8] p-4 text-slate-950">
Line 62:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap items-start justify-between gap-3">
Line 63:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 64:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Executive dashboard</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Executive dashboard</p>
Line 65:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="mt-1 text-2xl font-black">Week 9 · High Compliance Block</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="mt-1 text-2xl font-black">Week 9 · High Compliance Block</h2>
Line 66:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 67:
EN: Renders a self-closing JSX component or element. Code: <StatusBadge mode="maintain" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<StatusBadge mode="maintain" />
Line 68:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 69:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 grid gap-3 sm:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 grid gap-3 sm:grid-cols-2">
Line 70:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {[
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{[
Line 71:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Core Utilisation", "94%", "simple arithmetic"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Core Utilisation", "94%", "simple arithmetic"],
Line 72:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Support Load", "124%", "watch"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Support Load", "124%", "watch"],
Line 73:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Recovery Capacity", "63/100", "proxy"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Recovery Capacity", "63/100", "proxy"],
Line 74:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Efficiency", "71", "heuristic"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Efficiency", "71", "heuristic"],
Line 75:
EN: Iterates over mock data to render repeated UI elements. Code: ].map(([label, value, tag]) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：].map(([label, value, tag]) => (
Line 76:
EN: Opens a JSX element or component in the UI layout. Code: <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 77:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
Line 78:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 text-3xl font-black">{value}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 text-3xl font-black">{value}</p>
Line 79:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-xs font-semibold text-slate-500">{tag}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-xs font-semibold text-slate-500">{tag}</p>
Line 80:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 81:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 82:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 83:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
Line 84:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-2">
Line 85:
EN: Renders a self-closing JSX component or element. Code: <BarChart3 size={18} className="text-emerald-300" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<BarChart3 size={18} className="text-emerald-300" />
Line 86:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold">Risk forecast / 风险预测</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold">Risk forecast / 风险预测</p>
Line 87:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 88:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 grid grid-cols-7 items-end gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 grid grid-cols-7 items-end gap-2">
Line 89:
EN: Iterates over mock data to render repeated UI elements. Code: {[42, 54, 62, 70, 58, 64, 60].map((height, index) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{[42, 54, 62, 70, 58, 64, 60].map((height, index) => (
Line 90:
EN: Renders a self-closing JSX component or element. Code: <span key={index} className="rounded-t-lg bg-emerald-400" style={{ height: `${height}px` }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<span key={index} className="rounded-t-lg bg-emerald-400" style={{ height: `${height}px` }} />
Line 91:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 92:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 93:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 94:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 95:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 96:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 97:
EN: Closes a JSX element opened earlier in the layout. Code: </main>
中文：关闭前面打开的 JSX 元素。 代码：</main>
Line 98:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 99:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { ArrowRight, BarChart3, Gauge, ShieldCheck } from "lucide-react";
import { StatusBadge } from "../components/StatusBadge";

type LandingPageProps = {
  onOpenDashboard: () => void;
};

const conceptCards = [
  ["Core / Non-Core", "核心 / 非核心"],
  ["Plan / Forecast", "计划 / 预测"],
  ["Utilisation / Capacity", "使用率 / 容量"],
  ["Efficiency / Productivity", "效率 / 生产率"],
];

export function LandingPage({ onOpenDashboard }: LandingPageProps) {
  return (
    <main className="min-h-screen bg-[#070b12] px-4 py-8 text-white md:px-10 md:py-12">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
            <Gauge size={16} className="text-emerald-300" />
            LiftOps · SaaS-style training operations
          </div>
          <div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.02] md:text-7xl">
              Run training like an operations system.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A SaaS-style training operations dashboard for serious lifters.
              Manage core work, support load, capacity, efficiency, productivity, and risk.
            </p>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              面向认真训练者的 SaaS 风格训练运营 Dashboard。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOpenDashboard}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 shadow-xl shadow-emerald-950/40"
            >
              Open dashboard / 打开 Dashboard
              <ArrowRight size={18} />
            </button>
            <span className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300">
              Phase 1: static mock UI
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {conceptCards.map(([en, zh]) => (
              <div key={en} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <ShieldCheck size={18} className="text-cyan-300" />
                <p className="mt-3 text-sm font-bold">{en}</p>
                <p className="text-xs text-slate-400">{zh}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/30">
          <div className="rounded-[1.5rem] bg-[#f4f6f8] p-4 text-slate-950">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">Executive dashboard</p>
                <h2 className="mt-1 text-2xl font-black">Week 9 · High Compliance Block</h2>
              </div>
              <StatusBadge mode="maintain" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Core Utilisation", "94%", "simple arithmetic"],
                ["Support Load", "124%", "watch"],
                ["Recovery Capacity", "63/100", "proxy"],
                ["Efficiency", "71", "heuristic"],
              ].map(([label, value, tag]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-black">{value}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">{tag}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
              <div className="flex items-center gap-2">
                <BarChart3 size={18} className="text-emerald-300" />
                <p className="font-bold">Risk forecast / 风险预测</p>
              </div>
              <div className="mt-4 grid grid-cols-7 items-end gap-2">
                {[42, 54, 62, 70, 58, 64, 60].map((height, index) => (
                  <span key={index} className="rounded-t-lg bg-emerald-400" style={{ height: `${height}px` }} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
