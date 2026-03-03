<template>
  <div class="purchase-report" v-loading="loading">
    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="kpi-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon amount">
              <el-icon :size="32"><WalletFilled /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">采购总额</div>
              <div class="kpi-value">¥{{ (displayData.kpi?.totalAmount || 0).toLocaleString() }}</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>8.5%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon orders">
              <el-icon :size="32"><Document /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">采购单数</div>
              <div class="kpi-value">{{ displayData.kpi?.orderCount || 0 }}</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>5.2%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon suppliers">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">供应商数量</div>
              <div class="kpi-value">{{ displayData.kpi?.supplierCount || 0 }}</div>
              <div class="kpi-trend">
                <el-icon><Minus /></el-icon>
                <span>0%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon pending">
              <el-icon :size="32"><Clock /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">待入库金额</div>
              <div class="kpi-value">¥{{ (displayData.kpi?.pendingAmount || 0).toLocaleString() }}</div>
              <div class="kpi-trend down">
                <el-icon><Bottom /></el-icon>
                <span>12.3%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" class="chart-row">
      <el-col :span="16">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">采购趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">供应商采购占比</span>
          </template>
          <div ref="pieChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 采购明细表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <span class="card-title">商品采购明细</span>
      </template>
      <el-table :data="displayData.details || []" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="180" />
        <el-table-column prop="quantity" label="采购数量" width="100" align="right" />
        <el-table-column prop="avgPrice" label="平均单价" width="100" align="right">
          <template #default="{ row }">
            ¥{{ (row.avgPrice || 0).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="采购金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (row.amount || 0).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="supplierName" label="主要供应商" min-width="150" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { WalletFilled, Document, Box, Clock, Top, Bottom, Minus } from '@element-plus/icons-vue'

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
    totalAmount: 0,
    orderCount: 0,
    supplierCount: 0,
    pendingAmount: 0
  },
  trend: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    purchase: Array(12).fill(0),
    stock: Array(12).fill(0)
  },
  supplierRatio: [],
  details: []
}

// 显示数据
const displayData = computed(() => props.data || defaultData)

// 初始化趋势图
const initTrendChart = () => {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)
  const data = displayData.value.trend || defaultData.trend

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['采购额', '入库额']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.categories
    },
    yAxis: {
      type: 'value',
      name: '金额(元)'
    },
    series: [
      {
        name: '采购额',
        type: 'line',
        smooth: true,
        data: data.purchase,
        itemStyle: { color: '#1890FF' }
      },
      {
        name: '入库额',
        type: 'line',
        smooth: true,
        data: data.stock,
        itemStyle: { color: '#52C41A' }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化饼图
const initPieChart = () => {
  if (!pieChartRef.value) return

  pieChart = echarts.init(pieChartRef.value)
  const data = displayData.value.supplierRatio || defaultData.supplierRatio

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
        name: '供应商采购占比',
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
        data: data
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
.purchase-report {
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

      &.amount { background: rgba(24, 144, 255, 0.1); color: #1890FF; }
      &.orders { background: rgba(82, 196, 26, 0.1); color: #52C41A; }
      &.suppliers { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
      &.pending { background: rgba(245, 108, 108, 0.1); color: #F56C6C; }
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

  .chart-row {
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
