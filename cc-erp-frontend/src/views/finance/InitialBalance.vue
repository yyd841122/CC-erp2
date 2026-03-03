<template>
  <div class="initial-balance-container">
    <!-- 页面标题栏 -->
    <div class="page-header">
      <h2 class="page-title">期初开账</h2>
      <div class="page-actions" v-if="!isOpened">
        <el-button type="primary" @click="handleConfirmOpening" :loading="confirming">
          确认开账
        </el-button>
      </div>
    </div>

    <!-- 开账状态提示 -->
    <el-alert
      v-if="isOpened"
      title="系统已开账"
      :type="'success'"
      :closable="false"
      style="margin-bottom: 16px;"
    >
      <template #default>
        开账日期：{{ openingDate }}
      </template>
    </el-alert>

    <el-alert
      v-else
      title="系统未开账"
      type="warning"
      :closable="false"
      style="margin-bottom: 16px;"
    >
      <template #default>
        请完成期初数据录入后，点击右上角"确认开账"按钮正式启用系统。开账后期初数据将不可修改。
      </template>
    </el-alert>

    <!-- 选项卡 -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 期初库存 -->
      <el-tab-pane label="期初库存" name="inventory">
        <div class="tab-header">
          <div class="header-left">
            <span class="header-title">期初库存录入</span>
            <span class="header-tip">录入各商品在各仓库的初始库存数量和成本</span>
          </div>
          <div class="header-actions" v-if="!isOpened">
            <el-button type="primary" :icon="Plus" @click="handleAddInventory">
              新增
            </el-button>
            <el-button :icon="Upload" @click="handleImportInventory">
              导入
            </el-button>
          </div>
        </div>

        <!-- 搜索区域 -->
        <el-card class="search-card" shadow="never">
          <el-form :inline="true" :model="inventorySearch" class="search-form">
            <el-form-item label="商品名称">
              <el-input
                v-model="inventorySearch.productName"
                placeholder="请输入商品名称"
                clearable
                style="width: 200px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="loadInventoryData">查询</el-button>
              <el-button @click="handleInventoryReset">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 库存表格 -->
        <el-card class="table-card" shadow="never">
          <el-table
            :data="inventoryData"
            stripe
            v-loading="inventoryLoading"
            style="width: 100%"
          >
            <el-table-column prop="productName" label="商品名称" min-width="150" />
            <el-table-column prop="productCode" label="商品编码" width="120" />
            <el-table-column prop="warehouseName" label="仓库" width="120" />
            <el-table-column prop="quantity" label="期初数量" width="120" align="right" />
            <el-table-column prop="costPrice" label="成本单价" width="120" align="right">
              <template #default="{ row }">
                ¥{{ row.costPrice?.toFixed(2) || '0.00' }}
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="期初金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ ((row.quantity || 0) * (row.costPrice || 0)).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="!isOpened"
                  link
                  type="danger"
                  @click="handleDeleteInventory(row)"
                >
                  删除
                </el-button>
                <span v-else class="text-disabled">已锁定</span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="inventoryPagination.page"
              v-model:page-size="inventoryPagination.size"
              :page-sizes="[10, 20, 50]"
              :total="inventoryPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleInventorySizeChange"
              @current-change="handleInventoryPageChange"
            />
          </div>
        </el-card>

        <!-- 汇总信息 -->
        <div class="summary-card">
          <el-statistic title="期初库存总额" :value="inventoryTotalAmount" :precision="2" prefix="¥" />
        </div>
      </el-tab-pane>

      <!-- 期初应收 -->
      <el-tab-pane label="期初应收" name="receivable">
        <div class="tab-header">
          <div class="header-left">
            <span class="header-title">期初应收账款</span>
            <span class="header-tip">录入客户期初欠款金额</span>
          </div>
          <div class="header-actions" v-if="!isOpened">
            <el-button type="primary" :icon="Plus" @click="handleAddReceivable">
              新增
            </el-button>
          </div>
        </div>

        <el-card class="table-card" shadow="never">
          <el-table
            :data="receivableData"
            stripe
            v-loading="receivableLoading"
            style="width: 100%"
          >
            <el-table-column prop="customerName" label="客户名称" min-width="200" />
            <el-table-column prop="billNo" label="单据编号" width="150" />
            <el-table-column prop="billDate" label="单据日期" width="120" />
            <el-table-column prop="amount" label="应收金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ (row.amount || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="!isOpened"
                  link
                  type="danger"
                  @click="handleDeleteReceivable(row)"
                >
                  删除
                </el-button>
                <span v-else class="text-disabled">已锁定</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <div class="summary-card">
          <el-statistic title="期初应收总额" :value="receivableTotalAmount" :precision="2" prefix="¥" />
        </div>
      </el-tab-pane>

      <!-- 期初应付 -->
      <el-tab-pane label="期初应付" name="payable">
        <div class="tab-header">
          <div class="header-left">
            <span class="header-title">期初应付账款</span>
            <span class="header-tip">录入供应商期初欠款金额</span>
          </div>
          <div class="header-actions" v-if="!isOpened">
            <el-button type="primary" :icon="Plus" @click="handleAddPayable">
              新增
            </el-button>
          </div>
        </div>

        <el-card class="table-card" shadow="never">
          <el-table
            :data="payableData"
            stripe
            v-loading="payableLoading"
            style="width: 100%"
          >
            <el-table-column prop="supplierName" label="供应商名称" min-width="200" />
            <el-table-column prop="billNo" label="单据编号" width="150" />
            <el-table-column prop="billDate" label="单据日期" width="120" />
            <el-table-column prop="amount" label="应付金额" width="120" align="right">
              <template #default="{ row }">
                ¥{{ (row.amount || 0).toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200" show-overflow-tooltip />
            <el-table-column label="操作" width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="!isOpened"
                  link
                  type="danger"
                  @click="handleDeletePayable(row)"
                >
                  删除
                </el-button>
                <span v-else class="text-disabled">已锁定</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <div class="summary-card">
          <el-statistic title="期初应付总额" :value="payableTotalAmount" :precision="2" prefix="¥" />
        </div>
      </el-tab-pane>

      <!-- 期初现金 -->
      <el-tab-pane label="期初现金" name="cash">
        <div class="tab-header">
          <div class="header-left">
            <span class="header-title">期初现金余额</span>
            <span class="header-tip">录入各银行账户的期初余额</span>
          </div>
          <div class="header-actions" v-if="!isOpened">
            <el-button type="primary" @click="handleSaveCashBalance" :loading="cashSaving">
              保存
            </el-button>
          </div>
        </div>

        <el-card class="table-card" shadow="never">
          <el-table :data="cashAccounts" stripe style="width: 100%">
            <el-table-column prop="accountName" label="账户名称" min-width="200" />
            <el-table-column prop="accountNo" label="账号" width="180" />
            <el-table-column label="期初余额" width="180">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.balance"
                  :disabled="isOpened"
                  :precision="2"
                  :min="0"
                  controls-position="right"
                  style="width: 150px"
                />
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="200">
              <template #default="{ row }">
                <el-input
                  v-model="row.remark"
                  :disabled="isOpened"
                  placeholder="请输入备注"
                />
              </template>
            </el-table-column>
          </el-table>
        </el-card>

        <div class="summary-card">
          <el-statistic title="期初现金总额" :value="cashTotalAmount" :precision="2" prefix="¥" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 期初库存对话框 -->
    <el-dialog
      v-model="inventoryDialogVisible"
      title="新增期初库存"
      width="600px"
      :close-on-click-modal="false"
      @close="handleInventoryDialogClose"
    >
      <el-form
        ref="inventoryFormRef"
        :model="inventoryForm"
        :rules="inventoryFormRules"
        label-width="100px"
      >
        <el-form-item label="商品" prop="productId">
          <el-select
            v-model="inventoryForm.productId"
            placeholder="请选择商品"
            filterable
            style="width: 100%"
            @change="handleProductChange"
          >
            <el-option
              v-for="item in productList"
              :key="item.id"
              :label="`${item.productCode} - ${item.productName}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select
            v-model="inventoryForm.warehouseId"
            placeholder="请选择仓库"
            style="width: 100%"
          >
            <el-option
              v-for="item in warehouseList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="期初数量" prop="quantity">
          <el-input-number
            v-model="inventoryForm.quantity"
            :min="0"
            :precision="0"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="成本单价" prop="costPrice">
          <el-input-number
            v-model="inventoryForm.costPrice"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="inventoryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveInventory">确定</el-button>
      </template>
    </el-dialog>

    <!-- 期初应收对话框 -->
    <el-dialog
      v-model="receivableDialogVisible"
      title="新增期初应收"
      width="600px"
      :close-on-click-modal="false"
      @close="handleReceivableDialogClose"
    >
      <el-form
        ref="receivableFormRef"
        :model="receivableForm"
        :rules="receivableFormRules"
        label-width="100px"
      >
        <el-form-item label="客户" prop="customerId">
          <el-select
            v-model="receivableForm.customerId"
            placeholder="请选择客户"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in customerList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单据编号" prop="billNo">
          <el-input v-model="receivableForm.billNo" placeholder="请输入单据编号" />
        </el-form-item>
        <el-form-item label="单据日期" prop="billDate">
          <el-date-picker
            v-model="receivableForm.billDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="应收金额" prop="amount">
          <el-input-number
            v-model="receivableForm.amount"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="receivableForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="receivableDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveReceivable">确定</el-button>
      </template>
    </el-dialog>

    <!-- 期初应付对话框 -->
    <el-dialog
      v-model="payableDialogVisible"
      title="新增期初应付"
      width="600px"
      :close-on-click-modal="false"
      @close="handlePayableDialogClose"
    >
      <el-form
        ref="payableFormRef"
        :model="payableForm"
        :rules="payableFormRules"
        label-width="100px"
      >
        <el-form-item label="供应商" prop="supplierId">
          <el-select
            v-model="payableForm.supplierId"
            placeholder="请选择供应商"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="item in supplierList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="单据编号" prop="billNo">
          <el-input v-model="payableForm.billNo" placeholder="请输入单据编号" />
        </el-form-item>
        <el-form-item label="单据日期" prop="billDate">
          <el-date-picker
            v-model="payableForm.billDate"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="应付金额" prop="amount">
          <el-input-number
            v-model="payableForm.amount"
            :min="0"
            :precision="2"
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="payableForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="payableDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePayable">确定</el-button>
      </template>
    </el-dialog>

    <!-- 确认开账对话框 -->
    <el-dialog
      v-model="openingDialogVisible"
      title="确认开账"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-alert
        title="开账确认"
        type="warning"
        :closable="false"
        style="margin-bottom: 16px;"
      >
        <template #default>
          开账后，期初数据将被锁定，无法再进行修改。请确认期初数据已全部录入完成。
        </template>
      </el-alert>

      <el-form :model="openingForm" label-width="100px">
        <el-form-item label="开账日期" required>
          <el-date-picker
            v-model="openingForm.openingDate"
            type="date"
            placeholder="选择开账日期"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <div class="opening-summary">
        <p>期初库存总额：¥{{ inventoryTotalAmount.toFixed(2) }}</p>
        <p>期初应收总额：¥{{ receivableTotalAmount.toFixed(2) }}</p>
        <p>期初应付总额：¥{{ payableTotalAmount.toFixed(2) }}</p>
        <p>期初现金总额：¥{{ cashTotalAmount.toFixed(2) }}</p>
      </div>

      <template #footer>
        <el-button @click="openingDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="confirming" @click="handleOpeningConfirm">
          确认开账
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { Plus, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getInitialStatus,
  getInitialInventory,
  saveInitialInventory,
  deleteInitialInventory,
  getInitialReceivable,
  saveInitialReceivable,
  deleteInitialReceivable,
  getInitialPayable,
  saveInitialPayable,
  deleteInitialPayable,
  getInitialCashBalance,
  saveInitialCashBalance,
  confirmOpening
} from '@/api/initial'
import { getProductList } from '@/api/product'
import { getWarehouseList } from '@/api/warehouse'
import { getCustomerList } from '@/api/customer'
import { getSupplierList } from '@/api/supplier'

// 开账状态
const isOpened = ref(false)
const openingDate = ref('')
const activeTab = ref('inventory')
const confirming = ref(false)
const openingDialogVisible = ref(false)

// 期初库存
const inventoryLoading = ref(false)
const inventoryData = ref([])
const inventorySearch = reactive({
  productName: ''
})
const inventoryPagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 期初应收
const receivableLoading = ref(false)
const receivableData = ref([])

// 期初应付
const payableLoading = ref(false)
const payableData = ref([])

// 期初现金
const cashSaving = ref(false)
const cashAccounts = ref([
  { id: 1, accountName: '库存现金', accountNo: 'CASH001', balance: 0, remark: '日常零用现金' },
  { id: 2, accountName: '工商银行', accountNo: '6222-0000-0000-0001', balance: 0, remark: '基本户' },
  { id: 3, accountName: '建设银行', accountNo: '6227-0000-0000-0001', balance: 0, remark: '一般户' }
])

// 基础数据
const productList = ref([])
const warehouseList = ref([])
const customerList = ref([])
const supplierList = ref([])

// 期初库存对话框
const inventoryDialogVisible = ref(false)
const inventoryFormRef = ref()
const inventoryForm = reactive({
  productId: null,
  warehouseId: null,
  quantity: 0,
  costPrice: 0
})
const inventoryFormRules = {
  productId: [{ required: true, message: '请选择商品', trigger: 'change' }],
  warehouseId: [{ required: true, message: '请选择仓库', trigger: 'change' }],
  quantity: [{ required: true, message: '请输入期初数量', trigger: 'blur' }],
  costPrice: [{ required: true, message: '请输入成本单价', trigger: 'blur' }]
}

// 期初应收对话框
const receivableDialogVisible = ref(false)
const receivableFormRef = ref()
const receivableForm = reactive({
  customerId: null,
  billNo: '',
  billDate: '',
  amount: 0,
  remark: ''
})
const receivableFormRules = {
  customerId: [{ required: true, message: '请选择客户', trigger: 'change' }],
  billNo: [{ required: true, message: '请输入单据编号', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入应收金额', trigger: 'blur' }]
}

// 期初应付对话框
const payableDialogVisible = ref(false)
const payableFormRef = ref()
const payableForm = reactive({
  supplierId: null,
  billNo: '',
  billDate: '',
  amount: 0,
  remark: ''
})
const payableFormRules = {
  supplierId: [{ required: true, message: '请选择供应商', trigger: 'change' }],
  billNo: [{ required: true, message: '请输入单据编号', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入应付金额', trigger: 'blur' }]
}

// 开账表单
const openingForm = reactive({
  openingDate: ''
})

// 计算汇总金额
const inventoryTotalAmount = computed(() => {
  return inventoryData.value.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.costPrice || 0)
  }, 0)
})

const receivableTotalAmount = computed(() => {
  return receivableData.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const payableTotalAmount = computed(() => {
  return payableData.value.reduce((sum, item) => sum + (item.amount || 0), 0)
})

const cashTotalAmount = computed(() => {
  return cashAccounts.value.reduce((sum, item) => sum + (item.balance || 0), 0)
})

// 加载开账状态
const loadOpeningStatus = async () => {
  try {
    const data = await getInitialStatus()
    isOpened.value = data.isOpened
    openingDate.value = data.openingDate
  } catch (error) {
    console.error('加载开账状态失败:', error)
  }
}

// 加载期初库存
const loadInventoryData = async () => {
  inventoryLoading.value = true
  try {
    const params = {
      page: inventoryPagination.page,
      size: inventoryPagination.size,
      productName: inventorySearch.productName
    }
    const data = await getInitialInventory(params)
    inventoryData.value = data.data || []
    inventoryPagination.total = data.total || 0
  } catch (error) {
    console.error('加载期初库存失败:', error)
  } finally {
    inventoryLoading.value = false
  }
}

const handleInventoryPageChange = (page) => {
  inventoryPagination.page = page
  loadInventoryData()
}

const handleInventorySizeChange = (size) => {
  inventoryPagination.size = size
  inventoryPagination.page = 1
  loadInventoryData()
}

const handleInventoryReset = () => {
  inventorySearch.productName = ''
  loadInventoryData()
}

// 加载期初应收
const loadReceivableData = async () => {
  receivableLoading.value = true
  try {
    const data = await getInitialReceivable({ page: 1, size: 100 })
    receivableData.value = data.data || []
  } catch (error) {
    console.error('加载期初应收失败:', error)
  } finally {
    receivableLoading.value = false
  }
}

// 加载期初应付
const loadPayableData = async () => {
  payableLoading.value = true
  try {
    const data = await getInitialPayable({ page: 1, size: 100 })
    payableData.value = data.data || []
  } catch (error) {
    console.error('加载期初应付失败:', error)
  } finally {
    payableLoading.value = false
  }
}

// 加载期初现金
const loadCashBalance = async () => {
  try {
    const data = await getInitialCashBalance()
    if (data && data.length > 0) {
      cashAccounts.value = data
    }
  } catch (error) {
    console.error('加载期初现金失败:', error)
  }
}

// 加载基础数据
const loadBaseData = async () => {
  try {
    const [products, warehouses, customers, suppliers] = await Promise.all([
      getProductList({ page: 1, size: 1000 }),
      getWarehouseList({ page: 1, size: 100 }),
      getCustomerList({ page: 1, size: 1000 }),
      getSupplierList({ page: 1, size: 1000 })
    ])
    productList.value = products.data || []
    warehouseList.value = warehouses.data || []
    customerList.value = customers.data || []
    supplierList.value = suppliers.data || []
  } catch (error) {
    console.error('加载基础数据失败:', error)
  }
}

// 新增期初库存
const handleAddInventory = () => {
  Object.assign(inventoryForm, {
    productId: null,
    warehouseId: null,
    quantity: 0,
    costPrice: 0
  })
  inventoryDialogVisible.value = true
}

const handleProductChange = () => {
  const product = productList.value.find(p => p.id === inventoryForm.productId)
  if (product && !inventoryForm.costPrice) {
    inventoryForm.costPrice = product.purchasePrice || 0
  }
}

const handleSaveInventory = async () => {
  try {
    await inventoryFormRef.value.validate()

    const product = productList.value.find(p => p.id === inventoryForm.productId)
    const warehouse = warehouseList.value.find(w => w.id === inventoryForm.warehouseId)

    const data = {
      productId: inventoryForm.productId,
      productCode: product?.productCode,
      productName: product?.productName,
      warehouseId: inventoryForm.warehouseId,
      warehouseName: warehouse?.name,
      quantity: inventoryForm.quantity,
      costPrice: inventoryForm.costPrice
    }

    await saveInitialInventory(data)
    ElMessage.success('保存成功')
    inventoryDialogVisible.value = false
    loadInventoryData()
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error)
      ElMessage.error(error.message || '保存失败')
    }
  }
}

const handleInventoryDialogClose = () => {
  inventoryFormRef.value?.resetFields()
}

const handleDeleteInventory = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条期初库存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteInitialInventory(row.id)
    ElMessage.success('删除成功')
    loadInventoryData()
  } catch (error) {
    // 用户取消
  }
}

// 新增期初应收
const handleAddReceivable = () => {
  Object.assign(receivableForm, {
    customerId: null,
    billNo: '',
    billDate: '',
    amount: 0,
    remark: ''
  })
  receivableDialogVisible.value = true
}

const handleSaveReceivable = async () => {
  try {
    await receivableFormRef.value.validate()

    const customer = customerList.value.find(c => c.id === receivableForm.customerId)

    const data = {
      customerId: receivableForm.customerId,
      customerName: customer?.name,
      billNo: receivableForm.billNo,
      billDate: receivableForm.billDate,
      amount: receivableForm.amount,
      remark: receivableForm.remark
    }

    await saveInitialReceivable(data)
    ElMessage.success('保存成功')
    receivableDialogVisible.value = false
    loadReceivableData()
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error)
      ElMessage.error(error.message || '保存失败')
    }
  }
}

const handleReceivableDialogClose = () => {
  receivableFormRef.value?.resetFields()
}

const handleDeleteReceivable = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条期初应收吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteInitialReceivable(row.id)
    ElMessage.success('删除成功')
    loadReceivableData()
  } catch (error) {
    // 用户取消
  }
}

// 新增期初应付
const handleAddPayable = () => {
  Object.assign(payableForm, {
    supplierId: null,
    billNo: '',
    billDate: '',
    amount: 0,
    remark: ''
  })
  payableDialogVisible.value = true
}

const handleSavePayable = async () => {
  try {
    await payableFormRef.value.validate()

    const supplier = supplierList.value.find(s => s.id === payableForm.supplierId)

    const data = {
      supplierId: payableForm.supplierId,
      supplierName: supplier?.name,
      billNo: payableForm.billNo,
      billDate: payableForm.billDate,
      amount: payableForm.amount,
      remark: payableForm.remark
    }

    await saveInitialPayable(data)
    ElMessage.success('保存成功')
    payableDialogVisible.value = false
    loadPayableData()
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error)
      ElMessage.error(error.message || '保存失败')
    }
  }
}

const handlePayableDialogClose = () => {
  payableFormRef.value?.resetFields()
}

const handleDeletePayable = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这条期初应付吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteInitialPayable(row.id)
    ElMessage.success('删除成功')
    loadPayableData()
  } catch (error) {
    // 用户取消
  }
}

// 保存期初现金
const handleSaveCashBalance = async () => {
  cashSaving.value = true
  try {
    await saveInitialCashBalance(cashAccounts.value)
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    cashSaving.value = false
  }
}

// 确认开账
const handleConfirmOpening = () => {
  openingForm.openingDate = new Date().toISOString().split('T')[0]
  openingDialogVisible.value = true
}

const handleOpeningConfirm = async () => {
  if (!openingForm.openingDate) {
    ElMessage.warning('请选择开账日期')
    return
  }

  confirming.value = true
  try {
    await confirmOpening({
      openingDate: openingForm.openingDate
    })
    ElMessage.success('开账成功')
    openingDialogVisible.value = false
    loadOpeningStatus()
  } catch (error) {
    console.error('开账失败:', error)
    ElMessage.error(error.message || '开账失败')
  } finally {
    confirming.value = false
  }
}

// 导入期初库存（占位功能）
const handleImportInventory = () => {
  ElMessage.info('导入功能开发中...')
}

onMounted(() => {
  loadOpeningStatus()
  loadBaseData()
  loadInventoryData()
  loadReceivableData()
  loadPayableData()
  loadCashBalance()
})
</script>

<style lang="scss" scoped>
.initial-balance-container {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #262626;
    margin: 0;
  }

  .page-actions {
    display: flex;
    gap: 8px;
  }
}

.tab-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 16px;

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .header-title {
      font-size: 16px;
      font-weight: 600;
      color: #262626;
    }

    .header-tip {
      font-size: 12px;
      color: #8C8C8C;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.search-card {
  margin-bottom: 16px;

  :deep(.el-card__body) {
    padding: 16px;
  }
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  :deep(.el-card__body) {
    padding: 0;
  }

  .el-table {
    .el-table__header th {
      background: #FAFAFA;
    }
  }
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
}

.summary-card {
  margin-top: 16px;
  padding: 16px;
  background: #F0F5FF;
  border-radius: 4px;
  text-align: center;

  :deep(.el-statistic__head) {
    font-size: 14px;
    color: #595959;
    margin-bottom: 8px;
  }

  :deep(.el-statistic__content) {
    font-size: 24px;
    font-weight: 600;
    color: #1890FF;
  }
}

.opening-summary {
  padding: 16px;
  background: #F5F5F5;
  border-radius: 4px;

  p {
    margin: 8px 0;
    font-size: 14px;
    color: #595959;
  }
}

.text-disabled {
  color: #BFBFBF;
  font-size: 12px;
}
</style>
