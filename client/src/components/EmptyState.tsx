/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/EmptyState.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { ReactNode } from "react";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { ReactNode } from "react";
Line 3:
EN: Declares a local TypeScript type so component props stay explicit. Code: type EmptyStateProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type EmptyStateProps = {
Line 4:
EN: Defines one field on a TypeScript object shape. Code: icon?: ReactNode;
中文：定义 TypeScript 对象结构中的一个字段。 代码：icon?: ReactNode;
Line 5:
EN: Defines one field on a TypeScript object shape. Code: title: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：title: string;
Line 6:
EN: Defines one field on a TypeScript object shape. Code: titleZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：titleZh: string;
Line 7:
EN: Defines one field on a TypeScript object shape. Code: description: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：description: string;
Line 8:
EN: Defines one field on a TypeScript object shape. Code: descriptionZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：descriptionZh: string;
Line 9:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 11:
EN: Exports a reusable React component or page component. Code: export function EmptyState({ icon, title, titleZh, description, descriptionZh }: EmptyStateProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function EmptyState({ icon, title, titleZh, description, descriptionZh }: EmptyStateProps) {
Line 12:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
Line 14:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {icon ? (
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{icon ? (
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
Line 16:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {icon}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{icon}
Line 17:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 18:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ) : null}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：) : null}
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <h3 className="text-lg font-black text-slate-950">{title}</h3>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h3 className="text-lg font-black text-slate-950">{title}</h3>
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{titleZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{titleZh}</p>
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{descriptionZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{descriptionZh}</p>
Line 23:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 24:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 25:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
};

export function EmptyState({ icon, title, titleZh, description, descriptionZh }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center">
      {icon ? (
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="text-sm text-slate-500">{titleZh}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{descriptionZh}</p>
    </section>
  );
}
