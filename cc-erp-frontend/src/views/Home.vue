<template>
  <div class="home-container">
    <el-row :gutter="16">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-primary">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><ShoppingCart /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">今日销售</p>
              <p class="stat-value">¥ {{ formatMoney(stats.todaySales) }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-success">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Goods /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">商品总数</p>
              <p class="stat-value">{{ stats.productCount }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-warning">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><Box /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">库存预警</p>
              <p class="stat-value">{{ stats.lowStockCount }}</p>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card stat-card-info">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon :size="32"><User /></el-icon>
            </div>
            <div class="stat-info">
              <p class="stat-label">客户总数</p>
              <p class="stat-value">{{ stats.customerCount }}</p>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :xs="24" :lg="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>销售趋势（近7天）</span>
            </div>
          </template>
          <div ref="salesChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>商品分类占比</span>
            </div>
          </template>
          <div ref="categoryChartRef" style="height: 300px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <el-row :gutter="16">
            <el-col :xs="12" :sm="8" :md="6">
              <div class="quick-action" @click="$router.push('/product')">
                <el-icon :size="24" color="#1890FF"><Goods /></el-icon>
                <span>商品管理</span>
              </div>
            </el-col>
            <el-col :xs="12" :sm="8" :md="6">
              <div class="quick-action" @click="$router.push('/purchase')">
                <el-icon :size="24" color="#52C41A"><ShoppingCart /></el-icon>
                <span>采购入库</span>
              </div>
            </el-col>
            <el-col :xs="12" :sm="8" :md="6">
              <div class="quick-action" @click="$router.push('/sales')">
                <el-icon :size="24" color="#FAAD14"><Sell /></el-icon>
                <span>销售出库</span>
              </div>
            </el-col>
            <el-col :xs="12" :sm="8" :md="6">
              <div class="quick-action" @click="$router.push('/inventory')">
                <el-icon :size="24" color="#F5222D"><Box /></el-icon>
                <span>库存查询</span>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import * as echarts from 'echarts'
import {
  ShoppingCart,
  Goods,
  Box,
  User,
  Sell
} from '@element-plus/icons-vue'

const salesChartRef = ref()
const categoryChartRef = ref()
let salesChart = null
let categoryChart = null

// 统计数据
const stats = reactive({
  todaySales: 0,
  productCount: 0,
  lowStockCount: 0,
  customerCount: 0
})

// 从 localStorage 获取数据
const getData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

// 格式化金额
const formatMoney = (amount) => {
  return amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// 获取今天的日期字符串
const getTodayDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 计算统计数据
const calculateStats = () => {
  const products = getData('cc_erp_test_products')
  const customers = getData('cc_erp_test_customers')
  const salesOrders = getData('cc_erp_test_sales_orders')
  const categories = getData('cc_erp_categories')

  // 商品总数
  stats.productCount = products.length

  // 客户总数
  stats.customerCount = customers.length

  // 今日销售
  const today = getTodayDate()
  const todaySales = salesOrders.filter(order => {
    return order.orderDate && order.orderDate.startsWith(today) && order.status !== '已作废'
  })
  stats.todaySales = todaySales.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

  // 库存预警（库存小于10的商品）
  stats.lowStockCount = products.filter(p => (p.stock || 0) < 10).length
}

// 获取近7天日期
const getLast7Days = () => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    days.push(`${month}-${day}`)
  }
  return days
}

// 计算近7天销售数据
const getSalesData = () => {
  const salesOrders = getData('cc_erp_test_sales_orders')
  const last7Days = getLast7Days()
  const data = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const daySales = salesOrders
      .filter(order => order.orderDate && order.orderDate.startsWith(dateStr) && order.status !== '已作废')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    data.push(daySales)
  }

  return { dates: last7Days, values: data }
}

// 计算分类数据
const getCategoryData = () => {
  const products = getData('cc_erp_test_products')
  const categories = getData('cc_erp_categories')

  const categoryMap = {}
  categories.forEach(cat => {
    categoryMap[cat.id] = cat.categoryName
  })

  const productCountByCategory = {}
  products.forEach(product => {
    const categoryName = categoryMap[product.categoryId] || '未分类'
    productCountByCategory[categoryName] = (productCountByCategory[categoryName] || 0) + 1
  })

  const colors = ['#1890FF', '#52C41A', '#FAAD14', '#F5222D', '#722ED1', '#EB2F96']
  const data = Object.entries(productCountByCategory).map(([name, value], index) => ({
    value,
    name,
    itemStyle: { color: colors[index % colors.length] }
  }))

  return data
}

const initSalesChart = () => {
  if (!salesChartRef.value) return

  salesChart = echarts.init(salesChartRef.value)
  const { dates, values } = getSalesData()

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const param = params[0]
        return `${param.axisValue}<br/>销售额: ¥${formatMoney(param.value)}`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => '¥' + value
      }
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: values,
        smooth: true,
        itemStyle: {
          color: '#1890FF'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.05)' }
          ])
        }
      }
    ]
  }
  salesChart.setOption(option)
}

const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)
  const data = getCategoryData()

  // 如果没有数据，显示空状态
  if (data.length === 0) {
    const option = {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          color: '#999',
          fontSize: 14
        }
      }
    }
    categoryChart.setOption(option)
    return
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center'
    },
    series: [
      {
        name: '商品分类',
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
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data
      }
    ]
  }
  categoryChart.setOption(option)
}

const handleResize = () => {
  salesChart?.resize()
  categoryChart?.resize()
}

// 刷新数据
const refreshData = () => {
  calculateStats()
  if (salesChart) {
    const { dates, values } = getSalesData()
    salesChart.setOption({
      xAxis: { data: dates },
      series: [{ data: values }]
    })
  }
  if (categoryChart) {
    const data = getCategoryData()
    if (data.length === 0) {
      categoryChart.setOption({
        title: {
          text: '暂无数据',
          left: 'center',
          top: 'center',
          textStyle: { color: '#999', fontSize: 14 }
        },
        series: [{ data: [] }]
      })
    } else {
      categoryChart.setOption({
        title: { show: false },
        series: [{ data }]
      })
    }
  }
}

onMounted(() => {
  calculateStats()
  setTimeout(() => {
    initSalesChart()
    initCategoryChart()
  }, 100)
  window.addEventListener('resize', handleResize)

  // 监听 localStorage 变化，实时更新数据
  window.addEventListener('storage', refreshData)
})

onUnmounted(() => {
  salesChart?.dispose()
  categoryChart?.dispose()
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('storage', refreshData)
})
</script>

<style lang="scss" scoped>
.home-container {
  width: 100%;
}

.stat-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;

  .stat-icon {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(24, 144, 255, 0.1);
    color: #1890FF;
  }

  .stat-info {
    flex: 1;

    .stat-label {
      font-size: 14px;
      color: #8C8C8C;
      margin: 0 0 8px 0;
    }

    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #262626;
      margin: 0;
    }
  }
}

.stat-card-primary .stat-icon {
  background: rgba(24, 144, 255, 0.1);
  color: #1890FF;
}

.stat-card-success .stat-icon {
  background: rgba(82, 196, 26, 0.1);
  color: #52C41A;
}

.stat-card-warning .stat-icon {
  background: rgba(250, 173, 20, 0.1);
  color: #FAAD14;
}

.stat-card-info .stat-icon {
  background: rgba(24, 144, 255, 0.1);
  color: #1890FF;
}

.chart-card {
  border-radius: 8px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.card-header {
  font-size: 16px;
  font-weight: 500;
  color: #262626;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border: 1px solid #F0F0F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1890FF;
    background: rgba(24, 144, 255, 0.05);
  }

  span {
    margin-top: 12px;
    font-size: 14px;
    color: #262626;
  }
}
</style>
