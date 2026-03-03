<template>
  <div class="report-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">报表统计</h2>
      <div class="page-actions">
        <el-button :icon="Refresh" @click="handleRefreshAll">刷新</el-button>
      </div>
    </div>

    <!-- 报表类型选择 -->
    <el-card class="type-card" shadow="never">
      <el-radio-group v-model="activeReport" class="report-type-group" @change="handleReportChange">
        <el-radio-button label="sales">销售报表</el-radio-button>
        <el-radio-button label="purchase">采购报表</el-radio-button>
        <el-radio-button label="inventory">库存报表</el-radio-button>
        <el-radio-button label="finance">财务报表</el-radio-button>
        <el-radio-button label="performance">业绩报表</el-radio-button>
      </el-radio-group>
    </el-card>

    <!-- 快速时间选择 -->
    <el-card class="quick-date-card" shadow="never">
      <div class="quick-date-options">
        <span class="quick-label">快速选择：</span>
        <el-button
          v-for="option in quickDateOptions"
          :key="option.value"
          :type="selectedQuickDate === option.value ? 'primary' : 'default'"
          size="small"
          @click="handleQuickDate(option.value)"
        >
          {{ option.label }}
        </el-button>
      </div>
    </el-card>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
            @change="handleDateChange"
          />
        </el-form-item>

        <!-- 销售报表额外筛选 -->
        <template v-if="activeReport === 'sales'">
          <el-form-item label="客户">
            <el-select v-model="filterForm.customerId" placeholder="全部客户" clearable style="width: 150px">
              <el-option v-for="c in customerList" :key="c.id" :label="c.customerName" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="filterForm.categoryId" placeholder="全部分类" clearable style="width: 120px">
              <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.categoryName" :value="cat.id" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 采购报表额外筛选 -->
        <template v-if="activeReport === 'purchase'">
          <el-form-item label="供应商">
            <el-select v-model="filterForm.supplierId" placeholder="全部供应商" clearable style="width: 150px">
              <el-option v-for="s in supplierList" :key="s.id" :label="s.supplierName" :value="s.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-select v-model="filterForm.categoryId" placeholder="全部分类" clearable style="width: 120px">
              <el-option v-for="cat in categoryList" :key="cat.id" :label="cat.categoryName" :value="cat.id" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 库存报表额外筛选 -->
        <template v-if="activeReport === 'inventory'">
          <el-form-item label="仓库">
            <el-select v-model="filterForm.warehouseId" placeholder="全部仓库" clearable style="width: 120px">
              <el-option v-for="w in warehouseList" :key="w.id" :label="w.warehouseName" :value="w.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="库存状态">
            <el-select v-model="filterForm.stockStatus" placeholder="全部状态" clearable style="width: 120px">
              <el-option label="正常" value="normal" />
              <el-option label="偏低" value="low" />
              <el-option label="缺货" value="empty" />
              <el-option label="超储" value="high" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 财务报表额外筛选 -->
        <template v-if="activeReport === 'finance'">
          <el-form-item label="类型">
            <el-select v-model="filterForm.financeType" placeholder="全部类型" clearable style="width: 120px">
              <el-option label="应收" value="receivable" />
              <el-option label="应付" value="payable" />
              <el-option label="收入" value="income" />
              <el-option label="支出" value="expense" />
            </el-select>
          </el-form-item>
        </template>

        <!-- 业绩报表额外筛选 -->
        <template v-if="activeReport === 'performance'">
          <el-form-item label="部门">
            <el-select v-model="filterForm.departmentId" placeholder="全部部门" clearable style="width: 120px">
              <el-option label="销售一部" value="1" />
              <el-option label="销售二部" value="2" />
              <el-option label="销售三部" value="3" />
              <el-option label="销售四部" value="4" />
              <el-option label="销售五部" value="5" />
            </el-select>
          </el-form-item>
        </template>

        <el-form-item label="对比周期">
          <el-select v-model="filterForm.compareType" style="width: 120px">
            <el-option label="无对比" value="none" />
            <el-option label="同比" value="yoy" />
            <el-option label="环比" value="mom" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="queryLoading" @click="handleQuery">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button :icon="Download" @click="handleExport">导出</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 报表内容区域 -->
    <div class="report-content">
      <!-- 销售报表 -->
      <div v-show="activeReport === 'sales'" class="report-panel">
        <SalesReport :data="reportData.sales" :loading="reportLoading" />
      </div>

      <!-- 采购报表 -->
      <div v-show="activeReport === 'purchase'" class="report-panel">
        <PurchaseReport :data="reportData.purchase" :loading="reportLoading" />
      </div>

      <!-- 库存报表 -->
      <div v-show="activeReport === 'inventory'" class="report-panel">
        <InventoryReport :data="reportData.inventory" :loading="reportLoading" />
      </div>

      <!-- 财务报表 -->
      <div v-show="activeReport === 'finance'" class="report-panel">
        <FinanceReport :data="reportData.finance" :loading="reportLoading" />
      </div>

      <!-- 业绩报表 -->
      <div v-show="activeReport === 'performance'" class="report-panel">
        <PerformanceReport :data="reportData.performance" :loading="reportLoading" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Download, Refresh } from '@element-plus/icons-vue'
import { getSalesReport, getPurchaseReport, getInventoryReport, getFinanceReport, getPerformanceReport, exportReport } from '@/api/report'
import SalesReport from './reports/SalesReport.vue'
import PurchaseReport from './reports/PurchaseReport.vue'
import InventoryReport from './reports/InventoryReport.vue'
import FinanceReport from './reports/FinanceReport.vue'
import PerformanceReport from './reports/PerformanceReport.vue'

const activeReport = ref('sales')
const queryLoading = ref(false)
const reportLoading = ref(false)
const selectedQuickDate = ref('')

// 报表数据
const reportData = reactive({
  sales: null,
  purchase: null,
  inventory: null,
  finance: null,
  performance: null
})

// 筛选表单
const filterForm = reactive({
  dateRange: [],
  compareType: 'none',
  customerId: null,
  supplierId: null,
  categoryId: null,
  warehouseId: null,
  stockStatus: null,
  financeType: null,
  departmentId: null
})

// 快速时间选择选项
const quickDateOptions = [
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '上月', value: 'lastMonth' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' }
]

// 从 localStorage 加载数据列表
const customerList = ref([])
const supplierList = ref([])
const categoryList = ref([])
const warehouseList = ref([])

const loadFilterData = () => {
  try {
    const customers = JSON.parse(localStorage.getItem('cc_erp_test_customers') || '[]')
    customerList.value = customers.map(c => ({ id: c.id, customerName: c.name }))

    const suppliers = JSON.parse(localStorage.getItem('cc_erp_test_suppliers') || '[]')
    supplierList.value = suppliers.map(s => ({ id: s.id, supplierName: s.name }))

    const categories = JSON.parse(localStorage.getItem('cc_erp_categories') || '[]')
    categoryList.value = categories.map(c => ({ id: c.id, categoryName: c.categoryName }))

    const warehouses = JSON.parse(localStorage.getItem('cc_erp_test_warehouses') || '[]')
    warehouseList.value = warehouses.map(w => ({ id: w.id, warehouseName: w.name }))
  } catch (e) {
    console.error('加载筛选数据失败:', e)
  }
}

// 获取查询参数
const getQueryParams = () => {
  const params = {
    compareType: filterForm.compareType
  }

  if (filterForm.dateRange && filterForm.dateRange.length === 2) {
    params.startDate = filterForm.dateRange[0]
    params.endDate = filterForm.dateRange[1]
  }

  if (filterForm.customerId) params.customerId = filterForm.customerId
  if (filterForm.supplierId) params.supplierId = filterForm.supplierId
  if (filterForm.categoryId) params.categoryId = filterForm.categoryId
  if (filterForm.warehouseId) params.warehouseId = filterForm.warehouseId
  if (filterForm.stockStatus) params.stockStatus = filterForm.stockStatus
  if (filterForm.financeType) params.financeType = filterForm.financeType
  if (filterForm.departmentId) params.departmentId = filterForm.departmentId

  return params
}

// 查询报表数据
const queryReportData = async () => {
  const params = getQueryParams()
  reportLoading.value = true

  try {
    let data
    switch (activeReport.value) {
      case 'sales':
        data = await getSalesReport(params)
        reportData.sales = data
        break
      case 'purchase':
        data = await getPurchaseReport(params)
        reportData.purchase = data
        break
      case 'inventory':
        data = await getInventoryReport(params)
        reportData.inventory = data
        break
      case 'finance':
        data = await getFinanceReport(params)
        reportData.finance = data
        break
      case 'performance':
        data = await getPerformanceReport(params)
        reportData.performance = data
        break
    }
  } catch (error) {
    console.error('查询报表失败:', error)
    ElMessage.error('查询报表失败')
  } finally {
    reportLoading.value = false
  }
}

// 快速时间选择
const handleQuickDate = (type) => {
  selectedQuickDate.value = type
  const now = new Date()
  let startDate, endDate

  switch (type) {
    case 'today':
      startDate = endDate = formatDate(now)
      break
    case 'week':
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      startDate = formatDate(weekStart)
      endDate = formatDate(now)
      break
    case 'month':
      startDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
      endDate = formatDate(now)
      break
    case 'lastMonth':
      startDate = formatDate(new Date(now.getFullYear(), now.getMonth() - 1, 1))
      endDate = formatDate(new Date(now.getFullYear(), now.getMonth(), 0))
      break
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3)
      startDate = formatDate(new Date(now.getFullYear(), quarter * 3, 1))
      endDate = formatDate(now)
      break
    case 'year':
      startDate = formatDate(new Date(now.getFullYear(), 0, 1))
      endDate = formatDate(now)
      break
  }

  filterForm.dateRange = [startDate, endDate]
  handleQuery()
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 日期变化处理
const handleDateChange = () => {
  selectedQuickDate.value = ''
}

// 报表类型切换
const handleReportChange = () => {
  // 如果当前报表没有数据，则查询
  if (!reportData[activeReport.value]) {
    queryReportData()
  }
}

// 查询
const handleQuery = async () => {
  queryLoading.value = true
  await queryReportData()
  queryLoading.value = false
  ElMessage.success('查询成功')
}

// 重置
const handleReset = () => {
  Object.assign(filterForm, {
    dateRange: [],
    compareType: 'none',
    customerId: null,
    supplierId: null,
    categoryId: null,
    warehouseId: null,
    stockStatus: null,
    financeType: null,
    departmentId: null
  })
  selectedQuickDate.value = ''
  handleQuery()
}

// 刷新全部
const handleRefreshAll = () => {
  Object.keys(reportData).forEach(key => {
    reportData[key] = null
  })
  handleQuery()
}

// 导出
const handleExport = async () => {
  try {
    const params = getQueryParams()
    await exportReport(activeReport.value, params)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 初始化
onMounted(() => {
  loadFilterData()
  // 默认加载本月数据
  handleQuickDate('month')
})
</script>

<style lang="scss" scoped>
.report-container {
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

.type-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.report-type-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-date-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 12px 16px;
  }

  .quick-date-options {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;

    .quick-label {
      font-size: 14px;
      color: #595959;
      margin-right: 4px;
    }

    .el-button {
      border-radius: 4px;
    }
  }
}

.filter-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.filter-form {
  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
}

.report-content {
  min-height: 400px;

  .report-panel {
    animation: fadeIn 0.3s ease;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
