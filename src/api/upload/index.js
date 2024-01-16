import request from '@/utils/request'

// 查询登录日志列表
// 用户头像上传
export function fileUpload(data) {
  return request({
    url: '/file/upload',
    method: 'post',
    data: data
  })
}
