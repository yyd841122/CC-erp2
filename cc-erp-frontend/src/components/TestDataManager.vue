<template>
  <el-dialog
    v-model="visible"
    title="测试数据管理"
    width="500px"
    @close="handleClose"
  >
    <div class="test-data-container">
      <el-alert
        title="测试模式"
        type="warning"
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #default>
          <p>当前为<strong>测试模式</strong>，所有数据将持久化保存。</p>
          <p style="font-size: 12px; color: #666;">发布前请清空所有测试数据</p>
        </template>
      </el-alert>

      <div class="stats-section">
        <h4>数据统计</h4>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">商品数量</span>
              <span class="stat-value">{{ stats.products }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">分类数量</span>
              <span class="stat-value">{{ stats.categories }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">客户数量</span>
              <span class="stat-value">{{ stats.customers }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">供应商数量</span>
              <span class="stat-value">{{ stats.suppliers }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">仓库数量</span>
              <span class="stat-value">{{ stats.warehouses }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">用户数量</span>
              <span class="stat-value">{{ stats.users }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">角色数量</span>
              <span class="stat-value">{{ stats.roles }}</span>
            </div>
          </el-col>
        </el-row>
        <el-divider style="margin: 12px 0;" />
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">应收账款</span>
              <span class="stat-value">{{ stats.receivables }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">应付账款</span>
              <span class="stat-value">{{ stats.payables }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">收款记录</span>
              <span class="stat-value">{{ stats.receipts }}</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">付款记录</span>
              <span class="stat-value">{{ stats.payments }}</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <div class="stat-item">
              <span class="stat-label">发票数量</span>
              <span class="stat-value">{{ stats.invoices }}</span>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-divider />

      <div class="action-section">
        <h4>数据操作</h4>
        <el-space direction="vertical" style="width: 100%">
          <el-button @click="handleResetAllKeepAdmin" type="danger" :icon="Delete" plain>
            清除所有数据（保留管理员）
          </el-button>
          <el-button @click="handleResetAll" type="warning" :icon="Delete" plain>
            清空所有测试数据
          </el-button>
          <el-button @click="handleExportData" type="primary" :icon="Download" plain>
            导出测试数据
          </el-button>
          <el-button @click="handleImportData" type="success" :icon="Upload" plain>
            导入测试数据
          </el-button>
        </el-space>
      </div>

      <el-divider />

      <div class="info-section">
        <h4>测试数据说明</h4>
        <ul class="info-list">
          <li>✅ 添加的商品、客户、供应商等数据会自动保存</li>
          <li>✅ 刷新页面后数据不会丢失</li>
          <li>✅ 可一键清空所有测试数据</li>
          <li>✅ 支持导出/导入测试数据备份</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="handleRefresh">刷新统计</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Download, Upload } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 数据统计
const stats = reactive({
  products: 0,
  categories: 0,
  customers: 0,
  suppliers: 0,
  warehouses: 0,
  users: 0,
  roles: 0,
  receivables: 0,
  payables: 0,
  receipts: 0,
  payments: 0,
  invoices: 0
})

// 存储键定义
const STORAGE_KEYS = {
  PRODUCTS: 'cc_erp_test_products',
  CATEGORIES: 'cc_erp_categories',
  CUSTOMERS: 'cc_erp_test_customers',
  SUPPLIERS: 'cc_erp_test_suppliers',
  WAREHOUSES: 'cc_erp_test_warehouses',
  WAREHOUSE_STOCKS: 'cc_erp_test_warehouse_stocks',
  PURCHASE_ORDERS: 'cc_erp_test_purchase_orders',
  SALES_ORDERS: 'cc_erp_test_sales_orders',
  INVENTORY: 'cc_erp_test_inventory',
  FINANCE_RECEIVABLES: 'cc_erp_test_finance_receivables',
  FINANCE_PAYABLES: 'cc_erp_test_finance_payables',
  FINANCE_RECEIPTS: 'cc_erp_test_finance_receipts',
  FINANCE_PAYMENTS: 'cc_erp_test_finance_payments',
  FINANCE_INVOICES: 'cc_erp_test_finance_invoices',
  USERS: 'cc_erp_test_users',
  ROLES: 'cc_erp_test_roles',
  PERMISSIONS: 'cc_erp_test_permissions',
  INITIAL_BALANCE: 'cc_erp_initial_balance'
}

// 获取数据（必须在 handleRefresh 之前定义）
const getData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

// 保存数据
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

// 刷新统计
const handleRefresh = () => {
  stats.products = getData(STORAGE_KEYS.PRODUCTS)?.length || 0
  stats.categories = getData(STORAGE_KEYS.CATEGORIES)?.length || 0
  stats.customers = getData(STORAGE_KEYS.CUSTOMERS)?.length || 0
  stats.suppliers = getData(STORAGE_KEYS.SUPPLIERS)?.length || 0
  stats.warehouses = getData(STORAGE_KEYS.WAREHOUSES)?.length || 0
  stats.users = getData(STORAGE_KEYS.USERS)?.length || 0
  stats.roles = getData(STORAGE_KEYS.ROLES)?.length || 0
  stats.receivables = getData(STORAGE_KEYS.FINANCE_RECEIVABLES)?.length || 0
  stats.payables = getData(STORAGE_KEYS.FINANCE_PAYABLES)?.length || 0
  stats.receipts = getData(STORAGE_KEYS.FINANCE_RECEIPTS)?.length || 0
  stats.payments = getData(STORAGE_KEYS.FINANCE_PAYMENTS)?.length || 0
  stats.invoices = getData(STORAGE_KEYS.FINANCE_INVOICES)?.length || 0
}

// 监听对话框打开，自动刷新统计
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    handleRefresh()
  }
})

// 初始化时加载统计
handleRefresh()

// 获取数据（已移到上面，删除重复定义）
// const getData = (key) => { ... }

// 保存数据（已移到上面，删除重复定义）
// const saveData = (key, data) => { ... }

// 清除所有数据（保留管理员）
const handleResetAllKeepAdmin = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除所有数据吗？此操作将保留 admin 管理员账号及其最高权限。',
      '确认清除',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 保留管理员数据
    const adminUser = {
      id: 1,
      username: 'admin',
      realName: '系统管理员',
      email: 'admin@cc-erp.com',
      phone: '13800138000',
      isEnabled: true,
      roles: [{ id: 1, roleCode: 'ADMIN', roleName: '系统管理员' }],
      createdAt: new Date().toISOString()
    }

    const adminRole = {
      id: 1,
      roleName: '系统管理员',
      roleCode: 'ADMIN',
      isEnabled: true,
      permissions: ['*'], // 所有权限
      remark: '系统最高权限',
      createdAt: new Date().toISOString()
    }

    // 清空所有存储的测试数据
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // 保留模拟模式标记
    const mockMode = localStorage.getItem('mockMode')
    localStorage.clear()

    // 恢复模拟模式
    if (mockMode) localStorage.setItem('mockMode', mockMode)

    // 不再恢复默认分类（已清空虚拟数据）
    // 用户需要手动添加分类

    // 恢复管理员用户和角色
    localStorage.setItem('cc_erp_test_users', JSON.stringify([adminUser]))
    localStorage.setItem('cc_erp_test_roles', JSON.stringify([adminRole]))

    // 重置期初开账状态
    localStorage.removeItem('cc_erp_initial_balance')

    ElMessage.success('所有数据已清除，保留了 admin 管理员账号')
    handleRefresh()
    emit('refresh')
  } catch (error) {
    // 用户取消
  }
}

// 清空所有测试数据
const handleResetAll = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有测试数据吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定清空',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    // 清空所有测试数据
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })

    // 清空模拟模式标记以外的数据
    const mockMode = localStorage.getItem('mockMode')
    const mockCategories = localStorage.getItem('cc_erp_categories')

    localStorage.clear()

    // 恢复必要数据
    if (mockMode) localStorage.setItem('mockMode', mockMode)

    // 不再初始化默认分类（已清空虚拟数据）
    // 用户需要手动添加分类

    ElMessage.success('所有测试数据已清空')
    handleRefresh()
    emit('refresh')
  } catch (error) {
    // 用户取消
  }
}

// 导出测试数据
const handleExportData = () => {
  try {
    const exportData = {}
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      const data = getData(key)
      if (data && data.length > 0) {
        exportData[name] = data
      }
    })

    if (Object.keys(exportData).length === 0) {
      ElMessage.info('暂无测试数据可导出')
      return
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `cc-erp-test-data-${new Date().getTime()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    ElMessage.success('测试数据导出成功')
  } catch (error) {
    ElMessage.error('导出失败: ' + error.message)
  }
}

// 导入测试数据
const handleImportData = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'

  input.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)

        // 验证数据格式
        let importCount = 0
        Object.entries(data).forEach(([name, records]) => {
          const key = STORAGE_KEYS[name]
          if (key && Array.isArray(records)) {
            localStorage.setItem(key, JSON.stringify(records))
            importCount += records.length
          }
        })

        ElMessage.success(`成功导入 ${importCount} 条测试数据`)
        handleRefresh()
        emit('refresh')
      } catch (error) {
        ElMessage.error('导入失败：数据格式不正确')
      }
    }

    reader.readAsText(file)
  }

  input.click()
}

// 对外暴露方法
const getTestData = (key) => {
  return getData(STORAGE_KEYS[key.toUpperCase()] || key)
}

const saveTestData = (key, data) => {
  saveData(STORAGE_KEYS[key.toUpperCase()] || key, data)
}

defineExpose({
  getTestData,
  saveTestData,
  STORAGE_KEYS,
  handleRefresh
})
</script>

<style lang="scss" scoped>
.test-data-container {
  .stats-section {
    margin-bottom: 20px;

    h4 {
      font-size: 14px;
      color: #8C8C8C;
      margin-bottom: 12px;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #F5F5F5;
      border-radius: 4px;
      margin-bottom: 8px;

      .stat-label {
        font-size: 14px;
        color: #595959;
      }

      .stat-value {
        font-size: 18px;
        font-weight: 600;
        color: #1890FF;
      }
    }
  }

  .action-section {
    h4 {
      font-size: 14px;
      color: #8C8C8C;
      margin-bottom: 12px;
    }
  }

  .info-section {
    h4 {
      font-size: 14px;
      color: #8C8C8C;
      margin-bottom: 12px;
    }

    .info-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #595959;

      li {
        margin: 4px 0;
      }
    }
  }
}
</style>
