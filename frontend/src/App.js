// 使用全局变量（从 index.html 中的 script 标签加载）
const React = window.React;
const { useState, useCallback, useMemo } = React;
const { AgGridReact } = window.agGridReact;
const XLSX = window.XLSX;
const axios = window.axios;

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [gridApi, setGridApi] = useState(null);
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  
  // AG-Grid 默认列定义
  const defaultColDef = useMemo(function() {
    return {
      resizable: true,
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100
    };
  }, []);

  // 从后端获取 Excel 文件流并解析
  const loadExcelFromBackend = useCallback(function(endpoint, displayName) {
    setLoading(true);
    setError(null);
    
    return axios.get(API_BASE_URL + endpoint, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      }
    }).then(function(response) {
      // 从响应头获取文件名
      const contentDisposition = response.headers['content-disposition'];
      var filename = displayName || 'data.xlsx';
      if (contentDisposition) {
        var filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      setFileName(filename);

      // 将 ArrayBuffer 转换为 Uint8Array
      var data = new Uint8Array(response.data);
      
      // 使用 xlsx 库解析 Excel 数据
      var workbook = XLSX.read(data, { type: 'array' });
      
      // 获取第一个工作表
      var firstSheetName = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[firstSheetName];
      
      // 将工作表转换为 JSON 格式
      var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length === 0) {
        setError('Excel 文件为空');
        setLoading(false);
        return;
      }

      // 第一行作为表头
      var headers = jsonData[0];
      
      // 生成列定义
      var columns = headers.map(function(header, index) {
        return {
          headerName: header || ('列' + (index + 1)),
          field: 'col' + index,
          tooltipField: 'col' + index
        };
      });
      
      setColumnDefs(columns);

      // 将数据转换为 AG-Grid 需要的格式
      var rows = jsonData.slice(1).map(function(row, rowIndex) {
        var rowData = {};
        headers.forEach(function(_, colIndex) {
          rowData['col' + colIndex] = row[colIndex] !== undefined ? row[colIndex] : '';
        });
        return rowData;
      });

      setRowData(rows);
    }).catch(function(err) {
      console.error('加载 Excel 文件失败:', err);
      setError('加载失败：' + err.message);
      setRowData([]);
      setColumnDefs([]);
    }).finally(function() {
      setLoading(false);
    });
  }, []);

  // Grid 初始化完成回调
  function onGridReady(params) {
    setGridApi(params.api);
  }

  // 导出为 CSV
  function exportToCSV() {
    if (gridApi) {
      gridApi.exportDataAsCsv({
        fileName: fileName.replace('.xlsx', '.csv') || 'export.csv'
      });
    }
  }

  // 按钮样式
  var buttonStyle = {
    padding: '10px 20px',
    fontSize: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  };

  return React.createElement('div', { style: { padding: '20px', fontFamily: 'Arial, sans-serif' } },
    React.createElement('h1', { style: { color: '#333', marginBottom: '20px' } }, '📊 Excel 文件预览'),
    
    React.createElement('div', { style: { marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' } },
      React.createElement('button', {
        onClick: function() { loadExcelFromBackend('/excel', '示例数据.xlsx'); },
        style: buttonStyle,
        disabled: loading
      }, loading ? '加载中...' : '加载小型示例'),
      
      React.createElement('button', {
        onClick: function() { loadExcelFromBackend('/excel/large', '员工列表.xlsx'); },
        style: buttonStyle,
        disabled: loading
      }, loading ? '加载中...' : '加载大型数据集'),
      
      rowData.length > 0 ? React.createElement('button', {
        onClick: exportToCSV,
        style: Object.assign({}, buttonStyle, { backgroundColor: '#28a745' })
      }, '📥 导出 CSV') : null
    ),

    loading ? React.createElement('div', { style: { padding: '20px', textAlign: 'center', color: '#666' } }, '⏳ 正在加载 Excel 文件...') : null,

    error ? React.createElement('div', { 
      style: { 
        padding: '15px', 
        backgroundColor: '#f8d7da', 
        color: '#721c24', 
        borderRadius: '4px',
        marginBottom: '20px'
      }
    }, '❌ ', error) : null,

    (fileName && !loading && !error) ? React.createElement('div', { style: { marginBottom: '10px', color: '#666' } },
      '📄 当前文件：', React.createElement('strong', null, fileName), ' | ',
      '行数：', React.createElement('strong', null, rowData.length), ' | ',
      '列数：', React.createElement('strong', null, columnDefs.length)
    ) : null,

    React.createElement('div', {
      className: 'ag-theme-alpine',
      style: { height: '600px', width: '100%', border: '1px solid #ddd', borderRadius: '4px' }
    },
      columnDefs.length > 0 ?
        React.createElement(AgGridReact, {
          defaultColDef: defaultColDef,
          columnDefs: columnDefs,
          rowData: rowData,
          pagination: true,
          paginationPageSize: 50,
          enableRangeSelection: true,
          stopEditingWhenCellsLoseFocus: true,
          onGridReady: onGridReady,
          animateRows: true,
          rowSelection: 'multiple',
          suppressExcelExport: true,
          suppressCsvExport: true
        }) :
        React.createElement('div', { style: { padding: '40px', textAlign: 'center', color: '#999', fontSize: '16px' } },
          '👆 请点击上方按钮加载 Excel 文件进行预览'
        )
    ),

    React.createElement('div', { style: { marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '4px' } },
      React.createElement('h3', { style: { marginTop: 0 } }, '💡 使用说明'),
      React.createElement('ul', { style: { lineHeight: '1.8', color: '#555' } },
        React.createElement('li', null, '本应用使用 ', React.createElement('strong', null, 'AG-Grid'), ' 作为 Excel 文件预览组件，支持 React 16'),
        React.createElement('li', null, '点击按钮从后端获取 Excel 文件流'),
        React.createElement('li', null, '使用 ', React.createElement('strong', null, 'xlsx'), ' 库解析 Excel 二进制数据'),
        React.createElement('li', null, '表格支持排序、筛选、列宽调整等功能'),
        React.createElement('li', null, '可以导出当前视图为 CSV 文件'),
        React.createElement('li', null, '支持分页显示，每页显示 50 条数据')
      )
    )
  );
}

window.App = App;
