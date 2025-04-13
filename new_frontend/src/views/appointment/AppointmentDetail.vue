<template>
  <div class="appointment-detail">
    <div class="page-header">
      <div class="page-title">
        <el-page-header @back="goBack" :title="'返回预约列表'" :content="'预约详情'"></el-page-header>
      </div>
      <div class="page-actions">
        <el-button-group>
          <el-button 
            type="success" 
            @click="handleUpdateStatus('已确认')"
            v-if="appointment && appointment.status === '待确认'">
            <el-icon><Check /></el-icon> 确认预约
          </el-button>
          <el-button 
            type="primary" 
            @click="handleUpdateStatus('已完成')"
            v-if="appointment && appointment.status === '已确认'">
            <el-icon><CircleCheck /></el-icon> 完成预约
          </el-button>
          <el-button 
            type="danger" 
            @click="handleCancel"
            v-if="appointment && (appointment.status === '待确认' || appointment.status === '已确认')">
            <el-icon><Close /></el-icon> 取消预约
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <div v-loading="appointmentStore.loading">
      <el-row :gutter="20" v-if="appointment">
        <el-col :xs="24" :md="8">
          <el-card class="appointment-info-card">
            <template #header>
              <div class="card-header">
                <span>预约信息</span>
                <el-tag :type="getStatusType(appointment.status)">{{ appointment.status }}</el-tag>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="预约ID">{{ appointment.id }}</el-descriptions-item>
              <el-descriptions-item label="预约时间">{{ formatDateTime(appointment.appointmentTime) }}</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ formatDateTime(appointment.createTime) }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ formatDateTime(appointment.updateTime) }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <el-card class="patient-info-card">
            <template #header>
              <div class="card-header">
                <span>患者信息</span>
                <el-button type="primary" link @click="viewPatient">
                  查看详情
                </el-button>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="患者姓名">{{ appointment.patientName }}</el-descriptions-item>
              <el-descriptions-item label="患者ID">{{ appointment.patientId }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ patientInfo.phone || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="年龄">{{ patientInfo.age ? `${patientInfo.age}岁` : '未知' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="16">
          <el-card class="doctor-info-card">
            <template #header>
              <div class="card-header">
                <span>医生信息</span>
                <el-button type="primary" link @click="viewDoctor">
                  查看详情
                </el-button>
              </div>
            </template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="医生姓名">{{ appointment.doctorName }}</el-descriptions-item>
              <el-descriptions-item label="医生ID">{{ appointment.doctorId }}</el-descriptions-item>
              <el-descriptions-item label="科室">{{ appointment.department || doctorInfo.department || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="职称">{{ doctorInfo.title || '未知' }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <el-card class="appointment-details-card">
            <template #header>
              <div class="card-header">
                <span>预约详情</span>
              </div>
            </template>
            <div class="detail-section">
              <h3>预约原因</h3>
              <p>{{ appointment.reason || '无' }}</p>
            </div>
            <div class="detail-section">
              <h3>备注</h3>
              <p>{{ appointment.remark || '无' }}</p>
            </div>
          </el-card>
          
          <el-card class="medical-record-card">
            <template #header>
              <div class="card-header">
                <span>就诊记录</span>
                <el-button type="primary" @click="handleAddMedicalRecord" v-if="appointment.status === '已确认'">
                  <el-icon><Plus /></el-icon> 添加就诊记录
                </el-button>
              </div>
            </template>
            <div v-if="medicalRecords.length > 0">
              <div class="medical-record" v-for="(record, index) in medicalRecords" :key="index">
                <div class="record-header">
                  <h3>{{ formatDateTime(record.recordTime) }}</h3>
                  <span>{{ record.doctorName }}</span>
                </div>
                <div class="record-content">
                  <div class="record-item">
                    <h4>诊断结果</h4>
                    <p>{{ record.diagnosis }}</p>
                  </div>
                  <div class="record-item">
                    <h4>处方</h4>
                    <p>{{ record.prescription }}</p>
                  </div>
                  <div class="record-item">
                    <h4>医嘱</h4>
                    <p>{{ record.advice }}</p>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无就诊记录"></el-empty>
          </el-card>
        </el-col>
      </el-row>
      
      <el-empty v-else description="未找到预约信息"></el-empty>
    </div>
    
    <!-- 添加就诊记录对话框 -->
    <el-dialog
      title="添加就诊记录"
      v-model="dialogVisible"
      width="600px"
      destroy-on-close>
      <el-form
        :model="form"
        :rules="rules"
        ref="medicalRecordFormRef"
        label-width="100px"
        class="medical-record-form">
        <el-form-item label="诊断结果" prop="diagnosis">
          <el-input
            type="textarea"
            v-model="form.diagnosis"
            placeholder="请输入诊断结果"
            rows="3">
          </el-input>
        </el-form-item>
        <el-form-item label="处方" prop="prescription">
          <el-input
            type="textarea"
            v-model="form.prescription"
            placeholder="请输入处方"
            rows="3">
          </el-input>
        </el-form-item>
        <el-form-item label="医嘱" prop="advice">
          <el-input
            type="textarea"
            v-model="form.advice"
            placeholder="请输入医嘱"
            rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppointmentStore } from '../../stores/appointment'
import { usePatientStore } from '../../stores/patient'
import { useDoctorStore } from '../../stores/doctor'
import { Check, CircleCheck, Close, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const appointmentStore = useAppointmentStore()
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()

// 预约ID
const appointmentId = computed(() => route.params.id)

// 预约信息
const appointment = computed(() => appointmentStore.currentAppointment)

// 患者和医生信息
const patientInfo = ref({})
const doctorInfo = ref({})

// 就诊记录
const medicalRecords = ref([
  {
    recordTime: '2025-04-15 10:30:00',
    doctorName: '张医生',
    diagnosis: '上呼吸道感染',
    prescription: '阿莫西林胶囊 0.5g 每日三次；布洛芬缓释胶囊 0.3g 每日两次',
    advice: '多喝水，注意休息，三天后复诊'
  }
])

// 就诊记录对话框
const dialogVisible = ref(false)
const medicalRecordFormRef = ref(null)
const submitting = ref(false)
const form = ref({
  diagnosis: '',
  prescription: '',
  advice: ''
})

// 表单验证规则
const rules = {
  diagnosis: [
    { required: true, message: '请输入诊断结果', trigger: 'blur' }
  ]
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  if (isNaN(date.getTime())) return dateTime
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取状态标签类型
const getStatusType = (status) => {
  const statusMap = {
    '待确认': 'info',
    '已确认': 'success',
    '已完成': 'success',
    '已取消': 'danger',
    '已过期': 'warning'
  }
  return statusMap[status] || 'info'
}

// 返回预约列表
const goBack = () => {
  router.push('/appointments')
}

// 查看患者详情
const viewPatient = () => {
  if (appointment.value && appointment.value.patientId) {
    router.push(`/patients/${appointment.value.patientId}`)
  }
}

// 查看医生详情
const viewDoctor = () => {
  if (appointment.value && appointment.value.doctorId) {
    router.push(`/doctors/${appointment.value.doctorId}`)
  }
}

// 更新预约状态
const handleUpdateStatus = async (status) => {
  try {
    await ElMessageBox.confirm(`确定要将预约状态更新为"${status}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await appointmentStore.updateAppointmentStatus(appointmentId.value, status)
    
    // 重新获取预约详情
    await appointmentStore.fetchAppointmentById(appointmentId.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新预约状态失败:', error)
    }
  }
}

// 取消预约
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await appointmentStore.cancelAppointment(appointmentId.value)
    
    // 重新获取预约详情
    await appointmentStore.fetchAppointmentById(appointmentId.value)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
    }
  }
}

// 添加就诊记录
const handleAddMedicalRecord = () => {
  form.value = {
    diagnosis: '',
    prescription: '',
    advice: ''
  }
  dialogVisible.value = true
}

// 提交就诊记录表单
const submitForm = () => {
  if (!medicalRecordFormRef.value) return
  
  medicalRecordFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 添加就诊记录
        const newRecord = {
          recordTime: new Date().toISOString(),
          doctorName: appointment.value.doctorName,
          diagnosis: form.value.diagnosis,
          prescription: form.value.prescription,
          advice: form.value.advice
        }
        
        medicalRecords.value.unshift(newRecord)
        
        // 更新预约状态为已完成
        await appointmentStore.updateAppointmentStatus(appointmentId.value, '已完成')
        
        // 重新获取预约详情
        await appointmentStore.fetchAppointmentById(appointmentId.value)
        
        dialogVisible.value = false
        ElMessage.success('添加就诊记录成功')
      } catch (error) {
        console.error('添加就诊记录失败:', error)
        ElMessage.error('添加就诊记录失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 获取患者信息
const fetchPatientInfo = async () => {
  if (appointment.value && appointment.value.patientId) {
    try {
      const patient = await patientStore.fetchPatientById(appointment.value.patientId)
      patientInfo.value = patient || {}
    } catch (error) {
      console.error('获取患者信息失败:', error)
    }
  }
}

// 获取医生信息
const fetchDoctorInfo = async () => {
  if (appointment.value && appointment.value.doctorId) {
    try {
      const doctor = await doctorStore.fetchDoctorById(appointment.value.doctorId)
      doctorInfo.value = doctor || {}
    } catch (error) {
      console.error('获取医生信息失败:', error)
    }
  }
}

// 页面加载时获取数据
onMounted(async () => {
  if (appointmentId.value) {
    await appointmentStore.fetchAppointmentById(appointmentId.value)
    await fetchPatientInfo()
    await fetchDoctorInfo()
  }
})
</script>

<style scoped>
.appointment-detail {
  padding: 10px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.appointment-info-card,
.patient-info-card,
.doctor-info-card,
.appointment-details-card,
.medical-record-card {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
  font-weight: 500;
}

.detail-section p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
  white-space: pre-line;
}

.medical-record {
  border-bottom: 1px solid #EBEEF5;
  padding-bottom: 20px;
  margin-bottom: 20px;
}

.medical-record:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.record-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.record-header span {
  color: #909399;
  font-size: 14px;
}

.record-content {
  color: #606266;
}

.record-item {
  margin-bottom: 15px;
}

.record-item h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #303133;
}

.record-item p {
  margin: 0;
  line-height: 1.6;
  white-space: pre-line;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
