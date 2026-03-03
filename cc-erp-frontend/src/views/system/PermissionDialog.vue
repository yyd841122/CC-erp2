<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑权限' : '新增权限'"
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
      <el-form-item label="上级权限" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="permissionTree"
          :props="{ label: 'permissionName', value: 'id' }"
          placeholder="请选择上级权限（不选则为根权限）"
          clearable
          check-strictly
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="权限类型" prop="permissionType">
        <el-select
          v-model="formData.permissionType"
          placeholder="请选择权限类型"
          style="width: 100%"
        >
          <el-option label="菜单" value="menu" />
          <el-option label="按钮" value="button" />
          <el-option label="API" value="api" />
        </el-select>
      </el-form-item>

      <el-form-item label="权限名称" prop="permissionName">
        <el-input
          v-model="formData.permissionName"
          placeholder="请输入权限名称"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="权限编码" prop="permissionCode">
        <el-input
          v-model="formData.permissionCode"
          placeholder="请输入权限编码，如：user:list"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="路径" prop="path" v-if="formData.permissionType === 'menu'">
        <el-input
          v-model="formData.path"
          placeholder="请输入路由路径，如：/user"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="组件路径" prop="component" v-if="formData.permissionType === 'menu'">
        <el-input
          v-model="formData.component"
          placeholder="请输入组件路径，如：@/views/user/Index.vue"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="图标" prop="icon" v-if="formData.permissionType === 'menu'">
        <el-input
          v-model="formData.icon"
          placeholder="请输入图标名称，如：User"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          :max="9999"
          controls-position="right"
          style="width: 150px"
        />
      </el-form-item>

      <el-form-item label="状态" prop="isEnabled">
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
  data: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(false)
watch(() => props.modelValue, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    loadPermissionTree()
  }
})

const formRef = ref()
const submitting = ref(false)
const permissionTree = ref([])

const isEdit = computed(() => !!props.data?.id)

const formData = reactive({
  parentId: null,
  permissionType: 'menu',
  permissionName: '',
  permissionCode: '',
  path: '',
  component: '',
  icon: '',
  sortOrder: 0,
  isEnabled: true,
  remark: ''
})

const formRules = {
  permissionType: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ],
  permissionName: [
    { required: true, message: '请输入权限名称', trigger: 'blur' }
  ],
  permissionCode: [
    { required: true, message: '请输入权限编码', trigger: 'blur' }
  ]
}

// 加载权限树
const loadPermissionTree = async () => {
  try {
    const data = await getPermissionList({})
    permissionTree.value = buildTreeSelect(data || [])
  } catch (error) {
    console.error('加载权限树失败:', error)
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
      permissionType: data.permissionType || 'menu',
      permissionName: data.permissionName || '',
      permissionCode: data.permissionCode || '',
      path: data.path || '',
      component: data.component || '',
      icon: data.icon || '',
      sortOrder: data.sortOrder || 0,
      isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
      remark: data.remark || ''
    })
  } else {
    resetForm()
  }
}, { immediate: true })

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    parentId: null,
    permissionType: 'menu',
    permissionName: '',
    permissionCode: '',
    path: '',
    component: '',
    icon: '',
    sortOrder: 0,
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

    if (isEdit.value) {
      await updatePermission(props.data.id, formData)
      ElMessage.success('权限更新成功')
    } else {
      await createPermission(formData)
      ElMessage.success('权限创建成功')
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
</style>
