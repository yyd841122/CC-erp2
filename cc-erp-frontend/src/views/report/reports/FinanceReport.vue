<template>
  <div class="finance-report" v-loading="loading">
    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="kpi-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon income">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">本月收入</div>
              <div class="kpi-value">¥{{ (kpiData.monthlyIncome || 0).toLocaleString() }}</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>15.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon expense">
              <el-icon :size="32"><WalletFilled /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">本月支出</div>
              <div class="kpi-value">¥{{ (kpiData.monthlyExpense || 0).toLocaleString() }}</div>
              <div class="kpi-trend down">
                <el-icon><Bottom /></el-icon>
                <span>5.8%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon receivable">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">应收账款</div>
              <div class="kpi-value">¥{{ (kpiData.receivable || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon payable">
              <el-icon :size="32"><CreditCard /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">应付账款</div>
              <div class="kpi-value">¥{{ (kpiData.payable || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">收支趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">收支构成</span>
          </template>
          <div ref="pieChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 账龄分析表格 -->
    <el-row :gutter="16" class="table-row">
      <el-col :span="12">
        <el-card shadow="never" class="table-card">
          <template #header>
            <span class="card-title">应收账龄分析</span>
          </template>
          <el-table :data="agingReceivable" border stripe style="width: 100%">
            <el-table-column prop="period" label="账龄区间" width="120" />
            <el-table-column prop="count" label="单据数量" width="100" align="right" />
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.amount?.toLocaleString() || '0' }}
              </template>
            </el-table-column>
            <el-table-column prop="ratio" label="占比" width="80" align="right">
              <template #default="{ row }">
                {{ row.ratio }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="table-card">
          <template #header>
            <span class="card-title">应付账龄分析</span>
          </template>
          <el-table :data="agingPayable" border stripe style="width: 100%">
            <el-table-column prop="period" label="账龄区间" width="120" />
            <el-table-column prop="count" label="单据数量" width="100" align="right" />
            <el-table-column prop="amount" label="金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.amount?.toLocaleString() || '0' }}
              </template>
            </el-table-column>
            <el-table-column prop="ratio" label="占比" width="80" align="right">
              <template #default="{ row }">
                {{ row.ratio }}%
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Money, WalletFilled, Document, CreditCard, Top, Bottom } from '@element-plus/icons-vue'

const props = defineProps({
  data: Object,
  loading: {
    type: Boolean,
    default: false
  }
})

const trendChartRef = ref()
const pieChartRef = ref()
let trendChart = null
let pieChart = null

// 默认数据（已清空虚拟数据）
const defaultData = {
  kpi: {
    monthlyIncome: 0,
    monthlyExpense: 0,
    receivable: 0,
    payable: 0
  },
  agingReceivable: [],
  agingPayable: []
}

// 显示数据
const displayData = computed(() => props.data || defaultData)

// KPI 数据
const kpiData = computed(() => displayData.value.kpi || defaultData.kpi)

// 应收账龄数据
const agingReceivable = computed(() => displayData.value.agingReceivable || defaultData.agingReceivable)

// 应付账龄数据
const agingPayable = computed(() => displayData.value.agingPayable || defaultData.agingPayable)

// 初始化趋势图
const initTrendChart = () => {
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['收入', '支出']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        name: '收入',
        type: 'bar',
        data: Array(12).fill(0),
        itemStyle: { color: '#52C41A' }
      },
      {
        name: '支出',
        type: 'bar',
        data: Array(12).fill(0),
        itemStyle: { color: '#E6A23C' }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  pieChart = echarts.init(pieChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '收支构成',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 158600, name: '本月收入', itemStyle: { color: '#52C41A' } },
          { value: 98200, name: '本月支出', itemStyle: { color: '#E6A23C' } }
        ]
      }
    ]
  }
  pieChart.setOption(option)
}

// 更新图表
const updateCharts = () => {
  if (trendChart) {
    trendChart.dispose()
    initTrendChart()
  }
  if (pieChart) {
    pieChart.dispose()
    initPieChart()
  }
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    updateCharts()
  })
}, { deep: true })

onMounted(() => {
  initTrendChart()
  initPieChart()

  window.addEventListener('resize', () => {
    trendChart?.resize()
    pieChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  pieChart?.dispose()
})
</script>

<style lang="scss" scoped>
.finance-report {
  .kpi-cards {
    margin-bottom: 16px;
  }

  .kpi-card {
    :deep(.el-card__body) {
      padding: 20px;
    }

    .kpi-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .kpi-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 12px;

      &.income { background: rgba(82, 196, 26, 0.1); color: #52C41A; }
      &.expense { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
      &.receivable { background: rgba(24, 144, 255, 0.1); color: #1890FF; }
      &.payable { background: rgba(245, 108, 108, 0.1); color: #F56C6C; }
    }

    .kpi-info {
      flex: 1;

      .kpi-label {
        font-size: 14px;
        color: #8C8C8C;
        margin-bottom: 4px;
      }

      .kpi-value {
        font-size: 22px;
        font-weight: 600;
        color: #262626;
        margin-bottom: 4px;
      }

      .kpi-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;

        &.up { color: #52C41A; }
        &.down { color: #F56C6C; }
      }
    }
  }

  .chart-row, .table-row {
    margin-bottom: 16px;
  }

  .chart-card, .table-card {
    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #262626;
    }
  }
}
</style>
