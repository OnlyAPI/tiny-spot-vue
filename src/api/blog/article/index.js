import request from '@/utils/request'

export function list(query) {
  return request({
    url: '/blog/list',
    method: 'get',
    params: query
  })
}

export function getById(id) {
  return request({
    url: '/blog/getById/' + id,
    method: 'get'
  })
}

export function add(data) {
  return request({
    url: '/blog/add',
    method: 'post',
    data: data
  })
}

export function update(data, id) {
  return request({
    url: '/blog/update/' + id,
    method: 'post',
    data: data
  })
}

export function deleteById(id) {
  return request({
    url: '/blog/delete/' + id,
    method: 'delete'
  })
}

// 0：保存为草稿 1：发布文章
export function updateStatus(id, status) {
  return request({
    url: '/blog/updateStatus/' + id,
    method: 'get',
    params: { status: status }
  })
}

// 0：不置顶 1：置顶
export function updateTopStatus(id, status) {
  return request({
    url: '/blog/updateTopStatus/' + id,
    method: 'get',
    params: { status: status }
  })
}

// 0：不允许评论 1：允许评论
export function updateCommentStatus(id, status) {
  return request({
    url: '/blog/updateCommentStatus/' + id,
    method: 'get',
    params: { status: status }
  })
}
