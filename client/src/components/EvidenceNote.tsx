/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/EvidenceNote.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { BookOpenCheck } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { BookOpenCheck } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { EvidenceType } from "../types/operations";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { EvidenceType } from "../types/operations";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 5:
EN: Declares a local TypeScript type so component props stay explicit. Code: type EvidenceNoteProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type EvidenceNoteProps = {
Line 6:
EN: Defines one field on a TypeScript object shape. Code: type: EvidenceType;
中文：定义 TypeScript 对象结构中的一个字段。 代码：type: EvidenceType;
Line 7:
EN: Defines one field on a TypeScript object shape. Code: title?: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：title?: string;
Line 8:
EN: Defines one field on a TypeScript object shape. Code: titleZh?: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：titleZh?: string;
Line 9:
EN: Defines one field on a TypeScript object shape. Code: children: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：children: string;
Line 10:
EN: Defines one field on a TypeScript object shape. Code: childrenZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：childrenZh: string;
Line 11:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 13:
EN: Exports a reusable React component or page component. Code: export function EvidenceNote({
中文：导出可复用 React 组件或页面组件。 代码：export function EvidenceNote({
Line 14:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: type,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：type,
Line 15:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: title = "Evidence note",
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：title = "Evidence note",
Line 16:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: titleZh = "证据说明",
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：titleZh = "证据说明",
Line 17:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: children,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：children,
Line 18:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: childrenZh,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：childrenZh,
Line 19:
EN: Shows an evidence or heuristic boundary note in the interface. Code: }: EvidenceNoteProps) {
中文：在界面中展示证据边界或启发式说明。 代码：}: EvidenceNoteProps) {
Line 20:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start gap-3">
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
Line 24:
EN: Renders a self-closing JSX component or element. Code: <BookOpenCheck size={17} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<BookOpenCheck size={17} />
Line 25:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <div className="min-w-0">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="min-w-0">
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap items-center gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap items-center gap-2">
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">{title}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">{title}</p>
Line 29:
EN: Renders a self-closing JSX component or element. Code: <StatusBadge evidenceType={type} label={type} labelZh="标签" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<StatusBadge evidenceType={type} label={type} labelZh="标签" />
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 31:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-sm leading-6 text-slate-500">{childrenZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-sm leading-6 text-slate-500">{childrenZh}</p>
Line 33:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </aside>
中文：关闭前面打开的 JSX 元素。 代码：</aside>
Line 36:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 37:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { BookOpenCheck } from "lucide-react";
import type { EvidenceType } from "../types/operations";
import { StatusBadge } from "./StatusBadge";

type EvidenceNoteProps = {
  type: EvidenceType;
  title?: string;
  titleZh?: string;
  children: string;
  childrenZh: string;
};

export function EvidenceNote({
  type,
  title = "Evidence note",
  titleZh = "证据说明",
  children,
  childrenZh,
}: EvidenceNoteProps) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
          <BookOpenCheck size={17} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-slate-950">{title}</p>
            <StatusBadge evidenceType={type} label={type} labelZh="标签" />
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600">{children}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{childrenZh}</p>
        </div>
      </div>
    </aside>
  );
}
