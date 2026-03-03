<template>
  <el-dialog
    v-model="visible"
    title="库存流水"
    width="900px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <!-- 统计信息 -->
      <el-row :gutter="16" class="stats-row">
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">期初库存</div>
            <div class="stat-value">{{ stats.initialStock }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item success">
            <div class="stat-label">入库总量</div>
            <div class="stat-value">+{{ stats.totalIn }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item danger">
            <div class="stat-label">出库总量</div>
            <div class="stat-value">-{{ stats.totalOut }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-item">
            <div class="stat-label">当前库存</div>
            <div class="stat-value primary">{{ stats.currentStock }}</div>
          </div>
        </el-col>
      </el-row>

      <!-- 流水表格 -->
      <el-table
        :data="tableData"
        border
        stripe
        style="width: 100%"
        :default-sort="{ prop: 'movementDate', order: 'descending' }"
      >
        <el-table-column prop="movementNo" label="流水单号" width="150" />
        <el-table-column prop="movementDate" label="日期" width="110" sortable />
        <el-table-column prop="movementType" label="类型" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.movementType === 'in'" type="success" size="small">入库</el-tag>
            <el-tag v-else-if="row.movementType === 'out'" type="danger" size="small">出库</el-tag>
            <el-tag v-else-if="row.movementType === 'adjust'" type="warning" size="small">调整</el-tag>
            <el-tag v-else-if="row.movementType === 'transfer'" type="info" size="small">调拨</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="businessType" label="业务类型" width="100" />
        <el-table-column prop="quantity" label="数量" width="90" align="right">
          <template #default="{ row }">
            <span :class="row.movementType === 'in' ? 'text-success' : 'text-danger'">
              {{ row.movementType === 'in' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="beforeStock" label="变动前" width="90" align="right" />
        <el-table-column prop="afterStock" label="变动后" width="90" align="right">
          <template #default="{ row }">
            <span class="font-bold">{{ row.afterStock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unitPrice" label="单价" width="90" align="right">
          <template #default="{ row }">
            ¥{{ row.unitPrice?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.amount?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="referenceNo" label="关联单据" width="130" />
        <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleExport">导出</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  productId: [Number, String]
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)

// 统计数据
const stats = reactive({
  initialStock: 0,
  totalIn: 0,
  totalOut: 0,
  currentStock: 0
})

const tableData = ref([
  {
    id: 1,
    movementNo: 'MV-20240301-0001',
    movementDate: '2024-03-01 10:30',
    movementType: 'out',
    businessType: '销售出库',
    quantity: 100,
    beforeStock: 1350,
    afterStock: 1250,
    unitPrice: 6.5,
    amount: 650,
    referenceNo: 'SAL-20240301-0001',
    remark: '销售出库'
  },
  {
    id: 2,
    movementNo: 'MV-20240228-0001',
    movementDate: '2024-02-28 14:20',
    movementType: 'in',
    businessType: '采购入库',
    quantity: 500,
    beforeStock: 850,
    afterStock: 1350,
    unitPrice: 6.2,
    amount: 3100,
    referenceNo: 'PUR-20240228-0001',
    remark: '采购入库'
  },
  {
    id: 3,
    movementNo: 'MV-20240225-0001',
    movementDate: '2024-02-25 09:15',
    movementType: 'out',
    businessType: '销售出库',
    quantity: 150,
    beforeStock: 1000,
    afterStock: 850,
    unitPrice: 6.5,
    amount: 975,
    referenceNo: 'SAL-20240225-0001',
    remark: '销售出库'
  }
])

const pagination = reactive({
  page: 1,
  size: 20,
  total: 3
})

// 加载数据
const loadData = async () => {
  if (!props.productId) return

  loading.value = true
  try {
    // TODO: 调用接口获取流水数据
    // const data = await getStockMovementHistory(props.productId, params)
    updateStats()
  } catch (error) {
    console.error('加载流水失败:', error)
  } finally {
    loading.value = false
  }
}

// 更新统计
const updateStats = () => {
  const totalIn = tableData.value
    .filter(item => item.movementType === 'in')
    .reduce((sum, item) => sum + item.quantity, 0)
  const totalOut = tableData.value
    .filter(item => item.movementType === 'out')
    .reduce((sum, item) => sum + item.quantity, 0)

  stats.totalIn = totalIn
  stats.totalOut = totalOut
  stats.currentStock = 1250 // 当前库存
  stats.initialStock = stats.currentStock - totalIn + totalOut
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

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 导出
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 监听显示状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadData()
  }
})
</script>

<style lang="scss" scoped>
.stats-row {
  margin-bottom: 16px;
}

.stat-item {
  padding: 16px;
  background: #F5F5F5;
  border-radius: 4px;
  text-align: center;

  .stat-label {
    font-size: 14px;
    color: #8C8C8C;
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 600;
    color: #262626;

    &.primary {
      color: #1890FF;
    }
  }

  &.success .stat-value {
    color: #52C41A;
  }

  &.danger .stat-value {
    color: #F56C6C;
  }
}

.text-success {
  color: #52C41A;
}

.text-danger {
  color: #F56C6C;
}

.font-bold {
  font-weight: 600;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}
</style>
