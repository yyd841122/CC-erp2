<template>
  <el-dialog
    v-model="visible"
    title="库存调整"
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
        <el-descriptions-item label="商品编码">
          {{ stockData?.productCode }}
        </el-descriptions-item>
        <el-descriptions-item label="商品名称">
          {{ stockData?.productName }}
        </el-descriptions-item>
        <el-descriptions-item label="当前库存">
          <span class="current-stock">{{ stockData?.quantity || 0 }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="单位">
          {{ stockData?.unit }}
        </el-descriptions-item>
      </el-descriptions>

      <el-form-item label="调整类型" prop="adjustType">
        <el-radio-group v-model="formData.adjustType">
          <el-radio label="in">入库</el-radio>
          <el-radio label="out">出库</el-radio>
          <el-radio label="loss">损溢</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="调整数量" prop="adjustQuantity">
        <el-input-number
          v-model="formData.adjustQuantity"
          :min="1"
          :precision="0"
          controls-position="right"
          style="width: 200px"
        />
        <span class="ml-8 text-gray-500">
          调整后库存：<strong class="text-lg">{{ newStock }}</strong>
        </span>
      </el-form-item>

      <el-form-item label="调整单价" prop="adjustPrice">
        <el-input-number
          v-model="formData.adjustPrice"
          :min="0"
          :precision="2"
          controls-position="right"
          style="width: 200px"
        />
      </el-form-item>

      <el-form-item label="调整金额" prop="adjustAmount">
        <span class="amount-text">¥{{ adjustAmount.toFixed(2) }}</span>
      </el-form-item>

      <el-form-item label="调整原因" prop="reason">
        <el-select
          v-model="formData.reason"
          placeholder="请选择调整原因"
          style="width: 100%"
        >
          <el-option label="盘盈" value="盘盈" />
          <el-option label="盘亏" value="盘亏" />
          <el-option label="报损" value="报损" />
          <el-option label="退货" value="退货" />
          <el-option label="其他" value="其他" />
        </el-select>
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
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean,
  stockData: Object
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const submitting = ref(false)

const formData = reactive({
  adjustType: 'in',
  adjustQuantity: 1,
  adjustPrice: 0,
  reason: '',
  remark: ''
})

const formRules = {
  adjustType: [
    { required: true, message: '请选择调整类型', trigger: 'change' }
  ],
  adjustQuantity: [
    { required: true, message: '请输入调整数量', trigger: 'blur' }
  ],
  adjustPrice: [
    { required: true, message: '请输入调整单价', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请选择调整原因', trigger: 'change' }
  ]
}

// 计算调整后库存
const newStock = computed(() => {
  const current = props.stockData?.quantity || 0
  const qty = formData.adjustQuantity || 0

  if (formData.adjustType === 'in') {
    return current + qty
  } else if (formData.adjustType === 'out') {
    return Math.max(0, current - qty)
  } else {
    // 损溢时可以正负
    return current
  }
})

// 计算调整金额
const adjustAmount = computed(() => {
  return (formData.adjustQuantity || 0) * (formData.adjustPrice || 0)
})

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    adjustType: 'in',
    adjustQuantity: 1,
    adjustPrice: props.stockData?.avgCost || 0,
    reason: '',
    remark: ''
  })
}

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
      productId: props.stockData?.id,
      warehouseId: props.stockData?.warehouseId,
      adjustType: formData.adjustType,
      adjustQuantity: formData.adjustQuantity,
      adjustPrice: formData.adjustPrice,
      adjustAmount: adjustAmount.value,
      reason: formData.reason,
      remark: formData.remark
    }

    // TODO: 调用库存调整接口
    console.log('提交数据:', data)

    ElMessage.success('库存调整成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

// 监听打开对话框，初始化调整单价
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.stockData) {
    formData.adjustPrice = props.stockData.avgCost || 0
  }
})
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

.text-lg {
  font-size: 18px;
}

.current-stock {
  font-size: 18px;
  font-weight: 600;
  color: #1890FF;
}

.amount-text {
  font-size: 18px;
  font-weight: 600;
  color: #1890FF;
}
</style>
