/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/TrendLineChart.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import {
中文：导入本 React 文件运行时需要的依赖。 代码：import {
Line 2:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: CartesianGrid,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：CartesianGrid,
Line 3:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Line,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Line,
Line 4:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: LineChart,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：LineChart,
Line 5:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ResponsiveContainer,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：ResponsiveContainer,
Line 6:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Tooltip,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Tooltip,
Line 7:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: XAxis,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：XAxis,
Line 8:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: YAxis,
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：YAxis,
Line 9:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: } from "recharts";
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：} from "recharts";
Line 10:
EN: Imports TypeScript-only types used by this React file. Code: import type { TrendPoint } from "../types/forecast";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { TrendPoint } from "../types/forecast";
Line 12:
EN: Declares a local TypeScript type so component props stay explicit. Code: type TrendLineChartProps = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type TrendLineChartProps = {
Line 13:
EN: Defines one field on a TypeScript object shape. Code: title: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：title: string;
Line 14:
EN: Defines one field on a TypeScript object shape. Code: titleZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：titleZh: string;
Line 15:
EN: Defines one field on a TypeScript object shape. Code: data: TrendPoint[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：data: TrendPoint[];
Line 16:
EN: Defines one field on a TypeScript object shape. Code: dataKey: keyof TrendPoint;
中文：定义 TypeScript 对象结构中的一个字段。 代码：dataKey: keyof TrendPoint;
Line 17:
EN: Defines one field on a TypeScript object shape. Code: color: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：color: string;
Line 18:
EN: Defines one field on a TypeScript object shape. Code: suffix?: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：suffix?: string;
Line 19:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 21:
EN: Exports a reusable React component or page component. Code: export function TrendLineChart({ title, titleZh, data, dataKey, color, suffix }: TrendLineChartProps) {
中文：导出可复用 React 组件或页面组件。 代码：export function TrendLineChart({ title, titleZh, data, dataKey, color, suffix }: TrendLineChartProps) {
Line 22:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 23:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 24:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
Line 25:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-lg font-black text-slate-950">{titleZh}</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-lg font-black text-slate-950">{titleZh}</h2>
Line 26:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-4 h-56">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-4 h-56">
Line 27:
EN: Opens a JSX element or component in the UI layout. Code: <ResponsiveContainer width="100%" height="100%">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<ResponsiveContainer width="100%" height="100%">
Line 28:
EN: Opens a JSX element or component in the UI layout. Code: <LineChart data={data} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<LineChart data={data} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
Line 29:
EN: Renders a self-closing JSX component or element. Code: <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
Line 30:
EN: Renders a self-closing JSX component or element. Code: <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
Line 31:
EN: Renders a self-closing JSX component or element. Code: <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <Tooltip
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<Tooltip
Line 33:
EN: Passes a prop or HTML attribute into the JSX element. Code: formatter={(value) => [`${value}${suffix ?? ""}`, title]}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：formatter={(value) => [`${value}${suffix ?? ""}`, title]}
Line 34:
EN: Passes a prop or HTML attribute into the JSX element. Code: contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }}
Line 35:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 36:
EN: Renders a self-closing JSX component or element. Code: <Line type="monotone" dataKey={dataKey as string} stroke={color} strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 6 }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Line type="monotone" dataKey={dataKey as string} stroke={color} strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 6 }} />
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </LineChart>
中文：关闭前面打开的 JSX 元素。 代码：</LineChart>
Line 38:
EN: Closes a JSX element opened earlier in the layout. Code: </ResponsiveContainer>
中文：关闭前面打开的 JSX 元素。 代码：</ResponsiveContainer>
Line 39:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 40:
EN: Closes a JSX element opened earlier in the layout. Code: </section>
中文：关闭前面打开的 JSX 元素。 代码：</section>
Line 41:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 42:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "../types/forecast";

type TrendLineChartProps = {
  title: string;
  titleZh: string;
  data: TrendPoint[];
  dataKey: keyof TrendPoint;
  color: string;
  suffix?: string;
};

export function TrendLineChart({ title, titleZh, data, dataKey, color, suffix }: TrendLineChartProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
      <h2 className="text-lg font-black text-slate-950">{titleZh}</h2>
      <div className="mt-4 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 14, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
            <Tooltip
              formatter={(value) => [`${value}${suffix ?? ""}`, title]}
              contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }}
            />
            <Line type="monotone" dataKey={dataKey as string} stroke={color} strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: "#ffffff" }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
