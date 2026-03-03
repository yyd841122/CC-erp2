import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const STORAGE_KEY = 'cc_erp_test_warehouses'
const STOCK_KEY = 'cc_erp_test_warehouse_stocks'

// 获取数据
const getData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取仓库数据失败:', e)
    return null
  }
}

// 保存数据
const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存仓库数据失败:', e)
  }
}

// 获取库存数据
const getStockData = () => {
  try {
    const data = localStorage.getItem(STOCK_KEY)
    return data ? JSON.parse(data) : []
  } catch (e) {
    return []
  }
}

// 初始化模拟数据（已清空虚拟数据）
const initMockData = () => {
  const existing = getData()
  if (!existing) {
    saveData([])  // 不再初始化默认仓库，用户需要手动添加
  }
}

// 模拟仓库列表
const mockWarehouseList = (params) => {
  initMockData()
  return new Promise((resolve) => {
    setTimeout(() => {
      let warehouses = getData() || []

      // 搜索过滤
      if (params.warehouseName) {
        warehouses = warehouses.filter(w =>
          w.warehouseName.includes(params.warehouseName)
        )
      }
      if (params.isEnabled !== '' && params.isEnabled !== undefined) {
        warehouses = warehouses.filter(w => w.isEnabled === params.isEnabled)
      }

      // 分页
      const page = params.page || 1
      const size = params.size || 20
      const start = (page - 1) * size
      const end = start + size

      resolve({
        records: warehouses.slice(start, end),
        total: warehouses.length,
        page,
        size
      })
    }, 200)
  })
}

// 模拟仓库详情
const mockWarehouseDetail = (id) => {
  initMockData()
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const warehouses = getData() || []
      const warehouse = warehouses.find(w => w.id == id)
      if (warehouse) {
        resolve(warehouse)
      } else {
        reject(new Error('仓库不存在'))
      }
    }, 100)
  })
}

// 模拟创建仓库
const mockCreateWarehouse = (data) => {
  initMockData()
  return new Promise((resolve) => {
    setTimeout(() => {
      const warehouses = getData() || []
      const newId = Math.max(...warehouses.map(w => w.id), 0) + 1

      const newWarehouse = {
        ...data,
        id: newId,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }

      warehouses.unshift(newWarehouse)
      saveData(warehouses)

      resolve(newWarehouse)
    }, 300)
  })
}

// 模拟更新仓库
const mockUpdateWarehouse = (id, data) => {
  initMockData()
  return new Promise((resolve) => {
    setTimeout(() => {
      const warehouses = getData() || []
      const index = warehouses.findIndex(w => w.id == id)
      if (index !== -1) {
        warehouses[index] = {
          ...warehouses[index],
          ...data
        }
        saveData(warehouses)
        resolve(warehouses[index])
      }
    }, 300)
  })
}

// 模拟删除仓库
const mockDeleteWarehouse = (id) => {
  initMockData()
  return new Promise((resolve) => {
    setTimeout(() => {
      const warehouses = getData() || []
      const index = warehouses.findIndex(w => w.id == id)
      if (index !== -1) {
        warehouses.splice(index, 1)
        saveData(warehouses)
      }
      resolve()
    }, 200)
  })
}

// 模拟仓库库存分布
const mockWarehouseStock = (warehouseId) => {
  initMockData()
  return new Promise((resolve) => {
    setTimeout(() => {
      const stocks = getStockData()
      let filtered = stocks
      if (warehouseId) {
        filtered = stocks.filter(s => s.warehouseId == warehouseId)
      }
      resolve(filtered)
    }, 200)
  })
}

// 生成仓库编码
export const generateWarehouseCode = () => {
  if (isMockMode()) {
    const warehouses = getData() || []
    const maxId = Math.max(...warehouses.map(w => w.id), 0)
    return 'W' + String(maxId + 1).padStart(5, '0')
  }
  return null
}

// 查询仓库列表
export const getWarehouseList = (params) => {
  if (isMockMode()) {
    console.log('[模拟模式] 仓库列表查询', params)
    return mockWarehouseList(params)
  }
  return request({
    url: '/v1/warehouses',
    method: 'get',
    params
  })
}

// 查询仓库详情
export const getWarehouseDetail = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 仓库详情查询', id)
    return mockWarehouseDetail(id)
  }
  return request({
    url: `/v1/warehouses/${id}`,
    method: 'get'
  })
}

// 创建仓库
export const createWarehouse = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建仓库', data)
    return mockCreateWarehouse(data)
  }
  return request({
    url: '/v1/warehouses',
    method: 'post',
    data
  })
}

// 更新仓库
export const updateWarehouse = (id, data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 更新仓库', id, data)
    return mockUpdateWarehouse(id, data)
  }
  return request({
    url: `/v1/warehouses/${id}`,
    method: 'put',
    data
  })
}

// 删除仓库
export const deleteWarehouse = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 删除仓库', id)
    return mockDeleteWarehouse(id)
  }
  return request({
    url: `/v1/warehouses/${id}`,
    method: 'delete'
  })
}

// 查询仓库库存分布
export const getWarehouseStock = (warehouseId) => {
  if (isMockMode()) {
    console.log('[模拟模式] 仓库库存分布查询', warehouseId)
    return mockWarehouseStock(warehouseId)
  }
  return request({
    url: `/v1/warehouses/${warehouseId}/stock`,
    method: 'get'
  })
}
