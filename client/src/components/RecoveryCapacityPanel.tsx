/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/RecoveryCapacityPanel.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { BatteryMedium } from "lucide-react";
中文：导入本 React 文件运行时需要的依赖。 代码：import { BatteryMedium } from "lucide-react";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { CapacitySummary } from "../types/operations";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { CapacitySummary } from "../types/operations";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "./EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "./EvidenceNote";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { StatusBadge } from "./StatusBadge";
中文：导入本 React 文件运行时需要的依赖。 代码：import { StatusBadge } from "./StatusBadge";
Line 6:
EN: Declares a local TypeScript type so component props stay explicit. Code: type RecoveryCapacityPanelProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type RecoveryCapacityPanelProps = {
Line 7:
EN: Defines one field on a TypeScript object shape. Code: capacity: CapacitySummary;
中文：定义 TypeScript 对象结构中的一个字段。 代码：capacity: CapacitySummary;
Line 8:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 10:
EN: Exports a reusable React component or page component. Code: export function RecoveryCapacityPanel({ capacity }: RecoveryCapacityPanelProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function RecoveryCapacityPanel({ capacity }: RecoveryCapacityPanelProps) {
Line 11:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-start justify-between gap-3">
Line 14:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Capacity</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Capacity</p>
Line 16:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="mt-1 text-xl font-black text-slate-950">Recovery Capacity Proxy / 恢复容量 Proxy</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="mt-1 text-xl font-black text-slate-950">Recovery Capacity Proxy / 恢复容量 Proxy</h2>
Line 17:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 18:
EN: Renders a self-closing JSX component or element. Code: <StatusBadge status={capacity.status} label={capacity.status} labelZh="状态" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<StatusBadge status={capacity.status} label={capacity.status} labelZh="状态" />
Line 19:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 21:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-6 flex items-center gap-5">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-6 flex items-center gap-5">
Line 22:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
Line 23:
EN: Renders a self-closing JSX component or element. Code: <BatteryMedium size={34} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<BatteryMedium size={34} />
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex items-end gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex items-end gap-2">
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <span className="text-5xl font-black text-slate-950">{capacity.recoveryCapacityProxy}</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="text-5xl font-black text-slate-950">{capacity.recoveryCapacityProxy}</span>
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <span className="pb-2 text-sm font-bold text-slate-500">/100 proxy</span>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span className="pb-2 text-sm font-bold text-slate-500">/100 proxy</span>
Line 29:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-sm text-slate-500">Capacity gap: {capacity.capacityGap} points / 容量缺口</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-sm text-slate-500">Capacity gap: {capacity.capacityGap} points / 容量缺口</p>
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 32:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 34:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 grid grid-cols-2 gap-3 text-sm">
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-xl bg-slate-50 p-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-xl bg-slate-50 p-3">
Line 36:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-slate-500">Planned load index</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-slate-500">Planned load index</p>
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-2xl font-black text-slate-950">{capacity.plannedLoadIndex}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-2xl font-black text-slate-950">{capacity.plannedLoadIndex}</p>
Line 38:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 39:
EN: Opens a JSX element or component in the UI layout. Code: <div className="rounded-xl bg-amber-50 p-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="rounded-xl bg-amber-50 p-3">
Line 40:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-amber-700">Capacity gap</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-amber-700">Capacity gap</p>
Line 41:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-1 text-2xl font-black text-amber-800">{capacity.capacityGap}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-1 text-2xl font-black text-amber-800">{capacity.capacityGap}</p>
Line 42:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4">
Line 46:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote type="proxy" childrenZh="这是基于 wellness 自评的训练容量 proxy，不是医学诊断或精确生理测量。">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote type="proxy" childrenZh="这是基于 wellness 自评的训练容量 proxy，不是医学诊断或精确生理测量。">
Line 47:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: This is a wellness-based training capacity proxy, not a diagnosis or exact physiological measurement.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：This is a wellness-based training capacity proxy, not a diagnosis or exact physiological measurement.
Line 48:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 49:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 50:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 51:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 52:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { BatteryMedium } from "lucide-react";
import type { CapacitySummary } from "../types/operations";
import { EvidenceNote } from "./EvidenceNote";
import { StatusBadge } from "./StatusBadge";

type RecoveryCapacityPanelProps = {
  capacity: CapacitySummary;
};

export function RecoveryCapacityPanel({ capacity }: RecoveryCapacityPanelProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Capacity</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Recovery Capacity Proxy / 恢复容量 Proxy</h2>
        </div>
        <StatusBadge status={capacity.status} label={capacity.status} labelZh="状态" />
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-950 text-emerald-300">
          <BatteryMedium size={34} />
        </div>
        <div>
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-slate-950">{capacity.recoveryCapacityProxy}</span>
            <span className="pb-2 text-sm font-bold text-slate-500">/100 proxy</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Capacity gap: {capacity.capacityGap} points / 容量缺口</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-slate-500">Planned load index</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{capacity.plannedLoadIndex}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-amber-700">Capacity gap</p>
          <p className="mt-1 text-2xl font-black text-amber-800">{capacity.capacityGap}</p>
        </div>
      </div>

      <div className="mt-4">
        <EvidenceNote type="proxy" childrenZh="这是基于 wellness 自评的训练容量 proxy，不是医学诊断或精确生理测量。">
          This is a wellness-based training capacity proxy, not a diagnosis or exact physiological measurement.
        </EvidenceNote>
      </div>
    </section>
  );
}
