import request from '@/utils/request'

// 修改用户个人信息
export function updateUserProfile(data) {
  return request({
    url: '/user/updateInfo',
    method: 'post',
    data: data
  })
}

// 修改个人密码
export function updateUserPwd(data) {
  return request({
    url: '/user/updatePwd',
    method: 'post',
    data: data
  })
}

// 用户头像上传
export function uploadAvatar(data) {
  return request({
    url: '/user/updateAvatar',
    method: 'post',
    data: data
  })
}
