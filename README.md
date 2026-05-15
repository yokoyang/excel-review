# Excel 文件预览应用

本项目包含一个简单的后端和前端应用，用于演示如何从后端获取 Excel 文件流并在前端进行预览。

## 项目结构

```
/workspace
├── backend/          # Node.js 后端
│   ├── server.js     # Express 服务器
│   └── package.json  # 后端依赖配置
└── frontend/         # React 16 前端
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js    # 主应用组件
    │   └── index.js  # 入口文件
    └── package.json  # 前端依赖配置
```

## 技术栈

### 后端
- **Node.js** + **Express**: 提供 HTTP API
- **xlsx**: 生成 Excel 文件
- **cors**: 跨域支持

### 前端（重点）
- **React 16**: UI 框架
- **AG-Grid**: Excel 文件预览组件（推荐）
- **xlsx**: 解析 Excel 二进制数据
- **axios**: HTTP 请求库

## 前端 Excel 预览工具推荐

我推荐使用 **AG-Grid** 作为前端 Excel 文件预览工具，理由如下：

### AG-Grid 优势
1. ✅ **完全支持 React 16**
2. ✅ **性能优秀**：可处理大量数据（10 万行+）
3. ✅ **功能丰富**：
   - 排序、筛选、列宽调整
   - 分页显示
   - 单元格编辑
   - 导出 CSV/Excel
   - 固定列头
   - 响应式布局
4. ✅ **社区版免费**：功能已经足够强大
5. ✅ **文档完善**：易于上手
6. ✅ **主题定制**：提供多种内置主题

### 其他可选方案
- **react-data-grid**: 轻量级选择
- **Handsontable**: 类似 Excel 的交互体验（商业授权）
- **SheetJS + 自定义表格**: 完全自定义但开发成本高

## 快速开始

### 1. 启动后端

```bash
cd /workspace/backend
npm install
npm start
```

后端将在 http://localhost:3001 启动，提供以下 API：
- `GET /api/excel` - 小型示例数据
- `GET /api/excel/large` - 100 行大型数据集

### 2. 启动前端

```bash
cd /workspace/frontend
npm install
npm start
```

前端将在 http://localhost:3000 启动

## 功能说明

1. **加载 Excel 文件**：点击按钮从后端获取 Excel 文件流
2. **解析数据**：使用 xlsx 库将二进制数据转换为 JSON
3. **表格展示**：使用 AG-Grid 展示数据，支持：
   - 列排序（点击表头）
   - 数据筛选（表头菜单）
   - 列宽调整（拖拽列边界）
   - 分页导航
   - 多选行
4. **导出 CSV**：将当前数据导出为 CSV 文件

## 工作原理

1. 前端通过 axios 以 `arraybuffer` 类型请求后端 API
2. 后端生成 Excel 文件并以 Buffer 形式返回
3. 前端使用 xlsx 库解析 ArrayBuffer 数据
4. 将解析后的 JSON 数据传递给 AG-Grid 进行渲染

## 注意事项

- 确保后端和前端都启动后才能正常使用
- 前端默认请求 http://localhost:3001，如有需要可在 App.js 中修改 API_BASE_URL
- AG-Grid 的 CSS 样式已通过 CDN 在 index.html 中引入
