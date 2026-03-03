<template>
  <div class="purchase-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">采购管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增采购单
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="单据号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入单据号"
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item label="供应商">
          <el-input
            v-model="searchForm.supplierName"
            placeholder="请输入供应商名称"
            clearable
            style="width: 150px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="草稿" :value="0" />
            <el-option label="待审核" :value="1" />
            <el-option label="已审核" :value="2" />
            <el-option label="已入库" :value="3" />
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
        <el-table-column prop="orderNo" label="采购单号" width="150" />
        <el-table-column prop="supplierName" label="供应商" min-width="150" />
        <el-table-column prop="warehouseName" label="仓库" width="100" />
        <el-table-column prop="orderDate" label="采购日期" width="110" />
        <el-table-column prop="totalAmount" label="采购金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.totalAmount?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="finalAmount" label="含税金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ row.finalAmount?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="row.status === 1" type="warning">待审核</el-tag>
            <el-tag v-else-if="row.status === 2" type="success">已审核</el-tag>
            <el-tag v-else-if="row.status === 3" type="primary">已入库</el-tag>
            <el-tag v-else-if="row.status === 9" type="danger">已作废</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">
              查看
            </el-button>
            <el-button
              v-if="row.status === 1"
              link
              type="success"
              @click="handleApprove(row)"
            >
              审核
            </el-button>
            <el-button link type="primary" @click="handlePrint(row)">
              打印
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
    <PurchaseDialog
      v-model="dialogVisible"
      @refresh="loadData"
    />

    <!-- 详情对话框 -->
    <PurchaseDetailDialog
      v-model="detailVisible"
      :order-id="currentOrderId"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPurchaseOrderList, approvePurchaseOrder } from '@/api/purchase'
import PurchaseDialog from './PurchaseDialog.vue'
import PurchaseDetailDialog from './PurchaseDetailDialog.vue'

const searchForm = reactive({
  orderNo: '',
  supplierName: '',
  status: ''
})

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const detailVisible = ref(false)
const currentOrderId = ref(null)

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
    const data = await getPurchaseOrderList(params)
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
  searchForm.orderNo = ''
  searchForm.supplierName = ''
  searchForm.status = ''
  pagination.page = 1
  loadData()
}

// 刷新
const handleRefresh = () => {
  loadData()
}

// 新增
const handleAdd = () => {
  dialogVisible.value = true
}

// 查看详情
const handleView = (row) => {
  currentOrderId.value = row.id
  detailVisible.value = true
}

// 审核
const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm('确定要审核该采购单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await approvePurchaseOrder(row.id)
    ElMessage.success('审核成功')
    loadData()
  } catch (error) {
    // 用户取消或接口失败
  }
}

// 打印
const handlePrint = (row) => {
  ElMessage.info('打印功能开发中...')
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
.purchase-list-container {
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
