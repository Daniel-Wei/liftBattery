/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/PrepTimelineGantt.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports TypeScript-only types used by this React file. Code: import type { TrainingPhase } from "../types/training";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { TrainingPhase } from "../types/training";
Line 3:
EN: Declares a local TypeScript type so component props stay explicit. Code: type PrepTimelineGanttProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type PrepTimelineGanttProps = {
Line 4:
EN: Defines one field on a TypeScript object shape. Code: phases: TrainingPhase[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：phases: TrainingPhase[];
Line 5:
EN: Defines one field on a TypeScript object shape. Code: currentWeek: number;
中文：定义 TypeScript 对象结构中的一个字段。 代码：currentWeek: number;
Line 6:
EN: Defines one field on a TypeScript object shape. Code: totalWeeks: number;
中文：定义 TypeScript 对象结构中的一个字段。 代码：totalWeeks: number;
Line 7:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 9:
EN: Declares a local constant used by the component rendering logic. Code: const phaseStyles: Record<TrainingPhase["type"], string> = {
中文：声明组件渲染逻辑会用到的本地常量。 代码：const phaseStyles: Record<TrainingPhase["type"], string> = {
Line 10:
EN: Defines one field on a TypeScript object shape. Code: baseline: "bg-emerald-500",
中文：定义 TypeScript 对象结构中的一个字段。 代码：baseline: "bg-emerald-500",
Line 11:
EN: Defines one field on a TypeScript object shape. Code: deficit: "bg-cyan-500",
中文：定义 TypeScript 对象结构中的一个字段。 代码：deficit: "bg-cyan-500",
Line 12:
EN: Defines one field on a TypeScript object shape. Code: accumulation: "bg-violet-500",
中文：定义 TypeScript 对象结构中的一个字段。 代码：accumulation: "bg-violet-500",
Line 13:
EN: Defines one field on a TypeScript object shape. Code: intensification: "bg-slate-900",
中文：定义 TypeScript 对象结构中的一个字段。 代码：intensification: "bg-slate-900",
Line 14:
EN: Defines one field on a TypeScript object shape. Code: fatigueWatch: "bg-amber-500",
中文：定义 TypeScript 对象结构中的一个字段。 代码：fatigueWatch: "bg-amber-500",
Line 15:
EN: Defines one field on a TypeScript object shape. Code: peak: "bg-rose-500",
中文：定义 TypeScript 对象结构中的一个字段。 代码：peak: "bg-rose-500",
Line 16:
EN: Defines one field on a TypeScript object shape. Code: recovery: "bg-teal-500",
中文：定义 TypeScript 对象结构中的一个字段。 代码：recovery: "bg-teal-500",
Line 17:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 19:
EN: Exports a reusable React component or page component. Code: export function PrepTimelineGantt({ phases, currentWeek, totalWeeks }: PrepTimelineGanttProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function PrepTimelineGantt({ phases, currentWeek, totalWeeks }: PrepTimelineGanttProps) {
Line 20:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap items-start justify-between gap-3">
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Block timeline</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Block timeline</p>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="mt-1 text-xl font-black text-slate-950">Gantt phase map / 阶段时间线</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="mt-1 text-xl font-black text-slate-950">Gantt phase map / 阶段时间线</h2>
Line 26:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
Line 28:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Week {currentWeek} / 第 {currentWeek} 周
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Week {currentWeek} / 第 {currentWeek} 周
Line 29:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 overflow-x-auto pb-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 overflow-x-auto pb-2">
Line 33:
EN: Opens a JSX element or component in the UI layout. Code: <div className="min-w-[720px]">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="min-w-[720px]">
Line 34:
EN: Opens a JSX element or component in the UI layout. Code: <div className="grid gap-1 text-center text-[10px] font-bold text-slate-400" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="grid gap-1 text-center text-[10px] font-bold text-slate-400" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
Line 35:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {Array.from({ length: totalWeeks }, (_, index) => (
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{Array.from({ length: totalWeeks }, (_, index) => (
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <span key={index + 1} className={index + 1 === currentWeek ? "text-slate-950" : undefined}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span key={index + 1} className={index + 1 === currentWeek ? "text-slate-950" : undefined}>
Line 37:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {index + 1}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{index + 1}
Line 38:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 39:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 40:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <div className="relative mt-3 grid gap-x-1 gap-y-3" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="relative mt-3 grid gap-x-1 gap-y-3" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
Line 42:
EN: Opens a JSX element or component in the UI layout. Code: <div
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div
Line 43:
EN: Passes a prop or HTML attribute into the JSX element. Code: className="pointer-events-none absolute inset-y-0 z-10 w-0.5 rounded-full bg-slate-950"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：className="pointer-events-none absolute inset-y-0 z-10 w-0.5 rounded-full bg-slate-950"
Line 44:
EN: Passes a prop or HTML attribute into the JSX element. Code: style={{ left: `calc(${((currentWeek - 0.5) / totalWeeks) * 100}% - 1px)` }}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：style={{ left: `calc(${((currentWeek - 0.5) / totalWeeks) * 100}% - 1px)` }}
Line 45:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 46:
EN: Iterates over mock data to render repeated UI elements. Code: {phases.map((phase) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{phases.map((phase) => (
Line 47:
EN: Opens a JSX element or component in the UI layout. Code: <div key={phase.id} className="relative min-h-14 rounded-xl bg-slate-100 p-1" style={{ gridColumn: `${phase.startWeek} / ${phase.endWeek + 1}` }}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div key={phase.id} className="relative min-h-14 rounded-xl bg-slate-100 p-1" style={{ gridColumn: `${phase.startWeek} / ${phase.endWeek + 1}` }}>
Line 48:
EN: Opens a JSX element or component in the UI layout. Code: <div className={`flex h-full flex-col justify-center rounded-lg px-3 py-2 text-white ${phaseStyles[phase.type]}`}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className={`flex h-full flex-col justify-center rounded-lg px-3 py-2 text-white ${phaseStyles[phase.type]}`}>
Line 49:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-xs font-black leading-tight">{phase.name}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-xs font-black leading-tight">{phase.name}</span>
Line 50:
EN: Opens a JSX element or component in the UI layout. Code: <span className="mt-1 text-[11px] leading-tight opacity-85">{phase.nameZh}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="mt-1 text-[11px] leading-tight opacity-85">{phase.nameZh}</span>
Line 51:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 52:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 53:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 54:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 55:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 56:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 57:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 58:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 59:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import type { TrainingPhase } from "../types/training";

type PrepTimelineGanttProps = {
  phases: TrainingPhase[];
  currentWeek: number;
  totalWeeks: number;
};

const phaseStyles: Record<TrainingPhase["type"], string> = {
  baseline: "bg-emerald-500",
  deficit: "bg-cyan-500",
  accumulation: "bg-violet-500",
  intensification: "bg-slate-900",
  fatigueWatch: "bg-amber-500",
  peak: "bg-rose-500",
  recovery: "bg-teal-500",
};

export function PrepTimelineGantt({ phases, currentWeek, totalWeeks }: PrepTimelineGanttProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Block timeline</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Gantt phase map / 阶段时间线</h2>
        </div>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
          Week {currentWeek} / 第 {currentWeek} 周
        </span>
      </div>

      <div className="mt-5 overflow-x-auto pb-2">
        <div className="min-w-[720px]">
          <div className="grid gap-1 text-center text-[10px] font-bold text-slate-400" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
            {Array.from({ length: totalWeeks }, (_, index) => (
              <span key={index + 1} className={index + 1 === currentWeek ? "text-slate-950" : undefined}>
                {index + 1}
              </span>
            ))}
          </div>
          <div className="relative mt-3 grid gap-x-1 gap-y-3" style={{ gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
            <div
              className="pointer-events-none absolute inset-y-0 z-10 w-0.5 rounded-full bg-slate-950"
              style={{ left: `calc(${((currentWeek - 0.5) / totalWeeks) * 100}% - 1px)` }}
            />
            {phases.map((phase) => (
              <div key={phase.id} className="relative min-h-14 rounded-xl bg-slate-100 p-1" style={{ gridColumn: `${phase.startWeek} / ${phase.endWeek + 1}` }}>
                <div className={`flex h-full flex-col justify-center rounded-lg px-3 py-2 text-white ${phaseStyles[phase.type]}`}>
                  <span className="text-xs font-black leading-tight">{phase.name}</span>
                  <span className="mt-1 text-[11px] leading-tight opacity-85">{phase.nameZh}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
