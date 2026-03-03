<template>
  <div class="performance-report" v-loading="loading">
    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="kpi-cards">
      <el-col :span="8">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon sales">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">销售目标达成率</div>
              <div class="kpi-value">{{ kpiData.salesAchievement || 0 }}%</div>
              <div class="kpi-progress">
                <el-progress :percentage="kpiData.salesAchievement || 0" :color="progressColor" />
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon profit">
              <el-icon :size="32"><Wallet /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">毛利率</div>
              <div class="kpi-value">{{ kpiData.profitRate || 0 }}%</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>较上月 +2.3%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon customer">
              <el-icon :size="32"><UserFilled /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">客户增长率</div>
              <div class="kpi-value">{{ kpiData.customerGrowth || 0 }}%</div>
              <div class="kpi-trend up">
                <el-icon><Top /></el-icon>
                <span>较上月 +5.2%</span>
              </div>
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
            <span class="card-title">销售业绩趋势</span>
          </template>
          <div ref="trendChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">客户贡献排行</span>
          </template>
          <div ref="barChartRef" style="height: 320px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 员工业绩排行表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <span class="card-title">员工销售业绩排行</span>
      </template>
      <el-table :data="employeeData" border stripe style="width: 100%">
        <el-table-column type="index" label="排名" width="70" align="center">
          <template #default="{ $index }">
            <el-tag v-if="$index < 3" type="success">{{ $index + 1 }}</el-tag>
            <span v-else>{{ $index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="employeeName" label="员工姓名" width="120" />
        <el-table-column prop="orderCount" label="订单数" width="100" align="right" />
        <el-table-column prop="salesAmount" label="销售金额" width="120" align="right">
          <template #default="{ row }">
            ¥{{ row.salesAmount?.toLocaleString() || '0' }}
          </template>
        </el-table-column>
        <el-table-column prop="profitAmount" label="毛利润" width="120" align="right">
          <template #default="{ row }">
            <span class="profit-text">¥{{ row.profitAmount?.toLocaleString() || '0' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="profitRate" label="毛利率" width="90" align="right">
          <template #default="{ row }">
            {{ row.profitRate?.toFixed(1) || '0.0' }}%
          </template>
        </el-table-column>
        <el-table-column prop="customerCount" label="新客户数" width="100" align="right" />
        <el-table-column prop="achievementRate" label="目标达成率" width="120" align="right">
          <template #default="{ row }">
            <el-progress
              :percentage="row.achievementRate"
              :color="getProgressColor(row.achievementRate)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { TrendCharts, Wallet, UserFilled, Top } from '@element-plus/icons-vue'

const props = defineProps({
  data: Object,
  loading: {
    type: Boolean,
    default: false
  }
})

const trendChartRef = ref()
const barChartRef = ref()
let trendChart = null
let barChart = null

// 默认数据（已清空虚拟数据）
const defaultData = {
  kpi: {
    salesAchievement: 0,
    profitRate: 0,
    customerGrowth: 0
  },
  employeeData: []
}

// 显示数据
const displayData = computed(() => props.data || defaultData)

// KPI 数据
const kpiData = computed(() => displayData.value.kpi || defaultData.kpi)

const progressColor = computed(() => {
  const rate = kpiData.value.salesAchievement
  if (rate >= 100) return '#52C41A'
  if (rate >= 80) return '#1890FF'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
})

const getProgressColor = (rate) => {
  if (rate >= 100) return '#52C41A'
  if (rate >= 80) return '#1890FF'
  if (rate >= 60) return '#E6A23C'
  return '#F56C6C'
}

// 员工业绩数据
const employeeData = computed(() => displayData.value.employeeData || defaultData.employeeData)

// 初始化趋势图
const initTrendChart = () => {
  trendChart = echarts.init(trendChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      data: ['销售额', '目标额']
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
        name: '销售额',
        type: 'line',
        smooth: true,
        data: Array(12).fill(0),
        itemStyle: { color: '#1890FF' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        }
      },
      {
        name: '目标额',
        type: 'line',
        data: Array(12).fill(0),
        itemStyle: { color: '#52C41A' },
        lineStyle: { type: 'dashed' }
      }
    ]
  }
  trendChart.setOption(option)
}

// 初始化柱状图
const initBarChart = () => {
  barChart = echarts.init(barChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '金额(元)'
    },
    yAxis: {
      type: 'category',
      data: []
    },
    series: [
      {
        name: '销售金额',
        type: 'bar',
        data: []
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#1890FF' },
            { offset: 1, color: '#52C41A' }
          ]),
          borderRadius: [0, 8, 8, 0]
        },
        label: {
          show: true,
          position: 'right',
          formatter: '¥{c}'
        }
      }
    ]
  }
  barChart.setOption(option)
}

// 更新图表
const updateCharts = () => {
  if (trendChart) {
    trendChart.dispose()
    initTrendChart()
  }
  if (barChart) {
    barChart.dispose()
    initBarChart()
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
  initBarChart()

  window.addEventListener('resize', () => {
    trendChart?.resize()
    barChart?.resize()
  })
})

onUnmounted(() => {
  trendChart?.dispose()
  barChart?.dispose()
})
</script>

<style lang="scss" scoped>
.performance-report {
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
      &.profit { background: rgba(82, 196, 26, 0.1); color: #52C41A; }
      &.customer { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
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
        margin-bottom: 8px;
      }

      .kpi-progress {
        :deep(.el-progress__text) {
          font-size: 14px !important;
        }
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

  .profit-text {
    color: #52C41A;
    font-weight: 500;
  }

  :deep(.el-progress) {
    .el-progress__text {
      font-size: 13px !important;
    }
  }
}
</style>
