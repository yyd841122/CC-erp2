import * as XLSX from 'xlsx'

/**
 * 导出数据到 Excel
 * @param {Array} data - 要导出的数据
 * @param {Object} columns - 列配置 { key: '字段名', label: '列标题' }
 * @param {String} fileName - 文件名
 */
export const exportToExcel = (data, columns, fileName = '导出数据.xlsx') => {
  if (!data || data.length === 0) {
    return false
  }

  // 转换数据格式
  const exportData = data.map(row => {
    const newRow = {}
    columns.forEach(col => {
      newRow[col.label] = row[col.key] ?? ''
    })
    return newRow
  })

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exportData)

  // 设置列宽
  const colWidths = columns.map(col => ({
    wch: Math.max(col.label.length, 15)
  }))
  worksheet['!cols'] = colWidths

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1')

  // 生成文件名（带时间戳）
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-T:]/g, '')
  const fullFileName = fileName.replace('.xlsx', '') + `_${timestamp}.xlsx`

  // 下载文件
  XLSX.writeFile(workbook, fullFileName)
  return true
}

/**
 * 从 Excel 导入数据
 * @param {File} file - Excel 文件
 * @returns {Promise<Array>} 解析后的数据
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })

        // 获取第一个工作表
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // 解析为 JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          defval: null // 空单元格返回 null
        })

        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }

    reader.readAsArrayBuffer(file)
  })
}

/**
 * 下载 Excel 导入模板
 * @param {Object} columns - 列配置 { key: '字段名', label: '列标题', required: boolean }
 * @param {String} fileName - 模板文件名
 */
export const downloadTemplate = (columns, fileName = '导入模板.xlsx') => {
  // 创建工作表数据（使用数组数组格式，更可控）
  const data = [
    columns.map(col => col.label), // 第一行：列标题
    columns.map(col => {
      // 第二行：示例数据（必填字段有示例，可选字段留空）
      if (col.required) {
        return getExampleValue(col.label)
      }
      return ''
    })
  ]

  // 创建工作表
  const worksheet = XLSX.utils.aoa_to_sheet(data)

  // 设置列宽
  worksheet['!cols'] = columns.map(col => ({
    wch: Math.max(col.label.length + 4, 15)
  }))

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '导入数据')

  // 添加说明工作表
  const instructions = [
    ['导入说明'],
    [''],
    ['必填字段：'],
    ...columns.filter(c => c.required).map(c => [`- ${c.label}`]),
    [''],
    ['可选字段：'],
    ...columns.filter(c => !c.required).map(c => [`- ${c.label}`]),
    [''],
    ['注意事项：'],
    ['1. 请勿修改第一行列标题'],
    ['2. 必填字段不能为空'],
    ['3. 删除示例行（第二行），添加您的数据'],
    ['4. 分类名称必须是系统中已存在的分类'],
    ['5. 价格格式：100.00 表示100元'],
    ['6. 启用状态填写：启用 或 禁用']
  ]
  const instructionSheet = XLSX.utils.aoa_to_sheet(instructions)
  instructionSheet['!cols'] = [{ wch: 35 }]
  XLSX.utils.book_append_sheet(workbook, instructionSheet, '说明')

  // 下载文件
  XLSX.writeFile(workbook, fileName)
}

/**
 * 根据列标签生成示例值
 */
function getExampleValue(label) {
  const examples = {
    '商品编码': 'P00001',
    '商品名称': '示例商品名称',
    '分类名称': '办公用品',
    '规格': '标准规格',
    '单位': '套',
    '成本价': '100.00',
    '销售价': '150.00',
    '最低库存': '10',
    '最高库存': '1000',
    '启用状态': '启用',
    '备注': '这是备注信息'
  }
  return examples[label] || `示例${label}`
}
