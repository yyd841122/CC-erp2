<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑用户' : '新增用户'"
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
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="真实姓名" prop="realName">
        <el-input
          v-model="formData.realName"
          placeholder="请输入真实姓名"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          show-password
          style="width: 100%"
        />
        <div class="form-tip">默认密码: 123456</div>
      </el-form-item>

      <el-form-item label="确认密码" prop="confirmPassword" v-if="!isEdit">
        <el-input
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          show-password
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="邮箱" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="请输入邮箱"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入手机号"
          style="width: 100%"
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
import { createUser, updateUser } from '@/api/permission'

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
})

const formRef = ref()
const submitting = ref(false)

const isEdit = computed(() => !!props.data?.id)

const formData = reactive({
  username: '',
  realName: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  isEnabled: true,
  remark: ''
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== formData.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证手机号
const validatePhone = (rule, value, callback) => {
  if (value && !/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为 3-20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
}

// 监听数据变化，回显表单
watch(() => props.data, (data) => {
  if (data) {
    Object.assign(formData, {
      username: data.username || '',
      realName: data.realName || '',
      password: '',
      confirmPassword: '',
      email: data.email || '',
      phone: data.phone || '',
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
    username: '',
    realName: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
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
      username: formData.username,
      realName: formData.realName,
      email: formData.email,
      phone: formData.phone,
      isEnabled: formData.isEnabled,
      remark: formData.remark
    }

    if (!isEdit.value) {
      submitData.password = formData.password
    }

    if (isEdit.value) {
      await updateUser(props.data.id, submitData)
      ElMessage.success('用户更新成功')
    } else {
      await createUser(submitData)
      ElMessage.success('用户创建成功')
    }

    emit('refresh')
    handleClose()
  } catch (error) {
    if (error !== false) { // 不是验证错误
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
  font-size: 12px;
  color: #8C8C8C;
  margin-top: 4px;
}
</style>
