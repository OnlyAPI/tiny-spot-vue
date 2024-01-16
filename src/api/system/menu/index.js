import request from '@/utils/request'

// 查询角色菜单下拉树结构
export function treeselect() {
  return request({
    url: '/system/menu/roleMenuTree',
    method: 'get'
  })
}

// 查询菜单列表
export function listMenu(query) {
  return request({
    url: '/system/menu/menuNodeTree',
    method: 'get',
    params: query
  })
}

// 查询菜单详细
export function getMenu(menuId) {
  return request({
    url: '/system/menu/info/' + menuId,
    method: 'get'
  })
}

// // 查询菜单下拉树结构
// export function treeselect() {
//   return request({
//     url: '/system/menu/treeselect',
//     method: 'get'
//   })
// }

// 根据角色ID查询菜单下拉树结构
export function roleMenuTreeselect(roleId) {
  return request({
    url: '/system/menu/roleMenuTreeselect/' + roleId,
    method: 'get'
  })
}

// 新增菜单
export function addMenu(data) {
  return request({
    url: '/system/menu/add',
    method: 'post',
    data: data
  })
}

// 修改菜单
export function updateMenu(data, menuId) {
  return request({
    url: '/system/menu/update/' + menuId,
    method: 'post',
    data: data
  })
}

// 删除菜单
export function delMenu(menuId) {
  return request({
    url: '/system/menu/remove/' + menuId,
    method: 'delete'
  })
}

export function changeMenuStatus(menuId, status) {
  return request({
    url: '/system/menu/updateStatus/' + menuId,
    method: 'get',
    params: { status: status }
  })
}
