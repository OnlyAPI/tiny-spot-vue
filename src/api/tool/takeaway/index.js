import request from '@/utils/request'

// 查询登录日志列表
export function list(query) {
  return request({
    url: '/takeaway/pageList',
    method: 'get',
    params: query
  })
}
// 添加
export function save(value) {
  return request({
    url: '/takeaway/add',
    method: 'post',
    data: value
  })
}

// 修改
export function update(id, value) {
  return request({
    url: '/takeaway/update/' + id,
    method: 'post',
    data: value
  })
}

// 删除
export function deleteById(id) {
  return request({
    url: '/takeaway/remove/' + id,
    method: 'delete'
  })
}

// 删除
export function getById(id) {
  return request({
    url: '/takeaway/getById/' + id,
    method: 'get'
  })
}
