<template>
  <el-dialog
    v-model="visible"
    title="登记应付账款"
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
      <el-form-item label="供应商" prop="supplierId">
        <el-select
          v-model="formData.supplierId"
          placeholder="请选择供应商"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in supplierOptions"
            :key="item.id"
            :label="item.supplierName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="业务类型" prop="businessType">
        <el-select
          v-model="formData.businessType"
          placeholder="请选择业务类型"
          style="width: 100%"
        >
          <el-option label="采购" value="采购" />
          <el-option label="退货" value="退货" />
          <el-option label="服务" value="服务" />
          <el-option label="其他" value="其他" />
        </el-select>
      </el-form-item>

      <el-form-item label="应付金额" prop="totalAmount">
        <el-input-number
          v-model="formData.totalAmount"
          :min="0.01"
          :precision="2"
          controls-position="right"
          style="width: 200px"
        />
        <span class="ml-8 text-gray-500">元</span>
      </el-form-item>

      <el-form-item label="应付日期" prop="payableDate">
        <el-date-picker
          v-model="formData.payableDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="到期日期" prop="dueDate">
        <el-date-picker
          v-model="formData.dueDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="关联单据" prop="referenceNo">
        <el-input
          v-model="formData.referenceNo"
          placeholder="请输入关联单据号"
          style="width: 100%"
        />
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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createPayable, getSupplierOptions } from '@/api/finance'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = ref(false)
watch(() => props.modelValue, (val) => {
  visible.value = val
})
watch(visible, (val) => {
  emit('update:modelValue', val)
  if (val) {
    loadSupplierOptions()
  }
})

const formRef = ref()
const submitting = ref(false)
const supplierOptions = ref([])

const formData = reactive({
  supplierId: null,
  businessType: '采购',
  totalAmount: 0,
  payableDate: '',
  dueDate: '',
  referenceNo: '',
  remark: ''
})

const formRules = {
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  businessType: [
    { required: true, message: '请选择业务类型', trigger: 'change' }
  ],
  totalAmount: [
    { required: true, message: '请输入应付金额', trigger: 'blur' }
  ],
  payableDate: [
    { required: true, message: '请选择应付日期', trigger: 'change' }
  ],
  dueDate: [
    { required: true, message: '请选择到期日期', trigger: 'change' }
  ]
}

const loadSupplierOptions = async () => {
  try {
    supplierOptions.value = await getSupplierOptions()
  } catch (error) {
    console.error('加载供应商列表失败:', error)
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    supplierId: null,
    businessType: '采购',
    totalAmount: 0,
    payableDate: '',
    dueDate: '',
    referenceNo: '',
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

    // 获取供应商名称
    const supplier = supplierOptions.value.find(s => s.id === formData.supplierId)
    const data = {
      ...formData,
      supplierName: supplier?.supplierName || ''
    }

    await createPayable(data)

    ElMessage.success('应付账款登记成功')
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
.ml-8 {
  margin-left: 8px;
}

.text-gray-500 {
  color: #8C8C8C;
}
</style>
