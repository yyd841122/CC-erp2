<template>
  <div class="permission-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">权限管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增权限
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="权限名称">
          <el-input
            v-model="searchForm.permissionName"
            placeholder="请输入权限名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="权限类型">
          <el-select
            v-model="searchForm.permissionType"
            placeholder="请选择权限类型"
            clearable
            style="width: 150px"
          >
            <el-option label="全部" value="" />
            <el-option label="菜单" value="menu" />
            <el-option label="按钮" value="button" />
            <el-option label="API" value="api" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        stripe
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="permissionName" label="权限名称" min-width="200" />
        <el-table-column prop="permissionCode" label="权限编码" width="180" />
        <el-table-column prop="permissionType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.permissionType === 'menu'" type="success">菜单</el-tag>
            <el-tag v-else-if="row.permissionType === 'button'" type="primary">按钮</el-tag>
            <el-tag v-else-if="row.permissionType === 'api'" type="warning">API</el-tag>
            <el-tag v-else type="info">{{ row.permissionType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="path" label="路径" min-width="180" show-overflow-tooltip />
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon" :size="18">
              <component :is="row.icon" />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="isEnabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isEnabled ? 'success' : 'info'" size="small">
              {{ row.isEnabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <PermissionDialog
      v-model="dialogVisible"
      :data="currentRow"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPermissionList, deletePermission } from '@/api/permission'
import PermissionDialog from './PermissionDialog.vue'

const searchForm = reactive({
  permissionName: '',
  permissionType: ''
})

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm
    }
    const data = await getPermissionList(params)
    // 构建树形结构
    tableData.value = buildTree(data || [])
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 构建树形结构
const buildTree = (data) => {
  const map = new Map()
  const roots = []

  // 先建立映射
  data.forEach(item => {
    map.set(item.id, { ...item, children: [] })
  })

  // 构建树
  data.forEach(item => {
    const node = map.get(item.id)
    if (item.parentId === null || item.parentId === 0) {
      roots.push(node)
    } else {
      const parent = map.get(item.parentId)
      if (parent) {
        parent.children.push(node)
      }
    }
  })

  // 清理空children
  const cleanEmptyChildren = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        cleanEmptyChildren(node.children)
      }
    })
  }
  cleanEmptyChildren(roots)

  return roots
}

// 搜索
const handleSearch = () => {
  loadData()
}

// 重置
const handleReset = () => {
  searchForm.permissionName = ''
  searchForm.permissionType = ''
  loadData()
}

// 刷新
const handleRefresh = () => {
  loadData()
}

// 新增
const handleAdd = () => {
  currentRow.value = null
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = { ...row }
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该权限吗？如果存在子权限，将一并删除。', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deletePermission(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    // 用户取消或接口失败
  }
}

// 初始化加载
onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.permission-list-container {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }

  .page-actions {
    display: flex;
    gap: 8px;
  }
}

.search-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }

  .el-table {
    .el-table__header th {
      background: #FAFAFA;
    }
  }
}
</style>
