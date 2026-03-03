<template>
  <div class="menu-list-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">菜单管理</h2>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd">
          新增菜单
        </el-button>
        <el-button :icon="Refresh" @click="handleRefresh">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 菜单树表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'children' }"
        default-expand-all
      >
        <el-table-column prop="permissionName" label="菜单名称" min-width="200">
          <template #default="{ row }">
            <el-icon v-if="row.icon" class="menu-icon">
              <component :is="row.icon" />
            </el-icon>
            <span>{{ row.permissionName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="permissionCode" label="菜单编码" width="180" />
        <el-table-column prop="path" label="路由路径" min-width="150" show-overflow-tooltip />
        <el-table-column prop="component" label="组件路径" min-width="200" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
        <el-table-column prop="isEnabled" label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.isEnabled"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button link type="primary" @click="handleAddChild(row)">
              新增子菜单
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
    <MenuDialog
      v-model="dialogVisible"
      :data="currentRow"
      :parent-id="parentId"
      @refresh="loadData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPermissionList, deletePermission, updatePermission } from '@/api/permission'
import MenuDialog from './MenuDialog.vue'

const tableData = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const currentRow = ref(null)
const parentId = ref(null)

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const data = await getPermissionList({ permissionType: 'menu' })
    // 构建树形结构并排序
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

  // 排序和清理空children
  const sortAndClean = (nodes) => {
    nodes.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    nodes.forEach(node => {
      if (node.children && node.children.length === 0) {
        delete node.children
      } else if (node.children) {
        sortAndClean(node.children)
      }
    })
  }
  sortAndClean(roots)

  return roots
}

// 刷新
const handleRefresh = () => {
  loadData()
}

// 新增根菜单
const handleAdd = () => {
  currentRow.value = null
  parentId.value = null
  dialogVisible.value = true
}

// 新增子菜单
const handleAddChild = (row) => {
  currentRow.value = null
  parentId.value = row.id
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  currentRow.value = { ...row }
  parentId.value = null
  dialogVisible.value = true
}

// 状态切换
const handleStatusChange = async (row) => {
  try {
    await updatePermission(row.id, { isEnabled: row.isEnabled })
    ElMessage.success(row.isEnabled ? '已启用' : '已禁用')
  } catch (error) {
    // 回滚状态
    row.isEnabled = !row.isEnabled
    ElMessage.error('状态更新失败')
  }
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该菜单吗？如果存在子菜单，将一并删除。', '提示', {
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
.menu-list-container {
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

.menu-icon {
  margin-right: 8px;
  vertical-align: middle;
}
</style>
