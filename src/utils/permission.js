import store from '@/store'

/**
 * @param {Array} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  if (value && value instanceof Array && value.length > 0) {
    // const roles = store.getters && store.getters.roles
    const permission = store.getters && store.getters.permission
    const permissionRoles = value
    if (permission.includes('*:*:*')) {
      return true
    }
    const hasPermission = permission.some(role => {
      return permissionRoles.includes(role)
    })
    return hasPermission
  } else {
    console.error(`need roles! Like v-permission="['admin','editor']"`)
    return false
  }
}
