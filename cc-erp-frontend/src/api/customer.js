import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const STORAGE_KEY = 'cc_erp_test_customers'

// 获取数据
const getData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取客户数据失败:', e)
    return null
  }
}

// 保存数据
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存客户数据失败:', e)
  }
}

// 模拟客户列表
const mockCustomerList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let customers = getData() || []

      // 搜索过滤
      if (params.customerName) {
        customers = customers.filter(c =>
          c.customerName.includes(params.customerName)
        )
      }
      if (params.isEnabled !== '' && params.isEnabled !== undefined) {
        customers = customers.filter(c => c.isEnabled === params.isEnabled)
      }

      // 分页
      const page = params.page || 1
      const size = params.size || 20
      const start = (page - 1) * size
      const end = start + size

      resolve({
        records: customers.slice(start, end),
        total: customers.length,
        page,
        size
      })
    }, 200)
  })
}

// 模拟客户详情
const mockCustomerDetail = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const customers = getData() || []
      const customer = customers.find(c => c.id == id)
      if (customer) {
        resolve(customer)
      } else {
        reject(new Error('客户不存在'))
      }
    }, 100)
  })
}

// 模拟创建客户
const mockCreateCustomer = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const customers = getData() || []

      const newId = Math.max(...customers.map(c => c.id), 0) + 1

      const newCustomer = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }

      customers.unshift(newCustomer)
      saveData(customers)

      resolve(newCustomer)
    }, 300)
  })
}

// 模拟更新客户
const mockUpdateCustomer = (id, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const customers = getData() || []

      const index = customers.findIndex(c => c.id == id)
      if (index !== -1) {
        customers[index] = {
          ...customers[index],
          ...data
        }
        saveData(customers)
        resolve(customers[index])
      }
    }, 300)
  })
}

// 模拟删除客户
const mockDeleteCustomer = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const customers = getData() || []

      const index = customers.findIndex(c => c.id == id)
      if (index !== -1) {
        customers.splice(index, 1)
        saveData(customers)
      }
      resolve()
    }, 200)
  })
}

// 查询客户列表
export const getCustomerList = (params) => {
  if (isMockMode()) {
    console.log('[模拟模式] 客户列表查询', params)
    return mockCustomerList(params)
  }
  return request({
    url: '/v1/customers',
    method: 'get',
    params
  })
}

// 查询客户详情
export const getCustomerDetail = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 客户详情查询', id)
    return mockCustomerDetail(id)
  }
  return request({
    url: `/v1/customers/${id}`,
    method: 'get'
  })
}

// 创建客户
export const createCustomer = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建客户', data)
    return mockCreateCustomer(data)
  }
  return request({
    url: '/v1/customers',
    method: 'post',
    data
  })
}

// 更新客户
export const updateCustomer = (id, data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 更新客户', id, data)
    return mockUpdateCustomer(id, data)
  }
  return request({
    url: `/v1/customers/${id}`,
    method: 'put',
    data
  })
}

// 生成客户编码
export const generateCustomerCode = () => {
  if (isMockMode()) {
    const customers = getData() || []
    const maxId = Math.max(...customers.map(c => c.id), 0)
    return 'C' + String(maxId + 1).padStart(5, '0')
  }
  return null // 后端模式由后端生成
}

// 删除客户
export const deleteCustomer = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 删除客户', id)
    return mockDeleteCustomer(id)
  }
  return request({
    url: `/v1/customers/${id}`,
    method: 'delete'
  })
}
