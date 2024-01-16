import request from '@/utils/request'

export function getWsToken() {
  return request({
    url: '/wstoken',
    method: 'post'
  })
}
