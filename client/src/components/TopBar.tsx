/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/TopBar.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Search } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Search } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { NavItem } from "./Sidebar";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { NavItem } from "./Sidebar";
Line 4:
EN: Declares a local TypeScript type so component props stay explicit. Code: type TopBarProps<PageKey extends string = string> = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type TopBarProps<PageKey extends string = string> = {
Line 5:
EN: Defines one field on a TypeScript object shape. Code: navItems: NavItem<PageKey>[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：navItems: NavItem<PageKey>[];
Line 6:
EN: Defines one field on a TypeScript object shape. Code: currentPage: PageKey;
中文：定义 TypeScript 对象结构中的一个字段。 代码：currentPage: PageKey;
Line 7:
EN: Defines one field on a TypeScript object shape. Code: onNavigate: (page: PageKey) => void;
中文：定义 TypeScript 对象结构中的一个字段。 代码：onNavigate: (page: PageKey) => void;
Line 8:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 10:
EN: Exports a reusable React component or page component. Code: export function TopBar<PageKey extends string>({
中文：导出可复用 React 组件或页面组件。 代码：export function TopBar<PageKey extends string>({
Line 11:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: navItems,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：navItems,
Line 12:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: currentPage,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：currentPage,
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: onNavigate,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：onNavigate,
Line 14:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }: TopBarProps<PageKey>) {
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}: TopBarProps<PageKey>) {
Line 15:
EN: Declares a local constant used by the component rendering logic. Code: const active = navItems.find((item) => item.key === currentPage) ?? navItems[0];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const active = navItems.find((item) => item.key === currentPage) ?? navItems[0];
Line 17:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 18:
EN: Starts a React fragment without adding an extra DOM wrapper. Code: <>
中文：开始 React Fragment，避免增加额外 DOM 包裹。 代码：<>
Line 19:
EN: Opens a JSX element or component in the UI layout. Code: <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:ml-72 lg:px-7">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:ml-72 lg:px-7">
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center justify-between gap-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center justify-between gap-4">
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <div className="min-w-0">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="min-w-0">
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">LiftOps</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">LiftOps</p>
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="truncate text-base font-black text-slate-950">{active.label}</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="truncate text-base font-black text-slate-950">{active.label}</h1>
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <div className="hidden min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="hidden min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
Line 26:
EN: Renders a self-closing JSX component or element. Code: <Search size={16} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Search size={16} />
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <span>Search metrics, risks, phases</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span>Search metrics, risks, phases</span>
Line 28:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
Line 30:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {active.labelZh}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{active.labelZh}
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 32:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 33:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <nav className="fixed inset-x-3 bottom-3 z-30 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-300/70 backdrop-blur lg:hidden">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<nav className="fixed inset-x-3 bottom-3 z-30 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-300/70 backdrop-blur lg:hidden">
Line 36:
EN: Iterates over mock data to render repeated UI elements. Code: {navItems.map((item) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{navItems.map((item) => {
Line 37:
EN: Declares a local constant used by the component rendering logic. Code: const Icon = item.icon;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const Icon = item.icon;
Line 38:
EN: Declares a local constant used by the component rendering logic. Code: const isActive = item.key === currentPage;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const isActive = item.key === currentPage;
Line 40:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <button
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<button
Line 42:
EN: Passes a prop or HTML attribute into the JSX element. Code: key={item.key}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：key={item.key}
Line 43:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="button"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="button"
Line 44:
EN: Passes a prop or HTML attribute into the JSX element. Code: onClick={() => onNavigate(item.key)}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：onClick={() => onNavigate(item.key)}
Line 45:
EN: Passes a prop or HTML attribute into the JSX element. Code: title={`${item.label} / ${item.labelZh}`}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title={`${item.label} / ${item.labelZh}`}
Line 46:
EN: Passes a prop or HTML attribute into the JSX element. Code: className={`flex min-h-14 min-w-[4.75rem] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：className={`flex min-h-14 min-w-[4.75rem] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${
Line 47:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: isActive ? "bg-slate-950 text-white" : "text-slate-500"
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：isActive ? "bg-slate-950 text-white" : "text-slate-500"
Line 48:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }`}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}`}
Line 49:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 50:
EN: Renders a self-closing JSX component or element. Code: <Icon size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Icon size={18} />
Line 51:
EN: Opens a JSX element or component in the UI layout. Code: <span className="max-w-full truncate px-1">{item.labelZh}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="max-w-full truncate px-1">{item.labelZh}</span>
Line 52:
EN: Closes a JSX element opened earlier in the layout. Code: </button>
中文：关闭前面打开的 JSX 元素。 代码：</button>
Line 53:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 54:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 55:
EN: Closes a JSX element opened earlier in the layout. Code: </nav>
中文：关闭前面打开的 JSX 元素。 代码：</nav>
Line 56:
EN: Closes the React fragment. Code: </>
中文：关闭 React Fragment。 代码：</>
Line 57:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 58:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { Search } from "lucide-react";
import type { NavItem } from "./Sidebar";

type TopBarProps<PageKey extends string = string> = {
  navItems: NavItem<PageKey>[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
};

export function TopBar<PageKey extends string>({
  navItems,
  currentPage,
  onNavigate,
}: TopBarProps<PageKey>) {
  const active = navItems.find((item) => item.key === currentPage) ?? navItems[0];

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:ml-72 lg:px-7">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-slate-500">LiftOps</p>
            <h1 className="truncate text-base font-black text-slate-950">{active.label}</h1>
          </div>
          <div className="hidden min-w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
            <Search size={16} />
            <span>Search metrics, risks, phases</span>
          </div>
          <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
            {active.labelZh}
          </span>
        </div>
      </header>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl shadow-slate-300/70 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === currentPage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              title={`${item.label} / ${item.labelZh}`}
              className={`flex min-h-14 min-w-[4.75rem] flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-bold transition ${
                isActive ? "bg-slate-950 text-white" : "text-slate-500"
              }`}
            >
              <Icon size={18} />
              <span className="max-w-full truncate px-1">{item.labelZh}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
