/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/PlanUtilisationPanel.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { UtilisationSummary } from "../types/operations";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { UtilisationSummary } from "../types/operations";
Line 3:
EN: Declares a local TypeScript type so component props stay explicit. Code: type PlanUtilisationPanelProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type PlanUtilisationPanelProps = {
Line 4:
EN: Defines one field on a TypeScript object shape. Code: utilisation: UtilisationSummary;
中文：定义 TypeScript 对象结构中的一个字段。 代码：utilisation: UtilisationSummary;
Line 5:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 7:
EN: Declares a local constant used by the component rendering logic. Code: const items = [
中文：声明组件渲染逻辑会用到的本地常量。 代码：const items = [
Line 8:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "corePercent", label: "Core Utilisation", zh: "核心使用率", color: "bg-emerald-500" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "corePercent", label: "Core Utilisation", zh: "核心使用率", color: "bg-emerald-500" },
Line 9:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "supportPercent", label: "Support Load", zh: "支持负荷", color: "bg-amber-500" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "supportPercent", label: "Support Load", zh: "支持负荷", color: "bg-amber-500" },
Line 10:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "cardioPercent", label: "Cardio", zh: "有氧", color: "bg-cyan-500" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "cardioPercent", label: "Cardio", zh: "有氧", color: "bg-cyan-500" },
Line 11:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "nutritionAdherencePercent", label: "Nutrition", zh: "营养目标", color: "bg-violet-500" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "nutritionAdherencePercent", label: "Nutrition", zh: "营养目标", color: "bg-violet-500" },
Line 12:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ] as const;
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：] as const;
Line 14:
EN: Exports a reusable React component or page component. Code: export function PlanUtilisationPanel({ utilisation }: PlanUtilisationPanelProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function PlanUtilisationPanel({ utilisation }: PlanUtilisationPanelProps) {
Line 15:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 16:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Plan utilisation</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Plan utilisation</p>
Line 18:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="mt-1 text-xl font-black text-slate-950">Completed vs planned / 实际 vs 计划</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="mt-1 text-xl font-black text-slate-950">Completed vs planned / 实际 vs 计划</h2>
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 space-y-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 space-y-4">
Line 20:
EN: Iterates over mock data to render repeated UI elements. Code: {items.map((item) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{items.map((item) => {
Line 21:
EN: Declares a local constant used by the component rendering logic. Code: const value = utilisation[item.key];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const value = utilisation[item.key];
Line 22:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <div key={item.key}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={item.key}>
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mb-2 flex justify-between gap-3 text-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mb-2 flex justify-between gap-3 text-sm">
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <span className="font-bold text-slate-700">{item.label}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="font-bold text-slate-700">{item.label}</span>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-slate-500">{item.zh} · {value}%</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-slate-500">{item.zh} · {value}%</span>
Line 27:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <div className="h-2 rounded-full bg-slate-100">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="h-2 rounded-full bg-slate-100">
Line 29:
EN: Renders a self-closing JSX component or element. Code: <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.min(value, 100)}%` }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.min(value, 100)}%` }} />
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 32:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 33:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 36:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 37:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { UtilisationSummary } from "../types/operations";

type PlanUtilisationPanelProps = {
  utilisation: UtilisationSummary;
};

const items = [
  { key: "corePercent", label: "Core Utilisation", zh: "核心使用率", color: "bg-emerald-500" },
  { key: "supportPercent", label: "Support Load", zh: "支持负荷", color: "bg-amber-500" },
  { key: "cardioPercent", label: "Cardio", zh: "有氧", color: "bg-cyan-500" },
  { key: "nutritionAdherencePercent", label: "Nutrition", zh: "营养目标", color: "bg-violet-500" },
] as const;

export function PlanUtilisationPanel({ utilisation }: PlanUtilisationPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">Plan utilisation</p>
      <h2 className="mt-1 text-xl font-black text-slate-950">Completed vs planned / 实际 vs 计划</h2>
      <div className="mt-5 space-y-4">
        {items.map((item) => {
          const value = utilisation[item.key];
          return (
            <div key={item.key}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="font-bold text-slate-700">{item.label}</span>
                <span className="text-slate-500">{item.zh} · {value}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: `${Math.min(value, 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
