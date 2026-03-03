<template>
  <div class="stock-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">库存管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleStockTake">
          库存盘点
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 库存预警卡片 -->
    <el-row :gutter="16" class="alert-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="alert-card warning">
          <div class="alert-content">
            <div class="alert-icon">
              <el-icon :size="32" color="#E6A23C"><Warning /></el-icon>
            </div>
            <div class="alert-info">
              <div class="alert-value">{{ alertStats.lowStock }}</div>
              <div class="alert-label">库存不足</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="alert-card danger">
          <div class="alert-content">
            <div class="alert-icon">
              <el-icon :size="32" color="#F56C6C"><CircleClose /></el-icon>
            </div>
            <div class="alert-info">
              <div class="alert-value">{{ alertStats.outOfStock }}</div>
              <div class="alert-label">缺货商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="alert-card info">
          <div class="alert-content">
            <div class="alert-icon">
              <el-icon :size="32" color="#1890FF"><InfoFilled /></el-icon>
            </div>
            <div class="alert-info">
              <div class="alert-value">{{ alertStats.overstock }}</div>
              <div class="alert-label">超储商品</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="商品编码">
          <el-input
            v-model="searchForm.productCode"
            placeholder="请输入商品编码"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="商品名称">
          <el-input
            v-model="searchForm.productName"
            placeholder="请输入商品名称"
            clearable
            style="width: 160px"
          />
        </el-form-item>
        <el-form-item label="仓库">
          <el-select
            v-model="searchForm.warehouseId"
            placeholder="请选择仓库"
            clearable
            style="width: 140px"
          >
            <el-option label="主仓库" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态">
          <el-select
            v-model="searchForm.stockStatus"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="库存不足" value="low" />
            <el-option label="缺货" value="out" />
            <el-option label="超储" value="over" />
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
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="spec" label="规格" width="100" />
        <el-table-column prop="warehouseName" label="仓库" width="100" />
        <el-table-column prop="quantity" label="库存数量" width="100" align="right">
          <template #default="{ row }">
            <span :class="getStockClass(row)">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="minStock" label="最小库存" width="90" align="right" />
        <el-table-column prop="maxStock" label="最大库存" width="90" align="right" />
        <el-table-column prop="avgCost" label="平均成本" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.avgCost?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="库存金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ ((row.quantity || 0) * (row.avgCost || 0)).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastInDate" label="最近入库" width="110" />
        <el-table-column prop="lastOutDate" label="最近出库" width="110" />
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleViewHistory(row)">
              流水
            </el-button>
            <el-button link type="primary" @click="handleAdjust(row)">
              调整
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

    <!-- 库存调整对话框 -->
    <StockAdjustDialog
      v-model="adjustVisible"
      :stock-data="currentStock"
      @refresh="loadData"
    />

    <!-- 库存流水对话框 -->
    <StockHistoryDialog
      v-model="historyVisible"
      :product-id="currentProductId"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Refresh, Warning, CircleClose, InfoFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StockAdjustDialog from './StockAdjustDialog.vue'
import StockHistoryDialog from './StockHistoryDialog.vue'

const searchForm = reactive({
  productCode: '',
  productName: '',
  warehouseId: null,
  stockStatus: ''
})

// 预警统计
const alertStats = reactive({
  lowStock: 0,
  outOfStock: 0,
  overstock: 0
})

const tableData = ref([])

const loading = ref(false)
const adjustVisible = ref(false)
const historyVisible = ref(false)
const currentStock = ref(null)
const currentProductId = ref(null)

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

// 获取库存状态样式
const getStockClass = (row) => {
  if (row.quantity === 0) return 'stock-out'
  if (row.quantity < row.minStock) return 'stock-low'
  if (row.maxStock && row.quantity > row.maxStock) return 'stock-over'
  return 'stock-normal'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    // TODO: 调用接口获取数据
    // const data = await getStockList(params)
    updateAlertStats()
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新预警统计
const updateAlertStats = () => {
  alertStats.lowStock = tableData.value.filter(item =>
    item.quantity > 0 && item.quantity < item.minStock
  ).length
  alertStats.outOfStock = tableData.value.filter(item => item.quantity === 0).length
  alertStats.overstock = tableData.value.filter(item =>
    item.maxStock && item.quantity > item.maxStock
  ).length
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.productCode = ''
  searchForm.productName = ''
  searchForm.warehouseId = null
  searchForm.stockStatus = ''
  pagination.page = 1
  loadData()
}

// 刷新
const handleRefresh = () => {
  loadData()
}

// 库存盘点
const handleStockTake = () => {
  ElMessage.info('库存盘点功能开发中...')
}

// 查看流水
const handleViewHistory = (row) => {
  currentProductId.value = row.id
  historyVisible.value = true
}

// 库存调整
const handleAdjust = (row) => {
  currentStock.value = { ...row }
  adjustVisible.value = true
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
loadData()
</script>

<style lang="scss" scoped>
.stock-list-container {
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

.alert-cards {
  margin-bottom: 16px;
}

.alert-card {
  :deep(.el-card__body) {
    padding: 20px;
  }

  .alert-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .alert-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-info {
    flex: 1;

    .alert-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
    }

    .alert-label {
      font-size: 14px;
      color: #8C8C8C;
      margin-top: 4px;
    }
  }

  &.warning .alert-value { color: #E6A23C; }
  &.danger .alert-value { color: #F56C6C; }
  &.info .alert-value { color: #1890FF; }
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

.stock-normal { color: #52C41A; font-weight: 500; }
.stock-low { color: #E6A23C; font-weight: 500; }
.stock-out { color: #F56C6C; font-weight: 500; }
.stock-over { color: #1890FF; font-weight: 500; }
</style>
