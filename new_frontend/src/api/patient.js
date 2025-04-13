import request from './request'

// 患者相关 API
export default {
  // 获取患者列表
  getPatients() {
    return request({
      url: '/patients',
      method: 'get'
    })
  },
  
  // 根据姓名搜索患者
  getPatientsByName(name) {
    return request({
      url: '/patients/search',
      method: 'get',
      params: { name }
    })
  },
  
  // 获取患者详情
  getPatientById(id) {
    return request({
      url: `/patients/${id}`,
      method: 'get'
    })
  },
  
  // 创建患者
  createPatient(data) {
    return request({
      url: '/patients',
      method: 'post',
      data
    })
  },
  
  // 更新患者
  updatePatient(data) {
    return request({
      url: `/patients/${data.id}`,
      method: 'put',
      data
    })
  },
  
  // 删除患者
  deletePatient(id) {
    return request({
      url: `/patients/${id}`,
      method: 'delete'
    })
  }
}
