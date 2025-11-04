<template>
  <div class="excel-parser-container">
    <el-card title="Excel 文件解析" class="excel-card">
      <!-- 文件上传区域 -->
      <el-upload
        ref="upload"
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :before-upload="beforeUpload"
        accept=".xlsx,.xls"
        class="upload-btn"
      >
        <el-button size="small" type="primary">点击上传 Excel 文件</el-button>
        <div slot="tip" class="el-upload__tip">
          仅支持 .xlsx/.xls 格式文件，单个文件数据量不超过 10 万行
        </div>
      </el-upload>

      <!-- 进度条 -->
      <el-progress
        v-if="uploadProgress > 0 && uploadProgress < 100"
        :percentage="uploadProgress"
        status="active"
        :stroke-width="2"
        class="upload-progress"
      ></el-progress>

      <!-- 工作表切换 -->
      <el-select
        v-if="worksheets.length > 0"
        v-model="currentWorksheet"
        @change="handleWorksheetChange"
        placeholder="请选择工作表"
        style="width: 200px; margin: 15px 0;"
      >
        <el-option
          v-for="sheet in worksheets"
          :key="sheet.name"
          :label="sheet.name"
          :value="sheet.name"
        ></el-option>
      </el-select>

      <!-- 数据表格 -->
      <el-table
        v-if="tableData.length > 0"
        :data="tableData"
        stripe
        border
        style="width: 100%"
        height="600px"
        :default-sort="{prop: 'id', order: 'ascending'}"
      >
        <el-table-column
          v-for="(column, index) in tableColumns"
          :key="index"
          :prop="column.prop"
          :label="column.label"
          :width="column.width || 120"
          show-overflow-tooltip
        ></el-table-column>
      </el-table>

      <!-- 空数据提示 -->
      <el-empty
        v-if="worksheets.length > 0 && tableData.length === 0"
        description="当前工作表无数据"
      ></el-empty>
    </el-card>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'

// 解析单元格值，处理日期和数字格式
function parseCellValue(cell) {
  if (!cell) return ''
  
  // 处理日期格式
  if (cell.t === 'n' && (XLSX.SSF.is_date(cell.v) || cell.w && cell.w.match(/^\d{4}-\d{2}-\d{2}/))) {
    try {
      const date = XLSX.SSF.to_date(cell.v)
      return date.toISOString().split('T')[0]
    } catch (e) {
      return cell.w || cell.v
    }
  }
  
  // 处理数字格式
  if (cell.t === 'n') {
    // 如果是整数
    if (Number.isInteger(cell.v)) {
      return cell.v.toString()
    }
    // 保留两位小数
    return cell.v.toFixed(2)
  }
  
  // 其他类型直接返回
  return cell.w || cell.v || ''
}

export default {
  name: 'ExcelParser',
  data() {
    return {
      file: null,
      worksheets: [],
      currentWorksheet: '',
      tableColumns: [],
      tableData: [],
      uploadProgress: 0
    }
  },
  methods: {
    // 文件上传前校验
    beforeUpload(file) {
      const isExcel = file.type === 'application/vnd.ms-excel' || 
                     file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      const isLt10M = file.size / 1024 / 1024 < 10
      
      if (!isExcel) {
        this.$message.error('上传文件必须是 Excel 格式！')
        return false
      }
      if (!isLt10M) {
        this.$message.error('上传文件大小不能超过 10MB！')
        return false
      }
      
      return true
    },
    
    // 文件选择变化
    handleFileChange(file) {
      this.file = file.raw
      this.parseExcelFile()
    },
    
    // 解析 Excel 文件
    parseExcelFile() {
      if (!this.file) return
      
      this.uploadProgress = 10
      this.$message.info('开始解析 Excel 文件...')
      
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          this.uploadProgress = 30
          
          // 解析 Excel 文件
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: 'array' })
          
          this.uploadProgress = 50
          
          // 获取所有工作表
          this.worksheets = workbook.SheetNames.map(name => ({
            name,
            sheet: workbook.Sheets[name]
          }))
          
          this.uploadProgress = 70
          
          // 默认显示第一个工作表
          if (this.worksheets.length > 0) {
            this.currentWorksheet = this.worksheets[0].name
            this.loadWorksheetData(this.worksheets[0].sheet)
          }
          
          this.uploadProgress = 100
          setTimeout(() => {
            this.uploadProgress = 0
          }, 1000)
          
          this.$message.success(`文件解析成功！共 ${this.worksheets.length} 个工作表`)
          
        } catch (error) {
          this.uploadProgress = 0
          console.error('解析失败:', error)
          
          if (error.message && error.message.includes('Corrupted zip')) {
            this.$message.error('文件损坏或格式不正确，请检查文件！')
          } else {
            this.$message.error('文件解析失败，请检查文件格式是否正确！')
          }
        }
      }
      
      reader.onerror = () => {
        this.uploadProgress = 0
        this.$message.error('文件读取失败，请检查文件！')
      }
      
      // 读取文件
      reader.readAsArrayBuffer(this.file)
    },
    
    // 切换工作表
    handleWorksheetChange(sheetName) {
      const worksheet = this.worksheets.find(s => s.name === sheetName)
      if (worksheet) {
        this.loadWorksheetData(worksheet.sheet)
      }
    },
    
    // 加载工作表数据
    loadWorksheetData(sheet) {
      try {
        // 解析工作表数据
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
        
        // 检查数据量是否超过 10 万行
        if (jsonData.length > 100000) {
          this.$message.error('数据量超过 10 万行限制，请拆分文件后再上传！')
          this.tableColumns = []
          this.tableData = []
          return
        }
        
        // 处理表头和数据
        if (jsonData.length > 0) {
          const headers = jsonData[0]
          const dataRows = jsonData.slice(1)
          
          // 生成表格列
          this.tableColumns = headers.map((header, index) => ({
            prop: `column${index}`,
            label: header || `列${index + 1}`,
            width: header ? Math.min(200, Math.max(100, header.length * 10)) : 100
          }))
          
          // 生成表格数据
          this.tableData = dataRows.map((row, rowIndex) => {
            const rowData = { id: rowIndex + 1 }
            headers.forEach((_, colIndex) => {
              const cellValue = row[colIndex]
              // 如果是原始单元格对象则解析，否则直接使用
              if (cellValue && typeof cellValue === 'object' && cellValue.t) {
                rowData[`column${colIndex}`] = parseCellValue(cellValue)
              } else {
                rowData[`column${colIndex}`] = cellValue || ''
              }
            })
            return rowData
          })
          
          this.$message.success(`加载成功！共 ${this.tableData.length} 行数据`)
        } else {
          this.tableColumns = []
          this.tableData = []
          this.$message.info('当前工作表无数据')
        }
        
      } catch (error) {
        console.error('加载工作表失败:', error)
        this.$message.error('工作表数据解析失败！')
        this.tableColumns = []
        this.tableData = []
      }
    }
  }
}
</script>

<style scoped>
.excel-parser-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.excel-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.upload-btn {
  margin-bottom: 20px;
}

.upload-progress {
  margin: 10px 0;
}
</style>