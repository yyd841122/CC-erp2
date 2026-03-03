<template>
  <div class="payment-list">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-form">
        <el-input
          v-model="searchForm.paymentNo"
          placeholder="付款单号"
          clearable
          style="width: 140px"
        />
        <el-input
          v-model="searchForm.supplierName"
          placeholder="供应商名称"
          clearable
          style="width: 140px"
        />
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 220px"
        />
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增付款</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      stripe
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="paymentNo" label="付款单号" width="150" />
      <el-table-column prop="paymentDate" label="付款日期" width="110" />
      <el-table-column prop="supplierName" label="供应商" min-width="150" />
      <el-table-column prop="paymentMethod" label="付款方式" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.paymentMethod === 'cash'" type="success">现金</el-tag>
          <el-tag v-else-if="row.paymentMethod === 'bank'" type="primary">银行转账</el-tag>
          <el-tag v-else-if="row.paymentMethod === 'alipay'" type="info">支付宝</el-tag>
          <el-tag v-else-if="row.paymentMethod === 'wechat'" type="warning">微信</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="amount" label="付款金额" width="110" align="right">
        <template #default="{ row }">
          <span class="amount-text">¥{{ row.amount?.toFixed(2) || '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="bankAccount" label="付款账户" width="140" />
      <el-table-column prop="referenceNo" label="关联单据" width="140" />
      <el-table-column prop="handlerName" label="经手人" width="100" />
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="120" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">查看</el-button>
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

    <!-- 新增付款对话框 -->
    <AddPaymentDialog
      v-model="addDialogVisible"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getPaymentList } from '@/api/finance'
import AddPaymentDialog from './AddPaymentDialog.vue'

const searchForm = reactive({
  paymentNo: '',
  supplierName: '',
  dateRange: null
})

const tableData = ref([])
const loading = ref(false)
const addDialogVisible = ref(false)

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
    const res = await getPaymentList(params)
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
  searchForm.paymentNo = ''
  searchForm.supplierName = ''
  searchForm.dateRange = null
  pagination.page = 1
  loadData()
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleView = (row) => {
  ElMessage.info('查看详情功能开发中...')
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
.payment-list {
  .action-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .search-form {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
}

.amount-text {
  color: #E6A23C;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}
</style>
