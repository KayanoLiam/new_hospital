import { defineStore } from 'pinia'
import { doctorApi } from '../api'
import { ElMessage } from 'element-plus'

export const useDoctorStore = defineStore('doctor', {
  state: () => ({
    doctors: [],
    currentDoctor: null,
    loading: false,
    totalDoctors: 0
  }),
  
  getters: {
    getDoctorById: (state) => (id) => {
      return state.doctors.find(doctor => doctor.id === id)
    }
  },
  
  actions: {
    // 设置加载状态
    setLoading(status) {
      this.loading = status
    },
    
    // 获取医生列表
    async fetchDoctors(query = {}) {
      this.setLoading(true)
      try {
        const data = await doctorApi.getDoctors(query)
        
        // 处理不同的响应格式
        let doctors = []
        let total = 0
        
        if (Array.isArray(data)) {
          doctors = data
          total = data.length
        } else if (data.content && Array.isArray(data.content)) {
          doctors = data.content
          total = data.totalElements || doctors.length
        } else if (data.list && Array.isArray(data.list)) {
          doctors = data.list
          total = data.total || doctors.length
        } else {
          doctors = data ? (Array.isArray(data) ? data : [data]) : []
          total = doctors.length
        }
        
        this.doctors = doctors
        this.totalDoctors = total
        return { data: doctors, total }
      } catch (error) {
        console.error('获取医生列表失败:', error)
        ElMessage.error('获取医生列表失败')
        this.doctors = []
        this.totalDoctors = 0
        return { data: [], total: 0 }
      } finally {
        this.setLoading(false)
      }
    },
    
    // 搜索医生
    async searchDoctors(keyword) {
      this.setLoading(true)
      try {
        const data = await doctorApi.searchDoctors(keyword)
        
        // 处理不同的响应格式
        let doctors = []
        let total = 0
        
        if (Array.isArray(data)) {
          doctors = data
          total = data.length
        } else if (data.content && Array.isArray(data.content)) {
          doctors = data.content
          total = data.totalElements || doctors.length
        } else if (data.list && Array.isArray(data.list)) {
          doctors = data.list
          total = data.total || doctors.length
        } else {
          doctors = data ? (Array.isArray(data) ? data : [data]) : []
          total = doctors.length
        }
        
        this.doctors = doctors
        this.totalDoctors = total
        return { data: doctors, total }
      } catch (error) {
        console.error('搜索医生失败:', error)
        ElMessage.error('搜索医生失败')
        return { data: [], total: 0 }
      } finally {
        this.setLoading(false)
      }
    },
    
    // 获取医生详情
    async fetchDoctorById(doctorId) {
      this.setLoading(true)
      try {
        const data = await doctorApi.getDoctorById(doctorId)
        this.currentDoctor = data
        return data
      } catch (error) {
        console.error(`获取医生ID=${doctorId}失败:`, error)
        ElMessage.error('获取医生详情失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 创建医生
    async createDoctor(doctor) {
      this.setLoading(true)
      try {
        const data = await doctorApi.createDoctor(doctor)
        await this.fetchDoctors() // 重新获取列表
        ElMessage.success('添加医生成功')
        return data
      } catch (error) {
        console.error('创建医生失败:', error)
        ElMessage.error('添加医生失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 更新医生
    async updateDoctor(doctor) {
      this.setLoading(true)
      try {
        const data = await doctorApi.updateDoctor(doctor)
        const index = this.doctors.findIndex(d => d.id === doctor.id)
        if (index !== -1) {
          this.doctors[index] = { ...this.doctors[index], ...data }
        }
        ElMessage.success('更新医生成功')
        return data
      } catch (error) {
        console.error(`更新医生ID=${doctor.id}失败:`, error)
        ElMessage.error('更新医生失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 删除医生
    async deleteDoctor(doctorId) {
      this.setLoading(true)
      try {
        await doctorApi.deleteDoctor(doctorId)
        this.doctors = this.doctors.filter(d => d.id !== doctorId)
        ElMessage.success('删除医生成功')
        return true
      } catch (error) {
        console.error(`删除医生ID=${doctorId}失败:`, error)
        ElMessage.error('删除医生失败')
        return false
      } finally {
        this.setLoading(false)
      }
    }
  }
})
