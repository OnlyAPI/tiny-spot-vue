import request from '@/utils/request'

// 查询所有角色列表
export function listRole() {
  return request({
    url: '/system/role/list',
    method: 'get'
  })
}

// 分页查询角色列表
export function listRolePage(query) {
  return request({
    url: '/system/role/list/page',
    method: 'get',
    params: query
  })
}

// 删除角色
export function delRole(roleId) {
  return request({
    url: '/system/role/remove/' + roleId,
    method: 'delete'
  })
}

// 修改角色状态
export function changeRoleStatus(roleId, status) {
  return request({
    url: '/system/role/updateStatus/' + roleId,
    method: 'get',
    params: { status: status }
  })
}

// 修改角色
export function updateRole(data, roleId) {
  return request({
    url: '/system/role/update/' + roleId,
    method: 'post',
    data: data
  })
}

// 添加角色
export function addRole(data) {
  return request({
    url: '/system/role/add',
    method: 'post',
    data: data
  })
}

// 添加角色
export function getRoleById(roleId) {
  return request({
    url: '/system/role/info/' + roleId,
    method: 'get'
  })
}

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/role/roleMenuTreeSelect/' + roleId,
    method: 'get'
  })
}
