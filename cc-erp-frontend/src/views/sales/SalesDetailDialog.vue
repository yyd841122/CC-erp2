<template>
  <el-dialog
    v-model="visible"
    title="销售单详情"
    width="800px"
    @close="handleClose"
  >
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-descriptions
        title="基本信息"
        :column="2"
        border
        class="info-section"
      >
        <el-descriptions-item label="销售单号:">
          {{ detailData.orderNo }}
        </el-descriptions-item>
        <el-descriptions-item label="状态:">
          <el-tag v-if="detailData.status === 0" type="info">草稿</el-tag>
          <el-tag v-else-if="detailData.status === 1" type="warning">待审核</el-tag>
          <el-tag v-else-if="detailData.status === 2" type="success">已审核</el-tag>
          <el-tag v-else-if="detailData.status === 3" type="primary">已出库</el-tag>
          <el-tag v-else-if="detailData.status === 9" type="danger">已作废</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="客户:">
          {{ detailData.customerName }}
        </el-descriptions-item>
        <el-descriptions-item label="仓库:">
          {{ detailData.warehouseName }}
        </el-descriptions-item>
        <el-descriptions-item label="销售日期:">
          {{ detailData.orderDate }}
        </el-descriptions-item>
        <el-descriptions-item label="交货日期:">
          {{ detailData.deliveryDate || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间:">
          {{ detailData.createdAt }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 金额信息 -->
      <el-descriptions
        title="金额信息"
        :column="3"
        border
        class="info-section"
      >
        <el-descriptions-item label="销售金额:">
          <span class="amount-text">¥{{ detailData.totalAmount?.toFixed(2) || '0.00' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="税额:">
          <span class="amount-text">¥{{ detailData.taxAmount?.toFixed(2) || '0.00' }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="含税金额:">
          <span class="amount-text amount-primary">¥{{ detailData.finalAmount?.toFixed(2) || '0.00' }}</span>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 销售明细 -->
      <div class="detail-section">
        <h4 class="section-title">销售明细</h4>
        <el-table
          :data="detailData.items || []"
          border
          style="width: 100%"
          :summary-method="getSummaries"
          show-summary
        >
          <el-table-column prop="productCode" label="商品编码" width="120" />
          <el-table-column prop="productName" label="商品名称" min-width="150" />
          <el-table-column prop="spec" label="规格" width="100" />
          <el-table-column prop="unit" label="单位" width="60" />
          <el-table-column prop="quantity" label="数量" width="80" align="right" />
          <el-table-column prop="price" label="单价" width="100" align="right">
            <template #default="{ row }">
              ¥{{ row.price?.toFixed(2) || '0.00' }}
            </template>
          </el-table-column>
          <el-table-column prop="subtotal" label="小计" width="100" align="right">
            <template #default="{ row }">
              ¥{{ ((row.quantity || 0) * (row.price || 0)).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 备注 -->
      <div v-if="detailData.remark" class="remark-section">
        <h4 class="section-title">备注</h4>
        <p class="remark-text">{{ detailData.remark }}</p>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handlePrint">打印</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  orderId: [Number, String]
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const detailData = reactive({
  orderNo: '',
  status: 0,
  customerName: '',
  warehouseName: '',
  orderDate: '',
  deliveryDate: '',
  totalAmount: 0,
  taxAmount: 0,
  finalAmount: 0,
  items: [],
  remark: '',
  createdAt: ''
})

// 模拟数据（已清空虚拟数据，从props或API获取）
const mockData = {
  orderNo: '',
  status: 0,
  customerName: '',
  warehouseName: '',
  orderDate: '',
  deliveryDate: '',
  totalAmount: 0,
  taxAmount: 0,
  finalAmount: 0,
  items: [],
  remark: '',
  createdAt: ''
}

// 加载详情数据
const loadDetail = async () => {
  if (!props.orderId) return

  loading.value = true
  try {
    // TODO: 调用接口获取详情
    // const data = await getSalesOrderDetail(props.orderId)
    Object.assign(detailData, mockData)
  } catch (error) {
    console.error('加载详情失败:', error)
    ElMessage.error('加载详情失败')
  } finally {
    loading.value = false
  }
}

// 计算合计
const getSummaries = (param) => {
  const sums = []
  sums[0] = '合计'
  sums[6] = param.data.map((row) => (row.quantity || 0) * (row.price || 0)).reduce((sum, val) => sum + val, 0)
  return sums
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
}

// 打印
const handlePrint = () => {
  ElMessage.info('打印功能开发中...')
}

// 监听显示状态
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadDetail()
  }
})
</script>

<style lang="scss" scoped>
.info-section {
  margin-bottom: 16px;

  :deep(.el-descriptions__label) {
    font-weight: 500;
  }
}

.amount-text {
  font-weight: 500;
}

.amount-primary {
  font-size: 16px;
  font-weight: 600;
  color: #1890FF;
}

.detail-section {
  margin-top: 16px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 12px;
  }
}

.remark-section {
  margin-top: 16px;

  .section-title {
    font-size: 14px;
    font-weight: 500;
    color: #262626;
    margin-bottom: 8px;
  }

  .remark-text {
    font-size: 14px;
    color: #595959;
    margin: 0;
    padding: 12px;
    background: #F5F5F5;
    border-radius: 4px;
  }
}
</style>
