const express = require('express');
const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
const PORT = 3001;

// 启用 CORS，允许前端访问
app.use(cors());

// 提供 Excel 文件流接口 - 从内存生成示例数据
app.get('/api/excel', (req, res) => {
  // 创建示例数据
  const data = [
    ['姓名', '年龄', '城市', '邮箱'],
    ['张三', 25, '北京', 'zhangsan@example.com'],
    ['李四', 30, '上海', 'lisi@example.com'],
    ['王五', 28, '广州', 'wangwu@example.com'],
    ['赵六', 35, '深圳', 'zhaoliu@example.com'],
    ['钱七', 27, '杭州', 'qianqi@example.com']
  ];

  // 创建工作簿和工作表
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(wb, ws, '员工信息');

  // 将工作簿转换为 Buffer
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  // 设置响应头，告诉浏览器这是 Excel 文件流
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'inline; filename="sample.xlsx"');
  res.setHeader('Content-Length', excelBuffer.length);

  // 发送 Buffer 数据
  res.send(excelBuffer);
});

// 另一个接口：返回更大的数据集
app.get('/api/excel/large', (req, res) => {
  // 生成大量数据
  const data = [['ID', '姓名', '部门', '工资', '入职日期']];
  
  const names = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];
  const departments = ['技术部', '市场部', '财务部', '人事部', '运营部'];
  
  for (let i = 1; i <= 100; i++) {
    const name = names[i % names.length] + (i > 8 ? i : '');
    const dept = departments[i % departments.length];
    const salary = Math.floor(Math.random() * 20000) + 8000;
    const date = `20${20 + Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}-01`;
    
    data.push([i, name, dept, salary, date]);
  }

  // 创建工作簿和工作表
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(data);

  // 设置列宽
  ws['!cols'] = [
    { wch: 5 },  // ID
    { wch: 15 }, // 姓名
    { wch: 10 }, // 部门
    { wch: 10 }, // 工资
    { wch: 12 }  // 入职日期
  ];

  XLSX.utils.book_append_sheet(wb, ws, '员工列表');

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'inline; filename="employees.xlsx"');
  res.setHeader('Content-Length', excelBuffer.length);

  res.send(excelBuffer);
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
  console.log(`API endpoints:`);
  console.log(`  - GET http://localhost:${PORT}/api/excel (小型示例)`);
  console.log(`  - GET http://localhost:${PORT}/api/excel/large (大型数据集)`);
});
