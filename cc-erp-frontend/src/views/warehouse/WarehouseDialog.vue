<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑仓库' : '新增仓库'"
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
      <el-form-item label="仓库编码">
        <el-input
          v-model="formData.warehouseCode"
          placeholder="自动生成"
          :readonly="!isEdit"
        >
          <template #append v-if="!isEdit">
            <el-button @click="formData.warehouseCode = generateWarehouseCode()">重新生成</el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="仓库名称" prop="warehouseName">
        <el-input v-model="formData.warehouseName" placeholder="请输入仓库名称" />
      </el-form-item>

      <el-form-item label="仓库地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入仓库地址" />
      </el-form-item>

      <el-form-item label="负责人" prop="manager">
        <el-input v-model="formData.manager" placeholder="请输入负责人姓名" />
      </el-form-item>

      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>

      <el-form-item label="仓库面积(㎡)" prop="area">
        <el-input-number
          v-model="formData.area"
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
import { createWarehouse, updateWarehouse, generateWarehouseCode } from '@/api/warehouse'

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
  warehouseCode: '',
  warehouseName: '',
  address: '',
  manager: '',
  phone: '',
  area: 0,
  isEnabled: true,
  remark: ''
})

const formRules = {
  warehouseName: [
    { required: true, message: '请输入仓库名称', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入仓库地址', trigger: 'blur' }
  ],
  manager: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  area: [
    { required: true, message: '请输入仓库面积', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    id: null,
    warehouseCode: generateWarehouseCode(),
    warehouseName: '',
    address: '',
    manager: '',
    phone: '',
    area: 0,
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
      await updateWarehouse(formData.id, data)
      ElMessage.success('更新成功')
    } else {
      await createWarehouse(data)
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
