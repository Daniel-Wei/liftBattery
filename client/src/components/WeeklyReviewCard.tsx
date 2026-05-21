/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/WeeklyReviewCard.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { ClipboardCheck } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { ClipboardCheck } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { WeeklyReview } from "../types/operations";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { WeeklyReview } from "../types/operations";
Line 4:
EN: Declares a local TypeScript type so component props stay explicit. Code: type WeeklyReviewCardProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type WeeklyReviewCardProps = {
Line 5:
EN: Defines one field on a TypeScript object shape. Code: review: WeeklyReview;
中文：定义 TypeScript 对象结构中的一个字段。 代码：review: WeeklyReview;
Line 6:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 8:
EN: Exports a reusable React component or page component. Code: export function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
Line 9:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 10:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start gap-3">
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
Line 13:
EN: Renders a self-closing JSX component or element. Code: <ClipboardCheck size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<ClipboardCheck size={18} />
Line 14:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 16:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Week {review.week} review</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Week {review.week} review</p>
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Weekly operating review / 每周运营复盘</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Weekly operating review / 每周运营复盘</h2>
Line 18:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 19:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-5 text-sm leading-6 text-slate-600">{review.summary}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-5 text-sm leading-6 text-slate-600">{review.summary}</p>
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-sm leading-6 text-slate-500">{review.summaryZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-sm leading-6 text-slate-500">{review.summaryZh}</p>
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 grid gap-3 md:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 grid gap-3 md:grid-cols-3">
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-xl bg-emerald-50 p-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-xl bg-emerald-50 p-3">
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm font-semibold text-emerald-700">Core utilisation</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm font-semibold text-emerald-700">Core utilisation</p>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-2xl font-black text-emerald-900">{review.coreUtilisation}%</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-2xl font-black text-emerald-900">{review.coreUtilisation}%</p>
Line 26:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-xl bg-amber-50 p-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-xl bg-amber-50 p-3">
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm font-semibold text-amber-700">Support ratio</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm font-semibold text-amber-700">Support ratio</p>
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-2xl font-black text-amber-900">{review.supportRatio}%</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-2xl font-black text-amber-900">{review.supportRatio}%</p>
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 31:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-xl bg-cyan-50 p-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-xl bg-cyan-50 p-3">
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm font-semibold text-cyan-700">Capacity change</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm font-semibold text-cyan-700">Capacity change</p>
Line 33:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-2xl font-black text-cyan-900">{review.recoveryCapacityChange}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-2xl font-black text-cyan-900">{review.recoveryCapacityChange}</p>
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 rounded-xl bg-slate-50 p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 rounded-xl bg-slate-50 p-4">
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">Next review / 下周 review</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">Next review / 下周 review</p>
Line 38:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-sm text-slate-600">{review.nextReview}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-sm text-slate-600">{review.nextReview}</p>
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-sm text-slate-500">{review.nextReviewZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-sm text-slate-500">{review.nextReviewZh}</p>
Line 40:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 41:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 42:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 43:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { ClipboardCheck } from "lucide-react";
import type { WeeklyReview } from "../types/operations";

type WeeklyReviewCardProps = {
  review: WeeklyReview;
};

export function WeeklyReviewCard({ review }: WeeklyReviewCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <ClipboardCheck size={18} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Week {review.week} review</p>
          <h2 className="text-xl font-black text-slate-950">Weekly operating review / 每周运营复盘</h2>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-slate-600">{review.summary}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{review.summaryZh}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-sm font-semibold text-emerald-700">Core utilisation</p>
          <p className="mt-1 text-2xl font-black text-emerald-900">{review.coreUtilisation}%</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-sm font-semibold text-amber-700">Support ratio</p>
          <p className="mt-1 text-2xl font-black text-amber-900">{review.supportRatio}%</p>
        </div>
        <div className="rounded-xl bg-cyan-50 p-3">
          <p className="text-sm font-semibold text-cyan-700">Capacity change</p>
          <p className="mt-1 text-2xl font-black text-cyan-900">{review.recoveryCapacityChange}</p>
        </div>
      </div>
      <div className="mt-5 rounded-xl bg-slate-50 p-4">
        <p className="font-bold text-slate-950">Next review / 下周 review</p>
        <p className="mt-2 text-sm text-slate-600">{review.nextReview}</p>
        <p className="mt-1 text-sm text-slate-500">{review.nextReviewZh}</p>
      </div>
    </article>
  );
}
