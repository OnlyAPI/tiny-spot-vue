import request from '@/utils/request'

export function getAll() {
  return request({
    url: '/blog/tag/getAll',
    method: 'get'
  })
}

export function getById(id) {
  return request({
    url: '/blog/tag/getById/' + id,
    method: 'get'
  })
}

export function list(query) {
  return request({
    url: '/blog/tag/list',
    method: 'get',
    params: query
  })
}

export function save(data) {
  return request({
    url: '/blog/tag/add',
    method: 'post',
    data: data
  })
}

export function update(id, data) {
  return request({
    url: '/blog/tag/update/' + id,
    method: 'put',
    data: data
  })
}

export function deleteById(id) {
  return request({
    url: '/blog/tag/delete/' + id,
    method: 'delete'
  })
}

export function enableTag(id) {
  return request({
    url: '/blog/tag/enable',
    params: { tagId: id },
    method: 'get'
  })
}

export function disableTag(id) {
  return request({
    url: '/blog/tag/disable',
    params: { tagId: id },
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
