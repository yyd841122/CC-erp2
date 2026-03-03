<template>
  <el-dialog
    v-model="visible"
    title="新增发票"
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
      <el-form-item label="发票类型" prop="invoiceType">
        <el-select
          v-model="formData.invoiceType"
          placeholder="请选择发票类型"
          style="width: 100%"
        >
          <el-option label="销售发票" value="sale" />
          <el-option label="采购发票" value="purchase" />
        </el-select>
      </el-form-item>

      <el-form-item :label="formData.invoiceType === 'sale' ? '客户' : '供应商'" prop="partnerId">
        <el-select
          v-model="formData.partnerId"
          :placeholder="formData.invoiceType === 'sale' ? '请选择客户' : '请选择供应商'"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in partnerOptions"
            :key="item.id"
            :label="formData.invoiceType === 'sale' ? item.customerName : item.supplierName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="发票号码" prop="invoiceNo">
        <el-input
          v-model="formData.invoiceNo"
          placeholder="请输入发票号码"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="发票金额" prop="amount">
        <el-input-number
          v-model="formData.amount"
          :min="0.01"
          :precision="2"
          controls-position="right"
          @change="handleAmountChange"
          style="width: 200px"
        />
        <span class="ml-8 text-gray-500">元</span>
      </el-form-item>

      <el-form-item label="税率" prop="taxRate">
        <el-select
          v-model="formData.taxRate"
          placeholder="请选择税率"
          @change="handleAmountChange"
          style="width: 200px"
        >
          <el-option label="0%" :value="0" />
          <el-option label="3%" :value="0.03" />
          <el-option label="6%" :value="0.06" />
          <el-option label="9%" :value="0.09" />
          <el-option label="13%" :value="0.13" />
          <el-option label="16%" :value="0.16" />
        </el-select>
      </el-form-item>

      <el-form-item label="税额">
        <span class="tax-amount">¥{{ taxAmount.toFixed(2) }}</span>
      </el-form-item>

      <el-form-item label="价税合计">
        <span class="total-amount">¥{{ totalAmount.toFixed(2) }}</span>
      </el-form-item>

      <el-form-item label="开票日期" prop="invoiceDate">
        <el-date-picker
          v-model="formData.invoiceDate"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
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
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createInvoice, getCustomerOptions, getSupplierOptions } from '@/api/finance'

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
    loadPartnerOptions()
  }
})

const formRef = ref()
const submitting = ref(false)
const customerOptions = ref([])
const supplierOptions = ref([])

const formData = reactive({
  invoiceType: 'sale',
  partnerId: null,
  invoiceNo: '',
  amount: 0,
  taxRate: 0.13,
  invoiceDate: '',
  remark: ''
})

const formRules = {
  invoiceType: [
    { required: true, message: '请选择发票类型', trigger: 'change' }
  ],
  partnerId: [
    { required: true, message: '请选择往来单位', trigger: 'change' }
  ],
  invoiceNo: [
    { required: true, message: '请输入发票号码', trigger: 'blur' }
  ],
  amount: [
    { required: true, message: '请输入发票金额', trigger: 'blur' }
  ],
  invoiceDate: [
    { required: true, message: '请选择开票日期', trigger: 'change' }
  ]
}

// 计算税额
const taxAmount = computed(() => {
  return (formData.amount || 0) * (formData.taxRate || 0)
})

// 计算价税合计
const totalAmount = computed(() => {
  return (formData.amount || 0) + taxAmount.value
})

// 往来单位选项
const partnerOptions = computed(() => {
  return formData.invoiceType === 'sale' ? customerOptions.value : supplierOptions.value
})

const loadPartnerOptions = async () => {
  try {
    const [customers, suppliers] = await Promise.all([
      getCustomerOptions(),
      getSupplierOptions()
    ])
    customerOptions.value = customers
    supplierOptions.value = suppliers
  } catch (error) {
    console.error('加载往来单位失败:', error)
  }
}

const handleAmountChange = () => {
  // 金额变化时触发计算
  // computed 会自动更新
}

const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    invoiceType: 'sale',
    partnerId: null,
    invoiceNo: '',
    amount: 0,
    taxRate: 0.13,
    invoiceDate: '',
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

    // 获取往来单位名称
    const partner = partnerOptions.value.find(p => p.id === formData.partnerId)
    const data = {
      ...formData,
      partnerName: formData.invoiceType === 'sale'
        ? (partner?.customerName || '')
        : (partner?.supplierName || ''),
      taxAmount: taxAmount.value,
      totalAmount: totalAmount.value
    }

    await createInvoice(data)

    ElMessage.success('发票添加成功')
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

.tax-amount {
  font-size: 14px;
  color: #8C8C8C;
}

.total-amount {
  font-size: 16px;
  font-weight: 600;
  color: #1890FF;
}
</style>
