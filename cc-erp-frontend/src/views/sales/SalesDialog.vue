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
          <el-table-column label="商品" min-width="250">
            <template #default="{ row }">
              <el-select
                v-model="row.productId"
                placeholder="选择商品（支持模糊搜索）"
                filterable
                size="small"
                @change="handleProductChange(row)"
              >
                <el-option
                  v-for="item in productList"
                  :key="item.id"
                  :label="item.productCode + ' - ' + item.productName + (item.spec ? ' - ' + item.spec : '')"
                  :value="item.id"
                >
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="flex: 1;">{{ item.productCode }} - {{ item.productName }}<span v-if="item.spec" style="color: #666; margin-left: 8px;">({{ item.spec }})</span></span>
                    <span style="color: #999; font-size: 12px; margin-left: 10px;">库存: {{ item.stock }}</span>
                  </div>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="规格" width="100" prop="spec" />
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
          <el-descriptions-item label="历史累计:">
            <span class="amount-text">¥{{ previousCumulativeAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="累计总额:" :span="2">
            <span class="amount-text amount-success">¥{{ totalCumulativeAmount.toFixed(2) }}</span>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { getInitialStatus } from '@/api/initial'

const props = defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const router = useRouter()

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

// 获取客户历史累计金额
const getCumulativeAmount = (customerId) => {
  try {
    const cumulativeData = JSON.parse(localStorage.getItem('cc_erp_cumulative_amounts') || '{}')
    return cumulativeData.sales?.[customerId] || 0
  } catch (e) {
    console.error('获取累计金额失败:', e)
    return 0
  }
}

// 保存客户累计金额
const saveCumulativeAmount = (customerId, amount) => {
  try {
    const cumulativeData = JSON.parse(localStorage.getItem('cc_erp_cumulative_amounts') || '{}')
    if (!cumulativeData.sales) {
      cumulativeData.sales = {}
    }
    cumulativeData.sales[customerId] = amount
    localStorage.setItem('cc_erp_cumulative_amounts', JSON.stringify(cumulativeData))
  } catch (e) {
    console.error('保存累计金额失败:', e)
  }
}

// 历史累计金额
const previousCumulativeAmount = computed(() => {
  if (formData.customerId) {
    return getCumulativeAmount(formData.customerId)
  }
  return 0
})

// 累计总额（历史累计 + 本次金额）
const totalCumulativeAmount = computed(() => {
  return previousCumulativeAmount.value + finalAmount.value
})

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
  // 获取系统设置中的公司信息
  const systemSettings = JSON.parse(localStorage.getItem('cc_erp_system_settings') || '{}')
  const companyName = systemSettings.companyName || '广东XXX智能装备有限公司'
  const contactPhone = systemSettings.contactPhone || ''
  const contactAddress = systemSettings.contactAddress || ''

  // 生成打印内容
  const customer = customerList.value.find(c => c.id === formData.customerId)

  // 数字转中文大写金额
  const convertToChineseAmount = (num) => {
    const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
    const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']
    const decimal = ['角', '分']

    let str = String(Math.floor(num))
    let result = ''

    if (num === 0) return '零元整'

    // 处理整数部分
    for (let i = 0; i < str.length; i++) {
      const digit = parseInt(str[i])
      const pos = str.length - i - 1
      if (digit !== 0) {
        result += digits[digit] + units[pos]
      } else if (result[result.length - 1] !== '零' && pos !== 0) {
        result += digits[0]
      }
    }

    result += '元'

    // 处理小数部分
    const decimals = Math.round((num - Math.floor(num)) * 100)
    if (decimals > 0) {
      const j = Math.floor(decimals / 10)
      const f = decimals % 10
      if (j > 0) result += digits[j] + '角'
      if (f > 0) result += digits[f] + '分'
    } else {
      result += '整'
    }

    return result
  }

  const printContent = `
    <div style="font-family: 'SimSun', serif; padding: 30px 40px; font-size: 14px;">
      <!-- 头部 -->
      <div style="text-align: center; margin-bottom: 10px;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0; color: #000;">${companyName}</h1>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="font-size: 24px; font-weight: bold; margin: 0; padding: 10px 0; border-bottom: 2px solid #000; display: inline-block; min-width: 200px;">送货清单</h2>
      </div>

      <!-- 客户信息 -->
      <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px 0; border-bottom: 1px solid #000;">
        <div style="font-size: 16px;">
          <span style="display: inline-block; width: 80px;">客户名称：</span>
          <span style="font-weight: bold;">${customer?.name || ''}</span>
        </div>
        <div style="font-size: 16px;">
          <span style="display: inline-block; width: 80px;">日&nbsp;&nbsp;&nbsp;&nbsp;期：</span>
          <span>${formData.orderDate}</span>
        </div>
        <div style="font-size: 16px;">
          <span style="display: inline-block; width: 80px;">单&nbsp;&nbsp;号&nbsp;&nbsp;：</span>
          <span>No.${String(Date.now()).slice(-8)}</span>
        </div>
      </div>

      <!-- 商品明细表 -->
      <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f0f0f0; font-weight: bold;">
            <th style="width: 50px;">序号</th>
            <th>产品名称</th>
            <th style="width: 100px;">规格型号</th>
            <th style="width: 60px;">单位</th>
            <th style="width: 80px;">数量</th>
            <th style="width: 100px;">备注</th>
            <th style="width: 100px;">单价</th>
            <th style="width: 120px;">金额</th>
          </tr>
        </thead>
        <tbody>
          ${formData.items.map((item, index) => {
            const product = productList.value.find(p => p.id === item.productId)
            const subtotal = (item.quantity || 0) * (item.price || 0)
            return `
              <tr style="height: 40px;">
                <td style="text-align: center;">${index + 1}</td>
                <td>${product?.productName || ''}</td>
                <td>${product?.spec || item.spec || ''}</td>
                <td style="text-align: center;">${item.unit || ''}</td>
                <td style="text-align: center;">${item.quantity || 0}</td>
                <td></td>
                <td style="text-align: right; padding-right: 10px;">${(item.price || 0).toFixed(2)}</td>
                <td style="text-align: right; padding-right: 10px;">${subtotal.toFixed(2)}</td>
              </tr>
            `
          }).join('')}
          ${formData.items.length < 8 ? Array(8 - formData.items.length).fill(0).map(() => `
            <tr style="height: 40px;">
              <td style="text-align: center;">&nbsp;</td>
              <td></td>
              <td></td>
              <td style="text-align: center;"></td>
              <td style="text-align: center;"></td>
              <td></td>
              <td style="text-align: right; padding-right: 10px;"></td>
              <td style="text-align: right; padding-right: 10px;"></td>
            </tr>
          `).join('') : ''}
        </tbody>
      </table>

      <!-- 合计信息 -->
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 150px; font-size: 16px; padding: 5px 0;">
              <strong>合&nbsp;&nbsp;计：</strong>
            </td>
            <td style="font-size: 16px;">
              <span style="color: #000;">¥${finalAmount.value.toFixed(2)}</span>
              <span style="margin-left: 30px;">（${convertToChineseAmount(finalAmount.value)}）</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- 备注信息 -->
      <div style="margin-bottom: 20px; padding: 10px; border: 1px solid #999; background: #fafafa;">
        <div style="margin-bottom: 5px;">
          <strong>备&nbsp;&nbsp;&nbsp;注：</strong>${formData.remark || '收货后如有异常请于7天内通知，否则我公司不予受理，谢谢理解！'}
        </div>
      </div>

      <!-- 签字区域 -->
      <div style="margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 150px; padding: 8px 0;">
              <strong>制&nbsp;单&nbsp;人：</strong>
              <span style="display: inline-block; width: 100px; border-bottom: 1px solid #000;"></span>
            </td>
            <td style="width: 150px;">
              <strong>仓&nbsp;管&nbsp;员：</strong>
              <span style="display: inline-block; width: 100px; border-bottom: 1px solid #000;"></span>
            </td>
            <td style="width: 150px;">
              <strong>客&nbsp;户：</strong>
              <span style="display: inline-block; width: 100px; border-bottom: 1px solid #000;"></span>
            </td>
            <td></td>
          </tr>
        </table>
      </div>

      <!-- 底部信息 -->
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #666; border-top: 1px solid #ccc; padding-top: 10px;">
        <div>
          ${contactAddress ? `地址：${contactAddress}` : ''}
        </div>
        <div>
          ${contactPhone ? `电话：${contactPhone}` : ''}
        </div>
        <div>
          日期：${getToday()}
        </div>
      </div>
    </div>
  `

  // 打开打印窗口
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <meta charset="utf-8">
        <title>送货清单</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            margin: 0;
            padding: 0;
            font-family: SimSun, serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          @media print {
            body { margin: 0; }
            table { page-break-inside: avoid; }
          }
          @page {
            size: A4;
            margin: 10mm;
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
watch(() => props.modelValue, async (newVal) => {
  if (newVal) {
    // 检查是否已开账
    try {
      const status = await getInitialStatus()
      if (!status.isOpened) {
        await ElMessageBox.alert(
          '系统尚未开账，请先完成期初开账后再进行业务操作。\n\n是否立即前往期初开账页面？',
          '系统未开账',
          {
            confirmButtonText: '前往开账',
            cancelButtonText: '取消',
            type: 'warning',
            showCancelButton: true,
            distinguishCancelAndClose: true
          }
        ).then(() => {
          router.push('/finance/initial-balance')
        }).catch(() => {
          // 用户点击取消
        })
        emit('update:modelValue', false)
        return
      }
    } catch (error) {
      console.error('检查开账状态失败:', error)
    }

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

    // 保存累计金额
    saveCumulativeAmount(formData.customerId, totalCumulativeAmount.value)

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

.amount-success {
  font-size: 16px;
  font-weight: 600;
  color: #52C41A;
}
</style>
