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
      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="costPrice" label="成本价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ (row.costPrice / 100).toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="salePrice" label="销售价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ (row.salePrice / 100).toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="minStock" label="最低库存" width="90" align="center" />
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh, FolderOpened, Download, ArrowDown, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getProductList, deleteProduct, createProduct } from '@/api/product'
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

// 分类列表
const categories = ref([])

// localStorage 存储键
const CATEGORIES_STORAGE_KEY = 'cc_erp_categories'

// 加载分类数据
const loadCategories = () => {
  try {
    const saved = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (saved) {
      categories.value = JSON.parse(saved)
    } else {
      categories.value = []
    }
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
    // 同时更新分类的商品数量
    updateCategoryCount()
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

    // 更新分类的商品数量
    updateCategoryCount()
    loadData()
  } catch (error) {
    // 用户取消或接口失败
  }
}

// 分类管理
const handleCategoryManage = () => {
  categoryDialogVisible.value = true
  // 打开分类管理时更新商品数量
  if (categoryDialogRef.value) {
    categoryDialogRef.value.updateCategoryProductCount()
  }
}

// 分类刷新
const handleCategoryRefresh = () => {
  loadCategories()
  // 同时更新分类中的商品数量
  if (categoryDialogRef.value) {
    categoryDialogRef.value.updateCategoryProductCount()
  }
}

// 更新分类的商品数量
const updateCategoryCount = () => {
  try {
    const productsData = localStorage.getItem('cc_erp_test_products')
    const products = productsData ? JSON.parse(productsData) : []

    categories.value.forEach(category => {
      const count = products.filter(p => p.categoryId === category.id).length
      category.productCount = count
    })

    // 保存更新后的分类数据
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories.value))
  } catch (e) {
    console.error('更新分类数量失败:', e)
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

    // 获取现有数据用于查重
    const existingData = await getProductList({ page: 1, size: 10000 })
    const existingProducts = existingData.records || existingData || []

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const row of data) {
      try {
        // 映射 Excel 列名到字段名
        const category = categories.value.find(c => c.categoryName === row['分类名称'])
        if (!category) {
          console.warn('分类不存在:', row['分类名称'])
          errorCount++
          continue
        }

        const productCode = row['商品编码'] || ''
        const productName = row['商品名称']

        // 检查是否已存在（按商品编码或商品名称+规格组合）
        const spec = row['规格'] || ''
        const exists = existingProducts.some(p =>
          (productCode && p.productCode === productCode) ||
          (p.productName === productName && p.spec === spec)
        )

        if (exists) {
          skipCount++
          continue
        }

        const productData = {
          productCode: productCode,
          productName: productName,
          categoryId: category.id,
          spec: spec,
          unit: row['单位'] || '套',
          costPrice: row['成本价'] ? Math.round(parseFloat(row['成本价']) * 100) : 0,
          salePrice: row['销售价'] ? Math.round(parseFloat(row['销售价']) * 100) : 0,
          minStock: row['最低库存'] ? parseInt(row['最低库存']) : 0,
          maxStock: row['最高库存'] ? parseInt(row['最高库存']) : 0,
          isEnabled: row['启用状态'] === '启用' || row['启用状态'] === true,
          remark: row['备注'] || ''
        }

        await createProduct(productData)
        successCount++
      } catch (err) {
        console.error('导入失败:', row, err)
        errorCount++
      }
    }

    ElMessage.success(`导入完成：成功 ${successCount} 条，跳过 ${skipCount} 条（重复），失败 ${errorCount} 条`)
    updateCategoryCount()  // 更新分类的商品数量
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
  updateCategoryCount()  // 更新分类中的实际商品数量
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}
</style>
