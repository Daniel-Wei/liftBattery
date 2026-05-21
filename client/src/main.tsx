/*
LiftOps React line annotations / LiftOps React 每行注释
File: client/src/main.tsx
EN: This block explains each non-empty source line below without changing runtime behavior.
中文：本注释块解释下方每个非空源码行，不改变运行行为。

Line 1:
EN: Imports a runtime dependency used by this React file. Code: import React from "react";
中文：导入本 React 文件运行时需要的依赖。 代码：import React from "react";
Line 2:
EN: Imports a runtime dependency used by this React file. Code: import ReactDOM from "react-dom/client";
中文：导入本 React 文件运行时需要的依赖。 代码：import ReactDOM from "react-dom/client";
Line 3:
EN: Imports a runtime dependency used by this React file. Code: import App from "./App";
中文：导入本 React 文件运行时需要的依赖。 代码：import App from "./App";
Line 4:
EN: Imports a runtime dependency used by this React file. Code: import "./styles.css";
中文：导入本 React 文件运行时需要的依赖。 代码：import "./styles.css";
Line 6:
EN: Keeps this React and TypeScript line in place for the current UI behavior. Code: ReactDOM.createRoot(document.getElementById("root")!).render(
中文：保留当前 UI 行所需的 React 与 TypeScript 逻辑。 代码：ReactDOM.createRoot(document.getElementById("root")!).render(
Line 7:
EN: Opens a JSX element or component in the UI layout. Code: <React.StrictMode>
中文：打开 UI 布局中的 JSX 元素或组件。 代码：<React.StrictMode>
Line 8:
EN: Renders a self-closing JSX component or element. Code: <App />
中文：渲染一个自闭合 JSX 组件或元素。 代码：<App />
Line 9:
EN: Closes a JSX element opened earlier in the layout. Code: </React.StrictMode>,
中文：关闭前面打开的 JSX 元素。 代码：</React.StrictMode>,
Line 10:
EN: Closes the returned JSX expression. Code: );
中文：关闭返回的 JSX 表达式。 代码：);

End LiftOps React line annotations / 结束 LiftOps React 每行注释
*/

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
