/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/pages/TrendsPage.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import { LoadMonotonyChart } from "../components/LoadMonotonyChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { LoadMonotonyChart } from "../components/LoadMonotonyChart";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import { MultiMetricChart } from "../components/MultiMetricChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { MultiMetricChart } from "../components/MultiMetricChart";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import { TrendLineChart } from "../components/TrendLineChart";
中文：导入本 React 文件运行时需要的依赖。 代码：import { TrendLineChart } from "../components/TrendLineChart";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import { mockTrendData } from "../data/mockData";
中文：导入本 React 文件运行时需要的依赖。 代码：import { mockTrendData } from "../data/mockData";
Line 6:
EN: Exports a reusable React component or page component. Code: export function TrendsPage() {
中文：导出可复用 React 组件或页面组件。 代码：export function TrendsPage() {
Line 7:
EN: Starts the JSX tree returned by this component or callback. Code: return (
中文：开始返回组件或回调函数的 JSX 结构。 代码：return (
Line 8:
EN: Opens a JSX element or component in the UI layout. Code: <div className="mx-auto max-w-7xl space-y-6">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="mx-auto max-w-7xl space-y-6">
Line 9:
EN: Opens a JSX element or component in the UI layout. Code: <header>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<header>
Line 10:
EN: Opens a JSX element or component in the UI layout. Code: <p className="text-xs font-semibold uppercase text-slate-500">Trends / 趋势</p>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="text-xs font-semibold uppercase text-slate-500">Trends / 趋势</p>
Line 11:
EN: Opens a JSX element or component in the UI layout. Code: <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Load, recovery, bodyweight, and pressure.</h1>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Load, recovery, bodyweight, and pressure.</h1>
Line 12:
EN: Opens a JSX element or component in the UI layout. Code: <p className="mt-2 max-w-2xl text-slate-500">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<p className="mt-2 max-w-2xl text-slate-500">
Line 13:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: Static trend curves for training load, fatigue, sleep, hunger, mood, bodyweight, cardio, performance, calories, and carbs.
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：Static trend curves for training load, fatigue, sleep, hunger, mood, bodyweight, cardio, performance, calories, and carbs.
Line 14:
EN: Closes a JSX element opened earlier in the layout. Code: </p>
中文：关闭前面打开的 JSX 元素。 代码：</p>
Line 15:
EN: Closes a JSX element opened earlier in the layout. Code: </header>
中文：关闭前面打开的 JSX 元素。 代码：</header>
Line 17:
EN: Opens a JSX element or component in the UI layout. Code: <MultiMetricChart
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<MultiMetricChart
Line 18:
EN: Passes a prop or HTML attribute into the JSX element. Code: title="Training state trend"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：title="Training state trend"
Line 19:
EN: Passes a prop or HTML attribute into the JSX element. Code: titleZh="训练状态趋势"
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：titleZh="训练状态趋势"
Line 20:
EN: Passes a prop or HTML attribute into the JSX element. Code: data={mockTrendData}
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：data={mockTrendData}
Line 21:
EN: Passes a prop or HTML attribute into the JSX element. Code: lines={[
中文：向 JSX 元素传入 prop 或 HTML 属性。 代码：lines={[
Line 22:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "trainingLoad", name: "Training load", color: "#0f172a" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "trainingLoad", name: "Training load", color: "#0f172a" },
Line 23:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "recoveryCapacity", name: "Capacity", color: "#10b981" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "recoveryCapacity", name: "Capacity", color: "#10b981" },
Line 24:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "fatigue", name: "Fatigue", color: "#f59e0b" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "fatigue", name: "Fatigue", color: "#f59e0b" },
Line 25:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: { key: "performance", name: "Performance", color: "#0284c7" },
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：{ key: "performance", name: "Performance", color: "#0284c7" },
Line 26:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ]}
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：]}
Line 27:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: />
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：/>
Line 29:
EN: Opens a JSX element or component in the UI layout. Code: <div className="grid gap-5 lg:grid-cols-2">
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<div className="grid gap-5 lg:grid-cols-2">
Line 30:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Bodyweight trend" titleZh="体重趋势" data={mockTrendData} dataKey="bodyweight" color="#0284c7" suffix=" kg" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Bodyweight trend" titleZh="体重趋势" data={mockTrendData} dataKey="bodyweight" color="#0284c7" suffix=" kg" />
Line 31:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Calories" titleZh="热量" data={mockTrendData} dataKey="calories" color="#e11d48" suffix=" kcal" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Calories" titleZh="热量" data={mockTrendData} dataKey="calories" color="#e11d48" suffix=" kcal" />
Line 32:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Carbs" titleZh="碳水" data={mockTrendData} dataKey="carbs" color="#8b5cf6" suffix=" g" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Carbs" titleZh="碳水" data={mockTrendData} dataKey="carbs" color="#8b5cf6" suffix=" g" />
Line 33:
EN: Renders a self-closing JSX component or element. Code: <TrendLineChart title="Cardio" titleZh="有氧" data={mockTrendData} dataKey="cardio" color="#06b6d4" suffix=" min" />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<TrendLineChart title="Cardio" titleZh="有氧" data={mockTrendData} dataKey="cardio" color="#06b6d4" suffix=" min" />
Line 34:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 36:
EN: Renders a self-closing JSX component or element. Code: <LoadMonotonyChart data={mockTrendData} />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<LoadMonotonyChart data={mockTrendData} />
Line 37:
EN: Closes a JSX element opened earlier in the layout. Code: </div>
中文：关闭前面打开的 JSX 元素。 代码：</div>
Line 38:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);
Line 39:
EN: Closes the current TypeScript block or object. Code: }
中文：关闭当前 TypeScript 代码块或对象。 代码：}

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import { LoadMonotonyChart } from "../components/LoadMonotonyChart";
import { MultiMetricChart } from "../components/MultiMetricChart";
import { TrendLineChart } from "../components/TrendLineChart";
import { mockTrendData } from "../data/mockData";

export function TrendsPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase text-slate-500">Trends / 趋势</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950 md:text-5xl">Load, recovery, bodyweight, and pressure.</h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Static trend curves for training load, fatigue, sleep, hunger, mood, bodyweight, cardio, performance, calories, and carbs.
        </p>
      </header>

      <MultiMetricChart
        title="Training state trend"
        titleZh="训练状态趋势"
        data={mockTrendData}
        lines={[
          { key: "trainingLoad", name: "Training load", color: "#0f172a" },
          { key: "recoveryCapacity", name: "Capacity", color: "#10b981" },
          { key: "fatigue", name: "Fatigue", color: "#f59e0b" },
          { key: "performance", name: "Performance", color: "#0284c7" },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <TrendLineChart title="Bodyweight trend" titleZh="体重趋势" data={mockTrendData} dataKey="bodyweight" color="#0284c7" suffix=" kg" />
        <TrendLineChart title="Calories" titleZh="热量" data={mockTrendData} dataKey="calories" color="#e11d48" suffix=" kcal" />
        <TrendLineChart title="Carbs" titleZh="碳水" data={mockTrendData} dataKey="carbs" color="#8b5cf6" suffix=" g" />
        <TrendLineChart title="Cardio" titleZh="有氧" data={mockTrendData} dataKey="cardio" color="#06b6d4" suffix=" min" />
      </div>

      <LoadMonotonyChart data={mockTrendData} />
    </div>
  );
}
