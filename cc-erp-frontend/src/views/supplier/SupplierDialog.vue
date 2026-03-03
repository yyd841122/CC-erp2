<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑供应商' : '新增供应商'"
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
      <el-form-item label="供应商编码">
        <el-input
          v-model="formData.supplierCode"
          placeholder="自动生成"
          :readonly="isEdit"
        >
          <template #append v-if="!isEdit">
            <el-button @click="formData.supplierCode = generateSupplierCode()">重新生成</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="供应商名称" prop="supplierName">
        <el-input v-model="formData.supplierName" placeholder="请输入供应商名称" />
      </el-form-item>

      <el-form-item label="联系人" prop="contact">
        <el-input v-model="formData.contact" placeholder="请输入联系人" />
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>

      <el-form-item label="地址">
        <el-input
          v-model="formData.address"
          type="textarea"
          :rows="2"
          placeholder="请输入地址"
        />
      </el-form-item>

      <el-form-item label="信用额度">
        <el-input-number
          v-model="formData.creditLimit"
          :min="0"
          :precision="2"
          :controls-position="'right'"
          style="width: 100%;"
        />
      </el-form-item>

      <el-form-item label="启用状态">
        <el-switch v-model="formData.isEnabled" />
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
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
import { createSupplier, updateSupplier, generateSupplierCode } from '@/api/supplier'

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

const formData = reactive({
  id: null,
  supplierCode: '',
  supplierName: '',
  contact: '',
  phone: '',
  address: '',
  creditLimit: 0,
  isEnabled: true,
  remark: ''
})

const formRules = {
  supplierName: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' }
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    supplierCode: generateSupplierCode(),
    supplierName: '',
    contact: '',
    phone: '',
    address: '',
    creditLimit: 0,
    isEnabled: true,
    remark: ''
  })
}

// 监听数据变化
watch(() => props.data, (newVal) => {
  if (newVal) {
    Object.assign(formData, newVal)
  } else {
    resetForm()
  }
}, { immediate: true })

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

    const data = { ...formData }

    if (isEdit.value) {
      await updateSupplier(formData.id, data)
      ElMessage.success('更新成功')
    } else {
      await createSupplier(data)
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
.el-form-item {
  margin-bottom: 18px;
}
</style>
