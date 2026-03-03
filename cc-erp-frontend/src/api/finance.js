/**
 * 财务管理 API
 */
import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// 从 localStorage 获取数据
const getLocalStorageData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch (e) {
    return []
  }
}

// 生成应收账款数据（从 localStorage）
const generateMockReceivableList = (params) => {
  const receivables = getLocalStorageData('cc_erp_test_finance_receivables')
  const { customerName, status } = params

  let filtered = receivables
  if (customerName) {
    filtered = filtered.filter(r => r.customerName?.includes(customerName))
  }
  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }

  return filtered
}

// 生成应付账款数据（从 localStorage）
const generateMockPayableList = (params) => {
  const payables = getLocalStorageData('cc_erp_test_finance_payables')
  const { supplierName, status } = params

  let filtered = payables
  if (supplierName) {
    filtered = filtered.filter(p => p.supplierName?.includes(supplierName))
  }
  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }

  return filtered
}

// 生成收款记录数据（从 localStorage）
const generateMockReceiptList = (params) => {
  return getLocalStorageData('cc_erp_test_finance_receipts')
}

// 生成付款记录数据（从 localStorage）
const generateMockPaymentList = (params) => {
  return getLocalStorageData('cc_erp_test_finance_payments')
}

// 生成发票数据（从 localStorage）
const generateMockInvoiceList = (params) => {
  return getLocalStorageData('cc_erp_test_finance_invoices')
}

// 生成模拟统计数据（从真实数据计算）
const generateMockStats = () => {
  const receivables = getLocalStorageData('cc_erp_test_finance_receivables')
  const payables = getLocalStorageData('cc_erp_test_finance_payables')
  const receipts = getLocalStorageData('cc_erp_test_finance_receipts')
  const payments = getLocalStorageData('cc_erp_test_finance_payments')

  // 计算应收总额
  const receivable = receivables.reduce((sum, r) => sum + ((r.totalAmount || 0) - (r.paidAmount || 0)), 0)

  // 计算应付总额
  const payable = payables.reduce((sum, p) => sum + ((p.totalAmount || 0) - (p.paidAmount || 0)), 0)

  // 计算本月收入
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthlyIncome = receipts
    .filter(r => r.receiptDate?.startsWith(currentMonth))
    .reduce((sum, r) => sum + (r.amount || 0), 0)

  // 计算本月支出
  const monthlyExpense = payments
    .filter(p => p.paymentDate?.startsWith(currentMonth))
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return {
    monthlyIncome,
    monthlyExpense,
    receivable,
    payable
  }
}

/**
 * 获取财务统计数据
 */
export const getFinanceStats = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockStats())
      }, 200)
    })
  }
  return request({
    url: '/v1/finance/stats',
    method: 'get'
  })
}

/**
 * 获取应收账款列表
 */
export const getReceivableList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = generateMockReceivableList(params)
        resolve({
          list,
          total: list.length
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/finance/receivables',
    method: 'get',
    params
  })
}

/**
 * 新增应收账款
 */
export const createReceivable = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 保存到 localStorage
        const receivables = getLocalStorageData('cc_erp_test_finance_receivables')
        const newReceivable = {
          id: Date.now(),
          receivableNo: data.receivableNo || `AR-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(receivables.length + 1).padStart(4, '0')}`,
          ...data,
          status: data.status || 'unpaid'
        }
        receivables.push(newReceivable)
        localStorage.setItem('cc_erp_test_finance_receivables', JSON.stringify(receivables))
        console.log('[模拟模式] 新增应收账款', data)
        resolve({ success: true, id: newReceivable.id })
      }, 300)
    })
  }
  return request({
    url: '/v1/finance/receivables',
    method: 'post',
    data
  })
}

/**
 * 收款登记
 */
export const recordReceipt = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 保存到 localStorage
        const receipts = getLocalStorageData('cc_erp_test_finance_receipts')
        const newReceipt = {
          id: Date.now(),
          receiptNo: data.receiptNo || `REC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(receipts.length + 1).padStart(4, '0')}`,
          ...data
        }
        receipts.push(newReceipt)
        localStorage.setItem('cc_erp_test_finance_receipts', JSON.stringify(receipts))

        // 更新应收账款的已收金额
        const receivables = getLocalStorageData('cc_erp_test_finance_receivables')
        const receivable = receivables.find(r => r.receivableNo === data.referenceNo)
        if (receivable) {
          receivable.paidAmount = (receivable.paidAmount || 0) + data.amount
          // 更新状态
          if (receivable.paidAmount >= receivable.totalAmount) {
            receivable.status = 'paid'
          } else if (receivable.paidAmount > 0) {
            receivable.status = 'partial'
          }
          localStorage.setItem('cc_erp_test_finance_receivables', JSON.stringify(receivables))
        }

        console.log('[模拟模式] 收款登记', data)
        resolve({ success: true, id: newReceipt.id })
      }, 300)
    })
  }
  return request({
    url: '/v1/finance/receipts',
    method: 'post',
    data
  })
}

/**
 * 获取收款记录列表
 */
export const getReceiptList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = generateMockReceiptList(params)
        resolve({
          list,
          total: list.length
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/finance/receipts',
    method: 'get',
    params
  })
}

/**
 * 获取应付账款列表
 */
export const getPayableList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = generateMockPayableList(params)
        resolve({
          list,
          total: list.length
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/finance/payables',
    method: 'get',
    params
  })
}

/**
 * 新增应付账款
 */
export const createPayable = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 保存到 localStorage
        const payables = getLocalStorageData('cc_erp_test_finance_payables')
        const newPayable = {
          id: Date.now(),
          payableNo: data.payableNo || `AP-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(payables.length + 1).padStart(4, '0')}`,
          ...data,
          status: data.status || 'unpaid'
        }
        payables.push(newPayable)
        localStorage.setItem('cc_erp_test_finance_payables', JSON.stringify(payables))
        console.log('[模拟模式] 新增应付账款', data)
        resolve({ success: true, id: newPayable.id })
      }, 300)
    })
  }
  return request({
    url: '/v1/finance/payables',
    method: 'post',
    data
  })
}

/**
 * 付款登记
 */
export const recordPayment = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 保存到 localStorage
        const payments = getLocalStorageData('cc_erp_test_finance_payments')
        const newPayment = {
          id: Date.now(),
          paymentNo: data.paymentNo || `PAY-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(payments.length + 1).padStart(4, '0')}`,
          ...data
        }
        payments.push(newPayment)
        localStorage.setItem('cc_erp_test_finance_payments', JSON.stringify(payments))

        // 更新应付账款的已付金额
        const payables = getLocalStorageData('cc_erp_test_finance_payables')
        const payable = payables.find(p => p.payableNo === data.referenceNo)
        if (payable) {
          payable.paidAmount = (payable.paidAmount || 0) + data.amount
          // 更新状态
          if (payable.paidAmount >= payable.totalAmount) {
            payable.status = 'paid'
          } else if (payable.paidAmount > 0) {
            payable.status = 'partial'
          }
          localStorage.setItem('cc_erp_test_finance_payables', JSON.stringify(payables))
        }

        console.log('[模拟模式] 付款登记', data)
        resolve({ success: true, id: newPayment.id })
      }, 300)
    })
  }
  return request({
    url: '/v1/finance/payments',
    method: 'post',
    data
  })
}

/**
 * 获取付款记录列表
 */
export const getPaymentList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = generateMockPaymentList(params)
        resolve({
          list,
          total: list.length
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/finance/payments',
    method: 'get',
    params
  })
}

/**
 * 获取发票列表
 */
export const getInvoiceList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const list = generateMockInvoiceList(params)
        resolve({
          list,
          total: list.length
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/finance/invoices',
    method: 'get',
    params
  })
}

/**
 * 新增发票
 */
export const createInvoice = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 保存到 localStorage
        const invoices = getLocalStorageData('cc_erp_test_finance_invoices')
        const newInvoice = {
          id: Date.now(),
          invoiceNo: data.invoiceNo || `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(invoices.length + 1).padStart(4, '0')}`,
          ...data,
          status: data.status || 'pending'
        }
        invoices.push(newInvoice)
        localStorage.setItem('cc_erp_test_finance_invoices', JSON.stringify(invoices))
        console.log('[模拟模式] 新增发票', data)
        resolve({ success: true, id: newInvoice.id })
      }, 300)
    })
  }
  return request({
    url: '/v1/finance/invoices',
    method: 'post',
    data
  })
}

/**
 * 作废发票
 */
export const cancelInvoice = (id) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const invoices = getLocalStorageData('cc_erp_test_finance_invoices')
        const invoice = invoices.find(i => i.id === id)
        if (invoice) {
          invoice.status = 'cancelled'
          localStorage.setItem('cc_erp_test_finance_invoices', JSON.stringify(invoices))
        }
        console.log('[模拟模式] 作废发票', id)
        resolve({ success: true })
      }, 300)
    })
  }
  return request({
    url: `/v1/finance/invoices/${id}/cancel`,
    method: 'put'
  })
}

/**
 * 获取客户列表（用于应收账款下拉选择）
 */
export const getCustomerOptions = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const customers = getLocalStorageData('cc_erp_test_customers')
        resolve(customers.map(c => ({
          id: c.id,
          customerName: c.name
        })))
      }, 200)
    })
  }
  return request({
    url: '/v1/customer/options',
    method: 'get'
  })
}

/**
 * 获取供应商列表（用于应付账款下拉选择）
 */
export const getSupplierOptions = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const suppliers = getLocalStorageData('cc_erp_test_suppliers')
        resolve(suppliers.map(s => ({
          id: s.id,
          supplierName: s.name
        })))
      }, 200)
    })
  }
  return request({
    url: '/v1/supplier/options',
    method: 'get'
  })
}
