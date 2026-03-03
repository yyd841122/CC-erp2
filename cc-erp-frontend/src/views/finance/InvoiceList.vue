<template>
  <div class="invoice-list">
    <!-- 操作栏 -->
    <div class="action-bar">
      <div class="search-form">
        <el-input
          v-model="searchForm.invoiceNo"
          placeholder="发票号码"
          clearable
          style="width: 140px"
        />
        <el-select
          v-model="searchForm.invoiceType"
          placeholder="发票类型"
          clearable
          style="width: 120px"
        >
          <el-option label="全部" value="" />
          <el-option label="销售发票" value="sale" />
          <el-option label="采购发票" value="purchase" />
        </el-select>
        <el-select
          v-model="searchForm.status"
          placeholder="状态"
          clearable
          style="width: 120px"
        >
          <el-option label="全部" value="" />
          <el-option label="未开票" value="pending" />
          <el-option label="已开票" value="issued" />
          <el-option label="已作废" value="cancelled" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-button type="primary" :icon="Plus" @click="handleAdd">新增发票</el-button>
    </div>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      stripe
      v-loading="loading"
      border
      style="width: 100%"
    >
      <el-table-column prop="invoiceNo" label="发票号码" width="150" />
      <el-table-column prop="invoiceType" label="发票类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.invoiceType === 'sale'" type="success" size="small">销售发票</el-tag>
          <el-tag v-else-if="row.invoiceType === 'purchase'" type="primary" size="small">采购发票</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="partnerName" label="往来单位" min-width="150" />
      <el-table-column prop="amount" label="发票金额" width="110" align="right">
        <template #default="{ row }">
          ¥{{ row.amount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="taxAmount" label="税额" width="100" align="right">
        <template #default="{ row }">
          ¥{{ row.taxAmount?.toFixed(2) || '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="价税合计" width="110" align="right">
        <template #default="{ row }">
          <span class="amount-text">¥{{ row.totalAmount?.toFixed(2) || '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="invoiceDate" label="开票日期" width="110" />
      <el-table-column prop="status" label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.status === 'pending'" type="info">未开票</el-tag>
          <el-tag v-else-if="row.status === 'issued'" type="success">已开票</el-tag>
          <el-tag v-else-if="row.status === 'cancelled'" type="danger">已作废</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleView(row)">查看</el-button>
          <el-button
            v-if="row.status === 'issued'"
            link
            type="danger"
            @click="handleCancel(row)"
          >
            作废
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

    <!-- 新增发票对话框 -->
    <InvoiceDialog
      v-model="addDialogVisible"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getInvoiceList, cancelInvoice } from '@/api/finance'
import InvoiceDialog from './InvoiceDialog.vue'

const searchForm = reactive({
  invoiceNo: '',
  invoiceType: '',
  status: ''
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
    const res = await getInvoiceList(params)
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
  searchForm.invoiceNo = ''
  searchForm.invoiceType = ''
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

const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要作废该发票吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await cancelInvoice(row.id)
    ElMessage.success('作废成功')
    loadData()
  } catch (error) {
    // 用户取消或错误
    if (error !== 'cancel') {
      console.error('作废失败:', error)
    }
  }
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
.invoice-list {
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
  color: #1890FF;
  font-weight: 500;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}
</style>
