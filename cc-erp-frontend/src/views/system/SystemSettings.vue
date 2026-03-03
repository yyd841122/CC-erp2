<template>
  <div class="system-settings-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">系统设置</h2>
    </div>

    <el-row :gutter="16">
      <!-- 基本设置 -->
      <el-col :span="12">
        <el-card class="settings-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>基本设置</span>
            </div>
          </template>
          <el-form :model="basicSettings" label-width="120px" label-position="left">
            <el-form-item label="系统名称">
              <el-input v-model="basicSettings.systemName" placeholder="CC ERP 企业管理系统" />
            </el-form-item>
            <el-form-item label="系统简称">
              <el-input v-model="basicSettings.systemShortName" placeholder="CC ERP" />
            </el-form-item>
            <el-form-item label="公司名称">
              <el-input v-model="basicSettings.companyName" placeholder="请输入公司名称" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="basicSettings.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
            <el-form-item label="联系地址">
              <el-input v-model="basicSettings.contactAddress" placeholder="请输入联系地址" />
            </el-form-item>
            <el-form-item label="系统版本">
              <el-input v-model="basicSettings.version" placeholder="1.0.0" disabled />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveBasic">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- 安全设置 -->
      <el-col :span="12">
        <el-card class="settings-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>安全设置</span>
            </div>
          </template>
          <el-form :model="securitySettings" label-width="120px" label-position="left">
            <el-form-item label="密码最小长度">
              <el-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" controls-position="right" />
            </el-form-item>
            <el-form-item label="密码过期天数">
              <el-input-number v-model="securitySettings.passwordExpireDays" :min="0" :max="365" controls-position="right" />
              <span class="form-tip">0 表示永不过期</span>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-input-number v-model="securitySettings.maxLoginAttempts" :min="3" :max="10" controls-position="right" />
              <span class="form-tip">次</span>
            </el-form-item>
            <el-form-item label="会话超时时间">
              <el-input-number v-model="securitySettings.sessionTimeout" :min="30" :max="480" controls-position="right" />
              <span class="form-tip">分钟</span>
            </el-form-item>
            <el-form-item label="强制HTTPS">
              <el-switch v-model="securitySettings.forceHttps" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- 数据字典设置 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card class="settings-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Notebook /></el-icon>
              <span>数据字典</span>
              <el-button type="primary" size="small" :icon="Plus" style="margin-left: auto;" @click="handleAddDict">
                新增字典
              </el-button>
            </div>
          </template>
          <el-table :data="dictData" stripe style="width: 100%">
            <el-table-column prop="dictCode" label="字典编码" width="150" />
            <el-table-column prop="dictName" label="字典名称" width="150" />
            <el-table-column prop="dictValue" label="字典值" width="150" />
            <el-table-column prop="label" label="显示标签" min-width="150" />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column prop="isEnabled" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isEnabled ? 'success' : 'info'" size="small">
                  {{ row.isEnabled ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditDict(row)">编辑</el-button>
                <el-button link type="danger" @click="handleDeleteDict(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统日志 -->
    <el-row :gutter="16" style="margin-top: 16px;">
      <el-col :span="24">
        <el-card class="settings-card" shadow="never">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>操作日志</span>
              <el-button style="margin-left: auto;" @click="handleRefreshLogs">刷新</el-button>
            </div>
          </template>
          <el-table :data="logData" stripe style="width: 100%" max-height="300">
            <el-table-column prop="username" label="操作用户" width="100" />
            <el-table-column prop="module" label="模块" width="100" />
            <el-table-column prop="action" label="操作" min-width="150" />
            <el-table-column prop="ip" label="IP地址" width="130" />
            <el-table-column prop="createTime" label="操作时间" width="160" />
            <el-table-column prop="status" label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="logPagination.page"
              v-model:page-size="logPagination.size"
              :page-sizes="[10, 20, 50]"
              :total="logPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleLogSizeChange"
              @current-change="handleLogPageChange"
            />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Setting, Lock, Notebook, Document, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 基本设置
const basicSettings = reactive({
  systemName: 'CC ERP 企业管理系统',
  systemShortName: 'CC ERP',
  companyName: '',
  contactPhone: '',
  contactAddress: '',
  version: '1.0.0'
})

// 从 localStorage 加载基本设置
const loadBasicSettings = () => {
  try {
    const saved = localStorage.getItem('cc_erp_system_settings')
    if (saved) {
      const data = JSON.parse(saved)
      Object.assign(basicSettings, data)
    }
  } catch (e) {
    console.error('加载基本设置失败:', e)
  }
}

// 保存基本设置到 localStorage
const handleSaveBasic = () => {
  try {
    localStorage.setItem('cc_erp_system_settings', JSON.stringify(basicSettings))
    ElMessage.success('基本设置保存成功')
  } catch (e) {
    console.error('保存基本设置失败:', e)
    ElMessage.error('保存失败')
  }
}
const securitySettings = reactive({
  minPasswordLength: 6,
  passwordExpireDays: 90,
  maxLoginAttempts: 5,
  sessionTimeout: 120,
  forceHttps: false
})

// 数据字典
const dictData = ref([
  { id: 1, dictCode: 'user_status', dictName: '用户状态', dictValue: '1', label: '正常', sortOrder: 1, isEnabled: true },
  { id: 2, dictCode: 'user_status', dictName: '用户状态', dictValue: '0', label: '禁用', sortOrder: 2, isEnabled: true },
  { id: 3, dictCode: 'order_status', dictName: '订单状态', dictValue: '1', label: '待审核', sortOrder: 1, isEnabled: true },
  { id: 4, dictCode: 'order_status', dictName: '订单状态', dictValue: '2', label: '已审核', sortOrder: 2, isEnabled: true }
])

// 操作日志
const logData = ref([
  { id: 1, username: 'admin', module: '用户管理', action: '新增用户', ip: '192.168.1.100', createTime: '2024-03-03 10:30:00', status: 'success' },
  { id: 2, username: 'admin', module: '角色管理', action: '修改角色权限', ip: '192.168.1.100', createTime: '2024-03-03 10:25:00', status: 'success' },
  { id: 3, username: 'user1', module: '系统设置', action: '修改系统参数', ip: '192.168.1.101', createTime: '2024-03-03 10:20:00', status: 'failed' }
])

const logPagination = reactive({
  page: 1,
  size: 10,
  total: 3
})

// 保存安全设置
const handleSaveSecurity = () => {
  ElMessage.success('安全设置保存成功')
  // TODO: 调用接口保存设置
}

// 新增字典
const handleAddDict = () => {
  ElMessage.info('字典编辑功能开发中...')
}

// 编辑字典
const handleEditDict = (row) => {
  ElMessage.info('字典编辑功能开发中...')
}

// 删除字典
const handleDeleteDict = (row) => {
  ElMessage.info('字典删除功能开发中...')
}

// 刷新日志
const handleRefreshLogs = () => {
  // TODO: 重新加载日志数据
}

const handleLogPageChange = (page) => {
  logPagination.page = page
}

const handleLogSizeChange = (size) => {
  logPagination.size = size
  logPagination.page = 1
}

onMounted(() => {
  // 初始化加载数据
  loadBasicSettings()
})
</script>

<style lang="scss" scoped>
.system-settings-container {
  width: 100%;
}

.page-header {
  margin-bottom: 16px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }
}

.settings-card {
  :deep(.el-card__header) {
    padding: 12px 20px;
    background: #FAFAFA;
  }

  :deep(.el-card__body) {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #262626;
}

.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #8C8C8C;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
}
</style>
