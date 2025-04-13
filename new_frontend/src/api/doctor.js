import request from './request'

// 医生相关 API
export default {
  // 获取医生列表
  getDoctors(params) {
    return request({
      url: '/doctors',
      method: 'get',
      params
    })
  },
  
  // 搜索医生
  searchDoctors(keyword) {
    return request({
      url: '/doctors/search',
      method: 'get',
      params: { name: keyword }
    })
  },
  
  // 获取医生详情
  getDoctorById(id) {
    return request({
      url: `/doctors/${id}`,
      method: 'get'
    })
  },
  
  // 创建医生
  createDoctor(data) {
    return request({
      url: '/doctors',
      method: 'post',
      data
    })
  },
  
  // 更新医生
  updateDoctor(data) {
    return request({
      url: `/doctors/${data.id}`,
      method: 'put',
      data
    })
  },
  
  // 删除医生
  deleteDoctor(id) {
    return request({
      url: `/doctors/${id}`,
      method: 'delete'
    })
  }
}
