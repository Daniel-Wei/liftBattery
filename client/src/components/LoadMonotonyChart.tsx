/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/LoadMonotonyChart.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
中文：导入本 React 文件运行时需要的依赖。 代码：import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
Line 2:
EN: Imports TypeScript-only types used by this React file. Code: import type { TrendPoint } from "../types/forecast";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { TrendPoint } from "../types/forecast";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { EvidenceNote } from "./EvidenceNote";
中文：导入本 React 文件运行时需要的依赖。 代码：import { EvidenceNote } from "./EvidenceNote";
Line 5:
EN: Declares a local TypeScript type so component props stay explicit. Code: type LoadMonotonyChartProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type LoadMonotonyChartProps = {
Line 6:
EN: Defines one field on a TypeScript object shape. Code: data: TrendPoint[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：data: TrendPoint[];
Line 7:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 9:
EN: Exports a reusable React component or page component. Code: export function LoadMonotonyChart({ data }: LoadMonotonyChartProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function LoadMonotonyChart({ data }: LoadMonotonyChartProps) {
Line 10:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Load monotony / strain</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Load monotony / strain</p>
Line 13:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">Load pattern watch / 负荷模式观察</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">Load pattern watch / 负荷模式观察</h2>
Line 14:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 h-64">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 h-64">
Line 15:
EN: Opens a JSX element or component in the UI layout. Code: <ResponsiveContainer width="100%" height="100%">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<ResponsiveContainer width="100%" height="100%">
Line 16:
EN: Opens a JSX element or component in the UI layout. Code: <BarChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<BarChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
Line 17:
EN: Renders a self-closing JSX component or element. Code: <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
Line 18:
EN: Renders a self-closing JSX component or element. Code: <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
Line 19:
EN: Renders a self-closing JSX component or element. Code: <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
Line 20:
EN: Renders a self-closing JSX component or element. Code: <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14 }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14 }} />
Line 21:
EN: Renders a self-closing JSX component or element. Code: <Bar dataKey="monotony" name="Monotony" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Bar dataKey="monotony" name="Monotony" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
Line 22:
EN: Renders a self-closing JSX component or element. Code: <Bar dataKey="strain" name="Strain" fill="#f59e0b" radius={[8, 8, 0, 0]} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Bar dataKey="strain" name="Strain" fill="#f59e0b" radius={[8, 8, 0, 0]} />
Line 23:
EN: Closes a JSX element opened earlier in the layout. Code: </BarChart>
中文：关闭前面打开的 JSX 元素。 代码：</BarChart>
Line 24:
EN: Closes a JSX element opened earlier in the layout. Code: </ResponsiveContainer>
中文：关闭前面打开的 JSX 元素。 代码：</ResponsiveContainer>
Line 25:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4">
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <EvidenceNote type="watch" childrenZh="Monotony/strain 在 Phase 1 仅作为负荷模式观察示例；真实计算放到后续 domain logic。">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<EvidenceNote type="watch" childrenZh="Monotony/strain 在 Phase 1 仅作为负荷模式观察示例；真实计算放到后续 domain logic。">
Line 28:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Monotony/strain is shown as a load-pattern watch example in Phase 1; real calculations belong in later domain logic.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Monotony/strain is shown as a load-pattern watch example in Phase 1; real calculations belong in later domain logic.
Line 29:
EN: Closes a JSX element opened earlier in the layout. Code: </EvidenceNote>
中文：关闭前面打开的 JSX 元素。 代码：</EvidenceNote>
Line 30:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 31:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 32:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 33:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TrendPoint } from "../types/forecast";
import { EvidenceNote } from "./EvidenceNote";

type LoadMonotonyChartProps = {
  data: TrendPoint[];
};

export function LoadMonotonyChart({ data }: LoadMonotonyChartProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">Load monotony / strain</p>
      <h2 className="text-xl font-black text-slate-950">Load pattern watch / 负荷模式观察</h2>
      <div className="mt-5 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14 }} />
            <Bar dataKey="monotony" name="Monotony" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="strain" name="Strain" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4">
        <EvidenceNote type="watch" childrenZh="Monotony/strain 在 Phase 1 仅作为负荷模式观察示例；真实计算放到后续 domain logic。">
          Monotony/strain is shown as a load-pattern watch example in Phase 1; real calculations belong in later domain logic.
        </EvidenceNote>
      </div>
    </section>
  );
}
