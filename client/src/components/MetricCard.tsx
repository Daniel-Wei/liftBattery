/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/MetricCard.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { ReactNode } from "react";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { ReactNode } from "react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
Line 3:
EN: Imports TypeScript-only types used by this React file. Code: import type { OpsMetric } from "../types/operations";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { OpsMetric } from "../types/operations";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "./EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "./EvidenceNote";
Line 5:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 7:
EN: Declares a local TypeScript type so component props stay explicit. Code: type MetricCardProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type MetricCardProps = {
Line 8:
EN: Defines one field on a TypeScript object shape. Code: metric: OpsMetric;
中文：定义 TypeScript 对象结构中的一个字段。 代码：metric: OpsMetric;
Line 9:
EN: Defines one field on a TypeScript object shape. Code: icon?: ReactNode;
中文：定义 TypeScript 对象结构中的一个字段。 代码：icon?: ReactNode;
Line 10:
EN: Defines one field on a TypeScript object shape. Code: compact?: boolean;
中文：定义 TypeScript 对象结构中的一个字段。 代码：compact?: boolean;
Line 11:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 13:
EN: Declares a local constant used by the component rendering logic. Code: const trendIcons = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const trendIcons = {
Line 14:
EN: Defines one field on a TypeScript object shape. Code: up: ArrowUpRight,
中文：定义 TypeScript 对象结构中的一个字段。 代码：up: ArrowUpRight,
Line 15:
EN: Defines one field on a TypeScript object shape. Code: down: ArrowDownRight,
中文：定义 TypeScript 对象结构中的一个字段。 代码：down: ArrowDownRight,
Line 16:
EN: Defines one field on a TypeScript object shape. Code: stable: ArrowRight,
中文：定义 TypeScript 对象结构中的一个字段。 代码：stable: ArrowRight,
Line 17:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 19:
EN: Exports a reusable React component or page component. Code: export function MetricCard({ metric, icon, compact = false }: MetricCardProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function MetricCard({ metric, icon, compact = false }: MetricCardProps) {
Line 20:
EN: Declares a local constant used by the component rendering logic. Code: const TrendIcon = trendIcons[metric.trend];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const TrendIcon = trendIcons[metric.trend];
Line 22:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start justify-between gap-3">
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs text-slate-400">{metric.labelZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs text-slate-400">{metric.labelZh}</p>
Line 28:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-2">
Line 30:
EN: Renders a self-closing JSX component or element. Code: <StatusBadge status={metric.status} label={metric.status} labelZh="状态" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<StatusBadge status={metric.status} label={metric.status} labelZh="状态" />
Line 31:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {icon ? (
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{icon ? (
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
Line 33:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {icon}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{icon}
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 35:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ) : null}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：) : null}
Line 36:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 38:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 flex items-end justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 flex items-end justify-between gap-3">
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-3xl font-black text-slate-950">{metric.value}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-3xl font-black text-slate-950">{metric.value}</span>
Line 40:
EN: Opens a JSX element or component in the UI layout. Code: <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
Line 41:
EN: Renders a self-closing JSX component or element. Code: <TrendIcon size={14} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendIcon size={14} />
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {metric.trend}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{metric.trend}
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 44:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 45:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {!compact ? (
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{!compact ? (
Line 46:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4">
Line 47:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote type={metric.evidenceType} childrenZh={metric.explanationZh}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote type={metric.evidenceType} childrenZh={metric.explanationZh}>
Line 48:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {metric.explanation}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{metric.explanation}
Line 49:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 50:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 51:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ) : (
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：) : (
Line 52:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 text-xs leading-5 text-slate-500">{metric.explanation}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 text-xs leading-5 text-slate-500">{metric.explanation}</p>
Line 53:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: )}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：)}
Line 54:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 55:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 56:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { OpsMetric } from "../types/operations";
import { EvidenceNote } from "./EvidenceNote";
import { StatusBadge } from "./StatusBadge";

type MetricCardProps = {
  metric: OpsMetric;
  icon?: ReactNode;
  compact?: boolean;
};

const trendIcons = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  stable: ArrowRight,
};

export function MetricCard({ metric, icon, compact = false }: MetricCardProps) {
  const TrendIcon = trendIcons[metric.trend];

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
          <p className="text-xs text-slate-400">{metric.labelZh}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={metric.status} label={metric.status} labelZh="状态" />
          {icon ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              {icon}
            </div>
          ) : null}
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="text-3xl font-black text-slate-950">{metric.value}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
          <TrendIcon size={14} />
          {metric.trend}
        </span>
      </div>
      {!compact ? (
        <div className="mt-4">
          <EvidenceNote type={metric.evidenceType} childrenZh={metric.explanationZh}>
            {metric.explanation}
          </EvidenceNote>
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-slate-500">{metric.explanation}</p>
      )}
    </article>
  );
}
