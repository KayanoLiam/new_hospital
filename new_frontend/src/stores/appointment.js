import { defineStore } from 'pinia'
import { appointmentApi } from '../api'
import { ElMessage } from 'element-plus'

export const useAppointmentStore = defineStore('appointment', {
  state: () => ({
    appointments: [],
    currentAppointment: null,
    loading: false
  }),
  
  getters: {
    getAppointmentById: (state) => (id) => {
      return state.appointments.find(appointment => appointment.id === id)
    }
  },
  
  actions: {
    // 设置加载状态
    setLoading(status) {
      this.loading = status
    },
    
    // 获取预约列表
    async fetchAppointments() {
      this.setLoading(true)
      try {
        const data = await appointmentApi.getAppointments()
        this.appointments = data
        return data
      } catch (error) {
        console.error('获取预约列表失败:', error)
        ElMessage.error('获取预约列表失败')
        return []
      } finally {
        this.setLoading(false)
      }
    },
    
    // 获取预约详情
    async fetchAppointmentById(appointmentId) {
      this.setLoading(true)
      try {
        const data = await appointmentApi.getAppointmentById(appointmentId)
        this.currentAppointment = data
        return data
      } catch (error) {
        console.error(`获取预约ID=${appointmentId}失败:`, error)
        ElMessage.error('获取预约详情失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 创建预约
    async createAppointment(appointment) {
      this.setLoading(true)
      try {
        const data = await appointmentApi.createAppointment(appointment)
        this.appointments.push(data)
        ElMessage.success('创建预约成功')
        return data
      } catch (error) {
        console.error('创建预约失败:', error)
        ElMessage.error('创建预约失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 更新预约
    async updateAppointment(appointment) {
      this.setLoading(true)
      try {
        const data = await appointmentApi.updateAppointment(appointment)
        const index = this.appointments.findIndex(a => a.id === appointment.id)
        if (index !== -1) {
          this.appointments[index] = data
        }
        ElMessage.success('更新预约成功')
        return data
      } catch (error) {
        console.error(`更新预约ID=${appointment.id}失败:`, error)
        ElMessage.error('更新预约失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 取消预约
    async cancelAppointment(appointmentId) {
      this.setLoading(true)
      try {
        await appointmentApi.cancelAppointment(appointmentId)
        
        // 更新本地状态
        const index = this.appointments.findIndex(a => a.id === appointmentId)
        if (index !== -1) {
          this.appointments[index] = {
            ...this.appointments[index],
            status: '已取消'
          }
        }
        
        ElMessage.success('取消预约成功')
        return true
      } catch (error) {
        console.error(`取消预约ID=${appointmentId}失败:`, error)
        ElMessage.error('取消预约失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },
    
    // 更新预约状态
    async updateAppointmentStatus(id, status) {
      this.setLoading(true)
      try {
        await appointmentApi.updateAppointmentStatus(id, status)
        
        // 更新本地状态
        const index = this.appointments.findIndex(a => a.id === id)
        if (index !== -1) {
          this.appointments[index] = {
            ...this.appointments[index],
            status
          }
        }
        
        ElMessage.success('更新预约状态成功')
        return true
      } catch (error) {
        console.error(`更新预约ID=${id}状态失败:`, error)
        ElMessage.error('更新预约状态失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },
    
    // 删除预约
    async deleteAppointment(appointmentId) {
      this.setLoading(true)
      try {
        await appointmentApi.deleteAppointment(appointmentId)
        this.appointments = this.appointments.filter(a => a.id !== appointmentId)
        ElMessage.success('删除预约成功')
        return true
      } catch (error) {
        console.error(`删除预约ID=${appointmentId}失败:`, error)
        ElMessage.error('删除预约失败')
        return false
      } finally {
        this.setLoading(false)
      }
    },
    
    // 获取医生的预约列表
    async fetchAppointmentsByDoctorId(doctorId) {
      this.setLoading(true)
      try {
        const data = await appointmentApi.getAppointmentsByDoctorId(doctorId)
        return data
      } catch (error) {
        console.error(`获取医生ID=${doctorId}的预约列表失败:`, error)
        ElMessage.error('获取医生预约列表失败')
        return []
      } finally {
        this.setLoading(false)
      }
    }
  }
})
