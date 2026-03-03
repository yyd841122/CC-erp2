<template>
  <div class="payable-list">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-form">
        <el-input
          v-model="searchForm.supplierName"
          placeholder="供应商名称"
          clearable
          style="width: 160px"
        />
        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          style="width: 120px"
        >
          <el-option label="全部" value="" />
          <el-option label="未结算" value="unpaid" />
          <el-option label="部分结算" value="partial" />
          <el-option label="已结算" value="paid" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd">登记应付</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      stripe
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="payableNo" label="应付单号" width="140" />
      <el-table-column prop="supplierName" label="供应商" min-width="150" />
      <el-table-column prop="businessType" label="业务类型" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.businessType === '采购'" type="primary" size="small">采购</el-tag>
          <el-tag v-else-if="row.businessType === '退货'" type="warning" size="small">退货</el-tag>
          <el-tag v-else size="small">{{ row.businessType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="应付金额" width="110" align="right">
        <template #default="{ row }">
          ¥{{ row.totalAmount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="paidAmount" label="已付金额" width="110" align="right">
        <template #default="{ row }">
          ¥{{ row.paidAmount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="remainingAmount" label="待付金额" width="110" align="right">
        <template #default="{ row }">
          <span class="amount-remaining">¥{{ ((row.totalAmount || 0) - (row.paidAmount || 0)).toFixed(2) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="payableDate" label="应付日期" width="110" />
      <el-table-column prop="dueDate" label="到期日期" width="110" />
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'unpaid'" type="danger">未结算</el-tag>
          <el-tag v-else-if="row.status === 'partial'" type="warning">部分结算</el-tag>
          <el-tag v-else-if="row.status === 'paid'" type="success">已结算</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">查看</el-button>
          <el-button
            v-if="row.status !== 'paid'"
            link
            type="success"
            @click="handlePayment(row)"
          >
            付款
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 付款对话框 -->
    <PaymentDialog
      v-model="paymentVisible"
      :payable-data="currentRow"
      @refresh="loadData"
    />

    <!-- 应付登记对话框 -->
    <PayableDialog
      v-model="addDialogVisible"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPayableList } from '@/api/finance'
import PaymentDialog from './PaymentDialog.vue'
import PayableDialog from './PayableDialog.vue'

const searchForm = reactive({
  supplierName: '',
  status: ''
})

const tableData = ref([])
const loading = ref(false)
const paymentVisible = ref(false)
const addDialogVisible = ref(false)
const currentRow = ref(null)

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...searchForm
    }
    const res = await getPayableList(params)
    tableData.value = res.list || []
    pagination.total = res.total || 0
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  loadData()
}

const handleReset = () => {
  searchForm.supplierName = ''
  searchForm.status = ''
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看详情功能开发中...')
}

const handlePayment = (row) => {
  currentRow.value = row
  paymentVisible.value = true
}

const handlePageChange = (page) => {
  pagination.page = page
  loadData()
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.page = 1
  loadData()
}

loadData()
</script>

<style lang="scss" scoped>
.payable-list {
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .search-form {
      display: flex;
      gap: 8px;
    }
  }
}

.amount-remaining {
  color: #E6A23C;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}
</style>
