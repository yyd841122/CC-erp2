<template>
  <el-dialog
    v-model="visible"
    title="付款登记"
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
      <el-descriptions :column="2" border class="mb-16">
        <el-descriptions-item label="应付单号">
          {{ payableData?.payableNo }}
        </el-descriptions-item>
        <el-descriptions-item label="供应商">
          {{ payableData?.supplierName }}
        </el-descriptions-item>
        <el-descriptions-item label="应付金额">
          ¥{{ payableData?.totalAmount?.toFixed(2) || '0.00' }}
        </el-descriptions-item>
        <el-descriptions-item label="已付金额">
          ¥{{ payableData?.paidAmount?.toFixed(2) || '0.00' }}
        </el-descriptions-item>
        <el-descriptions-item label="待付金额" :span="2">
          <span class="amount-remaining">
            ¥{{ ((payableData?.totalAmount || 0) - (payableData?.paidAmount || 0)).toFixed(2) }}
          </span>
        </el-descriptions-item>
      </el-descriptions>

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
          :max="maxAmount"
          :precision="2"
          controls-position="right"
          style="width: 200px"
        />
        <span class="ml-8 text-gray-500">
          最多可付: ¥{{ maxAmount.toFixed(2) }}
        </span>
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
          <el-option label="工商银行 6222****1234" value="1" />
          <el-option label="建设银行 6227****5678" value="2" />
        </el-select>
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
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  payableData: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const submitting = ref(false)

// 最大可付金额
const maxAmount = computed(() => {
  return (props.payableData?.totalAmount || 0) - (props.payableData?.paidAmount || 0)
})

const formData = reactive({
  paymentDate: '',
  amount: 0,
  paymentMethod: 'bank',
  bankAccount: '',
  handlerName: '',
  remark: ''
})

const formRules = {
  paymentDate: [
    { required: true, message: '请选择付款日期', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入付款金额', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择付款方式', trigger: 'change' }
  ],
  bankAccount: [
    { required: true, message: '请选择付款账户', trigger: 'change' }
  ],
  handlerName: [
    { required: true, message: '请输入经手人', trigger: 'blur' }
  ]
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    paymentDate: '',
    amount: 0,
    paymentMethod: 'bank',
    bankAccount: '',
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

    const data = {
      payableId: props.payableData?.id,
      ...formData
    }

    // TODO: 调用付款接口
    console.log('提交数据:', data)

    ElMessage.success('付款登记成功')
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
.mb-16 {
  margin-bottom: 16px;
}

.ml-8 {
  margin-left: 8px;
}

.text-gray-500 {
  color: #8C8C8C;
}

.amount-remaining {
  color: #E6A23C;
  font-size: 16px;
  font-weight: 600;
}
</style>
