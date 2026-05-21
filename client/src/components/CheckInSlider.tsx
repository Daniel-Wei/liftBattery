/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/CheckInSlider.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { CheckInDimension } from "../types/wellness";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { CheckInDimension } from "../types/wellness";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 4:
EN: Declares a local TypeScript type so component props stay explicit. Code: type CheckInSliderProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type CheckInSliderProps = {
Line 5:
EN: Defines one field on a TypeScript object shape. Code: dimension: CheckInDimension;
中文：定义 TypeScript 对象结构中的一个字段。 代码：dimension: CheckInDimension;
Line 6:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 8:
EN: Exports a reusable React component or page component. Code: export function CheckInSlider({ dimension }: CheckInSliderProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function CheckInSlider({ dimension }: CheckInSliderProps) {
Line 9:
EN: Declares a local constant used by the component rendering logic. Code: const max = dimension.key === "topSetRpe" || dimension.key === "sessionRpe" ? 10 : dimension.key === "topSetRir" ? 5 : 5;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const max = dimension.key === "topSetRpe" || dimension.key === "sessionRpe" ? 10 : dimension.key === "topSetRir" ? 5 : 5;
Line 10:
EN: Declares a local constant used by the component rendering logic. Code: const percent = Math.max(0, Math.min(100, (Number(dimension.value) / max) * 100));
中文：声明组件渲染逻辑会用到的本地常量。 代码：const percent = Math.max(0, Math.min(100, (Number(dimension.value) / max) * 100));
Line 12:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 14:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start justify-between gap-3">
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 16:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">{dimension.label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">{dimension.label}</p>
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{dimension.labelZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{dimension.labelZh}</p>
Line 18:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <StatusBadge
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<StatusBadge
Line 20:
EN: Passes a prop or HTML attribute into the JSX element. Code: evidenceType={dimension.evidence === "wellnessSelfReport" ? "watch" : dimension.evidence === "sessionRpe" ? "established" : "proxy"}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：evidenceType={dimension.evidence === "wellnessSelfReport" ? "watch" : dimension.evidence === "sessionRpe" ? "established" : "proxy"}
Line 21:
EN: Passes a prop or HTML attribute into the JSX element. Code: label={String(dimension.value)}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：label={String(dimension.value)}
Line 22:
EN: Passes a prop or HTML attribute into the JSX element. Code: labelZh={dimension.evidence === "sessionRpe" ? "sRPE" : "值"}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：labelZh={dimension.evidence === "sessionRpe" ? "sRPE" : "值"}
Line 23:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 h-2 rounded-full bg-slate-100">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 h-2 rounded-full bg-slate-100">
Line 26:
EN: Renders a self-closing JSX component or element. Code: <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
Line 27:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <span>{dimension.minLabel}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span>{dimension.minLabel}</span>
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <span>{dimension.maxLabel}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span>{dimension.maxLabel}</span>
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 32:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 33:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 34:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { CheckInDimension } from "../types/wellness";
import { StatusBadge } from "./StatusBadge";

type CheckInSliderProps = {
  dimension: CheckInDimension;
};

export function CheckInSlider({ dimension }: CheckInSliderProps) {
  const max = dimension.key === "topSetRpe" || dimension.key === "sessionRpe" ? 10 : dimension.key === "topSetRir" ? 5 : 5;
  const percent = Math.max(0, Math.min(100, (Number(dimension.value) / max) * 100));

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-950">{dimension.label}</p>
          <p className="text-sm text-slate-500">{dimension.labelZh}</p>
        </div>
        <StatusBadge
          evidenceType={dimension.evidence === "wellnessSelfReport" ? "watch" : dimension.evidence === "sessionRpe" ? "established" : "proxy"}
          label={String(dimension.value)}
          labelZh={dimension.evidence === "sessionRpe" ? "sRPE" : "值"}
        />
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
        <span>{dimension.minLabel}</span>
        <span>{dimension.maxLabel}</span>
      </div>
    </article>
  );
}
