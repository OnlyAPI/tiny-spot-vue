import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/up-record/list',
    method: 'get',
    params: query
  })
}

// 删除
export function deleteById(id) {
  return request({
    url: '/up-record/remove/' + id,
    method: 'delete'
  })
}
