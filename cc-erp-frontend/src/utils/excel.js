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

        // 先解析所有数据（不指定 range）
        const allData = XLSX.utils.sheet_to_json(worksheet, {
          defval: null
        })

        // 过滤掉无效行（说明行、空行等）
        // 只保留包含"分类名称"等业务字段的行
        const validData = allData.filter(row => {
          // 检查是否包含任何业务数据字段（非说明性文字）
          const keys = Object.keys(row)
          const hasBusinessField = keys.some(key => {
            const val = String(row[key]).trim()
            // 跳过说明性文字
            if (val.includes('说明') || val.includes('必填') || val.includes('选填') || val === '示例') {
              return false
            }
            // 检查是否有实际内容
            return val !== null && val !== undefined && val !== ''
          })
          return hasBusinessField
        })

        console.log('[Excel导入] 解析结果:', { total: allData.length, valid: validData.length })
        resolve(validData)
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
  // 创建示例数据
  const exampleData = [{}]
  columns.forEach(col => {
    exampleData[0][col.label] = col.required ? `示例${col.label}` : ''
  })

  // 添加说明行
  const instructions = columns.map(col => {
    const req = col.required ? ' (必填)' : ' (选填)'
    return `${col.label}${req}`
  })

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(exampleData)

  // 在顶部添加说明
  XLSX.utils.sheet_add_aoa(worksheet, [['导入说明：']], { origin: 'A1' })
  XLSX.utils.sheet_add_aoa(worksheet, [instructions], { origin: 'A2' })
  XLSX.utils.sheet_add_aoa(worksheet, [['']], { origin: 'A3' })

  // 设置列宽
  const colWidths = columns.map(col => ({
    wch: Math.max(col.label.length, 15)
  }))
  worksheet['!cols'] = colWidths

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板')

  // 下载文件
  XLSX.writeFile(workbook, fileName)
}
