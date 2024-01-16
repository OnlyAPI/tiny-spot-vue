import request from '@/utils/request'

export function getAllClassify() {
  return request({
    url: '/blog/classify/getAll',
    method: 'get'
  })
}

export function getById(id) {
  return request({
    url: '/blog/classify/getById/' + id,
    method: 'get'
  })
}

export function list(query) {
  return request({
    url: '/blog/classify/list',
    method: 'get',
    params: query
  })
}

export function save(data) {
  return request({
    url: '/blog/classify/add',
    method: 'post',
    data: data
  })
}

export function update(id, data) {
  return request({
    url: '/blog/classify/update/' + id,
    method: 'put',
    data: data
  })
}

export function deleteById(id) {
  return request({
    url: '/blog/classify/delete/' + id,
    method: 'delete'
  })
}

export function enableTag(id) {
  return request({
    url: '/blog/classify/enable',
    params: { classifyId: id },
    method: 'get'
  })
}

export function disableTag(id) {
  return request({
    url: '/blog/classify/disable',
    params: { classifyId: id },
    method: 'get'
  })
}

export function updateStatus(id, status) {
  if (status === 0) {
    return disableTag(id)
  } else {
    return enableTag(id)
  }
}
