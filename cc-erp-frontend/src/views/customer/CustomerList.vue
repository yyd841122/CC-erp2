<template>
  <div class="customer-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">客户管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增客户
        </el-button>
        <el-dropdown @command="handleExcelCommand">
          <el-button :icon="Download">
            Excel操作 <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export">导出数据</el-dropdown-item>
              <el-dropdown-item command="import">导入数据</el-dropdown-item>
              <el-dropdown-item command="template">下载模板</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInputRef"
      type="file"
      accept=".xlsx,.xls"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="客户名称">
          <el-input
            v-model="searchForm.customerName"
            placeholder="请输入客户名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.isEnabled"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="启用" :value="true" />
            <el-option label="禁用" :value="false" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="customerCode" label="客户编码" width="120" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="address" label="地址" min-width="150" show-overflow-tooltip />
        <el-table-column prop="logisticsInfo" label="物流信息" min-width="150" show-overflow-tooltip />
        <el-table-column prop="creditLimit" label="信用额度" width="110" align="right">
          <template #default="{ row }">
            ¥{{ ((row.creditLimit || 0) / 100).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="isEnabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'info'" size="small">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <CustomerDialog
      v-model="dialogVisible"
      :data="currentRow"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh, Download, ArrowDown } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCustomerList, deleteCustomer, createCustomer } from '@/api/customer'
import { exportToExcel, importFromExcel, downloadTemplate } from '@/utils/excel'
import CustomerDialog from './CustomerDialog.vue'

const searchForm = reactive({
  customerName: '',
  isEnabled: ''
})

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)
const fileInputRef = ref()

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    const data = await getCustomerList(params)
    tableData.value = data.records || data
    pagination.total = data.total || 0
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.customerName = ''
  searchForm.isEnabled = ''
  pagination.page = 1
  loadData()
}

// 刷新
const handleRefresh = () => {
  loadData()
}

// 新增
const handleAdd = () => {
  currentRow.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该客户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteCustomer(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消或接口失败
  }
}

// 分页
const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

// Excel 列配置
const excelColumns = [
  { key: 'customerCode', label: '客户编码' },
  { key: 'customerName', label: '客户名称', required: true },
  { key: 'phone', label: '联系电话' },
  { key: 'address', label: '地址' },
  { key: 'logisticsInfo', label: '物流信息' },
  { key: 'creditLimit', label: '信用额度' },
  { key: 'isEnabled', label: '启用状态' },
  { key: 'remark', label: '备注' }
]

// Excel 操作命令处理
const handleExcelCommand = (command) => {
  switch (command) {
    case 'export':
      handleExport()
      break
    case 'import':
      handleImport()
      break
    case 'template':
      handleDownloadTemplate()
      break
  }
}

// 导出数据
const handleExport = async () => {
  try {
    loading.value = true
    const data = await getCustomerList({ page: 1, size: 10000 })
    const allData = data.records || data

    if (allData.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    // 转换信用额度格式（分转元）
    const exportData = allData.map(item => ({
      ...item,
      creditLimit: item.creditLimit ? (item.creditLimit / 100).toFixed(2) : '',
      isEnabled: item.isEnabled ? '启用' : '禁用'
    }))

    exportToExcel(exportData, excelColumns, '客户数据.xlsx')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  } finally {
    loading.value = false
  }
}

// 导入数据
const handleImport = () => {
  fileInputRef.value?.click()
}

// 文件选择处理
const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  try {
    loading.value = true
    const data = await importFromExcel(file)

    if (data.length === 0) {
      ElMessage.warning('Excel 文件为空')
      return
    }

    await ElMessageBox.confirm(
      `检测到 ${data.length} 条数据，确定要导入吗？`,
      '导入确认',
      {
        confirmButtonText: '确定导入',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    let successCount = 0
    let errorCount = 0

    for (const row of data) {
      try {
        const customerData = {
          customerCode: row['客户编码'] || '',
          customerName: row['客户名称'],
          phone: row['联系电话'] || '',
          address: row['地址'] || '',
          logisticsInfo: row['物流信息'] || '',
          creditLimit: row['信用额度'] ? Math.round(parseFloat(row['信用额度']) * 100) : 0,
          isEnabled: row['启用状态'] === '启用' || row['启用状态'] === true,
          remark: row['备注'] || ''
        }

        await createCustomer(customerData)
        successCount++
      } catch (err) {
        console.error('导入失败:', row, err)
        errorCount++
      }
    }

    ElMessage.success(`导入完成：成功 ${successCount} 条，失败 ${errorCount} 条`)
    loadData()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败：' + error.message)
  } finally {
    loading.value = false
    event.target.value = ''
  }
}

// 下载模板
const handleDownloadTemplate = () => {
  downloadTemplate(excelColumns, '客户导入模板.xlsx')
}

// 初始化加载
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.customer-list-container {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }

  .page-actions {
    display: flex;
    gap: 8px;
  }
}

.search-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }

  .el-table {
    .el-table__header th {
      background: #FAFAFA;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}
</style>
