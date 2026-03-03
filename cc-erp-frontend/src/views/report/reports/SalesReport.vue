<template>
  <div class="sales-report" v-loading="loading">
    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="kpi-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon sales">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">销售总额</div>
              <div class="kpi-value">¥{{ (displayData.kpi?.totalSales || 0).toLocaleString() }}</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>{{ displayData.kpi?.salesGrowth || 12.5 }}%</span>
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
              <div class="kpi-label">订单数量</div>
              <div class="kpi-value">{{ displayData.kpi?.orderCount || 0 }}</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>{{ displayData.kpi?.orderGrowth || 8.3 }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon profit">
              <el-icon :size="32"><Money /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">毛利润</div>
              <div class="kpi-value">¥{{ (displayData.kpi?.profit || 0).toLocaleString() }}</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>{{ displayData.kpi?.profitGrowth || 15.2 }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon customers">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">客户数量</div>
              <div class="kpi-value">{{ displayData.kpi?.customerCount || 0 }}</div>
              <div class="kpi-trend">
                <el-icon><Minus /></el-icon>
                <span>0%</span>
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
            <span class="card-title">销售趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">销售构成</span>
          </template>
          <div ref="pieChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 销售排行表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <span class="card-title">商品销售排行 (TOP {{ (displayData.ranking || []).length }})</span>
      </template>
      <el-table :data="displayData.ranking || []" border stripe style="width: 100%">
        <el-table-column type="index" label="排名" width="70" align="center">
          <template #default="{ $index }">
            <el-tag v-if="$index < 3" type="success">{{ $index + 1 }}</el-tag>
            <span v-else>{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="180" />
        <el-table-column prop="quantity" label="销售数量" width="100" align="right" />
        <el-table-column prop="amount" label="销售金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ (row.amount || 0).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column prop="profit" label="毛利润" width="110" align="right">
          <template #default="{ row }">
            <span class="profit-text">¥{{ (row.profit || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitRate" label="毛利率" width="90" align="right">
          <template #default="{ row }">
            {{ (row.profitRate || 0).toFixed(1) }}%
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { ShoppingCart, Document, Money, User, Top, Bottom, Minus } from '@element-plus/icons-vue'

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
    totalSales: 0,
    orderCount: 0,
    profit: 0,
    customerCount: 0
  },
  trend: {
    categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    sales: Array(12).fill(0),
    orders: Array(12).fill(0)
  },
  composition: [],
  ranking: []
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
      data: ['销售额', '订单数']
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
    yAxis: [
      {
        type: 'value',
        name: '销售额(元)',
        position: 'left'
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right'
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        smooth: true,
        data: data.sales,
        itemStyle: { color: '#1890FF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        }
      },
      {
        name: '订单数',
        type: 'bar',
        yAxisIndex: 1,
        data: data.orders,
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
  const data = displayData.value.composition || defaultData.composition

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
        name: '销售构成',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
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
.sales-report {
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

      &.sales { background: rgba(24, 144, 255, 0.1); color: #1890FF; }
      &.orders { background: rgba(82, 196, 26, 0.1); color: #52C41A; }
      &.profit { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
      &.customers { background: rgba(245, 108, 108, 0.1); color: #F56C6C; }
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

  .chart-card {
    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #262626;
    }
  }

  .table-card {
    .card-title {
      font-size: 16px;
      font-weight: 500;
      color: #262626;
    }
  }

  .profit-text {
    color: #52C41A;
    font-weight: 500;
  }
}
</style>
