/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/AppShell.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { ReactNode } from "react";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { ReactNode } from "react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { Sidebar, type NavItem } from "./Sidebar";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Sidebar, type NavItem } from "./Sidebar";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { TopBar } from "./TopBar";
中文：导入本 React 文件运行时需要的依赖。 代码：import { TopBar } from "./TopBar";
Line 5:
EN: Declares a local TypeScript type so component props stay explicit. Code: type AppShellProps<PageKey extends string = string> = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type AppShellProps<PageKey extends string = string> = {
Line 6:
EN: Defines one field on a TypeScript object shape. Code: navItems: NavItem<PageKey>[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：navItems: NavItem<PageKey>[];
Line 7:
EN: Defines one field on a TypeScript object shape. Code: currentPage: PageKey;
中文：定义 TypeScript 对象结构中的一个字段。 代码：currentPage: PageKey;
Line 8:
EN: Defines one field on a TypeScript object shape. Code: onNavigate: (page: PageKey) => void;
中文：定义 TypeScript 对象结构中的一个字段。 代码：onNavigate: (page: PageKey) => void;
Line 9:
EN: Defines one field on a TypeScript object shape. Code: children: ReactNode;
中文：定义 TypeScript 对象结构中的一个字段。 代码：children: ReactNode;
Line 10:
EN: Defines one field on a TypeScript object shape. Code: immersive?: boolean;
中文：定义 TypeScript 对象结构中的一个字段。 代码：immersive?: boolean;
Line 11:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 13:
EN: Exports a reusable React component or page component. Code: export function AppShell<PageKey extends string>({
中文：导出可复用 React 组件或页面组件。 代码：export function AppShell<PageKey extends string>({
Line 14:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: navItems,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：navItems,
Line 15:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: currentPage,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：currentPage,
Line 16:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: onNavigate,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：onNavigate,
Line 17:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: children,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：children,
Line 18:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: immersive = false,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：immersive = false,
Line 19:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }: AppShellProps<PageKey>) {
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}: AppShellProps<PageKey>) {
Line 20:
EN: Branches the render path based on component state or props. Code: if (immersive) {
中文：根据组件状态或 props 切换渲染路径。 代码：if (immersive) {
Line 21:
EN: Returns a compact JSX element directly. Code: return <div className="min-h-screen bg-[#070b12]">{children}</div>;
中文：直接返回一个紧凑的 JSX 元素。 代码：return <div className="min-h-screen bg-[#070b12]">{children}</div>;
Line 22:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}
Line 24:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <div className="min-h-screen bg-[#f4f6f8] text-slate-950">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="min-h-screen bg-[#f4f6f8] text-slate-950">
Line 26:
EN: Renders a self-closing JSX component or element. Code: <Sidebar navItems={navItems} currentPage={currentPage} onNavigate={onNavigate} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Sidebar navItems={navItems} currentPage={currentPage} onNavigate={onNavigate} />
Line 27:
EN: Renders a self-closing JSX component or element. Code: <TopBar navItems={navItems} currentPage={currentPage} onNavigate={onNavigate} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TopBar navItems={navItems} currentPage={currentPage} onNavigate={onNavigate} />
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <main className="px-4 pb-28 pt-5 lg:ml-72 lg:px-7 lg:pb-10">{children}</main>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<main className="px-4 pb-28 pt-5 lg:ml-72 lg:px-7 lg:pb-10">{children}</main>
Line 29:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 30:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 31:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { ReactNode } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { TopBar } from "./TopBar";

type AppShellProps<PageKey extends string = string> = {
  navItems: NavItem<PageKey>[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  children: ReactNode;
  immersive?: boolean;
};

export function AppShell<PageKey extends string>({
  navItems,
  currentPage,
  onNavigate,
  children,
  immersive = false,
}: AppShellProps<PageKey>) {
  if (immersive) {
    return <div className="min-h-screen bg-[#070b12]">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-950">
      <Sidebar navItems={navItems} currentPage={currentPage} onNavigate={onNavigate} />
      <TopBar navItems={navItems} currentPage={currentPage} onNavigate={onNavigate} />
      <main className="px-4 pb-28 pt-5 lg:ml-72 lg:px-7 lg:pb-10">{children}</main>
    </div>
  );
}
