/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/CoreNonCorePanel.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Dumbbell, Gauge } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Dumbbell, Gauge } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { CoreWorkPlan, SupportLoadPlan } from "../types/training";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { CoreWorkPlan, SupportLoadPlan } from "../types/training";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 5:
EN: Declares a local TypeScript type so component props stay explicit. Code: type CoreNonCorePanelProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type CoreNonCorePanelProps = {
Line 6:
EN: Defines one field on a TypeScript object shape. Code: core: CoreWorkPlan[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：core: CoreWorkPlan[];
Line 7:
EN: Defines one field on a TypeScript object shape. Code: support: SupportLoadPlan[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：support: SupportLoadPlan[];
Line 8:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 10:
EN: Exports a reusable React component or page component. Code: export function CoreNonCorePanel({ core, support }: CoreNonCorePanelProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function CoreNonCorePanel({ core, support }: CoreNonCorePanelProps) {
Line 11:
EN: Declares a local constant used by the component rendering logic. Code: const plannedCore = core.reduce((sum, item) => sum + item.plannedHardSets, 0);
中文：声明组件渲染逻辑会用到的本地常量。 代码：const plannedCore = core.reduce((sum, item) => sum + item.plannedHardSets, 0);
Line 12:
EN: Declares a local constant used by the component rendering logic. Code: const completedCore = core.reduce((sum, item) => sum + item.completedHardSets, 0);
中文：声明组件渲染逻辑会用到的本地常量。 代码：const completedCore = core.reduce((sum, item) => sum + item.completedHardSets, 0);
Line 13:
EN: Declares a local constant used by the component rendering logic. Code: const plannedSupport = support.reduce((sum, item) => sum + item.plannedUnits, 0);
中文：声明组件渲染逻辑会用到的本地常量。 代码：const plannedSupport = support.reduce((sum, item) => sum + item.plannedUnits, 0);
Line 14:
EN: Declares a local constant used by the component rendering logic. Code: const completedSupport = support.reduce((sum, item) => sum + item.completedUnits, 0);
中文：声明组件渲染逻辑会用到的本地常量。 代码：const completedSupport = support.reduce((sum, item) => sum + item.completedUnits, 0);
Line 15:
EN: Declares a local constant used by the component rendering logic. Code: const corePercent = Math.round((completedCore / plannedCore) * 100);
中文：声明组件渲染逻辑会用到的本地常量。 代码：const corePercent = Math.round((completedCore / plannedCore) * 100);
Line 16:
EN: Declares a local constant used by the component rendering logic. Code: const supportPercent = Math.round((completedSupport / plannedSupport) * 100);
中文：声明组件渲染逻辑会用到的本地常量。 代码：const supportPercent = Math.round((completedSupport / plannedSupport) * 100);
Line 18:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap items-start justify-between gap-3">
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Core / Non-Core</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Core / Non-Core</p>
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="mt-1 text-xl font-black text-slate-950">Work allocation / 训练分配</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="mt-1 text-xl font-black text-slate-950">Work allocation / 训练分配</h2>
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 25:
EN: Renders a self-closing JSX component or element. Code: <StatusBadge status={supportPercent > 110 ? "watch" : "good"} label="watch" labelZh="观察" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<StatusBadge status={supportPercent > 110 ? "watch" : "good"} label="watch" labelZh="观察" />
Line 26:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 grid gap-4 md:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 grid gap-4 md:grid-cols-2">
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-2xl bg-slate-950 p-4 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-2xl bg-slate-950 p-4 text-white">
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-2">
Line 31:
EN: Renders a self-closing JSX component or element. Code: <Dumbbell size={18} className="text-emerald-300" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Dumbbell size={18} className="text-emerald-300" />
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold">Core Work / 核心训练</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold">Core Work / 核心训练</p>
Line 33:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 34:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 flex items-end gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 flex items-end gap-2">
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-4xl font-black">{corePercent}%</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-4xl font-black">{corePercent}%</span>
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <span className="pb-1 text-sm text-slate-400">{completedCore}/{plannedCore} hard sets</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="pb-1 text-sm text-slate-400">{completedCore}/{plannedCore} hard sets</span>
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 38:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 h-2 rounded-full bg-white/10">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 h-2 rounded-full bg-white/10">
Line 39:
EN: Renders a self-closing JSX component or element. Code: <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(corePercent, 100)}%` }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(corePercent, 100)}%` }} />
Line 40:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 41:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 43:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-2xl bg-slate-50 p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-2xl bg-slate-50 p-4">
Line 44:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-2">
Line 45:
EN: Renders a self-closing JSX component or element. Code: <Gauge size={18} className="text-amber-600" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Gauge size={18} className="text-amber-600" />
Line 46:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">Support Load / 支持负荷</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">Support Load / 支持负荷</p>
Line 47:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 48:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 flex items-end gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 flex items-end gap-2">
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-4xl font-black text-slate-950">{supportPercent}%</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-4xl font-black text-slate-950">{supportPercent}%</span>
Line 50:
EN: Opens a JSX element or component in the UI layout. Code: <span className="pb-1 text-sm text-slate-500">completed vs plan</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="pb-1 text-sm text-slate-500">completed vs plan</span>
Line 51:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 52:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 h-2 rounded-full bg-slate-200">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 h-2 rounded-full bg-slate-200">
Line 53:
EN: Renders a self-closing JSX component or element. Code: <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(supportPercent, 100)}%` }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(supportPercent, 100)}%` }} />
Line 54:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 55:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 56:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 58:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 grid gap-3 md:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 grid gap-3 md:grid-cols-3">
Line 59:
EN: Iterates over mock data to render repeated UI elements. Code: {core.map((item) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{core.map((item) => (
Line 60:
EN: Opens a JSX element or component in the UI layout. Code: <div key={item.id} className="rounded-xl border border-slate-200 p-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={item.id} className="rounded-xl border border-slate-200 p-3">
Line 61:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm font-bold text-slate-950">{item.targetArea}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm font-bold text-slate-950">{item.targetArea}</p>
Line 62:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs text-slate-500">{item.targetAreaZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs text-slate-500">{item.targetAreaZh}</p>
Line 63:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-sm text-slate-600">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-sm text-slate-600">
Line 64:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {item.completedHardSets}/{item.plannedHardSets} hard sets
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{item.completedHardSets}/{item.plannedHardSets} hard sets
Line 65:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 66:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 67:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 68:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 69:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 70:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 71:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { Dumbbell, Gauge } from "lucide-react";
import type { CoreWorkPlan, SupportLoadPlan } from "../types/training";
import { StatusBadge } from "./StatusBadge";

type CoreNonCorePanelProps = {
  core: CoreWorkPlan[];
  support: SupportLoadPlan[];
};

export function CoreNonCorePanel({ core, support }: CoreNonCorePanelProps) {
  const plannedCore = core.reduce((sum, item) => sum + item.plannedHardSets, 0);
  const completedCore = core.reduce((sum, item) => sum + item.completedHardSets, 0);
  const plannedSupport = support.reduce((sum, item) => sum + item.plannedUnits, 0);
  const completedSupport = support.reduce((sum, item) => sum + item.completedUnits, 0);
  const corePercent = Math.round((completedCore / plannedCore) * 100);
  const supportPercent = Math.round((completedSupport / plannedSupport) * 100);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Core / Non-Core</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Work allocation / 训练分配</h2>
        </div>
        <StatusBadge status={supportPercent > 110 ? "watch" : "good"} label="watch" labelZh="观察" />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-slate-950 p-4 text-white">
          <div className="flex items-center gap-2">
            <Dumbbell size={18} className="text-emerald-300" />
            <p className="font-bold">Core Work / 核心训练</p>
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-black">{corePercent}%</span>
            <span className="pb-1 text-sm text-slate-400">{completedCore}/{plannedCore} hard sets</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-2 rounded-full bg-emerald-400" style={{ width: `${Math.min(corePercent, 100)}%` }} />
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <Gauge size={18} className="text-amber-600" />
            <p className="font-bold text-slate-950">Support Load / 支持负荷</p>
          </div>
          <div className="mt-5 flex items-end gap-2">
            <span className="text-4xl font-black text-slate-950">{supportPercent}%</span>
            <span className="pb-1 text-sm text-slate-500">completed vs plan</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.min(supportPercent, 100)}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {core.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3">
            <p className="text-sm font-bold text-slate-950">{item.targetArea}</p>
            <p className="text-xs text-slate-500">{item.targetAreaZh}</p>
            <p className="mt-2 text-sm text-slate-600">
              {item.completedHardSets}/{item.plannedHardSets} hard sets
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
