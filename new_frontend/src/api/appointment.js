import request from './request'

// 预约相关 API
export default {
  // 获取预约列表
  getAppointments() {
    return request({
      url: '/appointments',
      method: 'get'
    })
  },
  
  // 获取预约详情
  getAppointmentById(id) {
    return request({
      url: `/appointments/${id}`,
      method: 'get'
    })
  },
  
  // 创建预约
  createAppointment(data) {
    return request({
      url: '/appointments',
      method: 'post',
      data
    })
  },
  
  // 更新预约
  updateAppointment(data) {
    return request({
      url: `/appointments/${data.id}`,
      method: 'put',
      data
    })
  },
  
  // 取消预约
  cancelAppointment(id) {
    return request({
      url: `/appointments/${id}/cancel`,
      method: 'patch'
    })
  },
  
  // 更新预约状态
  updateAppointmentStatus(id, status) {
    return request({
      url: `/appointments/${id}/status`,
      method: 'patch',
      params: { status }
    })
  },
  
  // 删除预约
  deleteAppointment(id) {
    return request({
      url: `/appointments/${id}`,
      method: 'delete'
    })
  },
  
  // 获取医生的预约列表
  getAppointmentsByDoctorId(doctorId) {
    return request({
      url: `/appointments/doctor/${doctorId}`,
      method: 'get'
    })
  }
}
