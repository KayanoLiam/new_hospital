import { defineStore } from 'pinia'
import { patientApi } from '../api'
import { ElMessage } from 'element-plus'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [],
    currentPatient: null,
    loading: false
  }),
  
  getters: {
    getPatientById: (state) => (id) => {
      return state.patients.find(patient => patient.id === id)
    }
  },
  
  actions: {
    // 设置加载状态
    setLoading(status) {
      this.loading = status
    },
    
    // 获取患者列表
    async fetchPatients() {
      this.setLoading(true)
      try {
        const data = await patientApi.getPatients()
        this.patients = data
        return data
      } catch (error) {
        console.error('获取患者列表失败:', error)
        ElMessage.error('获取患者列表失败')
        return []
      } finally {
        this.setLoading(false)
      }
    },
    
    // 根据姓名搜索患者
    async fetchPatientsByName(name) {
      this.setLoading(true)
      try {
        const data = await patientApi.getPatientsByName(name)
        this.patients = data
        return data
      } catch (error) {
        console.error('搜索患者失败:', error)
        ElMessage.error('搜索患者失败')
        return []
      } finally {
        this.setLoading(false)
      }
    },
    
    // 获取患者详情
    async fetchPatientById(patientId) {
      this.setLoading(true)
      try {
        const data = await patientApi.getPatientById(patientId)
        this.currentPatient = data
        return data
      } catch (error) {
        console.error(`获取患者ID=${patientId}失败:`, error)
        ElMessage.error('获取患者详情失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 创建患者
    async createPatient(patient) {
      this.setLoading(true)
      try {
        const data = await patientApi.createPatient(patient)
        this.patients.push(data)
        ElMessage.success('添加患者成功')
        return data
      } catch (error) {
        console.error('创建患者失败:', error)
        ElMessage.error('添加患者失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 更新患者
    async updatePatient(patient) {
      this.setLoading(true)
      try {
        const data = await patientApi.updatePatient(patient)
        const index = this.patients.findIndex(p => p.id === patient.id)
        if (index !== -1) {
          this.patients[index] = data
        }
        ElMessage.success('更新患者成功')
        return data
      } catch (error) {
        console.error(`更新患者ID=${patient.id}失败:`, error)
        ElMessage.error('更新患者失败')
        return null
      } finally {
        this.setLoading(false)
      }
    },
    
    // 删除患者
    async deletePatient(patientId) {
      this.setLoading(true)
      try {
        await patientApi.deletePatient(patientId)
        this.patients = this.patients.filter(p => p.id !== patientId)
        ElMessage.success('删除患者成功')
        return true
      } catch (error) {
        console.error(`删除患者ID=${patientId}失败:`, error)
        ElMessage.error('删除患者失败')
        return false
      } finally {
        this.setLoading(false)
      }
    }
  }
})
