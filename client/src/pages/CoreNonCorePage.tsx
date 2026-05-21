/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/CoreNonCorePage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { CoreNonCorePanel } from "../components/CoreNonCorePanel";
中文：导入本 React 文件运行时需要的依赖。 代码：import { CoreNonCorePanel } from "../components/CoreNonCorePanel";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "../components/EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "../components/EvidenceNote";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import {
中文：导入本 React 文件运行时需要的依赖。 代码：import {
Line 4:
EN: Reads static mock data for the Phase 1 UI. Code: mockCoreWorkPlans,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockCoreWorkPlans,
Line 5:
EN: Reads static mock data for the Phase 1 UI. Code: mockSupportLoadPlans,
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：mockSupportLoadPlans,
Line 6:
EN: Reads static mock data for the Phase 1 UI. Code: } from "../data/mockData";
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：} from "../data/mockData";
Line 8:
EN: Exports a reusable React component or page component. Code: export function CoreNonCorePage() {
中文：导出可复用 React 组件或页面组件。 代码：export function CoreNonCorePage() {
Line 9:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 10:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <header>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header>
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Core / Non-Core / 核心与非核心</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Core / Non-Core / 核心与非核心</p>
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Separate productive work from support load.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Separate productive work from support load.</h1>
Line 14:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 max-w-2xl text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 max-w-2xl text-slate-500">
Line 15:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Core is the work directly tied to the block goal. Support load can help, but it can also crowd recovery when it exceeds plan.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Core is the work directly tied to the block goal. Support load can help, but it can also crowd recovery when it exceeds plan.
Line 16:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 17:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 19:
EN: Renders a self-closing JSX component or element. Code: <CoreNonCorePanel core={mockCoreWorkPlans} support={mockSupportLoadPlans} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CoreNonCorePanel core={mockCoreWorkPlans} support={mockSupportLoadPlans} />
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 lg:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 lg:grid-cols-2">
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Core examples / 核心训练示例</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Core examples / 核心训练示例</h2>
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 grid gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 grid gap-3">
Line 25:
EN: Iterates over mock data to render repeated UI elements. Code: {mockCoreWorkPlans.map((item) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockCoreWorkPlans.map((item) => (
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <div key={item.id} className="rounded-xl bg-slate-50 p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={item.id} className="rounded-xl bg-slate-50 p-4">
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">{item.targetArea}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">{item.targetArea}</p>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{item.targetAreaZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{item.targetAreaZh}</p>
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-sm text-slate-600">{item.completedHardSets}/{item.plannedHardSets} hard sets · {item.priority}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-sm text-slate-600">{item.completedHardSets}/{item.plannedHardSets} hard sets · {item.priority}</p>
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 31:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 32:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 33:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Support load / 支持负荷</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Support load / 支持负荷</h2>
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 grid gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 grid gap-3">
Line 38:
EN: Iterates over mock data to render repeated UI elements. Code: {mockSupportLoadPlans.map((item) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockSupportLoadPlans.map((item) => (
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <div key={item.id} className="rounded-xl bg-slate-50 p-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={item.id} className="rounded-xl bg-slate-50 p-4">
Line 40:
EN: Opens a JSX element or component in the UI layout. Code: <p className="font-bold text-slate-950">{item.label}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="font-bold text-slate-950">{item.label}</p>
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">{item.labelZh}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">{item.labelZh}</p>
Line 42:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 text-sm text-slate-600">{item.completedUnits}/{item.plannedUnits} {item.unitLabel}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 text-sm text-slate-600">{item.completedUnits}/{item.plannedUnits} {item.unitLabel}</p>
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 44:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 45:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 46:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 47:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote
Line 50:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="heuristic"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="heuristic"
Line 51:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Non-core boundary"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Non-core boundary"
Line 52:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="非核心边界"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="非核心边界"
Line 53:
EN: Passes a prop or HTML attribute into the JSX element. Code: childrenZh="Non-Core Overload 是产品观察语言，用于提示支持性工作可能挤占恢复，不代表诊断。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：childrenZh="Non-Core Overload 是产品观察语言，用于提示支持性工作可能挤占恢复，不代表诊断。"
Line 54:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 55:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Non-Core Overload is product watch language for support work that may crowd recovery; it is not a diagnosis.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Non-Core Overload is product watch language for support work that may crowd recovery; it is not a diagnosis.
Line 56:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 57:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 58:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 59:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { CoreNonCorePanel } from "../components/CoreNonCorePanel";
import { EvidenceNote } from "../components/EvidenceNote";
import {
  mockCoreWorkPlans,
  mockSupportLoadPlans,
} from "../data/mockData";

export function CoreNonCorePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Core / Non-Core / 核心与非核心</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Separate productive work from support load.</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Core is the work directly tied to the block goal. Support load can help, but it can also crowd recovery when it exceeds plan.
        </p>
      </header>

      <CoreNonCorePanel core={mockCoreWorkPlans} support={mockSupportLoadPlans} />

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Core examples / 核心训练示例</h2>
          <div className="mt-4 grid gap-3">
            {mockCoreWorkPlans.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{item.targetArea}</p>
                <p className="text-sm text-slate-500">{item.targetAreaZh}</p>
                <p className="mt-2 text-sm text-slate-600">{item.completedHardSets}/{item.plannedHardSets} hard sets · {item.priority}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Support load / 支持负荷</h2>
          <div className="mt-4 grid gap-3">
            {mockSupportLoadPlans.map((item) => (
              <div key={item.id} className="rounded-xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">{item.label}</p>
                <p className="text-sm text-slate-500">{item.labelZh}</p>
                <p className="mt-2 text-sm text-slate-600">{item.completedUnits}/{item.plannedUnits} {item.unitLabel}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <EvidenceNote
        type="heuristic"
        title="Non-core boundary"
        titleZh="非核心边界"
        childrenZh="Non-Core Overload 是产品观察语言，用于提示支持性工作可能挤占恢复，不代表诊断。"
      >
        Non-Core Overload is product watch language for support work that may crowd recovery; it is not a diagnosis.
      </EvidenceNote>
    </div>
  );
}
