import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/api/permission'

/**
 * 权限指令
 * 用法: v-permission="'product:add'" 或 v-permission="['product:add', 'product:edit']"
 */
export const permission = {
  mounted(el, binding) {
    const { value } = binding

    if (value) {
      let hasAuth = false

      if (typeof value === 'string') {
        hasAuth = hasPermission(value)
      } else if (Array.isArray(value)) {
        hasAuth = hasAnyPermission(value)
      }

      if (!hasAuth) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限，如: v-permission="\'product:add\'"')
    }
  }
}

/**
 * 权限指令（必须全部满足）
 * 用法: v-permission-all="['product:add', 'product:edit']"
 */
export const permissionAll = {
  mounted(el, binding) {
    const { value } = binding

    if (value && Array.isArray(value)) {
      const hasAuth = hasAllPermissions(value)

      if (!hasAuth) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限数组，如: v-permission-all="[\'product:add\', \'product:edit\']"')
    }
  }
}

/**
 * 注册权限指令
 */
export function setupPermissionDirective(app) {
  app.directive('permission', permission)
  app.directive('permission-all', permissionAll)
}

/**
 * 权限组合式函数
 */
export function usePermission() {
  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  }
}
