/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/components/MultiMetricChart.tsx
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
EN: Imports TypeScript-only types used by this React file. Code: import type { ForecastPoint, TrendPoint } from "../types/forecast";
中文：导入本 React 文件使用的 TypeScript 类型，不进入运行时代码。 代码：import type { ForecastPoint, TrendPoint } from "../types/forecast";
Line 12:
EN: Declares a local TypeScript type so component props stay explicit. Code: type ChartPoint = TrendPoint | ForecastPoint;
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type ChartPoint = TrendPoint | ForecastPoint;
Line 14:
EN: Declares a local TypeScript type so component props stay explicit. Code: type MetricLine<T extends ChartPoint> = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type MetricLine<T extends ChartPoint> = {
Line 15:
EN: Defines one field on a TypeScript object shape. Code: key: keyof T;
中文：定义 TypeScript 对象结构中的一个字段。 代码：key: keyof T;
Line 16:
EN: Defines one field on a TypeScript object shape. Code: name: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：name: string;
Line 17:
EN: Defines one field on a TypeScript object shape. Code: color: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：color: string;
Line 18:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 20:
EN: Declares a local TypeScript type so component props stay explicit. Code: type MultiMetricChartProps<T extends ChartPoint> = {
中文：声明本文件内部使用的 TypeScript 类型，让组件 props 更明确。 代码：type MultiMetricChartProps<T extends ChartPoint> = {
Line 21:
EN: Defines one field on a TypeScript object shape. Code: title: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：title: string;
Line 22:
EN: Defines one field on a TypeScript object shape. Code: titleZh: string;
中文：定义 TypeScript 对象结构中的一个字段。 代码：titleZh: string;
Line 23:
EN: Defines one field on a TypeScript object shape. Code: data: T[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：data: T[];
Line 24:
EN: Defines one field on a TypeScript object shape. Code: lines: MetricLine<T>[];
中文：定义 TypeScript 对象结构中的一个字段。 代码：lines: MetricLine<T>[];
Line 25:
EN: Closes the current TypeScript block or object. Code: };
中文：关闭当前 TypeScript 代码块或对象。 代码：};
Line 27:
EN: Exports a reusable React component or page component. Code: export function MultiMetricChart<T extends ChartPoint>({ title, titleZh, data, lines }: MultiMetricChartProps<T>) {
中文：导出可复用 React 组件或页面组件。 代码：export function MultiMetricChart<T extends ChartPoint>({ title, titleZh, data, lines }: MultiMetricChartProps<T>) {
Line 28:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
Line 30:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap items-start justify-between gap-3">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap items-start justify-between gap-3">
Line 31:
EN: Opens a JSX element or component in the UI layout. Code: <div>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div>
Line 32:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
Line 33:
EN: Opens a JSX element or component in the UI layout. Code: <h2 className="text-xl font-black text-slate-950">{titleZh}</h2>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h2 className="text-xl font-black text-slate-950">{titleZh}</h2>
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 35:
EN: Opens a JSX element or component in the UI layout. Code: <div className="flex flex-wrap gap-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="flex flex-wrap gap-2">
Line 36:
EN: Iterates over mock data to render repeated UI elements. Code: {lines.map((line) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{lines.map((line) => (
Line 37:
EN: Opens a JSX element or component in the UI layout. Code: <span key={line.key as string} className="flex items-center gap-1 text-xs font-semibold text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<span key={line.key as string} className="flex items-center gap-1 text-xs font-semibold text-slate-500">
Line 38:
EN: Renders a self-closing JSX component or element. Code: <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
Line 39:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: {line.name}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{line.name}
Line 40:
EN: Closes a JSX element opened earlier in the layout. Code: </span>
中文：关闭前面打开的 JSX 元素。 代码：</span>
Line 41:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 42:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 43:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 44:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mt-5 h-72">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mt-5 h-72">
Line 45:
EN: Opens a JSX element or component in the UI layout. Code: <ResponsiveContainer width="100%" height="100%">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<ResponsiveContainer width="100%" height="100%">
Line 46:
EN: Opens a JSX element or component in the UI layout. Code: <LineChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<LineChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
Line 47:
EN: Renders a self-closing JSX component or element. Code: <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
Line 48:
EN: Renders a self-closing JSX component or element. Code: <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
Line 49:
EN: Renders a self-closing JSX component or element. Code: <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
Line 50:
EN: Renders a self-closing JSX component or element. Code: <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }} />
Line 51:
EN: Iterates over mock data to render repeated UI elements. Code: {lines.map((line) => (
中文：遍历 mock 数据并渲染重复 UI 元素。 代码：{lines.map((line) => (
Line 52:
EN: Renders a self-closing JSX component or element. Code: <Line key={line.key as string} type="monotone" dataKey={line.key as string} name={line.name} stroke={line.color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<Line key={line.key as string} type="monotone" dataKey={line.key as string} name={line.name} stroke={line.color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
Line 53:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ))}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：))}
Line 54:
EN: Closes a JSX element opened earlier in the layout. Code: </LineChart>
中文：关闭前面打开的 JSX 元素。 代码：</LineChart>
Line 55:
EN: Closes a JSX element opened earlier in the layout. Code: </ResponsiveContainer>
中文：关闭前面打开的 JSX 元素。 代码：</ResponsiveContainer>
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

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ForecastPoint, TrendPoint } from "../types/forecast";

type ChartPoint = TrendPoint | ForecastPoint;

type MetricLine<T extends ChartPoint> = {
  key: keyof T;
  name: string;
  color: string;
};

type MultiMetricChartProps<T extends ChartPoint> = {
  title: string;
  titleZh: string;
  data: T[];
  lines: MetricLine<T>[];
};

export function MultiMetricChart<T extends ChartPoint>({ title, titleZh, data, lines }: MultiMetricChartProps<T>) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">{title}</p>
          <h2 className="text-xl font-black text-slate-950">{titleZh}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {lines.map((line) => (
            <span key={line.key as string} className="flex items-center gap-1 text-xs font-semibold text-slate-500">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: line.color }} />
              {line.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-5 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: "1px solid #e2e8f0", borderRadius: 14, boxShadow: "0 12px 36px rgba(15,23,42,0.12)" }} />
            {lines.map((line) => (
              <Line key={line.key as string} type="monotone" dataKey={line.key as string} name={line.name} stroke={line.color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
