<template>
  <div class="product-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">商品管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增商品
        </el-button>
        <el-button :icon="FolderOpened" @click="handleCategoryManage">
          分类管理
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
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="商品分类">
          <el-select
            v-model="searchForm.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            />
          </el-select>
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
      <!-- 批量操作工具栏 -->
      <div v-if="selectedRows.length > 0" class="batch-toolbar">
        <span class="selected-info">已选择 <strong>{{ selectedRows.length }}</strong> 项</span>
        <div class="batch-actions">
          <el-button type="danger" :icon="Delete" @click="handleBatchDelete">
            批量删除
          </el-button>
          <el-button type="primary" :icon="Edit" @click="showBatchCategoryDialog">
            批量更改分类
          </el-button>
          <el-button @click="handleClearSelection">
            取消选择
          </el-button>
        </div>
      </div>

      <el-table
        ref="tableRef"
        :data="tableData"
        stripe
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="商品编码" min-width="100" sortable />
        <el-table-column prop="productName" label="商品名称" min-width="150" show-overflow-tooltip sortable />
        <el-table-column prop="categoryName" label="分类" min-width="100" sortable />
        <el-table-column prop="spec" label="规格" min-width="80" sortable />
        <el-table-column prop="unit" label="单位" min-width="60" />
        <el-table-column prop="costPrice" label="成本价" min-width="90" align="right">
          <template #default="{ row }">
            ¥{{ (row.costPrice / 100).toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="salePrice" label="销售价" min-width="90" align="right">
          <template #default="{ row }">
            ¥{{ (row.salePrice / 100).toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="最低库存" min-width="80" align="center" />
        <el-table-column prop="isEnabled" label="状态" min-width="70" align="center">
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
    <ProductDialog
      v-model="dialogVisible"
      :data="currentRow"
      :categories="categories"
      @refresh="loadData"
    />

    <!-- 分类管理对话框 -->
    <CategoryDialog
      v-model="categoryDialogVisible"
      @refresh="handleCategoryRefresh"
      ref="categoryDialogRef"
    />

    <!-- 批量更改分类对话框 -->
    <el-dialog
      v-model="batchCategoryDialogVisible"
      title="批量更改分类"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="选中商品">
          <span class="selected-count">{{ selectedRows.length }} 个商品</span>
        </el-form-item>
        <el-form-item label="新分类">
          <el-select
            v-model="batchCategoryId"
            placeholder="请选择新分类"
            style="width: 100%;"
          >
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="商品列表">
          <div class="product-preview">
            <el-tag
              v-for="item in selectedRows.slice(0, 5)"
              :key="item.id"
              size="small"
              style="margin: 4px;"
            >
              {{ item.productName }}
            </el-tag>
            <span v-if="selectedRows.length > 5" class="more-hint">
              等 {{ selectedRows.length }} 个商品
            </span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchCategoryDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="batchUpdating" @click="handleBatchUpdateCategory">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh, FolderOpened, Download, ArrowDown, Delete, Edit } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList, deleteProduct, createProduct, updateProduct } from '@/api/product'
import { getCategoryList } from '@/api/productCategory'
import { exportToExcel, importFromExcel, downloadTemplate } from '@/utils/excel'
import ProductDialog from './ProductDialog.vue'
import CategoryDialog from './CategoryDialog.vue'

const searchForm = reactive({
  productName: '',
  categoryId: '',
  isEnabled: ''
})

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const categoryDialogVisible = ref(false)
const currentRow = ref(null)
const categoryDialogRef = ref()
const fileInputRef = ref()
const tableRef = ref()

// 批量操作相关
const selectedRows = ref([])
const batchCategoryDialogVisible = ref(false)
const batchCategoryId = ref(null)
const batchUpdating = ref(false)

// 分类列表
const categories = ref([])

// 加载分类数据
const loadCategories = async () => {
  try {
    const data = await getCategoryList()
    categories.value = data || []
  } catch (e) {
    console.error('加载分类失败:', e)
  }
}

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
    const data = await getProductList(params)
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
  searchForm.productName = ''
  searchForm.categoryId = ''
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
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消或接口失败
  }
}

// 表格选择变化
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
}
const handleSortChange = ({ prop, order }) => {
  if (!order) {
    // 无排序，恢复原始顺序
    loadData()
    return
  }

  tableData.value.sort((a, b) => {
    let aVal = a[prop]
    let bVal = b[prop]

    // 处理空值
    if (aVal === null || aVal === undefined) aVal = ''
    if (bVal === null || bVal === undefined) bVal = ''

    // 数字类型比较
    if (prop === 'costPrice' || prop === 'salePrice' || prop === 'minStock') {
      aVal = Number(aVal) || 0
      bVal = Number(bVal) || 0
    }

    if (order === 'ascending') {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
    }
  })
}
// 清空选择
const handleClearSelection = () => {
  tableRef.value?.clearSelection()
  selectedRows.value = []
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个商品吗？此操作不可恢复！`,
      '批量删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    loading.value = true
    let successCount = 0
    let errorCount = 0

    for (const row of selectedRows.value) {
      try {
        await deleteProduct(row.id)
        successCount++
      } catch (err) {
        console.error('删除失败:', row, err)
        errorCount++
      }
    }

    handleClearSelection()

    if (errorCount === 0) {
      ElMessage.success(`成功删除 ${successCount} 个商品`)
    } else {
      ElMessage.warning(`删除完成：成功 ${successCount} 个，失败 ${errorCount} 个`)
    }

    loadData()
  } catch (error) {
    // 用户取消
  } finally {
    loading.value = false
  }
}

// 显示批量更改分类对话框
const showBatchCategoryDialog = () => {
  batchCategoryId.value = null
  batchCategoryDialogVisible.value = true
}

// 批量更改分类
const handleBatchUpdateCategory = async () => {
  if (!batchCategoryId.value) {
    ElMessage.warning('请选择新分类')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要将选中的 ${selectedRows.value.length} 个商品更改为新分类吗？`,
      '批量更改分类确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    batchUpdating.value = true
    const category = categories.value.find(c => c.id === batchCategoryId.value)
    let successCount = 0
    let errorCount = 0

    for (const row of selectedRows.value) {
      try {
        await updateProduct(row.id, {
          ...row,
          categoryId: category.id,
          categoryName: category.categoryName
        })
        successCount++
      } catch (err) {
        console.error('更新失败:', row, err)
        errorCount++
      }
    }

    batchCategoryDialogVisible.value = false
    handleClearSelection()

    if (errorCount === 0) {
      ElMessage.success(`成功更新 ${successCount} 个商品`)
    } else {
      ElMessage.warning(`更新完成：成功 ${successCount} 个，失败 ${errorCount} 个`)
    }

    loadData()
  } catch (error) {
    // 用户取消
  } finally {
    batchUpdating.value = false
  }
}

// 分类管理
const handleCategoryManage = () => {
  categoryDialogVisible.value = true
}

// 分类刷新
const handleCategoryRefresh = () => {
  loadCategories()
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
  { key: 'productCode', label: '商品编码' },
  { key: 'productName', label: '商品名称', required: true },
  { key: 'categoryName', label: '分类名称', required: true },
  { key: 'spec', label: '规格' },
  { key: 'unit', label: '单位', required: true },
  { key: 'costPrice', label: '成本价' },
  { key: 'salePrice', label: '销售价' },
  { key: 'minStock', label: '最低库存' },
  { key: 'maxStock', label: '最高库存' },
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
    // 获取所有数据（不分页）
    const data = await getProductList({ page: 1, size: 10000 })
    const allData = data.records || data

    if (allData.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    // 转换价格格式（分转元）
    const exportData = allData.map(item => ({
      ...item,
      costPrice: item.costPrice ? (item.costPrice / 100).toFixed(2) : '',
      salePrice: item.salePrice ? (item.salePrice / 100).toFixed(2) : '',
      isEnabled: item.isEnabled ? '启用' : '禁用'
    }))

    exportToExcel(exportData, excelColumns, '商品数据.xlsx')
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
    let skipCount = 0
    let errorCount = 0

    // 获取所有商品用于去重检查
    const allProducts = await getProductList({ page: 1, size: 10000 })
    const allProductList = allProducts.records || allProducts

    for (const row of data) {
      try {
        // 映射 Excel 列名到字段名
        const category = categories.value.find(c => c.categoryName === row['分类名称'])
        if (!category) {
          console.warn('分类不存在:', row['分类名称'])
          errorCount++
          continue
        }

        const productData = {
          productCode: row['商品编码'] || '',
          productName: row['商品名称'],
          categoryId: category.id,
          categoryName: category.categoryName,
          spec: row['规格'] || '',
          unit: row['单位'] || '套',
          costPrice: row['成本价'] ? Math.round(parseFloat(row['成本价']) * 100) : 0,
          salePrice: row['销售价'] ? Math.round(parseFloat(row['销售价']) * 100) : 0,
          minStock: row['最低库存'] ? parseInt(row['最低库存']) : 0,
          maxStock: row['最高库存'] ? parseInt(row['最高库存']) : 0,
          isEnabled: row['启用状态'] === '启用' || row['启用状态'] === true,
          remark: row['备注'] || ''
        }

        // 检查是否已存在相同商品（商品名称+分类+规格三者相同视为重复）
        const existingProduct = allProductList.find(p =>
          p.productName === productData.productName &&
          p.categoryId === productData.categoryId &&
          p.spec === productData.spec
        )
        if (existingProduct) {
          console.log('跳过重复商品:', productData.productName)
          skipCount++
          continue
        }

        await createProduct(productData)
        successCount++
      } catch (err) {
        console.error('导入失败:', row, err)
        errorCount++
      }
    }

    ElMessage.success(`导入完成：成功 ${successCount} 条，跳过 ${skipCount} 条重复数据，失败 ${errorCount} 条`)
    loadData()
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error('导入失败：' + error.message)
  } finally {
    loading.value = false
    // 重置文件输入
    event.target.value = ''
  }
}

// 下载模板
const handleDownloadTemplate = () => {
  downloadTemplate(excelColumns, '商品导入模板.xlsx')
}

// 初始化加载
onMounted(() => {
  loadCategories()
  loadData()
})
</script>

<style lang="scss" scoped>
.product-list-container {
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

.batch-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #e6f7ff;
  border-bottom: 1px solid #d9d9d9;

  .selected-info {
    font-size: 14px;
    color: #595959;

    strong {
      color: #1890ff;
      font-size: 16px;
    }
  }

  .batch-actions {
    display: flex;
    gap: 8px;
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}

.selected-count {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
}

.product-preview {
  max-height: 100px;
  overflow-y: auto;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.more-hint {
  font-size: 12px;
  color: #999;
  margin-left: 8px;
}
</style>
