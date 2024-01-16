import request from '@/utils/request'

export function auth(type) {
  return request({
    url: '/oAuth2/auth',
    method: 'get',
    params: { authType: type }
  })
}

export function authLogin(code, type, state) {
  return request({
    url: '/oAuth2/login',
    method: 'post',
    data: { code: code, authType: type, state: state }
  })
}
