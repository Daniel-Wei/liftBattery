/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/Sidebar.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { LucideIcon } from "lucide-react";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { LucideIcon } from "lucide-react";
Line 3:
EN: Exports a shared TypeScript type for component props or navigation data. Code: export type NavItem<PageKey extends string = string> = {
中文：导出组件属性或导航数据使用的共享 TypeScript 类型。 代码：export type NavItem<PageKey extends string = string> = {
Line 4:
EN: Defines one field on a TypeScript object shape. Code: key: PageKey;
中文：定义 TypeScript 对象结构中的一个字段。 代码：key: PageKey;
Line 5:
EN: Defines one field on a TypeScript object shape. Code: label: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：label: string;
Line 6:
EN: Defines one field on a TypeScript object shape. Code: labelZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：labelZh: string;
Line 7:
EN: Defines one field on a TypeScript object shape. Code: icon: LucideIcon;
中文：定义 TypeScript 对象结构中的一个字段。 代码：icon: LucideIcon;
Line 8:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 10:
EN: Declares a local TypeScript type so component props stay explicit. Code: type SidebarProps<PageKey extends string = string> = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type SidebarProps<PageKey extends string = string> = {
Line 11:
EN: Defines one field on a TypeScript object shape. Code: navItems: NavItem<PageKey>[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：navItems: NavItem<PageKey>[];
Line 12:
EN: Defines one field on a TypeScript object shape. Code: currentPage: PageKey;
中文：定义 TypeScript 对象结构中的一个字段。 代码：currentPage: PageKey;
Line 13:
EN: Defines one field on a TypeScript object shape. Code: onNavigate: (page: PageKey) => void;
中文：定义 TypeScript 对象结构中的一个字段。 代码：onNavigate: (page: PageKey) => void;
Line 14:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 16:
EN: Exports a reusable React component or page component. Code: export function Sidebar<PageKey extends string>({
中文：导出可复用 React 组件或页面组件。 代码：export function Sidebar<PageKey extends string>({
Line 17:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: navItems,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：navItems,
Line 18:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: currentPage,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：currentPage,
Line 19:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: onNavigate,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：onNavigate,
Line 20:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }: SidebarProps<PageKey>) {
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}: SidebarProps<PageKey>) {
Line 21:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800 bg-[#070b12] p-4 text-white lg:flex lg:flex-col">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800 bg-[#070b12] p-4 text-white lg:flex lg:flex-col">
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <button
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<button
Line 24:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="button"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="button"
Line 25:
EN: Passes a prop or HTML attribute into the JSX element. Code: onClick={() => onNavigate(navItems[0].key)}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：onClick={() => onNavigate(navItems[0].key)}
Line 26:
EN: Passes a prop or HTML attribute into the JSX element. Code: className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
Line 27:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-3">
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">
Line 30:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: LO
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：LO
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span>
Line 33:
EN: Opens a JSX element or component in the UI layout. Code: <span className="block text-xl font-black">LiftOps</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="block text-xl font-black">LiftOps</span>
Line 34:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-xs text-slate-400">Training operations</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-xs text-slate-400">Training operations</span>
Line 35:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 36:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </button>
中文：关闭前面打开的 JSX 元素。 代码：</button>
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <nav className="mt-5 space-y-1">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<nav className="mt-5 space-y-1">
Line 40:
EN: Iterates over mock data to render repeated UI elements. Code: {navItems.map((item) => {
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{navItems.map((item) => {
Line 41:
EN: Declares a local constant used by the component rendering logic. Code: const Icon = item.icon;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const Icon = item.icon;
Line 42:
EN: Declares a local constant used by the component rendering logic. Code: const active = item.key === currentPage;
中文：声明组件渲染逻辑会用到的本地常量。 代码：const active = item.key === currentPage;
Line 44:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <button
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<button
Line 46:
EN: Passes a prop or HTML attribute into the JSX element. Code: key={item.key}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：key={item.key}
Line 47:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="button"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="button"
Line 48:
EN: Passes a prop or HTML attribute into the JSX element. Code: onClick={() => onNavigate(item.key)}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：onClick={() => onNavigate(item.key)}
Line 49:
EN: Passes a prop or HTML attribute into the JSX element. Code: className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
Line 50:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: active
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：active
Line 51:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ? "bg-white text-slate-950"
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：? "bg-white text-slate-950"
Line 52:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: : "text-slate-400 hover:bg-white/10 hover:text-white"
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：: "text-slate-400 hover:bg-white/10 hover:text-white"
Line 53:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: }`}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：}`}
Line 54:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 55:
EN: Renders a self-closing JSX component or element. Code: <Icon size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Icon size={18} />
Line 56:
EN: Opens a JSX element or component in the UI layout. Code: <span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span>
Line 57:
EN: Opens a JSX element or component in the UI layout. Code: <span className="block">{item.label}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="block">{item.label}</span>
Line 58:
EN: Opens a JSX element or component in the UI layout. Code: <span className={active ? "text-xs text-slate-500" : "text-xs text-slate-500"}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className={active ? "text-xs text-slate-500" : "text-xs text-slate-500"}>
Line 59:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {item.labelZh}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{item.labelZh}
Line 60:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 61:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 62:
EN: Closes a JSX element opened earlier in the layout. Code: </button>
中文：关闭前面打开的 JSX 元素。 代码：</button>
Line 63:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 64:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: })}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：})}
Line 65:
EN: Closes a JSX element opened earlier in the layout. Code: </nav>
中文：关闭前面打开的 JSX 元素。 代码：</nav>
Line 67:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
Line 68:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-white">Phase 1</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-white">Phase 1</p>
Line 69:
EN: Opens a JSX element or component in the UI layout. Code: <p>Static UI with mock data only.</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p>Static UI with mock data only.</p>
Line 70:
EN: Opens a JSX element or component in the UI layout. Code: <p>仅静态 UI 与 mock 数据。</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p>仅静态 UI 与 mock 数据。</p>
Line 71:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 72:
EN: Closes a JSX element opened earlier in the layout. Code: </aside>
中文：关闭前面打开的 JSX 元素。 代码：</aside>
Line 73:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 74:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { LucideIcon } from "lucide-react";

export type NavItem<PageKey extends string = string> = {
  key: PageKey;
  label: string;
  labelZh: string;
  icon: LucideIcon;
};

type SidebarProps<PageKey extends string = string> = {
  navItems: NavItem<PageKey>[];
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
};

export function Sidebar<PageKey extends string>({
  navItems,
  currentPage,
  onNavigate,
}: SidebarProps<PageKey>) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800 bg-[#070b12] p-4 text-white lg:flex lg:flex-col">
      <button
        type="button"
        onClick={() => onNavigate(navItems[0].key)}
        className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400 text-lg font-black text-slate-950">
            LO
          </span>
          <span>
            <span className="block text-xl font-black">LiftOps</span>
            <span className="text-xs text-slate-400">Training operations</span>
          </span>
        </div>
      </button>

      <nav className="mt-5 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.key === currentPage;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${
                active
                  ? "bg-white text-slate-950"
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span>
                <span className="block">{item.label}</span>
                <span className={active ? "text-xs text-slate-500" : "text-xs text-slate-500"}>
                  {item.labelZh}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400">
        <p className="font-bold text-white">Phase 1</p>
        <p>Static UI with mock data only.</p>
        <p>仅静态 UI 与 mock 数据。</p>
      </div>
    </aside>
  );
}
