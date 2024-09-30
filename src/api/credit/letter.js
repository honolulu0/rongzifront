import request from '@/utils/request'

// 查询信用证列表
export function listCredit(query) {
  return request({
    url: '/credit/letter/list',
    method: 'get',
    params: query
  })
}

// 查询信用证详细
export function getCredit(id) {
  return request({
    url: '/credit/letter/' + id,
    method: 'get'
  })
}

// 新增信用证
export function addCredit(data) {
  return request({
    url: '/credit/letter',
    method: 'post',
    data: data
  })
}

// 修改信用证
export function updateCredit(data) {
  return request({
    url: '/credit/letter',
    method: 'put',
    data: data
  })
}

// 删除信用证
export function delCredit(id) {
  return request({
    url: '/credit/letter/' + id,
    method: 'delete'
  })
}

export function getProjectByManagementId(id) {
  return request({
    url: '/credit/letter/managementId/' + id,
    method: 'get'
  })
}
