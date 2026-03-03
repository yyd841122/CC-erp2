<template>
  <div class="finance-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">财务管理</h2>
    </div>

    <!-- 金额统计卡片 -->
    <el-row :gutter="16" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card success">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#52C41A"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">本月收入</div>
              <div class="stat-value">¥{{ (stats.monthlyIncome || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card warning">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#E6A23C"><WalletFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">本月支出</div>
              <div class="stat-value">¥{{ (stats.monthlyExpense || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card primary">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#1890FF"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">应收账款</div>
              <div class="stat-value">¥{{ (stats.receivable || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card danger">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="36" color="#F56C6C"><CreditCard /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">应付账款</div>
              <div class="stat-value">¥{{ (stats.payable || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Tab 切换 -->
    <el-card class="main-card">
      <el-tabs v-model="activeTab" class="finance-tabs">
        <!-- 应收账款 -->
        <el-tab-pane label="应收账款" name="receivable">
          <ReceivableList />
        </el-tab-pane>

        <!-- 应付账款 -->
        <el-tab-pane label="应付账款" name="payable">
          <PayableList />
        </el-tab-pane>

        <!-- 收款记录 -->
        <el-tab-pane label="收款记录" name="receipt">
          <ReceiptList />
        </el-tab-pane>

        <!-- 付款记录 -->
        <el-tab-pane label="付款记录" name="payment">
          <PaymentList />
        </el-tab-pane>

        <!-- 发票管理 -->
        <el-tab-pane label="发票管理" name="invoice">
          <InvoiceList />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Money, WalletFilled, Document, CreditCard } from '@element-plus/icons-vue'
import { getFinanceStats } from '@/api/finance'
import ReceivableList from './ReceivableList.vue'
import PayableList from './PayableList.vue'
import ReceiptList from './ReceiptList.vue'
import PaymentList from './PaymentList.vue'
import InvoiceList from './InvoiceList.vue'

const activeTab = ref('receivable')

// 统计数据
const stats = reactive({
  monthlyIncome: 0,
  monthlyExpense: 0,
  receivable: 0,
  payable: 0
})

// 加载统计数据
const loadStats = async () => {
  try {
    const data = await getFinanceStats()
    Object.assign(stats, data)
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style lang="scss" scoped>
.finance-container {
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
}

.stats-cards {
  margin-bottom: 16px;
}

.stat-card {
  :deep(.el-card__body) {
    padding: 20px;
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.04);
  }

  .stat-info {
    flex: 1;

    .stat-label {
      font-size: 14px;
      color: #8C8C8C;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 20px;
      font-weight: 600;
      color: #262626;
    }
  }

  &.success .stat-value { color: #52C41A; }
  &.warning .stat-value { color: #E6A23C; }
  &.primary .stat-value { color: #1890FF; }
  &.danger .stat-value { color: #F56C6C; }
}

.main-card {
  :deep(.el-card__body) {
    padding: 0;
  }

  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 20px;
  }

  :deep(.el-tabs__content) {
    padding: 20px;
  }
}
</style>
