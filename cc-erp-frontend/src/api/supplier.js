import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const STORAGE_KEY = 'cc_erp_test_suppliers'

// 获取数据
const getData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取供应商数据失败:', e)
    return null
  }
}

// 保存数据
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存供应商数据失败:', e)
  }
}

// 模拟供应商列表
const mockSupplierList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let suppliers = getData() || []

      // 搜索过滤
      if (params.supplierName) {
        suppliers = suppliers.filter(s =>
          s.supplierName.includes(params.supplierName)
        )
      }
      if (params.contact) {
        suppliers = suppliers.filter(s =>
          s.contact?.includes(params.contact)
        )
      }
      if (params.isEnabled !== '' && params.isEnabled !== undefined) {
        suppliers = suppliers.filter(s => s.isEnabled === params.isEnabled)
      }

      // 分页
      const page = params.page || 1
      const size = params.size || 20
      const start = (page - 1) * size
      const end = start + size

      resolve({
        records: suppliers.slice(start, end),
        total: suppliers.length,
        page,
        size
      })
    }, 200)
  })
}

// 模拟供应商详情
const mockSupplierDetail = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const suppliers = getData() || []
      const supplier = suppliers.find(s => s.id == id)
      if (supplier) {
        resolve(supplier)
      } else {
        reject(new Error('供应商不存在'))
      }
    }, 100)
  })
}

// 模拟创建供应商
const mockCreateSupplier = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suppliers = getData() || []

      const newId = Math.max(...suppliers.map(s => s.id), 0) + 1

      const newSupplier = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }

      suppliers.unshift(newSupplier)
      saveData(suppliers)

      resolve(newSupplier)
    }, 300)
  })
}

// 模拟更新供应商
const mockUpdateSupplier = (id, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suppliers = getData() || []

      const index = suppliers.findIndex(s => s.id == id)
      if (index !== -1) {
        suppliers[index] = {
          ...suppliers[index],
          ...data
        }
        saveData(suppliers)
        resolve(suppliers[index])
      }
    }, 300)
  })
}

// 模拟删除供应商
const mockDeleteSupplier = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const suppliers = getData() || []

      const index = suppliers.findIndex(s => s.id == id)
      if (index !== -1) {
        suppliers.splice(index, 1)
        saveData(suppliers)
      }
      resolve()
    }, 200)
  })
}

// 查询供应商列表
export const getSupplierList = (params) => {
  if (isMockMode()) {
    console.log('[模拟模式] 供应商列表查询', params)
    return mockSupplierList(params)
  }
  return request({
    url: '/v1/suppliers',
    method: 'get',
    params
  })
}

// 查询供应商详情
export const getSupplierDetail = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 供应商详情查询', id)
    return mockSupplierDetail(id)
  }
  return request({
    url: `/v1/suppliers/${id}`,
    method: 'get'
  })
}

// 创建供应商
export const createSupplier = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建供应商', data)
    return mockCreateSupplier(data)
  }
  return request({
    url: '/v1/suppliers',
    method: 'post',
    data
  })
}

// 更新供应商
export const updateSupplier = (id, data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 更新供应商', id, data)
    return mockUpdateSupplier(id, data)
  }
  return request({
    url: `/v1/suppliers/${id}`,
    method: 'put',
    data
  })
}

// 生成供应商编码
export const generateSupplierCode = () => {
  if (isMockMode()) {
    const suppliers = getData() || []
    const maxId = Math.max(...suppliers.map(s => s.id), 0)
    return 'S' + String(maxId + 1).padStart(5, '0')
  }
  return null // 后端模式由后端生成
}

// 删除供应商
export const deleteSupplier = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 删除供应商', id)
    return mockDeleteSupplier(id)
  }
  return request({
    url: `/v1/suppliers/${id}`,
    method: 'delete'
  })
}
