<template>
  <div class="sales-report-page">
    <SalesReport :data="reportData" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getSalesReport } from '@/api/report'
import SalesReport from './reports/SalesReport.vue'

const loading = ref(false)
const reportData = ref(null)

// 获取报表数据
const fetchReportData = async () => {
  loading.value = true
  try {
    // 默认查询本月数据
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const params = {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      compareType: 'none'
    }

    reportData.value = await getSalesReport(params)
  } catch (error) {
    console.error('查询销售报表失败:', error)
    ElMessage.error('查询销售报表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReportData()
})
</script>

<style lang="scss" scoped>
.sales-report-page {
  width: 100%;
}
</style>
