<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑角色' : '新增角色'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="角色编码" prop="roleCode">
        <el-input
          v-model="formData.roleCode"
          placeholder="请输入角色编码（英文）"
          :disabled="isEdit && formData.roleCode === 'ADMIN'"
        />
      </el-form-item>

      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="formData.roleName" placeholder="请输入角色名称" />
      </el-form-item>

      <el-form-item label="描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="2"
          placeholder="请输入角色描述"
        />
      </el-form-item>

      <el-form-item label="权限配置">
        <div class="permission-container">
          <div class="permission-header">
            <el-checkbox
              v-model="selectAll"
              :indeterminate="isIndeterminate"
              @change="handleSelectAll"
            >
              全选
            </el-checkbox>
            <span class="selected-count">已选 {{ selectedPermissions.length }} 项</span>
          </div>
          <el-scrollbar max-height="300px">
            <div class="permission-list">
              <div
                v-for="module in groupedPermissions"
                :key="module.module"
                class="permission-module"
              >
                <div class="module-header">
                  <el-checkbox
                    v-model="module.checked"
                    :indeterminate="module.indeterminate"
                    @change="handleModuleChange(module)"
                  >
                    {{ module.module }}
                  </el-checkbox>
                </div>
                <div class="module-permissions">
                  <el-checkbox
                    v-for="perm in module.permissions"
                    :key="perm.code"
                    v-model="perm.checked"
                    @change="handlePermissionChange"
                  >
                    {{ perm.name }}
                  </el-checkbox>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
      </el-form-item>

      <el-form-item label="启用状态">
        <el-switch v-model="formData.isEnabled" />
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
import { createRole, updateRole, getPermissionDefinitions } from '@/api/permission'

const props = defineProps({
  modelValue: Boolean,
  data: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => !!props.data?.id)

const formRef = ref()
const submitting = ref(false)
const permissionDefs = ref([])

const formData = reactive({
  id: null,
  roleCode: '',
  roleName: '',
  description: '',
  permissions: [],
  isEnabled: true
})

const formRules = {
  roleCode: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码只能包含大写字母和下划线', trigger: 'blur' }
  ],
  roleName: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ]
}

// 按模块分组的权限
const groupedPermissions = computed(() => {
  const modules = {}
  permissionDefs.value.forEach(perm => {
    if (!modules[perm.module]) {
      modules[perm.module] = {
        module: perm.module,
        permissions: [],
        checked: false,
        indeterminate: false
      }
    }
    const isChecked = formData.permissions.includes(perm.code)
    modules[perm.module].permissions.push({
      ...perm,
      checked: isChecked
    })
  })

  // 更新模块的选中状态
  Object.values(modules).forEach(module => {
    const checkedCount = module.permissions.filter(p => p.checked).length
    module.checked = checkedCount === module.permissions.length && checkedCount > 0
    module.indeterminate = checkedCount > 0 && checkedCount < module.permissions.length
  })

  return Object.values(modules)
})

// 选中的权限数量
const selectedPermissions = computed(() => formData.permissions)

// 全选状态
const selectAll = computed({
  get: () => {
    return permissionDefs.value.length > 0 &&
           formData.permissions.length === permissionDefs.value.length
  },
  set: (val) => {
    // 实际变化在 handleSelectAll 中处理
  }
})

// 是否半选
const isIndeterminate = computed(() => {
  const count = formData.permissions.length
  return count > 0 && count < permissionDefs.value.length
})

// 加载权限定义
const loadPermissionDefinitions = async () => {
  try {
    permissionDefs.value = await getPermissionDefinitions()
  } catch (error) {
    console.error('加载权限定义失败:', error)
  }
}

// 全选/取消全选
const handleSelectAll = (checked) => {
  if (checked) {
    formData.permissions = permissionDefs.value.map(p => p.code)
  } else {
    formData.permissions = []
  }
}

// 模块选中变化
const handleModuleChange = (module) => {
  const moduleCodes = module.permissions.map(p => p.code)
  if (module.checked) {
    // 添加该模块所有权限
    moduleCodes.forEach(code => {
      if (!formData.permissions.includes(code)) {
        formData.permissions.push(code)
      }
    })
  } else {
    // 移除该模块所有权限
    formData.permissions = formData.permissions.filter(p => !moduleCodes.includes(p))
  }
}

// 权限选中变化
const handlePermissionChange = () => {
  // 触发重新计算，响应式会自动处理
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    roleCode: '',
    roleName: '',
    description: '',
    permissions: [],
    isEnabled: true
  })
}

// 监听数据变化
watch(() => props.data, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
    if (!formData.permissions) {
      formData.permissions = []
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// 监听对话框打开，加载权限定义
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadPermissionDefinitions()
  }
})

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    submitting.value = true

    const data = {
      ...formData,
      permissions: formData.permissions
    }

    if (isEdit.value) {
      await updateRole(formData.id, data)
      ElMessage.success('更新成功')
    } else {
      await createRole(data)
      ElMessage.success('新增成功')
    }

    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.permission-container {
  width: 100%;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  padding: 12px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBEEF5;
  margin-bottom: 12px;

  .selected-count {
    font-size: 12px;
    color: #909399;
  }
}

.permission-list {
  .permission-module {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.module-header {
  padding: 8px 0;
  font-weight: 500;
}

.module-permissions {
  padding-left: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.el-form-item {
  margin-bottom: 18px;
}
</style>
