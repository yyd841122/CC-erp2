<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑菜单' : '新增菜单'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="上级菜单" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="menuTree"
          :props="{ label: 'permissionName', value: 'id' }"
          placeholder="请选择上级菜单（不选则为根菜单）"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="菜单名称" prop="permissionName">
        <el-input
          v-model="formData.permissionName"
          placeholder="请输入菜单名称"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="菜单编码" prop="permissionCode">
        <el-input
          v-model="formData.permissionCode"
          placeholder="请输入菜单编码，如：user:list"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="路由路径" prop="path">
        <el-input
          v-model="formData.path"
          placeholder="请输入路由路径，如：/user"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="组件路径" prop="component">
        <el-input
          v-model="formData.component"
          placeholder="请输入组件路径，如：@/views/user/Index.vue"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="图标">
        <el-input
          v-model="formData.icon"
          placeholder="请输入图标名称，如：User"
          style="width: 100%"
        />
        <div class="icon-preview" v-if="formData.icon">
          <span>预览：</span>
          <el-icon :size="20" style="vertical-align: middle; margin-left: 8px;">
            <component :is="formData.icon" />
          </el-icon>
        </div>
      </el-form-item>

      <el-form-item label="排序">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 150px"
        />
        <span class="form-tip">数值越小，排序越靠前</span>
      </el-form-item>

      <el-form-item label="是否显示">
        <el-switch
          v-model="formData.isVisible"
          active-text="显示"
          inactive-text="隐藏"
        />
      </el-form-item>

      <el-form-item label="状态">
        <el-switch
          v-model="formData.isEnabled"
          active-text="启用"
          inactive-text="禁用"
        />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getPermissionList, createPermission, updatePermission } from '@/api/permission'

const props = defineProps({
  modelValue: Boolean,
  data: Object,
  parentId: [Number, null]
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(false)
watch(() => props.modelValue, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    loadMenuTree()
  }
})

const formRef = ref()
const submitting = ref(false)
const menuTree = ref([])

const isEdit = computed(() => !!props.data?.id)

const formData = reactive({
  parentId: null,
  permissionName: '',
  permissionCode: '',
  path: '',
  component: '',
  icon: '',
  sortOrder: 0,
  isVisible: true,
  isEnabled: true,
  remark: ''
})

const formRules = {
  permissionName: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' }
  ],
  permissionCode: [
    { required: true, message: '请输入菜单编码', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ],
  component: [
    { required: true, message: '请输入组件路径', trigger: 'blur' }
  ]
}

// 加载菜单树
const loadMenuTree = async () => {
  try {
    const data = await getPermissionList({ permissionType: 'menu' })
    menuTree.value = buildTreeSelect(data || [])
  } catch (error) {
    console.error('加载菜单树失败:', error)
  }
}

// 构建树形选择数据
const buildTreeSelect = (data) => {
  const map = new Map()
  const roots = []

  data.forEach(item => {
    if (item.id !== props.data?.id) { // 排除当前编辑的节点
      map.set(item.id, { ...item, children: [] })
    }
  })

  data.forEach(item => {
    if (item.id === props.data?.id) return

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

// 监听数据变化，回显表单
watch(() => props.data, (data) => {
  if (data) {
    Object.assign(formData, {
      parentId: data.parentId,
      permissionName: data.permissionName || '',
      permissionCode: data.permissionCode || '',
      path: data.path || '',
      component: data.component || '',
      icon: data.icon || '',
      sortOrder: data.sortOrder || 0,
      isVisible: data.isVisible !== undefined ? data.isVisible : true,
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      remark: data.remark || ''
    })
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听父ID变化（新增子菜单时）
watch(() => props.parentId, (parentId) => {
  if (parentId && !props.data) {
    formData.parentId = parentId
  }
})

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    parentId: null,
    permissionName: '',
    permissionCode: '',
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
    isVisible: true,
    isEnabled: true,
    remark: ''
  })
}

const handleClose = () => {
  visible.value = false
  resetForm()
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    const submitData = {
      ...formData,
      permissionType: 'menu'
    }

    if (isEdit.value) {
      await updatePermission(props.data.id, submitData)
      ElMessage.success('菜单更新成功')
    } else {
      await createPermission(submitData)
      ElMessage.success('菜单创建成功')
    }

    emit('refresh')
    handleClose()
  } catch (error) {
    if (error !== false) {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.form-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #8C8C8C;
}

.icon-preview {
  margin-top: 4px;
  font-size: 12px;
  color: #595959;
}
</style>
