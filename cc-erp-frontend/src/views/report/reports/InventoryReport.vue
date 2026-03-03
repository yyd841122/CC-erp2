<template>
  <div class="inventory-report" v-loading="loading">
    <!-- 关键指标卡片 -->
    <el-row :gutter="16" class="kpi-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon total">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">库存总值</div>
              <div class="kpi-value">¥{{ (kpiData.totalValue || 0).toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon warning">
              <el-icon :size="32"><Warning /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">库存不足</div>
              <div class="kpi-value warning">{{ kpiData.lowStock || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon danger">
              <el-icon :size="32"><CircleClose /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">缺货商品</div>
              <div class="kpi-value danger">{{ kpiData.outOfStock || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-content">
            <div class="kpi-icon overstock">
              <el-icon :size="32"><InfoFilled /></el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-label">超储商品</div>
              <div class="kpi-value overstock">{{ kpiData.overstock || 0 }}</div>
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
            <span class="card-title">库存分类占比</span>
          </template>
          <div ref="pieChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <span class="card-title">库存周转率</span>
          </template>
          <div ref="barChartRef" style="height: 300px"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库存明细表格 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <span class="card-title">库存明细</span>
      </template>
      <el-table :data="inventoryData" border stripe style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="productCode" label="商品编码" width="120" />
        <el-table-column prop="productName" label="商品名称" min-width="150" />
        <el-table-column prop="quantity" label="库存数量" width="100" align="right">
          <template #default="{ row }">
            <span :class="getStockClass(row)">{{ row.quantity }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="60" />
        <el-table-column prop="avgCost" label="平均成本" width="100" align="right">
          <template #default="{ row }">
            ¥{{ row.avgCost?.toFixed(2) || '0.00' }}
          </template>
        </el-table-column>
        <el-table-column prop="stockValue" label="库存金额" width="110" align="right">
          <template #default="{ row }">
            ¥{{ (row.quantity * row.avgCost).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="turnoverRate" label="周转率" width="90" align="right">
          <template #default="{ row }">
            {{ row.turnoverRate?.toFixed(1) || '0.0' }}
          </template>
        </el-table-column>
        <el-table-column prop="lastInDate" label="最近入库" width="110" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'normal'" type="success" size="small">正常</el-tag>
            <el-tag v-else-if="row.status === 'low'" type="warning" size="small">库存不足</el-tag>
            <el-tag v-else-if="row.status === 'out'" type="danger" size="small">缺货</el-tag>
            <el-tag v-else-if="row.status === 'over'" type="info" size="small">超储</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Box, Warning, CircleClose, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  data: Object,
  loading: {
    type: Boolean,
    default: false
  }
})

const pieChartRef = ref()
const barChartRef = ref()
let pieChart = null
let barChart = null

// 默认数据（已清空虚拟数据）
const defaultData = {
  kpi: {
    totalValue: 0,
    lowStock: 0,
    outOfStock: 0,
    overstock: 0
  },
  stockStatus: []
}

// 显示数据
const displayData = computed(() => props.data || defaultData)

// KPI 数据
const kpiData = computed(() => displayData.value.kpi || defaultData.kpi)

// 库存明细数据
const inventoryData = computed(() => displayData.value.stockStatus || defaultData.stockStatus)

const getStockClass = (row) => {
  if (row.status === 'out') return 'text-danger'
  if (row.status === 'low') return 'text-warning'
  if (row.status === 'over') return 'text-info'
  return 'text-success'
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
        name: '库存分类占比',
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
        data: []
      }
    ]
  }
  pieChart.setOption(option)
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
      name: '周转率'
    },
    yAxis: {
      type: 'category',
      data: []
    },
    series: [
      {
        name: '周转率',
        type: 'bar',
        data: [8.5, 6.2, 4.8, 4.2, 1.5],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#1890FF' },
            { offset: 1, color: '#52C41A' }
          ]),
          borderRadius: [0, 8, 8, 0]
        },
        label: {
          show: true,
          position: 'right'
        }
      }
    ]
  }
  barChart.setOption(option)
}

// 更新图表
const updateCharts = () => {
  if (pieChart) {
    pieChart.dispose()
    initPieChart()
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
  initPieChart()
  initBarChart()

  window.addEventListener('resize', () => {
    pieChart?.resize()
    barChart?.resize()
  })
})

onUnmounted(() => {
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<style lang="scss" scoped>
.inventory-report {
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

      &.total { background: rgba(24, 144, 255, 0.1); color: #1890FF; }
      &.warning { background: rgba(230, 162, 60, 0.1); color: #E6A23C; }
      &.danger { background: rgba(245, 108, 108, 0.1); color: #F56C6C; }
      &.overstock { background: rgba(144, 147, 153, 0.1); color: #909399; }
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

        &.warning { color: #E6A23C; }
        &.danger { color: #F56C6C; }
        &.overstock { color: #909399; }
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

  .text-success { color: #52C41A; font-weight: 500; }
  .text-warning { color: #E6A23C; font-weight: 500; }
  .text-danger { color: #F56C6C; font-weight: 500; }
  .text-info { color: #909399; font-weight: 500; }
}
</style>
