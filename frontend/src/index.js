// 使用全局变量（从 index.html 中的 script 标签加载）
const React = window.React;
const ReactDOM = window.ReactDOM;

ReactDOM.render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(window.App, null)
  ),
  document.getElementById('root')
);
