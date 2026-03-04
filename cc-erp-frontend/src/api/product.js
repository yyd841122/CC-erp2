import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const STORAGE_KEYS = {
  PRODUCTS: 'cc_erp_test_products',
  CATEGORIES: 'cc_erp_categories'
}

// 获取数据
const getData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    console.error('读取数据失败:', e)
    return null
  }
}

// 保存数据
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

// 模拟商品列表
const mockProductList = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let products = getData(STORAGE_KEYS.PRODUCTS) || []

      // 搜索过滤
      if (params.productName) {
        products = products.filter(p =>
          p.productName.includes(params.productName)
        )
      }
      if (params.categoryId) {
        products = products.filter(p => p.categoryId == params.categoryId)
      }
      if (params.isEnabled !== '' && params.isEnabled !== undefined) {
        products = products.filter(p => p.isEnabled === params.isEnabled)
      }

      // 分页
      const page = params.page || 1
      const size = params.size || 20
      const start = (page - 1) * size
      const end = start + size

      resolve({
        records: products.slice(start, end),
        total: products.length,
        page,
        size
      })
    }, 200)
  })
}

// 模拟商品详情
const mockProductDetail = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const products = getData(STORAGE_KEYS.PRODUCTS) || []
      const product = products.find(p => p.id == id)
      if (product) {
        resolve(product)
      } else {
        reject(new Error('商品不存在'))
      }
    }, 100)
  })
}

// 模拟创建商品
const mockCreateProduct = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getData(STORAGE_KEYS.PRODUCTS) || []
      const categories = getData(STORAGE_KEYS.CATEGORIES) || []

      const newId = Math.max(...products.map(p => p.id), 0) + 1
      const category = categories.find(c => c.id == data.categoryId)

      const newProduct = {
        ...data,
        id: newId,
        categoryName: category?.categoryName || '',
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }

      products.unshift(newProduct)
      saveData(STORAGE_KEYS.PRODUCTS, products)

      // 更新分类商品数量
      const categoryIndex = categories.findIndex(c => c.id == data.categoryId)
      if (categoryIndex !== -1) {
        categories[categoryIndex].productCount = (categories[categoryIndex].productCount || 0) + 1
        saveData(STORAGE_KEYS.CATEGORIES, categories)
      }

      resolve(newProduct)
    }, 300)
  })
}

// 模拟更新商品
const mockUpdateProduct = (id, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getData(STORAGE_KEYS.PRODUCTS) || []
      const categories = getData(STORAGE_KEYS.CATEGORIES) || []

      const index = products.findIndex(p => p.id == id)
      if (index !== -1) {
        const category = categories.find(c => c.id == data.categoryId)

        // 更新分类商品数量
        const oldCategoryId = products[index].categoryId
        if (oldCategoryId != data.categoryId) {
          const oldCategoryIndex = categories.findIndex(c => c.id == oldCategoryId)
          if (oldCategoryIndex !== -1 && categories[oldCategoryIndex].productCount > 0) {
            categories[oldCategoryIndex].productCount--
          }

          const newCategoryIndex = categories.findIndex(c => c.id == data.categoryId)
          if (newCategoryIndex !== -1) {
            categories[newCategoryIndex].productCount = (categories[newCategoryIndex].productCount || 0) + 1
          }
          saveData(STORAGE_KEYS.CATEGORIES, categories)
        }

        products[index] = {
          ...products[index],
          ...data,
          categoryName: category?.categoryName || products[index].categoryName
        }
        saveData(STORAGE_KEYS.PRODUCTS, products)
        resolve(products[index])
      }
    }, 300)
  })
}

// 模拟删除商品
const mockDeleteProduct = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const products = getData(STORAGE_KEYS.PRODUCTS) || []
      const categories = getData(STORAGE_KEYS.CATEGORIES) || []

      const index = products.findIndex(p => p.id == id)
      if (index !== -1) {
        const categoryId = products[index].categoryId

        products.splice(index, 1)
        saveData(STORAGE_KEYS.PRODUCTS, products)

        // 更新分类商品数量
        const categoryIndex = categories.findIndex(c => c.id == categoryId)
        if (categoryIndex !== -1 && categories[categoryIndex].productCount > 0) {
          categories[categoryIndex].productCount--
          saveData(STORAGE_KEYS.CATEGORIES, categories)
        }
      }
      resolve()
    }, 200)
  })
}

// 查询商品列表
export const getProductList = (params) => {
  if (isMockMode()) {
    console.log('[模拟模式] 商品列表查询', params)
    return mockProductList(params)
  }
  return request({
    url: '/v1/products',
    method: 'get',
    params
  })
}

// 查询商品详情
export const getProductDetail = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 商品详情查询', id)
    return mockProductDetail(id)
  }
  return request({
    url: `/v1/products/${id}`,
    method: 'get'
  })
}

// 创建商品
export const createProduct = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建商品', data)
    return mockCreateProduct(data)
  }
  return request({
    url: '/v1/products',
    method: 'post',
    data
  })
}

// 更新商品
export const updateProduct = (id, data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 更新商品', id, data)
    return mockUpdateProduct(id, data)
  }
  return request({
    url: `/v1/products/${id}`,
    method: 'put',
    data
  })
}

// 生成商品编码
export const generateProductCode = () => {
  if (isMockMode()) {
    const products = getData(STORAGE_KEYS.PRODUCTS) || []
    const maxId = Math.max(...products.map(p => p.id), 0)
    return 'P' + String(maxId + 1).padStart(5, '0')
  }
  return null // 后端模式由后端生成
}

// 删除商品
export const deleteProduct = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 删除商品', id)
    return mockDeleteProduct(id)
  }
  return request({
    url: `/v1/products/${id}`,
    method: 'delete'
  })
}

// ==================== 商品分类 API ====================

// 模拟分类列表
const mockCategoryList = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let categories = getData(STORAGE_KEYS.CATEGORIES) || []
      // 计算每个分类的商品数量
      const products = getData(STORAGE_KEYS.PRODUCTS) || []
      categories = categories.map(c => ({
        ...c,
        productCount: products.filter(p => p.categoryId == c.id).length
      }))
      resolve(categories)
    }, 100)
  })
}

// 模拟创建分类
const mockCreateCategory = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getData(STORAGE_KEYS.CATEGORIES) || []
      const newId = Math.max(...categories.map(c => c.id), 0) + 1
      const newCategory = {
        ...data,
        id: newId,
        productCount: 0,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      categories.push(newCategory)
      saveData(STORAGE_KEYS.CATEGORIES, categories)
      resolve(newCategory)
    }, 200)
  })
}

// 模拟更新分类
const mockUpdateCategory = (id, data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const categories = getData(STORAGE_KEYS.CATEGORIES) || []
      const index = categories.findIndex(c => c.id == id)
      if (index !== -1) {
        categories[index] = { ...categories[index], ...data }
        saveData(STORAGE_KEYS.CATEGORIES, categories)
        resolve(categories[index])
      }
    }, 200)
  })
}

// 模拟删除分类
const mockDeleteCategory = (id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let categories = getData(STORAGE_KEYS.CATEGORIES) || []
      categories = categories.filter(c => c.id != id)
      saveData(STORAGE_KEYS.CATEGORIES, categories)
      resolve()
    }, 200)
  })
}

// 查询分类列表
export const getCategoryList = () => {
  if (isMockMode()) {
    console.log('[模拟模式] 分类列表查询')
    return mockCategoryList()
  }
  return request({
    url: '/v1/product-categories',
    method: 'get'
  })
}

// 创建分类
export const createCategory = (data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 创建分类', data)
    return mockCreateCategory(data)
  }
  return request({
    url: '/v1/product-categories',
    method: 'post',
    data
  })
}

// 更新分类
export const updateCategory = (id, data) => {
  if (isMockMode()) {
    console.log('[模拟模式] 更新分类', id, data)
    return mockUpdateCategory(id, data)
  }
  return request({
    url: `/v1/product-categories/${id}`,
    method: 'put',
    data
  })
}

// 删除分类
export const deleteCategory = (id) => {
  if (isMockMode()) {
    console.log('[模拟模式] 删除分类', id)
    return mockDeleteCategory(id)
  }
  return request({
    url: `/v1/product-categories/${id}`,
    method: 'delete'
  })
}
