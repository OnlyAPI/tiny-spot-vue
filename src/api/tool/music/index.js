import request from '@/utils/request'

// 查询音乐列表
export function pageList(query) {
  return request({
    url: '/music/pageInfo',
    method: 'get',
    params: query
  })
}

// 新增
export function add(data) {
  return request({
    url: '/music/add',
    method: 'post',
    data: data
  })
}

// 修改
export function update(data, musicId) {
  return request({
    url: '/music/update/' + musicId,
    method: 'post',
    data: data
  })
}

// 查询音乐列表
export function delMusic(musicId) {
  return request({
    url: '/music/remove/' + musicId,
    method: 'delete'
  })
}

// 查询音乐列表
export function getById(musicId) {
  return request({
    url: '/music/getById/' + musicId,
    method: 'get'
  })
}

export function list() {
  return request({
    url: '/music/list',
    method: 'get'
  })
}
