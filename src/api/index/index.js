import request from '@/utils/request'

export function getStatisticalData() {
  return request({
    url: '/index/statistical',
    method: 'get'
  })
}

export function getLineChartData(type) {
  return request({
    url: '/index/lineChart',
    method: 'get',
    params: { type: type }
  })
}

export function planList(planDate) {
  return request({
    url: '/plan/list',
    method: 'get',
    params: { planDate: planDate }
  })
}

export function addPlan(text, planDate) {
  return request({
    url: '/plan/add',
    method: 'get',
    params: { planDate: planDate, text: text }
  })
}

export function editPlan(id, text, status) {
  return request({
    url: '/plan/edit/' + id,
    method: 'put',
    params: { status: status, text: text }
  })
}

export function deletePlan(id) {
  return request({
    url: '/plan/delete/' + id,
    method: 'delete'
  })
}
