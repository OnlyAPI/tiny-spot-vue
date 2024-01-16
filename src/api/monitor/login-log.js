import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/monitor/loginlog/list',
    method: 'get',
    params: query
  })
}

