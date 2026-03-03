<template>
  <div class="warehouse-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">仓库管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增仓库
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="仓库名称">
          <el-input
            v-model="searchForm.warehouseName"
            placeholder="请输入仓库名称"
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
        <el-table-column prop="warehouseCode" label="仓库编码" width="120" />
        <el-table-column prop="warehouseName" label="仓库名称" min-width="150" />
        <el-table-column prop="address" label="仓库地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="manager" label="负责人" width="100" />
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="area" label="面积(㎡)" width="100" align="right" />
        <el-table-column prop="isEnabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'info'" size="small">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewStock(row)">
              库存分布
            </el-button>
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
    <WarehouseDialog
      v-model="dialogVisible"
      :data="currentRow"
      @refresh="loadData"
    />

    <!-- 库存分布对话框 -->
    <el-dialog
      v-model="stockDialogVisible"
      title="库存分布"
      width="800px"
    >
      <el-table
        :data="stockData"
        v-loading="stockLoading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column prop="quantity" label="库存数量" width="120" align="right">
          <template #default="{ row }">
            <span :style="{ color: row.quantity < 100 ? '#f56c6c' : '' }">
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="库存状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.quantity < 100" type="danger" size="small">偏低</el-tag>
            <el-tag v-else-if="row.quantity < 500" type="warning" size="small">正常</el-tag>
            <el-tag v-else type="success" size="small">充足</el-tag>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="stockData.length === 0 && !stockLoading" class="empty-stock">
        <el-empty description="暂无库存数据" />
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getWarehouseList, deleteWarehouse, getWarehouseStock } from '@/api/warehouse'
import WarehouseDialog from './WarehouseDialog.vue'

const searchForm = reactive({
  warehouseName: '',
  isEnabled: ''
})

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const stockDialogVisible = ref(false)
const currentRow = ref(null)
const stockData = ref([])
const stockLoading = ref(false)

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
    const data = await getWarehouseList(params)
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
  searchForm.warehouseName = ''
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
    await ElMessageBox.confirm('确定要删除该仓库吗？删除后将清空该仓库的库存记录。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteWarehouse(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消或接口失败
  }
}

// 查看库存分布
const handleViewStock = async (row) => {
  stockDialogVisible.value = true
  stockLoading.value = true
  try {
    const data = await getWarehouseStock(row.id)
    stockData.value = data || []
  } catch (error) {
    console.error('加载库存数据失败:', error)
    stockData.value = []
  } finally {
    stockLoading.value = false
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

// 初始化加载
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.warehouse-list-container {
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

.empty-stock {
  padding: 40px 0;
}
</style>
