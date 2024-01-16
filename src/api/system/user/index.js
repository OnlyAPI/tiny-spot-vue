import request from '@/utils/request'

// 查询用户列表
export function listUser(query) {
  return request({
    url: '/system/user/list',
    method: 'get',
    params: query
  })
}

// 查询用户详细
export function getUser(userId) {
  return request({
    url: '/system/user/info/' + userId,
    method: 'get'
  })
}

// 新增用户
export function addUser(data) {
  return request({
    url: '/system/user/add',
    method: 'post',
    data: data
  })
}

// 修改用户
export function updateUser(data, userId) {
  return request({
    url: '/system/user/update/' + userId,
    method: 'post',
    data: data
  })
}

// 删除用户
export function delUser(userId) {
  return request({
    url: '/system/user/remove/' + userId,
    method: 'delete'
  })
}

// 用户密码重置
export function resetUserPwd(userId, password) {
  const data = {
    newPwd: password
  }
  return request({
    url: '/system/user/pwd/reset/' + userId,
    method: 'post',
    data: data
  })
}

// 用户状态修改
export function changeUserStatus(userId, status) {
  if (status === 0) {
    return request({
      url: '/system/user/status/disable/' + userId,
      method: 'put'
    })
  } else {
    return request({
      url: '/system/user/status/enable/' + userId,
      method: 'put'
    })
  }
}

// 查询授权角色
export function getUserRole(userId) {
  return request({
    url: '/system/user/role/' + userId,
    method: 'get'
  })
}

// 保存授权角色
export function updateAuthRole(data) {
  return request({
    url: '/system/user/role/update',
    method: 'post',
    data: data
  })
}
