<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑销售单' : '新增销售单'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="客户" prop="customerId">
            <el-select
              v-model="formData.customerId"
              placeholder="请选择客户"
              filterable
              style="width: 100%;"
            >
              <el-option
                v-for="item in customerList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="仓库" prop="warehouseId">
            <el-select
              v-model="formData.warehouseId"
              placeholder="请选择仓库"
              style="width: 100%;"
            >
              <el-option label="主仓库" :value="1" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="销售日期" prop="orderDate">
            <el-date-picker
              v-model="formData.orderDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="交货日期">
            <el-date-picker
              v-model="formData.deliveryDate"
              type="date"
              placeholder="选择日期"
              value-format="YYYY-MM-DD"
              style="width: 100%;"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 销售明细 -->
      <el-form-item label="销售明细">
        <el-button type="primary" size="small" :icon="Plus" @click="handleAddItem">
          添加商品
        </el-button>

        <el-table
          :data="formData.items"
          border
          style="width: 100%; margin-top: 8px;"
          max-height="300"
        >
          <el-table-column label="商品" min-width="180">
            <template #default="{ row }">
              <el-select
                v-model="row.productId"
                placeholder="选择商品"
                filterable
                size="small"
                @change="handleProductChange(row)"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.productCode + ' - ' + item.productName"
                  :value="item.id"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span>{{ item.productCode }} - {{ item.productName }}</span>
                    <span style="color: #999; font-size: 12px;">库存: {{ item.stock }}</span>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="规格" width="80" prop="spec" />
          <el-table-column label="单位" width="60" prop="unit" />
          <el-table-column label="当前库存" width="90" align="right">
            <template #default="{ row }">
              <span :style="{ color: (row.currentStock || 0) < 0 ? '#F5222D' : '' }">
                {{ row.currentStock !== undefined ? row.currentStock : '-' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="出库数量" width="120">
            <template #default="{ row }">
              <el-input-number
                v-model="row.quantity"
                :precision="0"
                size="small"
                controls-position="right"
                style="width: 100%;"
              />
            </template>
          </el-table-column>
          <el-table-column label="销售单价" width="110">
            <template #default="{ row }">
              <el-input-number
                v-model="row.price"
                :min="0"
                :precision="2"
                size="small"
                controls-position="right"
                @change="handleAmountChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="税率%" width="80">
            <template #default="{ row }">
              <el-input-number
                v-model="row.taxRate"
                :min="0"
                :max="100"
                :precision="0"
                size="small"
                controls-position="right"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="100" align="right">
            <template #default="{ row }">
              ¥{{ ((row.quantity || 0) * (row.price || 0)).toFixed(2) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center" fixed="right">
            <template #default="{ $index }">
              <el-button
                link
                type="danger"
                size="small"
                @click="handleDeleteItem($index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <!-- 金额汇总 -->
      <el-form-item>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="销售金额:">
            <span class="amount-text">¥{{ totalAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="税额:">
            <span class="amount-text">¥{{ totalTax.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="含税金额:">
            <span class="amount-text amount-primary">¥{{ finalAmount.toFixed(2) }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-form-item>

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="success" :icon="Printer" @click="handlePrint" :disabled="formData.items.length === 0">
        打印
      </el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确定' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Plus, Printer } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const formRef = ref()
const submitting = ref(false)

// 商品和客户列表
const customerList = ref([])
const productList = ref([])

// 从 localStorage 加载商品和客户数据
const loadProductData = () => {
  try {
    const products = JSON.parse(localStorage.getItem('cc_erp_test_products') || '[]')
    if (products.length > 0) {
      productList.value = products.map(p => ({
        id: p.id,
        productCode: p.productCode,
        productName: p.productName,
        spec: p.spec || '',
        unit: p.unit,
        salePrice: p.salePrice || 0,
        stock: p.stock || 0
      }))
    }
  } catch (e) {
    console.error('加载商品数据失败:', e)
  }
}

const loadCustomerData = () => {
  try {
    const customers = JSON.parse(localStorage.getItem('cc_erp_test_customers') || '[]')
    if (customers.length > 0) {
      customerList.value = customers.map(c => ({
        id: c.id,
        name: c.name
      }))
    }
  } catch (e) {
    console.error('加载客户数据失败:', e)
  }
}

// 获取当天日期 YYYY-MM-DD
const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formData = reactive({
  customerId: null,
  warehouseId: 1,
  orderDate: getToday(),
  deliveryDate: getToday(),
  items: [],
  remark: ''
})

const formRules = {
  customerId: [
    { required: true, message: '请选择客户', trigger: 'change' }
  ],
  warehouseId: [
    { required: true, message: '请选择仓库', trigger: 'change' }
  ],
  orderDate: [
    { required: true, message: '请选择销售日期', trigger: 'change' }
  ],
  items: [
    {
      required: true,
      validator: (rule, value, callback) => {
        if (!value || value.length === 0) {
          callback(new Error('请添加销售明细'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 计算金额
const totalAmount = computed(() => {
  return formData.items.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.price || 0)
  }, 0)
})

const totalTax = computed(() => {
  return formData.items.reduce((sum, item) => {
    const subtotal = (item.quantity || 0) * (item.price || 0)
    return sum + subtotal * ((item.taxRate || 0) / 100)
  }, 0)
})

const finalAmount = computed(() => {
  return totalAmount.value + totalTax.value
})

// 添加明细
const handleAddItem = () => {
  formData.items.push({
    productId: null,
    productCode: '',
    productName: '',
    spec: '',
    unit: '个',
    currentStock: 0,
    quantity: 1,
    price: 0,
    taxRate: 0,
    subtotal: 0
  })
}

// 商品选择变化
const handleProductChange = (row) => {
  const product = productList.value.find(p => p.id === row.productId)
  if (product) {
    row.spec = product.spec
    row.unit = product.unit
    row.price = product.salePrice || 0
    row.currentStock = product.stock || 0  // 显示当前库存
  }
}

// 数量/单价变化
const handleAmountChange = (row) => {
  // 自动计算小计
}

// 删除明细
const handleDeleteItem = (index) => {
  formData.items.splice(index, 1)
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    customerId: null,
    warehouseId: 1,
    orderDate: getToday(),
    deliveryDate: getToday(),
    items: [],
    remark: ''
  })
}

// 关闭对话框
const handleClose = () => {
  visible.value = false
  resetForm()
}

// 打印销售单
const handlePrint = () => {
  // 生成打印内容
  const customer = customerList.value.find(c => c.id === formData.customerId)
  const printContent = `
    <div style="font-family: 'SimSun', serif; padding: 20px;">
      <div style="text-align: center; font-size: 20px; font-weight: bold; margin-bottom: 20px;">
        销售单
      </div>
      <div style="margin-bottom: 10px;">
        <span>客户：${customer?.name || ''}</span>
        <span style="margin-left: 30px;">销售日期：${formData.orderDate}</span>
        <span style="margin-left: 30px;">交货日期：${formData.deliveryDate}</span>
      </div>
      <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f5f5f5;">
            <th>商品名称</th>
            <th>规格</th>
            <th>单位</th>
            <th>数量</th>
            <th>销售单价</th>
            <th>税率(%)</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          ${formData.items.map(item => {
            const product = productList.value.find(p => p.id === item.productId)
            const subtotal = (item.quantity || 0) * (item.price || 0)
            return `
              <tr>
                <td>${product?.productName || ''}</td>
                <td>${item.spec || ''}</td>
                <td>${item.unit || ''}</td>
                <td>${item.quantity || 0}</td>
                <td>¥${(item.price || 0).toFixed(2)}</td>
                <td>${item.taxRate || 0}%</td>
                <td>¥${subtotal.toFixed(2)}</td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 20px;">
        <p>销售金额：¥${totalAmount.value.toFixed(2)}</p>
        <p>税额：¥${totalTax.value.toFixed(2)}</p>
        <p style="font-size: 16px; font-weight: bold;">含税金额：¥${finalAmount.value.toFixed(2)}</p>
        <p style="margin-top: 10px;">备注：${formData.remark || '无'}</p>
      </div>
      <div style="margin-top: 30px; display: flex; justify-content: space-between;">
        <span>制单人：__________</span>
        <span>审核人：__________</span>
        <span>日期：${getToday()}</span>
      </div>
    </div>
  `

  // 打开打印窗口
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>销售单打印</title>
        <style>
          body { margin: 0; padding: 0; }
          @media print {
            body { margin: 0; }
          }
        </style>
      </head>
      <body>${printContent}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// 初始化加载数据
onMounted(() => {
  loadProductData()
  loadCustomerData()
})

// 监听对话框打开，刷新数据
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    loadProductData()
    loadCustomerData()
  }
})

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (formData.items.length === 0) {
      ElMessage.warning('请添加销售明细')
      return
    }

    submitting.value = true

    const data = {
      customerId: formData.customerId,
      warehouseId: formData.warehouseId,
      orderDate: formData.orderDate,
      deliveryDate: formData.deliveryDate,
      items: formData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        taxRate: item.taxRate
      })),
      remark: formData.remark
    }

    // TODO: 调用创建销售单接口
    console.log('提交数据:', data)

    ElMessage.success('新增成功')
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
:deep(.el-form-item) {
  margin-bottom: 16px;
}

.amount-text {
  font-weight: 500;
}

.amount-primary {
  font-size: 16px;
  font-weight: 600;
  color: #1890FF;
}
</style>
