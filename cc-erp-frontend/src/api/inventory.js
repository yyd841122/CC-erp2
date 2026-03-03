import request from '@/utils/request'

// 查询库存列表
export const getStockList = (params) => {
  return request({
    url: '/v1/inventory/stocks',
    method: 'get',
    params
  })
}

// 库存调整
export const adjustStock = (data) => {
  return request({
    url: '/v1/inventory/adjust',
    method: 'post',
    data
  })
}

// 查询库存流水
export const getStockMovements = (params) => {
  return request({
    url: '/v1/inventory/movements',
    method: 'get',
    params
  })
}

// 获取库存预警
export const getStockAlerts = () => {
  return request({
    url: '/v1/inventory/alerts',
    method: 'get'
  })
}
