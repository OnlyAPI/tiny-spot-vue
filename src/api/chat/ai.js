import request from '@/utils/request'

export function getAiRobotList() {
  return request({
    url: '/ai/robots',
    method: 'get'
  })
}

// 创建会话
export function createConversation(data) {
  return request({
    url: '/ai/conversation',
    method: 'post',
    data: data
  })
}

export function queryConversationList() {
  return request({
    url: '/ai/conversation/list',
    method: 'get'
  })
}

export function queryConversationInfoByCId(cId) {
  return request({
    url: '/ai/conversation/' + cId,
    method: 'get'
  })
}

export function getAiConversationHistoryList(cid) {
  return request({
    url: '/ai/conversation/history',
    method: 'get',
    params: { cid: cid }
  })
}

export function delConversation(cid) {
  return request({
    url: '/ai/conversation/' + cid,
    method: 'delete'
  })
}
