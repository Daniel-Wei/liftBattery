/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/ForecastRiskCard.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { AlertTriangle, Gauge, TrendingDown } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { AlertTriangle, Gauge, TrendingDown } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { RiskWatch } from "../types/forecast";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { RiskWatch } from "../types/forecast";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 5:
EN: Declares a local TypeScript type so component props stay explicit. Code: type ForecastRiskCardProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type ForecastRiskCardProps = {
Line 6:
EN: Defines one field on a TypeScript object shape. Code: risk: RiskWatch;
中文：定义 TypeScript 对象结构中的一个字段。 代码：risk: RiskWatch;
Line 7:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 9:
EN: Declares a local constant used by the component rendering logic. Code: const severityStatus = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const severityStatus = {
Line 10:
EN: Defines one field on a TypeScript object shape. Code: low: "neutral",
中文：定义 TypeScript 对象结构中的一个字段。 代码：low: "neutral",
Line 11:
EN: Defines one field on a TypeScript object shape. Code: medium: "watch",
中文：定义 TypeScript 对象结构中的一个字段。 代码：medium: "watch",
Line 12:
EN: Defines one field on a TypeScript object shape. Code: high: "risk",
中文：定义 TypeScript 对象结构中的一个字段。 代码：high: "risk",
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: } as const;
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：} as const;
Line 15:
EN: Declares a local constant used by the component rendering logic. Code: const icons = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const icons = {
Line 16:
EN: Defines one field on a TypeScript object shape. Code: deloadWatch: TrendingDown,
中文：定义 TypeScript 对象结构中的一个字段。 代码：deloadWatch: TrendingDown,
Line 17:
EN: Defines one field on a TypeScript object shape. Code: cutPressureWatch: Gauge,
中文：定义 TypeScript 对象结构中的一个字段。 代码：cutPressureWatch: Gauge,
Line 18:
EN: Defines one field on a TypeScript object shape. Code: recoveryRisk: AlertTriangle,
中文：定义 TypeScript 对象结构中的一个字段。 代码：recoveryRisk: AlertTriangle,
Line 19:
EN: Defines one field on a TypeScript object shape. Code: performanceRisk: TrendingDown,
中文：定义 TypeScript 对象结构中的一个字段。 代码：performanceRisk: TrendingDown,
Line 20:
EN: Defines one field on a TypeScript object shape. Code: nonCoreOverload: Gauge,
中文：定义 TypeScript 对象结构中的一个字段。 代码：nonCoreOverload: Gauge,
Line 21:
EN: Defines one field on a TypeScript object shape. Code: capacityGap: AlertTriangle,
中文：定义 TypeScript 对象结构中的一个字段。 代码：capacityGap: AlertTriangle,
Line 22:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 24:
EN: Exports a reusable React component or page component. Code: export function ForecastRiskCard({ risk }: ForecastRiskCardProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function ForecastRiskCard({ risk }: ForecastRiskCardProps) {
Line 25:
EN: Declares a local constant used by the component rendering logic. Code: const Icon = icons[risk.type];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const Icon = icons[risk.type];
Line 27:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start gap-3">
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
Line 31:
EN: Renders a self-closing JSX component or element. Code: <Icon size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Icon size={18} />
Line 32:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 33:
EN: Opens a JSX element or component in the UI layout. Code: <div className="min-w-0 flex-1">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="min-w-0 flex-1">
Line 34:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap items-start justify-between gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap items-start justify-between gap-2">
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <h3 className="font-black text-slate-950">{risk.title}</h3>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h3 className="font-black text-slate-950">{risk.title}</h3>
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{risk.titleZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{risk.titleZh}</p>
Line 38:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 39:
EN: Renders a self-closing JSX component or element. Code: <StatusBadge status={severityStatus[risk.severity]} label={risk.severity} labelZh="严重度" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<StatusBadge status={severityStatus[risk.severity]} label={risk.severity} labelZh="严重度" />
Line 40:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 grid gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 grid gap-2">
Line 42:
EN: Iterates over mock data to render repeated UI elements. Code: {risk.signals.map((signal, index) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{risk.signals.map((signal, index) => (
Line 43:
EN: Opens a JSX element or component in the UI layout. Code: <div key={signal} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={signal} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
Line 44:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-semibold text-slate-800">{signal}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-semibold text-slate-800">{signal}</p>
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <p>{risk.signalsZh[index]}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p>{risk.signalsZh[index]}</p>
Line 46:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 47:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 48:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-4 text-sm leading-6 text-slate-600">{risk.recommendation}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-4 text-sm leading-6 text-slate-600">{risk.recommendation}</p>
Line 50:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-sm leading-6 text-slate-500">{risk.recommendationZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-sm leading-6 text-slate-500">{risk.recommendationZh}</p>
Line 51:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 52:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 53:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 54:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 55:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { AlertTriangle, Gauge, TrendingDown } from "lucide-react";
import type { RiskWatch } from "../types/forecast";
import { StatusBadge } from "./StatusBadge";

type ForecastRiskCardProps = {
  risk: RiskWatch;
};

const severityStatus = {
  low: "neutral",
  medium: "watch",
  high: "risk",
} as const;

const icons = {
  deloadWatch: TrendingDown,
  cutPressureWatch: Gauge,
  recoveryRisk: AlertTriangle,
  performanceRisk: TrendingDown,
  nonCoreOverload: Gauge,
  capacityGap: AlertTriangle,
};

export function ForecastRiskCard({ risk }: ForecastRiskCardProps) {
  const Icon = icons[risk.type];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-black text-slate-950">{risk.title}</h3>
              <p className="text-sm text-slate-500">{risk.titleZh}</p>
            </div>
            <StatusBadge status={severityStatus[risk.severity]} label={risk.severity} labelZh="严重度" />
          </div>
          <div className="mt-4 grid gap-2">
            {risk.signals.map((signal, index) => (
              <div key={signal} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <p className="font-semibold text-slate-800">{signal}</p>
                <p>{risk.signalsZh[index]}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">{risk.recommendation}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{risk.recommendationZh}</p>
        </div>
      </div>
    </article>
  );
}
