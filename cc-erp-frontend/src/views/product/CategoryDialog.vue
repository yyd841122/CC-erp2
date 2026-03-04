<template>
  <el-dialog
    v-model="visible"
    title="商品分类管理"
    width="600px"
    @close="handleClose"
  >
    <div class="category-container">
      <!-- 操作栏 -->
      <div class="toolbar">
        <div class="add-category">
          <el-input
            v-model="newCategoryName"
            placeholder="请输入分类名称"
            clearable
            style="width: 300px; margin-right: 10px"
            @keyup.enter="handleAddCategory"
          />
          <el-button type="primary" @click="handleAddCategory">
            添加分类
          </el-button>
        </div>
        <div class="excel-actions">
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

      <!-- 分类列表 -->
      <div class="category-list">
        <el-table
          :data="categories"
          stripe
          style="width: 100%"
          max-height="400"
        >
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="categoryName" label="分类名称" min-width="150" />
          <el-table-column prop="productCount" label="商品数量" width="100" align="center" />
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column label="操作" width="150" align="center" fixed="right">
            <template #default="{ row }">
              <el-button
                link
                type="primary"
                size="small"
                @click="handleEditCategory(row)"
              >
                编辑
              </el-button>
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteCategory(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>

    <!-- 编辑分类对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑分类"
      width="400px"
      append-to-body
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input
            v-model="editForm.categoryName"
            placeholder="请输入分类名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveEdit">确定</el-button>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, ArrowDown } from '@element-plus/icons-vue'
import { exportToExcel, importFromExcel, downloadTemplate } from '@/utils/excel'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const newCategoryName = ref('')
const editDialogVisible = ref(false)
const editForm = reactive({
  id: null,
  categoryName: ''
})

// localStorage 存储键
const CATEGORIES_STORAGE_KEY = 'cc_erp_categories'
const PRODUCTS_STORAGE_KEY = 'cc_erp_test_products'

// 默认分类数据（已清空虚拟数据）
const defaultCategories = []

// 分类列表
const categories = ref([])

// 从 localStorage 加载分类
const loadCategories = () => {
  try {
    let saved = localStorage.getItem(CATEGORIES_STORAGE_KEY)
    if (saved) {
      categories.value = JSON.parse(saved)
    } else {
      categories.value = [...defaultCategories]
    }
    // 更新每个分类的实际商品数量
    updateCategoryProductCount()
    saveCategories()
  } catch (e) {
    console.error('加载分类失败:', e)
    categories.value = [...defaultCategories]
  }
}

// 更新分类的商品数量（从实际商品数据统计）
const updateCategoryProductCount = () => {
  try {
    const productsData = localStorage.getItem(PRODUCTS_STORAGE_KEY)
    const products = productsData ? JSON.parse(productsData) : []

    categories.value.forEach(category => {
      const count = products.filter(p => p.categoryId === category.id).length
      category.productCount = count
    })
  } catch (e) {
    console.error('更新分类商品数量失败:', e)
  }
}

// 保存分类到 localStorage
const saveCategories = () => {
  try {
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories.value))
  } catch (e) {
    console.error('保存分类失败:', e)
  }
}

// 初始化时加载分类
loadCategories()

// 添加分类
const handleAddCategory = () => {
  if (!newCategoryName.value.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  // 检查是否重复
  const exists = categories.value.some(
    c => c.categoryName === newCategoryName.value.trim()
  )
  if (exists) {
    ElMessage.warning('该分类已存在')
    return
  }

  // 安全地获取新ID
  const maxId = categories.value.length > 0
    ? Math.max(...categories.value.map(c => c.id))
    : 0
  const newId = maxId + 1
  const now = new Date()
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  categories.value.unshift({
    id: newId,
    categoryName: newCategoryName.value.trim(),
    productCount: 0,
    createdAt: timeStr
  })

  saveCategories()
  newCategoryName.value = ''
  ElMessage.success('添加成功')
  emit('refresh')
}

// 编辑分类
const handleEditCategory = (row) => {
  editForm.id = row.id
  editForm.categoryName = row.categoryName
  editDialogVisible.value = true
}

// 保存编辑
const handleSaveEdit = () => {
  if (!editForm.categoryName.trim()) {
    ElMessage.warning('请输入分类名称')
    return
  }

  // 检查是否重复（排除自己）
  const exists = categories.value.some(
    c => c.id !== editForm.id && c.categoryName === editForm.categoryName.trim()
  )
  if (exists) {
    ElMessage.warning('该分类名称已存在')
    return
  }

  const index = categories.value.findIndex(c => c.id === editForm.id)
  if (index !== -1) {
    categories.value[index].categoryName = editForm.categoryName.trim()
    saveCategories()
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    emit('refresh')
  }
}

// 删除分类
const handleDeleteCategory = async (row) => {
  // 实际检查商品数据
  try {
    const productsData = localStorage.getItem(PRODUCTS_STORAGE_KEY)
    const products = productsData ? JSON.parse(productsData) : []
    const actualCount = products.filter(p => p.categoryId === row.id).length

    if (actualCount > 0) {
      ElMessage.warning(`该分类下还有 ${actualCount} 个商品，无法删除`)
      return
    }
  } catch (e) {
    console.error('检查商品数据失败:', e)
  }

  try {
    await ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const index = categories.value.findIndex(c => c.id === row.id)
    if (index !== -1) {
      categories.value.splice(index, 1)
      saveCategories()
      ElMessage.success('删除成功')
      emit('refresh')
    }
  } catch (error) {
    // 用户取消
  }
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 文件输入引用
const fileInputRef = ref()

// Excel 列配置
const excelColumns = [
  { key: 'categoryName', label: '分类名称', required: true }
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
const handleExport = () => {
  try {
    if (categories.value.length === 0) {
      ElMessage.warning('暂无数据可导出')
      return
    }

    const exportData = categories.value.map(item => ({
      ...item
    }))

    exportToExcel(exportData, excelColumns, '商品分类数据.xlsx')
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
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

    // 重新加载分类数据以确保获取最新数据
    loadCategories()

    // 先打印Excel原始数据用于调试
    console.log('Excel 原始数据:', data)
    console.log('当前分类数据:', categories.value)

    let successCount = 0
    let skipCount = 0
    let errorCount = 0

    for (const row of data) {
      try {
        console.log('处理行数据:', row)
        const categoryName = row['分类名称']
        console.log('提取的分类名称:', categoryName)

        if (!categoryName || !categoryName.trim()) {
          console.warn('跳过空分类名称:', row)
          errorCount++
          continue
        }

        // 检查是否已存在
        const exists = categories.value.some(
          c => c.categoryName === categoryName.trim()
        )

        if (exists) {
          console.log('分类已存在，跳过:', categoryName)
          skipCount++
          continue
        }

        // 安全地获取新ID
        const maxId = categories.value.length > 0
          ? Math.max(...categories.value.map(c => c.id))
          : 0
        const newId = maxId + 1
        const now = new Date()
        const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

        const newCategory = {
          id: newId,
          categoryName: categoryName.trim(),
          productCount: 0,
          createdAt: timeStr
        }

        console.log('添加新分类:', newCategory)
        categories.value.push(newCategory)
        successCount++
      } catch (err) {
        console.error('导入失败 - 行数据:', row, '错误:', err)
        errorCount++
      }
    }

    // 保存到 localStorage
    saveCategories()
    console.log('导入完成，当前分类数据:', categories.value)
    ElMessage.success(`导入完成：成功 ${successCount} 条，跳过 ${skipCount} 条（重复），失败 ${errorCount} 条`)
    emit('refresh')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导入失败:', error)
      ElMessage.error('导入失败：' + error.message)
    }
  } finally {
    // 重置文件输入
    event.target.value = ''
  }
}

// 下载模板
const handleDownloadTemplate = () => {
  downloadTemplate(excelColumns, '商品分类导入模板.xlsx')
}

// 获取分类列表（供父组件调用）
const getCategories = () => {
  return categories.value
}

// 暴露方法给父组件
defineExpose({
  getCategories,
  loadCategories,
  updateCategoryProductCount
})
</script>

<style lang="scss" scoped>
.category-container {
  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #EBEEF5;
  }

  .add-category {
    display: flex;
    align-items: center;
  }

  .excel-actions {
    display: flex;
    gap: 8px;
  }

  .category-list {
    :deep(.el-table) {
      .el-table__header th {
        background: #FAFAFA;
      }
    }
  }
}
</style>
