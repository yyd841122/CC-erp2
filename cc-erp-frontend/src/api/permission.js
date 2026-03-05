import request from '@/utils/request'

// 检查是否为模拟模式
const isMockMode = () => {
  return localStorage.getItem('mockMode') === 'true'
}

// localStorage 键
const ROLE_STORAGE_KEY = 'cc_erp_test_roles'
const PERMISSION_STORAGE_KEY = 'cc_erp_test_permissions'
const USER_STORAGE_KEY = 'cc_erp_test_users'

// 从 localStorage 获取数据
const getLocalStorageData = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  } catch (e) {
    return null
  }
}

// 保存到 localStorage
const saveLocalStorageData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存数据失败:', e)
  }
}

// 默认管理员角色
const defaultAdminRole = {
  id: 1,
  roleCode: 'ADMIN',
  roleName: '系统管理员',
  description: '拥有所有权限',
  permissions: ['*'],
  isEnabled: true,
  createdAt: '2024-01-01 10:00:00'
}

// 默认管理员用户
const defaultAdminUser = {
  id: 1,
  username: 'admin',
  realName: '系统管理员',
  email: 'admin@cc-erp.com',
  phone: '13800138000',
  isEnabled: true,
  roles: [{ id: 1, roleCode: 'ADMIN', roleName: '系统管理员' }],
  lastLoginTime: null,
  createdAt: '2024-01-01 10:00:00'
}

// 获取角色列表
const getRoles = () => {
  const data = getLocalStorageData(ROLE_STORAGE_KEY)
  return data && data.length > 0 ? data : [defaultAdminRole]
}

const mockRoles = [] // 将从 localStorage 读取

// 权限定义
const permissionDefinitions = [
  // 商品管理
  { code: 'product:view', name: '查看商品', module: '商品管理' },
  { code: 'product:add', name: '新增商品', module: '商品管理' },
  { code: 'product:edit', name: '编辑商品', module: '商品管理' },
  { code: 'product:delete', name: '删除商品', module: '商品管理' },
  // 客户管理
  { code: 'customer:view', name: '查看客户', module: '客户管理' },
  { code: 'customer:add', name: '新增客户', module: '客户管理' },
  { code: 'customer:edit', name: '编辑客户', module: '客户管理' },
  { code: 'customer:delete', name: '删除客户', module: '客户管理' },
  // 供应商管理
  { code: 'supplier:view', name: '查看供应商', module: '供应商管理' },
  { code: 'supplier:add', name: '新增供应商', module: '供应商管理' },
  { code: 'supplier:edit', name: '编辑供应商', module: '供应商管理' },
  { code: 'supplier:delete', name: '删除供应商', module: '供应商管理' },
  // 采购管理
  { code: 'purchase:view', name: '查看采购', module: '采购管理' },
  { code: 'purchase:add', name: '新增采购', module: '采购管理' },
  { code: 'purchase:edit', name: '编辑采购', module: '采购管理' },
  { code: 'purchase:audit', name: '审核采购', module: '采购管理' },
  { code: 'purchase:delete', name: '删除采购', module: '采购管理' },
  // 销售管理
  { code: 'sales:view', name: '查看销售', module: '销售管理' },
  { code: 'sales:add', name: '新增销售', module: '销售管理' },
  { code: 'sales:edit', name: '编辑销售', module: '销售管理' },
  { code: 'sales:audit', name: '审核销售', module: '销售管理' },
  { code: 'sales:delete', name: '删除销售', module: '销售管理' },
  // 库存管理
  { code: 'inventory:view', name: '查看库存', module: '库存管理' },
  { code: 'inventory:adjust', name: '库存调整', module: '库存管理' },
  // 仓库管理
  { code: 'warehouse:view', name: '查看仓库', module: '仓库管理' },
  { code: 'warehouse:add', name: '新增仓库', module: '仓库管理' },
  { code: 'warehouse:edit', name: '编辑仓库', module: '仓库管理' },
  { code: 'warehouse:delete', name: '删除仓库', module: '仓库管理' },
  // 财务管理
  { code: 'finance:view', name: '查看财务', module: '财务管理' },
  { code: 'finance:add', name: '新增财务', module: '财务管理' },
  { code: 'finance:edit', name: '编辑财务', module: '财务管理' },
  { code: 'finance:audit', name: '审核财务', module: '财务管理' },
  // 报表管理
  { code: 'report:view', name: '查看报表', module: '报表管理' },
  { code: 'report:export', name: '导出报表', module: '报表管理' },
  // 用户管理
  { code: 'user:view', name: '查看用户', module: '用户管理' },
  { code: 'user:add', name: '新增用户', module: '用户管理' },
  { code: 'user:edit', name: '编辑用户', module: '用户管理' },
  { code: 'user:delete', name: '删除用户', module: '用户管理' },
  // 角色管理
  { code: 'role:view', name: '查看角色', module: '角色管理' },
  { code: 'role:add', name: '新增角色', module: '角色管理' },
  { code: 'role:edit', name: '编辑角色', module: '角色管理' },
  { code: 'role:delete', name: '删除角色', module: '角色管理' }
]

// 获取角色列表
export const getRoleList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let roles = getRoles()

        if (params.roleName) {
          roles = roles.filter(r => r.roleName.includes(params.roleName))
        }
        if (params.isEnabled !== '' && params.isEnabled !== undefined) {
          roles = roles.filter(r => r.isEnabled === params.isEnabled)
        }

        const page = params.page || 1
        const size = params.size || 20
        const start = (page - 1) * size
        const end = start + size

        resolve({
          records: roles.slice(start, end),
          total: roles.length,
          page,
          size
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/roles',
    method: 'get',
    params
  })
}

// 获取所有角色（不分页）
export const getAllRoles = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roles = getRoles()
        resolve(roles.filter(r => r.isEnabled))
      }, 100)
    })
  }
  return request({
    url: '/v1/roles/all',
    method: 'get'
  })
}

// 获取权限定义
export const getPermissionDefinitions = () => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(permissionDefinitions)
      }, 100)
    })
  }
  return request({
    url: '/v1/permissions/definitions',
    method: 'get'
  })
}

// 创建角色
export const createRole = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roles = getRoles()
        const newRole = {
          ...data,
          id: Math.max(...roles.map(r => r.id), 0) + 1,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        roles.unshift(newRole)
        saveLocalStorageData(ROLE_STORAGE_KEY, roles)
        resolve(newRole)
      }, 300)
    })
  }
  return request({
    url: '/v1/roles',
    method: 'post',
    data
  })
}

// 更新角色
export const updateRole = (id, data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roles = getRoles()
        const index = roles.findIndex(r => r.id === id)
        if (index !== -1) {
          roles[index] = { ...roles[index], ...data }
          saveLocalStorageData(ROLE_STORAGE_KEY, roles)
          resolve(roles[index])
        }
      }, 300)
    })
  }
  return request({
    url: `/v1/roles/${id}`,
    method: 'put',
    data
  })
}

// 删除角色
export const deleteRole = (id) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const roles = getRoles()
        const index = roles.findIndex(r => r.id === id)
        if (index !== -1) {
          // 不允许删除管理员角色
          if (roles[index].roleCode === 'ADMIN') {
            resolve({ success: false, message: '不能删除管理员角色' })
            return
          }
          roles.splice(index, 1)
          saveLocalStorageData(ROLE_STORAGE_KEY, roles)
        }
        resolve({ success: true })
      }, 200)
    })
  }
  return request({
    url: `/v1/roles/${id}`,
    method: 'delete'
  })
}

// 权限检查函数
export const hasPermission = (permission) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
  if (!userInfo.roles || userInfo.roles.length === 0) return false

  // 检查是否有管理员权限
  for (const role of userInfo.roles) {
    if (role.permissions && role.permissions.includes('*')) {
      return true
    }
  }

  // 收集所有权限
  const allPermissions = []
  for (const role of userInfo.roles) {
    if (role.permissions) {
      allPermissions.push(...role.permissions)
    }
  }

  return allPermissions.includes(permission)
}

// 检查多个权限（满足任一即可）
export const hasAnyPermission = (permissions) => {
  return permissions.some(p => hasPermission(p))
}

// 检查多个权限（必须全部满足）
export const hasAllPermissions = (permissions) => {
  return permissions.every(p => hasPermission(p))
}

// 获取用户列表
export const getUserList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let users = getUsers()

        if (params.username) {
          users = users.filter(u => u.username.includes(params.username))
        }
        if (params.realName) {
          users = users.filter(u => u.realName.includes(params.realName))
        }
        if (params.isEnabled !== '' && params.isEnabled !== undefined) {
          users = users.filter(u => u.isEnabled === params.isEnabled)
        }

        const page = params.page || 1
        const size = params.size || 20
        const start = (page - 1) * size
        const end = start + size

        resolve({
          records: users.slice(start, end),
          list: users.slice(start, end),
          total: users.length
        })
      }, 200)
    })
  }
  return request({
    url: '/v1/users',
    method: 'get',
    params
  })
}

// 获取用户列表（从 localStorage）
const getUsers = () => {
  const data = getLocalStorageData(USER_STORAGE_KEY)
  return data && data.length > 0 ? data : [defaultAdminUser]
}

// 创建用户
export const createUser = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers()
        const newUser = {
          ...data,
          id: Math.max(...users.map(u => u.id), 0) + 1,
          roles: [],
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
          lastLoginTime: null,
          createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
        }
        users.unshift(newUser)
        saveLocalStorageData(USER_STORAGE_KEY, users)
        resolve(newUser)
      }, 300)
    })
  }
  return request({
    url: '/v1/users',
    method: 'post',
    data
  })
}

// 更新用户
export const updateUser = (id, data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers()
        const index = users.findIndex(u => u.id === id)
        if (index !== -1) {
          // 不允许修改管理员用户名
          if (users[index].username === 'admin' && data.username && data.username !== 'admin') {
            resolve({ success: false, message: '不能修改管理员用户名' })
            return
          }
          users[index] = { ...users[index], ...data }
          saveLocalStorageData(USER_STORAGE_KEY, users)
          resolve(users[index])
        }
      }, 300)
    })
  }
  return request({
    url: `/v1/users/${id}`,
    method: 'put',
    data
  })
}

// 删除用户
export const deleteUser = (id) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers()
        const index = users.findIndex(u => u.id === id)
        if (index !== -1) {
          // 不允许删除管理员用户
          if (users[index].username === 'admin') {
            resolve({ success: false, message: '不能删除管理员用户' })
            return
          }
          users.splice(index, 1)
          saveLocalStorageData(USER_STORAGE_KEY, users)
        }
        resolve({ success: true })
      }, 200)
    })
  }
  return request({
    url: `/v1/users/${id}`,
    method: 'delete'
  })
}

// 重置密码
export const resetPassword = (id) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[模拟模式] 重置密码，用户ID:', id)
        resolve({ success: true })
      }, 300)
    })
  }
  return request({
    url: `/v1/users/${id}/reset-password`,
    method: 'post'
  })
}

// 分配角色
export const assignRoles = (userId, data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getUsers()
        const roles = getRoles()
        const index = users.findIndex(u => u.id === userId)
        if (index !== -1) {
          const userRoles = roles.filter(r => data.roleIds.includes(r.id))
          users[index].roles = userRoles
          saveLocalStorageData(USER_STORAGE_KEY, users)
          resolve({ success: true })
        }
      }, 300)
    })
  }
  return request({
    url: `/v1/users/${userId}/roles`,
    method: 'post',
    data
  })
}

// 获取权限列表（树形）
export const getPermissionList = (params) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 返回默认的权限树（菜单）
        resolve([
          {
            id: 1,
            parentId: null,
            permissionCode: 'home',
            permissionName: '首页',
            permissionType: 'menu',
            path: '/home',
            icon: 'HomeFilled',
            sortOrder: 1,
            isEnabled: true
          }
        ])
      }, 200)
    })
  }
  return request({
    url: '/v1/permissions',
    method: 'get',
    params
  })
}

// 创建权限
export const createPermission = (data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 300)
    })
  }
  return request({
    url: '/v1/permissions',
    method: 'post',
    data
  })
}

// 更新权限
export const updatePermission = (id, data) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 300)
    })
  }
  return request({
    url: `/v1/permissions/${id}`,
    method: 'put',
    data
  })
}

// 删除权限
export const deletePermission = (id) => {
  if (isMockMode()) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true })
      }, 200)
    })
  }
  return request({
    url: `/v1/permissions/${id}`,
    method: 'delete'
  })
}
