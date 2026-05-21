/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/StatusBadge.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { EvidenceType, OpsStatus } from "../types/operations";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { EvidenceType, OpsStatus } from "../types/operations";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { TrainingMode } from "../types/training";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { TrainingMode } from "../types/training";
Line 4:
EN: Declares a local TypeScript type so component props stay explicit. Code: type StatusBadgeProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type StatusBadgeProps = {
Line 5:
EN: Defines one field on a TypeScript object shape. Code: status?: OpsStatus;
中文：定义 TypeScript 对象结构中的一个字段。 代码：status?: OpsStatus;
Line 6:
EN: Defines one field on a TypeScript object shape. Code: mode?: TrainingMode;
中文：定义 TypeScript 对象结构中的一个字段。 代码：mode?: TrainingMode;
Line 7:
EN: Defines one field on a TypeScript object shape. Code: evidenceType?: EvidenceType;
中文：定义 TypeScript 对象结构中的一个字段。 代码：evidenceType?: EvidenceType;
Line 8:
EN: Defines one field on a TypeScript object shape. Code: label?: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：label?: string;
Line 9:
EN: Defines one field on a TypeScript object shape. Code: labelZh?: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：labelZh?: string;
Line 10:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 12:
EN: Declares a local constant used by the component rendering logic. Code: const statusStyles: Record<OpsStatus, string> = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const statusStyles: Record<OpsStatus, string> = {
Line 13:
EN: Defines one field on a TypeScript object shape. Code: good: "border-emerald-200 bg-emerald-50 text-emerald-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：good: "border-emerald-200 bg-emerald-50 text-emerald-700",
Line 14:
EN: Defines one field on a TypeScript object shape. Code: watch: "border-amber-200 bg-amber-50 text-amber-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：watch: "border-amber-200 bg-amber-50 text-amber-700",
Line 15:
EN: Defines one field on a TypeScript object shape. Code: risk: "border-rose-200 bg-rose-50 text-rose-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：risk: "border-rose-200 bg-rose-50 text-rose-700",
Line 16:
EN: Defines one field on a TypeScript object shape. Code: neutral: "border-slate-200 bg-slate-50 text-slate-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：neutral: "border-slate-200 bg-slate-50 text-slate-700",
Line 17:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 19:
EN: Declares a local constant used by the component rendering logic. Code: const modeStyles: Record<TrainingMode, string> = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const modeStyles: Record<TrainingMode, string> = {
Line 20:
EN: Defines one field on a TypeScript object shape. Code: push: "border-emerald-200 bg-emerald-50 text-emerald-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：push: "border-emerald-200 bg-emerald-50 text-emerald-700",
Line 21:
EN: Defines one field on a TypeScript object shape. Code: maintain: "border-cyan-200 bg-cyan-50 text-cyan-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：maintain: "border-cyan-200 bg-cyan-50 text-cyan-700",
Line 22:
EN: Defines one field on a TypeScript object shape. Code: lighter: "border-amber-200 bg-amber-50 text-amber-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：lighter: "border-amber-200 bg-amber-50 text-amber-700",
Line 23:
EN: Defines one field on a TypeScript object shape. Code: recoveryPriority: "border-violet-200 bg-violet-50 text-violet-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：recoveryPriority: "border-violet-200 bg-violet-50 text-violet-700",
Line 24:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 26:
EN: Declares a local constant used by the component rendering logic. Code: const evidenceStyles: Record<EvidenceType, string> = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const evidenceStyles: Record<EvidenceType, string> = {
Line 27:
EN: Defines one field on a TypeScript object shape. Code: established: "border-emerald-200 bg-emerald-50 text-emerald-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：established: "border-emerald-200 bg-emerald-50 text-emerald-700",
Line 28:
EN: Defines one field on a TypeScript object shape. Code: simpleArithmetic: "border-cyan-200 bg-cyan-50 text-cyan-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：simpleArithmetic: "border-cyan-200 bg-cyan-50 text-cyan-700",
Line 29:
EN: Defines one field on a TypeScript object shape. Code: heuristic: "border-violet-200 bg-violet-50 text-violet-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：heuristic: "border-violet-200 bg-violet-50 text-violet-700",
Line 30:
EN: Defines one field on a TypeScript object shape. Code: proxy: "border-amber-200 bg-amber-50 text-amber-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：proxy: "border-amber-200 bg-amber-50 text-amber-700",
Line 31:
EN: Defines one field on a TypeScript object shape. Code: watch: "border-slate-200 bg-slate-50 text-slate-700",
中文：定义 TypeScript 对象结构中的一个字段。 代码：watch: "border-slate-200 bg-slate-50 text-slate-700",
Line 32:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 34:
EN: Declares a local constant used by the component rendering logic. Code: const modeLabels: Record<TrainingMode, { en: string; zh: string }> = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const modeLabels: Record<TrainingMode, { en: string; zh: string }> = {
Line 35:
EN: Defines one field on a TypeScript object shape. Code: push: { en: "Push", zh: "推进" },
中文：定义 TypeScript 对象结构中的一个字段。 代码：push: { en: "Push", zh: "推进" },
Line 36:
EN: Defines one field on a TypeScript object shape. Code: maintain: { en: "Maintain", zh: "维持" },
中文：定义 TypeScript 对象结构中的一个字段。 代码：maintain: { en: "Maintain", zh: "维持" },
Line 37:
EN: Defines one field on a TypeScript object shape. Code: lighter: { en: "Lighter", zh: "降低输出" },
中文：定义 TypeScript 对象结构中的一个字段。 代码：lighter: { en: "Lighter", zh: "降低输出" },
Line 38:
EN: Defines one field on a TypeScript object shape. Code: recoveryPriority: { en: "Recovery Priority", zh: "优先恢复" },
中文：定义 TypeScript 对象结构中的一个字段。 代码：recoveryPriority: { en: "Recovery Priority", zh: "优先恢复" },
Line 39:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 41:
EN: Exports a reusable React component or page component. Code: export function StatusBadge({
中文：导出可复用 React 组件或页面组件。 代码：export function StatusBadge({
Line 42:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: status,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：status,
Line 43:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: mode,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：mode,
Line 44:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: evidenceType,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：evidenceType,
Line 45:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: label,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：label,
Line 46:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: labelZh,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：labelZh,
Line 47:
EN: Shows a compact status label for dashboard state. Code: }: StatusBadgeProps) {
中文：展示 Dashboard 状态的小型标签。 代码：}: StatusBadgeProps) {
Line 48:
EN: Declares a local constant used by the component rendering logic. Code: const style = mode
中文：声明组件渲染逻辑会用到的本地常量。 代码：const style = mode
Line 49:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ? modeStyles[mode]
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：? modeStyles[mode]
Line 50:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: : evidenceType
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：: evidenceType
Line 51:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ? evidenceStyles[evidenceType]
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：? evidenceStyles[evidenceType]
Line 52:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: : status
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：: status
Line 53:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ? statusStyles[status]
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：? statusStyles[status]
Line 54:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: : statusStyles.neutral;
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：: statusStyles.neutral;
Line 55:
EN: Declares a local constant used by the component rendering logic. Code: const fallback = mode ? modeLabels[mode] : { en: label ?? status ?? evidenceType ?? "Neutral", zh: labelZh ?? "状态" };
中文：声明组件渲染逻辑会用到的本地常量。 代码：const fallback = mode ? modeLabels[mode] : { en: label ?? status ?? evidenceType ?? "Neutral", zh: labelZh ?? "状态" };
Line 57:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 58:
EN: Opens a JSX element or component in the UI layout. Code: <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
Line 59:
EN: Renders a self-closing JSX component or element. Code: <span className="h-1.5 w-1.5 rounded-full bg-current" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<span className="h-1.5 w-1.5 rounded-full bg-current" />
Line 60:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {label ?? fallback.en}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{label ?? fallback.en}
Line 61:
EN: Opens a JSX element or component in the UI layout. Code: <span className="opacity-75">{labelZh ?? fallback.zh}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="opacity-75">{labelZh ?? fallback.zh}</span>
Line 62:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 63:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 64:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { EvidenceType, OpsStatus } from "../types/operations";
import type { TrainingMode } from "../types/training";

type StatusBadgeProps = {
  status?: OpsStatus;
  mode?: TrainingMode;
  evidenceType?: EvidenceType;
  label?: string;
  labelZh?: string;
};

const statusStyles: Record<OpsStatus, string> = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  watch: "border-amber-200 bg-amber-50 text-amber-700",
  risk: "border-rose-200 bg-rose-50 text-rose-700",
  neutral: "border-slate-200 bg-slate-50 text-slate-700",
};

const modeStyles: Record<TrainingMode, string> = {
  push: "border-emerald-200 bg-emerald-50 text-emerald-700",
  maintain: "border-cyan-200 bg-cyan-50 text-cyan-700",
  lighter: "border-amber-200 bg-amber-50 text-amber-700",
  recoveryPriority: "border-violet-200 bg-violet-50 text-violet-700",
};

const evidenceStyles: Record<EvidenceType, string> = {
  established: "border-emerald-200 bg-emerald-50 text-emerald-700",
  simpleArithmetic: "border-cyan-200 bg-cyan-50 text-cyan-700",
  heuristic: "border-violet-200 bg-violet-50 text-violet-700",
  proxy: "border-amber-200 bg-amber-50 text-amber-700",
  watch: "border-slate-200 bg-slate-50 text-slate-700",
};

const modeLabels: Record<TrainingMode, { en: string; zh: string }> = {
  push: { en: "Push", zh: "推进" },
  maintain: { en: "Maintain", zh: "维持" },
  lighter: { en: "Lighter", zh: "降低输出" },
  recoveryPriority: { en: "Recovery Priority", zh: "优先恢复" },
};

export function StatusBadge({
  status,
  mode,
  evidenceType,
  label,
  labelZh,
}: StatusBadgeProps) {
  const style = mode
    ? modeStyles[mode]
    : evidenceType
      ? evidenceStyles[evidenceType]
      : status
        ? statusStyles[status]
        : statusStyles.neutral;
  const fallback = mode ? modeLabels[mode] : { en: label ?? status ?? evidenceType ?? "Neutral", zh: labelZh ?? "状态" };

  return (
    <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label ?? fallback.en}
      <span className="opacity-75">{labelZh ?? fallback.zh}</span>
    </span>
  );
}
