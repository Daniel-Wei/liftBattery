/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/TrainingModeCard.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Activity, Gauge, Moon, TrendingUp } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Activity, Gauge, Moon, TrendingUp } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { TrainingMode } from "../types/training";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { TrainingMode } from "../types/training";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 5:
EN: Declares a local TypeScript type so component props stay explicit. Code: type TrainingModeCardProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type TrainingModeCardProps = {
Line 6:
EN: Defines one field on a TypeScript object shape. Code: mode: TrainingMode;
中文：定义 TypeScript 对象结构中的一个字段。 代码：mode: TrainingMode;
Line 7:
EN: Defines one field on a TypeScript object shape. Code: title: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：title: string;
Line 8:
EN: Defines one field on a TypeScript object shape. Code: titleZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：titleZh: string;
Line 9:
EN: Defines one field on a TypeScript object shape. Code: description: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：description: string;
Line 10:
EN: Defines one field on a TypeScript object shape. Code: active?: boolean;
中文：定义 TypeScript 对象结构中的一个字段。 代码：active?: boolean;
Line 11:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 13:
EN: Declares a local constant used by the component rendering logic. Code: const icons = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const icons = {
Line 14:
EN: Defines one field on a TypeScript object shape. Code: push: TrendingUp,
中文：定义 TypeScript 对象结构中的一个字段。 代码：push: TrendingUp,
Line 15:
EN: Defines one field on a TypeScript object shape. Code: maintain: Gauge,
中文：定义 TypeScript 对象结构中的一个字段。 代码：maintain: Gauge,
Line 16:
EN: Defines one field on a TypeScript object shape. Code: lighter: Activity,
中文：定义 TypeScript 对象结构中的一个字段。 代码：lighter: Activity,
Line 17:
EN: Defines one field on a TypeScript object shape. Code: recoveryPriority: Moon,
中文：定义 TypeScript 对象结构中的一个字段。 代码：recoveryPriority: Moon,
Line 18:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 20:
EN: Exports a reusable React component or page component. Code: export function TrainingModeCard({
中文：导出可复用 React 组件或页面组件。 代码：export function TrainingModeCard({
Line 21:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: mode,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：mode,
Line 22:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: title,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：title,
Line 23:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: titleZh,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：titleZh,
Line 24:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: description,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：description,
Line 25:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: active = false,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：active = false,
Line 26:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }: TrainingModeCardProps) {
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}: TrainingModeCardProps) {
Line 27:
EN: Declares a local constant used by the component rendering logic. Code: const Icon = icons[mode];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const Icon = icons[mode];
Line 29:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <article className={`rounded-2xl border p-4 shadow-sm ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className={`rounded-2xl border p-4 shadow-sm ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
Line 31:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start justify-between gap-3">
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"}`}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"}`}>
Line 33:
EN: Renders a self-closing JSX component or element. Code: <Icon size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Icon size={18} />
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 35:
EN: Shows a compact status label for dashboard state. Code: {active ? <StatusBadge mode={mode} /> : null}
中文：展示 Dashboard 状态的小型标签。 代码：{active ? <StatusBadge mode={mode} /> : null}
Line 36:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <h3 className="mt-4 text-lg font-black">{title}</h3>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h3 className="mt-4 text-lg font-black">{title}</h3>
Line 38:
EN: Opens a JSX element or component in the UI layout. Code: <p className={active ? "text-sm text-slate-300" : "text-sm text-slate-500"}>{titleZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className={active ? "text-sm text-slate-300" : "text-sm text-slate-500"}>{titleZh}</p>
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <p className={active ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-600"}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className={active ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-600"}>
Line 40:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {description}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{description}
Line 41:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 42:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 43:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 44:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { Activity, Gauge, Moon, TrendingUp } from "lucide-react";
import type { TrainingMode } from "../types/training";
import { StatusBadge } from "./StatusBadge";

type TrainingModeCardProps = {
  mode: TrainingMode;
  title: string;
  titleZh: string;
  description: string;
  active?: boolean;
};

const icons = {
  push: TrendingUp,
  maintain: Gauge,
  lighter: Activity,
  recoveryPriority: Moon,
};

export function TrainingModeCard({
  mode,
  title,
  titleZh,
  description,
  active = false,
}: TrainingModeCardProps) {
  const Icon = icons[mode];

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${active ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-950"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"}`}>
          <Icon size={18} />
        </div>
        {active ? <StatusBadge mode={mode} /> : null}
      </div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className={active ? "text-sm text-slate-300" : "text-sm text-slate-500"}>{titleZh}</p>
      <p className={active ? "mt-3 text-sm leading-6 text-slate-300" : "mt-3 text-sm leading-6 text-slate-600"}>
        {description}
      </p>
    </article>
  );
}
