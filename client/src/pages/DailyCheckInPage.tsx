/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/DailyCheckInPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Calculator } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Calculator } from "lucide-react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { CheckInSlider } from "../components/CheckInSlider";
中文：导入本 React 文件运行时需要的依赖。 代码：import { CheckInSlider } from "../components/CheckInSlider";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "../components/EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "../components/EvidenceNote";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { EmptyState } from "../components/EmptyState";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EmptyState } from "../components/EmptyState";
Line 5:
EN: Imports a runtime dependency used by this React file. Code: import { mockCheckInDimensions, mockWellnessCheckIns } from "../data/mockData";
中文：导入本 React 文件运行时需要的依赖。 代码：import { mockCheckInDimensions, mockWellnessCheckIns } from "../data/mockData";
Line 7:
EN: Declares a local constant used by the component rendering logic. Code: const latest = mockWellnessCheckIns[mockWellnessCheckIns.length - 1];
中文：声明组件渲染逻辑会用到的本地常量。 代码：const latest = mockWellnessCheckIns[mockWellnessCheckIns.length - 1];
Line 9:
EN: Exports a reusable React component or page component. Code: export function DailyCheckInPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function DailyCheckInPage() {
Line 10:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-400">Daily Check-in / 每日 Check-in</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-400">Daily Check-in / 每日 Check-in</p>
Line 14:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black md:text-5xl">Input state, not a medical questionnaire.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black md:text-5xl">Input state, not a medical questionnaire.</h1>
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
Line 16:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Phase 1 shows static wellness, RIR/RPE, and session-RPE fields. No input is saved.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Phase 1 shows static wellness, RIR/RPE, and session-RPE fields. No input is saved.
Line 17:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 18:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 20:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
Line 21:
EN: Iterates over mock data to render repeated UI elements. Code: {mockCheckInDimensions.map((dimension) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{mockCheckInDimensions.map((dimension) => (
Line 22:
EN: Renders a self-closing JSX component or element. Code: <CheckInSlider key={dimension.key} dimension={dimension} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CheckInSlider key={dimension.key} dimension={dimension} />
Line 23:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote
Line 28:
EN: Passes a prop or HTML attribute into the JSX element. Code: type="established"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：type="established"
Line 29:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Session-RPE load"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Session-RPE load"
Line 30:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="Session-RPE 负荷"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="Session-RPE 负荷"
Line 31:
EN: Passes a prop or HTML attribute into the JSX element. Code: childrenZh="使用 session RPE x duration 作为训练课内部负荷示例。当前仅展示 mock 数据，不保存。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：childrenZh="使用 session RPE x duration 作为训练课内部负荷示例。当前仅展示 mock 数据，不保存。"
Line 32:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: >
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：>
Line 33:
EN: Reads static mock data for the Phase 1 UI. Code: Uses session RPE x duration as an internal training load example. This is display-only mock data in Phase 1.
中文：读取 Phase 1 静态 UI 使用的 mock 数据。 代码：Uses session RPE x duration as an internal training load example. This is display-only mock data in Phase 1.
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-center gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-center gap-3">
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
Line 38:
EN: Renders a self-closing JSX component or element. Code: <Calculator size={18} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Calculator size={18} />
Line 39:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 40:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="font-black text-slate-950">Today mock load / 今日示例负荷</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="font-black text-slate-950">Today mock load / 今日示例负荷</h2>
Line 42:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-sm text-slate-500">Session RPE {latest.sessionRpe} x {latest.sessionDurationMinutes} minutes</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-sm text-slate-500">Session RPE {latest.sessionRpe} x {latest.sessionDurationMinutes} minutes</p>
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 44:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-5 text-4xl font-black text-slate-950">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-5 text-4xl font-black text-slate-950">
Line 46:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {(latest.sessionRpe ?? 0) * (latest.sessionDurationMinutes ?? 0)} AU
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{(latest.sessionRpe ?? 0) * (latest.sessionDurationMinutes ?? 0)} AU
Line 47:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 48:
EN: Closes a JSX element opened earlier in the layout. Code: </article>
中文：关闭前面打开的 JSX 元素。 代码：</article>
Line 49:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 51:
EN: Opens a JSX element or component in the UI layout. Code: <EmptyState
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EmptyState
Line 52:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Saving starts in Phase 2"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Saving starts in Phase 2"
Line 53:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="Phase 2 开始保存"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="Phase 2 开始保存"
Line 54:
EN: Passes a prop or HTML attribute into the JSX element. Code: description="Phase 1 is intentionally static, so check-ins do not persist."
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：description="Phase 1 is intentionally static, so check-ins do not persist."
Line 55:
EN: Passes a prop or HTML attribute into the JSX element. Code: descriptionZh="Phase 1 刻意保持静态，因此 check-in 不会持久化。"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：descriptionZh="Phase 1 刻意保持静态，因此 check-in 不会持久化。"
Line 56:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
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

import { Calculator } from "lucide-react";
import { CheckInSlider } from "../components/CheckInSlider";
import { EvidenceNote } from "../components/EvidenceNote";
import { EmptyState } from "../components/EmptyState";
import { mockCheckInDimensions, mockWellnessCheckIns } from "../data/mockData";

const latest = mockWellnessCheckIns[mockWellnessCheckIns.length - 1];

export function DailyCheckInPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <p className="text-xs font-semibold uppercase text-slate-400">Daily Check-in / 每日 Check-in</p>
        <h1 className="mt-2 text-3xl font-black md:text-5xl">Input state, not a medical questionnaire.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Phase 1 shows static wellness, RIR/RPE, and session-RPE fields. No input is saved.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockCheckInDimensions.map((dimension) => (
          <CheckInSlider key={dimension.key} dimension={dimension} />
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <EvidenceNote
          type="established"
          title="Session-RPE load"
          titleZh="Session-RPE 负荷"
          childrenZh="使用 session RPE x duration 作为训练课内部负荷示例。当前仅展示 mock 数据，不保存。"
        >
          Uses session RPE x duration as an internal training load example. This is display-only mock data in Phase 1.
        </EvidenceNote>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Calculator size={18} />
            </div>
            <div>
              <h2 className="font-black text-slate-950">Today mock load / 今日示例负荷</h2>
              <p className="text-sm text-slate-500">Session RPE {latest.sessionRpe} x {latest.sessionDurationMinutes} minutes</p>
            </div>
          </div>
          <p className="mt-5 text-4xl font-black text-slate-950">
            {(latest.sessionRpe ?? 0) * (latest.sessionDurationMinutes ?? 0)} AU
          </p>
        </article>
      </section>

      <EmptyState
        title="Saving starts in Phase 2"
        titleZh="Phase 2 开始保存"
        description="Phase 1 is intentionally static, so check-ins do not persist."
        descriptionZh="Phase 1 刻意保持静态，因此 check-in 不会持久化。"
      />
    </div>
  );
}
