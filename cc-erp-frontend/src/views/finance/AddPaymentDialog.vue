<template>
  <el-dialog
    v-model="visible"
    title="新增付款"
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

      <el-form-item label="付款日期" prop="paymentDate">
        <el-date-picker
          v-model="formData.paymentDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="付款金额" prop="amount">
        <el-input-number
          v-model="formData.amount"
          :min="0.01"
          :precision="2"
          controls-position="right"
          style="width: 200px"
        />
        <span class="ml-8 text-gray-500">元</span>
      </el-form-item>

      <el-form-item label="付款方式" prop="paymentMethod">
        <el-select
          v-model="formData.paymentMethod"
          placeholder="请选择付款方式"
          style="width: 100%"
        >
          <el-option label="现金" value="cash" />
          <el-option label="银行转账" value="bank" />
          <el-option label="支付宝" value="alipay" />
          <el-option label="微信" value="wechat" />
        </el-select>
      </el-form-item>

      <el-form-item label="付款账户" prop="bankAccount">
        <el-select
          v-model="formData.bankAccount"
          placeholder="请选择付款账户"
          style="width: 100%"
        >
          <el-option label="工商银行 6222****1234" value="工商银行 6222****1234" />
          <el-option label="建设银行 6227****5678" value="建设银行 6227****5678" />
          <el-option label="农业银行 6228****9012" value="农业银行 6228****9012" />
        </el-select>
      </el-form-item>

      <el-form-item label="关联单据" prop="referenceNo">
        <el-input
          v-model="formData.referenceNo"
          placeholder="请输入关联应付单号"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="经手人" prop="handlerName">
        <el-input
          v-model="formData.handlerName"
          placeholder="请输入经手人"
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
import { recordPayment, getSupplierOptions } from '@/api/finance'

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
  paymentDate: '',
  amount: 0,
  paymentMethod: 'bank',
  bankAccount: '',
  referenceNo: '',
  handlerName: '',
  remark: ''
})

const formRules = {
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' }
  ],
  paymentDate: [
    { required: true, message: '请选择付款日期', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入付款金额', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择付款方式', trigger: 'change' }
  ],
  handlerName: [
    { required: true, message: '请输入经手人', trigger: 'blur' }
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
    paymentDate: '',
    amount: 0,
    paymentMethod: 'bank',
    bankAccount: '',
    referenceNo: '',
    handlerName: '',
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

    await recordPayment(data)

    ElMessage.success('付款登记成功')
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
