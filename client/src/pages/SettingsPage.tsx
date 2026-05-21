/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/SettingsPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Ruler, Target, Trophy } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Ruler, Target, Trophy } from "lucide-react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "../components/EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "../components/EvidenceNote";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { EmptyState } from "../components/EmptyState";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EmptyState } from "../components/EmptyState";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { mockTrainingBlock, mockUser } from "../data/mockData";
中文：导入本 React 文件运行时需要的依赖。 代码：import { mockTrainingBlock, mockUser } from "../data/mockData";
Line 6:
EN: Declares a local constant used by the component rendering logic. Code: const modes = [
中文：声明组件渲染逻辑会用到的本地常量。 代码：const modes = [
Line 7:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Cut Mode", "减脂模式"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Cut Mode", "减脂模式"],
Line 8:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Contest Prep Mode", "备赛模式"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Contest Prep Mode", "备赛模式"],
Line 9:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Photoshoot Prep Mode", "拍摄准备模式"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Photoshoot Prep Mode", "拍摄准备模式"],
Line 10:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["High Fatigue Training Block", "高疲劳训练周期"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["High Fatigue Training Block", "高疲劳训练周期"],
Line 11:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Maintenance / Performance", "维持 / 表现模式"],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Maintenance / Performance", "维持 / 表现模式"],
Line 12:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ];
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：];
Line 14:
EN: Declares a local constant used by the component rendering logic. Code: const lengths = ["6 weeks", "8 weeks", "12 weeks", "16 weeks", "20-24 weeks"];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const lengths = ["6 weeks", "8 weeks", "12 weeks", "16 weeks", "20-24 weeks"];
Line 16:
EN: Exports a reusable React component or page component. Code: export function SettingsPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function SettingsPage() {
Line 17:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 18:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <header>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header>
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Settings / 设置</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Settings / 设置</p>
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Static operating setup.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Static operating setup.</h1>
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 max-w-2xl text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 max-w-2xl text-slate-500">
Line 23:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Mode preset, cycle length, training goal, target priorities, units, and metric disclaimers.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Mode preset, cycle length, training goal, target priorities, units, and metric disclaimers.
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 25:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 md:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 md:grid-cols-3">
Line 28:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {[
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{[
Line 29:
EN: Reads static mock data for the Phase 1 UI. Code: [Trophy, "Mode", "模式", mockUser.modeLabel, mockUser.modeLabelZh],
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：[Trophy, "Mode", "模式", mockUser.modeLabel, mockUser.modeLabelZh],
Line 30:
EN: Reads static mock data for the Phase 1 UI. Code: [Target, "Goal", "目标", mockUser.trainingGoal, mockUser.trainingGoalZh],
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：[Target, "Goal", "目标", mockUser.trainingGoal, mockUser.trainingGoalZh],
Line 31:
EN: Reads static mock data for the Phase 1 UI. Code: [Ruler, "Units", "单位", mockUser.units, "kg / cm"],
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：[Ruler, "Units", "单位", mockUser.units, "kg / cm"],
Line 32:
EN: Iterates over mock data to render repeated UI elements. Code: ].map(([Icon, label, zh, value, helper]) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：].map(([Icon, label, zh, value, helper]) => {
Line 33:
EN: Declares a local constant used by the component rendering logic. Code: const DisplayIcon = Icon as typeof Trophy;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const DisplayIcon = Icon as typeof Trophy;
Line 34:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
Line 37:
EN: Renders a self-closing JSX component or element. Code: <DisplayIcon size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<DisplayIcon size={18} />
Line 38:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{String(label)}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-4 text-xs font-semibold uppercase text-slate-500">{String(label)}</p>
Line 40:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs text-slate-400">{String(zh)}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs text-slate-400">{String(zh)}</p>
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 text-lg font-black text-slate-950">{String(value)}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 text-lg font-black text-slate-950">{String(value)}</p>
Line 42:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-sm text-slate-500">{String(helper)}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-sm text-slate-500">{String(helper)}</p>
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 44:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 45:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 46:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 48:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Final architecture / 最终架构</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Final architecture / 最终架构</p>
Line 50:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="mt-1 text-2xl font-black text-slate-950">React + Azure Functions + Docker</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="mt-1 text-2xl font-black text-slate-950">React + Azure Functions + Docker</h2>
Line 51:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 grid gap-3 md:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 grid gap-3 md:grid-cols-3">
Line 52:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {[
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{[
Line 53:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["React frontend", "React 前端", "Phase 1 static UI, later connected to API."],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["React frontend", "React 前端", "Phase 1 static UI, later connected to API."],
Line 54:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: [".NET 8 Azure Functions", ".NET 8 Azure Functions", "Planned backend API in Phase 4."],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：[".NET 8 Azure Functions", ".NET 8 Azure Functions", "Planned backend API in Phase 4."],
Line 55:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ["Docker", "Docker", "Containerized frontend now; API container added after Functions project exists."],
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：["Docker", "Docker", "Containerized frontend now; API container added after Functions project exists."],
Line 56:
EN: Iterates over mock data to render repeated UI elements. Code: ].map(([label, zh, body]) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：].map(([label, zh, body]) => (
Line 57:
EN: Opens a JSX element or component in the UI layout. Code: <div key={label} className="rounded-xl bg-slate-50 p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={label} className="rounded-xl bg-slate-50 p-4">
Line 58:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">{label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">{label}</p>
Line 59:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{zh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{zh}</p>
Line 60:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
Line 61:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 62:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 63:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 64:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 66:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 lg:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 lg:grid-cols-2">
Line 67:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 68:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Mode preset / 模式预设</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Mode preset / 模式预设</h2>
Line 69:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 grid gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 grid gap-2">
Line 70:
EN: Iterates over mock data to render repeated UI elements. Code: {modes.map(([en, zh]) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{modes.map(([en, zh]) => {
Line 71:
EN: Declares a local constant used by the component rendering logic. Code: const active = en === mockUser.modeLabel;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const active = en === mockUser.modeLabel;
Line 72:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 73:
EN: Opens a JSX element or component in the UI layout. Code: <div key={en} className={`rounded-xl border p-3 ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50"}`}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={en} className={`rounded-xl border p-3 ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50"}`}>
Line 74:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold">{en}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold">{en}</p>
Line 75:
EN: Opens a JSX element or component in the UI layout. Code: <p className={active ? "text-sm text-slate-300" : "text-sm text-slate-500"}>{zh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className={active ? "text-sm text-slate-300" : "text-sm text-slate-500"}>{zh}</p>
Line 76:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 77:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 78:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 79:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 80:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 82:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 83:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Cycle length / 周期长度</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Cycle length / 周期长度</h2>
Line 84:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 flex flex-wrap gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 flex flex-wrap gap-2">
Line 85:
EN: Iterates over mock data to render repeated UI elements. Code: {lengths.map((length) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{lengths.map((length) => {
Line 86:
EN: Declares a local constant used by the component rendering logic. Code: const active = length === `${mockTrainingBlock.totalWeeks} weeks`;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const active = length === `${mockTrainingBlock.totalWeeks} weeks`;
Line 87:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 88:
EN: Opens a JSX element or component in the UI layout. Code: <span key={length} className={`rounded-full border px-4 py-2 text-sm font-bold ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span key={length} className={`rounded-full border px-4 py-2 text-sm font-bold ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
Line 89:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {length}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{length}
Line 90:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 91:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 92:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 93:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 94:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 rounded-xl bg-slate-50 p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 rounded-xl bg-slate-50 p-4">
Line 95:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">Priority muscles / 重点肌群</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">Priority muscles / 重点肌群</p>
Line 96:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-sm text-slate-600">{mockUser.priorityMuscles.join(", ")}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-sm text-slate-600">{mockUser.priorityMuscles.join(", ")}</p>
Line 97:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{mockUser.priorityMusclesZh.join("、")}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{mockUser.priorityMusclesZh.join("、")}</p>
Line 98:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 99:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 100:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 102:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote
Line 103:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="heuristic"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="heuristic"
Line 104:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Heuristic metric disclaimer"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Heuristic metric disclaimer"
Line 105:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="启发式指标免责声明"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="启发式指标免责声明"
Line 106:
EN: Passes a prop or HTML attribute into the JSX element. Code: childrenZh="MV/MEV/MAV/MRV、Capacity、Efficiency、Productivity 和 Forecast 在 LiftOps 中都是启发式、proxy 或 watch 语言。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：childrenZh="MV/MEV/MAV/MRV、Capacity、Efficiency、Productivity 和 Forecast 在 LiftOps 中都是启发式、proxy 或 watch 语言。"
Line 107:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 108:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: MV/MEV/MAV/MRV, Capacity, Efficiency, Productivity, and Forecast are heuristic, proxy, or watch language in LiftOps.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：MV/MEV/MAV/MRV, Capacity, Efficiency, Productivity, and Forecast are heuristic, proxy, or watch language in LiftOps.
Line 109:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 111:
EN: Opens a JSX element or component in the UI layout. Code: <EmptyState
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EmptyState
Line 112:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Editable settings arrive in Phase 2"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Editable settings arrive in Phase 2"
Line 113:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="Phase 2 添加可编辑设置"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="Phase 2 添加可编辑设置"
Line 114:
EN: Passes a prop or HTML attribute into the JSX element. Code: description="Phase 1 only previews the setup surface."
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：description="Phase 1 only previews the setup surface."
Line 115:
EN: Passes a prop or HTML attribute into the JSX element. Code: descriptionZh="Phase 1 只预览设置界面。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：descriptionZh="Phase 1 只预览设置界面。"
Line 116:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 117:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 118:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 119:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { Ruler, Target, Trophy } from "lucide-react";
import { EvidenceNote } from "../components/EvidenceNote";
import { EmptyState } from "../components/EmptyState";
import { mockTrainingBlock, mockUser } from "../data/mockData";

const modes = [
  ["Cut Mode", "减脂模式"],
  ["Contest Prep Mode", "备赛模式"],
  ["Photoshoot Prep Mode", "拍摄准备模式"],
  ["High Fatigue Training Block", "高疲劳训练周期"],
  ["Maintenance / Performance", "维持 / 表现模式"],
];

const lengths = ["6 weeks", "8 weeks", "12 weeks", "16 weeks", "20-24 weeks"];

export function SettingsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Settings / 设置</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Static operating setup.</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Mode preset, cycle length, training goal, target priorities, units, and metric disclaimers.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          [Trophy, "Mode", "模式", mockUser.modeLabel, mockUser.modeLabelZh],
          [Target, "Goal", "目标", mockUser.trainingGoal, mockUser.trainingGoalZh],
          [Ruler, "Units", "单位", mockUser.units, "kg / cm"],
        ].map(([Icon, label, zh, value, helper]) => {
          const DisplayIcon = Icon as typeof Trophy;
          return (
            <article key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <DisplayIcon size={18} />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase text-slate-500">{String(label)}</p>
              <p className="text-xs text-slate-400">{String(zh)}</p>
              <p className="mt-3 text-lg font-black text-slate-950">{String(value)}</p>
              <p className="mt-1 text-sm text-slate-500">{String(helper)}</p>
            </article>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-500">Final architecture / 最终架构</p>
        <h2 className="mt-1 text-2xl font-black text-slate-950">React + Azure Functions + Docker</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["React frontend", "React 前端", "Phase 1 static UI, later connected to API."],
            [".NET 8 Azure Functions", ".NET 8 Azure Functions", "Planned backend API in Phase 4."],
            ["Docker", "Docker", "Containerized frontend now; API container added after Functions project exists."],
          ].map(([label, zh, body]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="font-bold text-slate-950">{label}</p>
              <p className="text-sm text-slate-500">{zh}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Mode preset / 模式预设</h2>
          <div className="mt-4 grid gap-2">
            {modes.map(([en, zh]) => {
              const active = en === mockUser.modeLabel;
              return (
                <div key={en} className={`rounded-xl border p-3 ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50"}`}>
                  <p className="font-bold">{en}</p>
                  <p className={active ? "text-sm text-slate-300" : "text-sm text-slate-500"}>{zh}</p>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Cycle length / 周期长度</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {lengths.map((length) => {
              const active = length === `${mockTrainingBlock.totalWeeks} weeks`;
              return (
                <span key={length} className={`rounded-full border px-4 py-2 text-sm font-bold ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                  {length}
                </span>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="font-bold text-slate-950">Priority muscles / 重点肌群</p>
            <p className="mt-2 text-sm text-slate-600">{mockUser.priorityMuscles.join(", ")}</p>
            <p className="text-sm text-slate-500">{mockUser.priorityMusclesZh.join("、")}</p>
          </div>
        </article>
      </section>

      <EvidenceNote
        type="heuristic"
        title="Heuristic metric disclaimer"
        titleZh="启发式指标免责声明"
        childrenZh="MV/MEV/MAV/MRV、Capacity、Efficiency、Productivity 和 Forecast 在 LiftOps 中都是启发式、proxy 或 watch 语言。"
      >
        MV/MEV/MAV/MRV, Capacity, Efficiency, Productivity, and Forecast are heuristic, proxy, or watch language in LiftOps.
      </EvidenceNote>

      <EmptyState
        title="Editable settings arrive in Phase 2"
        titleZh="Phase 2 添加可编辑设置"
        description="Phase 1 only previews the setup surface."
        descriptionZh="Phase 1 只预览设置界面。"
      />
    </div>
  );
}
