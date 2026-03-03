<template>
  <div class="annual-closing-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">年终关账</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Lock" @click="showClosingDialog = true">
          执行关账
        </el-button>
      </div>
    </div>

    <!-- 说明提示 -->
    <el-alert
      title="关于年终关账"
      type="info"
      :closable="false"
      style="margin-bottom: 16px;"
    >
      <template #default>
        <p>1. 年终关账通常在每年春节前（腊月）进行，关账后将锁定该年度所有财务数据</p>
        <p>2. 已关账年度的数据不可修改，但可以查询</p>
        <p>3. 反结账功能仅系统管理员可使用</p>
      </template>
    </el-alert>

    <!-- 已关账年度列表 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>已关账年度</span>
          <el-button :icon="Refresh" @click="loadData" circle />
        </div>
      </template>

      <el-table
        :data="closingList"
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="year" label="年度" width="100" align="center" />
        <el-table-column prop="closingDate" label="关账日期" width="120" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column label="销售金额" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ (row.summary?.salesAmount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="采购金额" width="140" align="right">
          <template #default="{ row }">
            <span class="amount-text">¥{{ (row.summary?.purchaseAmount || 0).toLocaleString() }}</span>
          </template>
        </el-table-column>
        <el-table-column label="毛利" width="140" align="right">
          <template #default="{ row }">
            <span :class="row.summary?.profit >= 0 ? 'profit-text' : 'loss-text'">
              ¥{{ (row.summary?.profit || 0).toLocaleString() }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'closed' ? 'success' : 'info'" size="small">
              {{ row.status === 'closed' ? '已关账' : '已取消' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :icon="View"
              @click="handleViewDetail(row)"
            >
              查看详情
            </el-button>
            <el-button
              v-if="row.status === 'closed' && isAdmin"
              link
              type="warning"
              :icon="Unlock"
              @click="handleCancelClosing(row)"
            >
              反结账
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && closingList.length === 0" description="暂无关账记录" />
    </el-card>

    <!-- 执行关账对话框 -->
    <el-dialog
      v-model="showClosingDialog"
      title="执行年终关账"
      width="600px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-alert
        title="确认执行关账？"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px;"
      >
        <template #default>
          <p>关账后，该年度的所有财务数据将被锁定，无法修改。</p>
          <p>请确认已完成以下工作：</p>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li>所有销售订单已录入并审核</li>
            <li>所有采购订单已录入并审核</li>
            <li>所有收付款已确认</li>
            <li>所有发票已开具</li>
            <li>库存盘点已完成</li>
          </ul>
        </template>
      </el-alert>

      <el-form :model="closingForm" :rules="closingRules" ref="closingFormRef" label-width="100px">
        <el-form-item label="关账年度" prop="year">
          <el-date-picker
            v-model="closingForm.year"
            type="year"
            placeholder="选择年度"
            value-format="YYYY"
            style="width: 100%"
            @change="handleYearChange"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="closingForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入关账备注信息（选填）"
          />
        </el-form-item>
      </el-form>

      <!-- 财务汇总预览 -->
      <div v-if="previewSummary" class="summary-preview">
        <h4>年度财务汇总预览</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="销售订单数">
            {{ previewSummary.salesCount }} 单
          </el-descriptions-item>
          <el-descriptions-item label="销售金额">
            ¥{{ previewSummary.salesAmount.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="采购订单数">
            {{ previewSummary.purchaseCount }} 单
          </el-descriptions-item>
          <el-descriptions-item label="采购金额">
            ¥{{ previewSummary.purchaseAmount.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="库存总值">
            ¥{{ previewSummary.inventoryValue.toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="毛利">
            <span :class="previewSummary.profit >= 0 ? 'profit-text' : 'loss-text'">
              ¥{{ previewSummary.profit.toLocaleString() }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="showClosingDialog = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="handlePerformClosing"
          :disabled="!closingForm.year || !previewSummary"
        >
          确认关账
        </el-button>
      </template>
    </el-dialog>

    <!-- 查看详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      :title="`${currentDetail?.year}年度关账详情`"
      width="700px"
    >
      <div v-if="currentDetail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="关账年度">
            {{ currentDetail.year }}
          </el-descriptions-item>
          <el-descriptions-item label="关账日期">
            {{ currentDetail.closingDate }}
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ currentDetail.operator }}
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="currentDetail.status === 'closed' ? 'success' : 'info'" size="small">
              {{ currentDetail.status === 'closed' ? '已关账' : '已取消' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">
            {{ currentDetail.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin-top: 20px;">财务汇总</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="销售订单数">
            {{ currentDetail.summary?.salesCount || 0 }} 单
          </el-descriptions-item>
          <el-descriptions-item label="销售金额">
            ¥{{ (currentDetail.summary?.salesAmount || 0).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="采购订单数">
            {{ currentDetail.summary?.purchaseCount || 0 }} 单
          </el-descriptions-item>
          <el-descriptions-item label="采购金额">
            ¥{{ (currentDetail.summary?.purchaseAmount || 0).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="库存总值">
            ¥{{ (currentDetail.summary?.inventoryValue || 0).toLocaleString() }}
          </el-descriptions-item>
          <el-descriptions-item label="毛利">
            <span :class="(currentDetail.summary?.profit || 0) >= 0 ? 'profit-text' : 'loss-text'">
              ¥{{ (currentDetail.summary?.profit || 0).toLocaleString() }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Lock, Unlock, View, Refresh } from '@element-plus/icons-vue'
import {
  getClosingList,
  performClosing,
  cancelClosing,
  getClosingSummary,
  getClosingDetail,
  getNextYearOpening
} from '@/api/annualClosing'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const router = useRouter()
const isAdmin = computed(() => {
  const roles = userStore.userInfo?.roles || []
  return roles.some(r => r.roleCode === 'ADMIN')
})

const loading = ref(false)
const closingList = ref([])
const showClosingDialog = ref(false)
const showDetailDialog = ref(false)
const submitting = ref(false)
const currentDetail = ref(null)
const previewSummary = ref(null)

const closingFormRef = ref()
const closingForm = reactive({
  year: null,
  remark: ''
})

const closingRules = {
  year: [
    { required: true, message: '请选择关账年度', trigger: 'change' }
  ]
}

// 加载关账列表
const loadSummary = async (year) => {
  try {
    const summary = await getClosingSummary(year)
    return summary
  } catch (error) {
    console.error('获取汇总失败:', error)
    return null
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const data = await getClosingList()
    closingList.value = data
  } catch (error) {
    console.error('加载失败:', error)
    ElMessage.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

// 监听年度变化，加载汇总预览
const handleYearChange = async () => {
  if (!closingForm.year) {
    previewSummary.value = null
    return
  }

  // 检查是否已关账
  const year = closingForm.year
  const existing = closingList.value.find(c => c.year === year)

  if (existing) {
    ElMessage.warning(`${year}年度已经关账`)
    return
  }

  // 加载汇总预览
  const summary = await loadSummary(year)
  previewSummary.value = summary
}

// 执行关账
const handlePerformClosing = async () => {
  try {
    await closingFormRef.value.validate()

    await ElMessageBox.confirm(
      '确认执行年终关账？关账后该年度数据将被锁定，无法修改。',
      '确认关账',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    submitting.value = true

    const data = {
      year: closingForm.year,
      remark: closingForm.remark,
      operator: userStore.userInfo?.realName || '管理员',
      operatorId: userStore.userInfo?.userId,
      summary: previewSummary.value
    }

    await performClosing(data)

    ElMessage.success('关账成功')
    showClosingDialog.value = false
    closingForm.year = null
    closingForm.remark = ''
    previewSummary.value = null

    loadData()

    // 提示进行下年度开账
    setTimeout(async () => {
      try {
        const nextYearData = await getNextYearOpening()
        if (nextYearData && nextYearData.needsOpening) {
          await ElMessageBox.confirm(
            `${data.year}年度已关账！系统已自动生成${nextYearData.year}年度的期初数据。\n\n是否立即前往进行${nextYearData.year}年度开账？`,
            '关账完成',
            {
              confirmButtonText: '立即前往开账',
              cancelButtonText: '稍后处理',
              type: 'success',
              distinguishCancelAndClose: true
            }
          )
          router.push('/finance/initial-balance')
        } else {
          ElMessage.info(`${data.year}年度已关账，数据已锁定`)
        }
      } catch (error) {
        // 用户点击"稍后处理"或关闭对话框，不执行任何操作
        if (error === 'close' || error === 'cancel') {
          console.log('用户选择稍后处理下年度开账')
        }
      }
    }, 500)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('关账失败:', error)
      ElMessage.error(error.message || '关账失败')
    }
  } finally {
    submitting.value = false
  }
}

// 反结账
const handleCancelClosing = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认取消 ${row.year} 年度的关账状态？取消后该年度的数据将可以修改。`,
      '反结账确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await cancelClosing(row.year)

    ElMessage.success('反结账成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('反结账失败:', error)
      ElMessage.error(error.message || '反结账失败')
    }
  }
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    const detail = await getClosingDetail(row.year)
    currentDetail.value = detail
    showDetailDialog.value = true
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 关闭对话框时重置表单
const handleDialogClose = () => {
  closingForm.year = null
  closingForm.remark = ''
  previewSummary.value = null
  if (closingFormRef.value) {
    closingFormRef.value.clearValidate()
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.annual-closing-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #262626;
  }
}

.amount-text {
  font-weight: 500;
  color: #262626;
}

.profit-text {
  color: #52C41A;
  font-weight: 600;
}

.loss-text {
  color: #F5222D;
  font-weight: 600;
}

.summary-preview {
  margin-top: 20px;
  padding: 16px;
  background: #F5F7FA;
  border-radius: 4px;

  h4 {
    margin: 0 0 16px 0;
    font-size: 14px;
    font-weight: 500;
    color: #262626;
  }
}
</style>
