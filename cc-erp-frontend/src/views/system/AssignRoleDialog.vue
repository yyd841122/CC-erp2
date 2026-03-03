<template>
  <el-dialog
    v-model="visible"
    title="分配角色"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="user-info">
      <span class="label">用户：</span>
      <span class="value">{{ userData?.realName || userData?.username }}</span>
    </div>

    <el-divider />

    <el-form label-width="80px">
      <el-form-item label="角色">
        <el-checkbox-group v-model="selectedRoles">
          <el-checkbox
            v-for="role in roleList"
            :key="role.id"
            :label="role.id"
            :disabled="!role.isEnabled"
          >
            {{ role.roleName }}
            <span v-if="!role.isEnabled" class="text-disabled">(已禁用)</span>
          </el-checkbox>
        </el-checkbox-group>
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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getRoleList, assignRoles } from '@/api/permission'

const props = defineProps({
  modelValue: Boolean,
  userData: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(false)
watch(() => props.modelValue, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    loadRoles()
    loadUserRoles()
  }
})

const roleList = ref([])
const selectedRoles = ref([])
const submitting = ref(false)

// 加载角色列表
const loadRoles = async () => {
  try {
    const data = await getRoleList({ isEnabled: true })
    roleList.value = data.records || data.list || data || []
  } catch (error) {
    console.error('加载角色列表失败:', error)
  }
}

// 加载用户已有角色
const loadUserRoles = () => {
  if (props.userData?.roles) {
    selectedRoles.value = props.userData.roles.map(r => r.id)
  } else {
    selectedRoles.value = []
  }
}

const handleClose = () => {
  visible.value = false
  selectedRoles.value = []
}

const handleSubmit = async () => {
  try {
    submitting.value = true

    await assignRoles(props.userData.id, {
      roleIds: selectedRoles.value
    })

    ElMessage.success('角色分配成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('角色分配失败:', error)
    ElMessage.error('角色分配失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.user-info {
  padding: 10px 0;
  font-size: 14px;

  .label {
    color: #595959;
    font-weight: 500;
  }

  .value {
    color: #262626;
    font-weight: 600;
  }
}

.text-disabled {
  color: #8C8C8C;
  font-size: 12px;
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}
</style>
