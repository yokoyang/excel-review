import React, { useState, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import XLSX from 'xlsx';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [gridApi, setGridApi] = useState(null);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');

  // AG-Grid 默认列定义
  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    minWidth: 100
  };

  // 从后端获取 Excel 文件流并解析
  const loadExcelFromBackend = useCallback(async (endpoint, displayName) => {
    setLoading(true);
    setError(null);
    
    try {
      // 以 ArrayBuffer 形式获取文件流
      const response = await axios.get(`${API_BASE_URL}${endpoint}`, {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }
      });

      // 从响应头获取文件名
      const contentDisposition = response.headers['content-disposition'];
      let filename = displayName || 'data.xlsx';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      setFileName(filename);

      // 将 ArrayBuffer 转换为 Uint8Array
      const data = new Uint8Array(response.data);
      
      // 使用 xlsx 库解析 Excel 数据
      const workbook = XLSX.read(data, { type: 'array' });
      
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 将工作表转换为 JSON 格式
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        setError('Excel 文件为空');
        setLoading(false);
        return;
      }

      // 第一行作为表头
      const headers = jsonData[0];
      
      // 生成列定义
      const columns = headers.map((header, index) => ({
        headerName: header || `列${index + 1}`,
        field: `col${index}`,
        tooltipField: `col${index}`
      }));
      
      setColumnDefs(columns);

      // 将数据转换为 AG-Grid 需要的格式
      const rows = jsonData.slice(1).map((row, rowIndex) => {
        const rowData = {};
        headers.forEach((_, colIndex) => {
          rowData[`col${colIndex}`] = row[colIndex] !== undefined ? row[colIndex] : '';
        });
        return rowData;
      });

      setRowData(rows);
      
    } catch (err) {
      console.error('加载 Excel 文件失败:', err);
      setError(`加载失败：${err.message}`);
      setRowData([]);
      setColumnDefs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Grid 初始化完成回调
  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  // 导出为 CSV
  const exportToCSV = () => {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: fileName.replace('.xlsx', '.csv') || 'export.csv'
      });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>📊 Excel 文件预览</h1>
      
      {/* 按钮区域 */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => loadExcelFromBackend('/excel', '示例数据.xlsx')}
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? '加载中...' : '加载小型示例'}
        </button>
        
        <button
          onClick={() => loadExcelFromBackend('/excel/large', '员工列表.xlsx')}
          style={buttonStyle}
          disabled={loading}
        >
          {loading ? '加载中...' : '加载大型数据集'}
        </button>
        
        {rowData.length > 0 && (
          <button
            onClick={exportToCSV}
            style={{...buttonStyle, backgroundColor: '#28a745'}}
          >
            📥 导出 CSV
          </button>
        )}
      </div>

      {/* 状态显示 */}
      {loading && (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          ⏳ 正在加载 Excel 文件...
        </div>
      )}

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          ❌ {error}
        </div>
      )}

      {fileName && !loading && !error && (
        <div style={{ marginBottom: '10px', color: '#666' }}>
          📄 当前文件：<strong>{fileName}</strong> | 
          行数：<strong>{rowData.length}</strong> | 
          列数：<strong>{columnDefs.length}</strong>
        </div>
      )}

      {/* AG-Grid 表格 */}
      <div 
        className="ag-theme-alpine"
        style={{ 
          height: '600px', 
          width: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      >
        {columnDefs.length > 0 ? (
          <AgGridReact
            defaultColDef={defaultColDef}
            columnDefs={columnDefs}
            rowData={rowData}
            pagination={true}
            paginationPageSize={50}
            enableRangeSelection={true}
            stopEditingWhenCellsLoseFocus={true}
            onGridReady={onGridReady}
            animateRows={true}
            rowSelection="multiple"
            suppressExcelExport={true}
            suppressCsvExport={true}
          />
        ) : (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#999',
            fontSize: '16px'
          }}>
            👆 请点击上方按钮加载 Excel 文件进行预览
          </div>
        )}
      </div>

      {/* 使用说明 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h3 style={{ marginTop: 0 }}>💡 使用说明</h3>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>本应用使用 <strong>AG-Grid</strong> 作为 Excel 文件预览组件，支持 React 16</li>
          <li>点击按钮从后端获取 Excel 文件流</li>
          <li>使用 <strong>xlsx</strong> 库解析 Excel 二进制数据</li>
          <li>表格支持排序、筛选、列宽调整等功能</li>
          <li>可以导出当前视图为 CSV 文件</li>
          <li>支持分页显示，每页显示 50 条数据</li>
        </ul>
      </div>
    </div>
  );
}

// 按钮样式
const buttonStyle = {
  padding: '10px 20px',
  fontSize: '14px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s'
};

export default App;
