<template>
  <div class="patient-detail">
    <div class="page-header">
      <div class="page-title">
        <el-page-header @back="goBack" :title="'返回患者列表'" :content="'患者详情'"></el-page-header>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon> 编辑患者
        </el-button>
      </div>
    </div>
    
    <div v-loading="patientStore.loading">
      <el-row :gutter="20" v-if="patient">
        <el-col :xs="24" :md="8">
          <el-card class="patient-info-card">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            <div class="patient-avatar">
              <el-avatar :size="100" :icon="UserFilled"></el-avatar>
              <h2>{{ patient.name }}</h2>
              <p>患者ID: {{ patient.id }}</p>
            </div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="性别">{{ patient.gender }}</el-descriptions-item>
              <el-descriptions-item label="年龄">{{ patient.age }}岁</el-descriptions-item>
              <el-descriptions-item label="电话">{{ patient.phone }}</el-descriptions-item>
              <el-descriptions-item label="地址">{{ patient.address }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="16">
          <el-card class="medical-history-card">
            <template #header>
              <div class="card-header">
                <span>病史记录</span>
              </div>
            </template>
            <div class="medical-history" v-if="patient.medicalHistory">
              <p>{{ patient.medicalHistory }}</p>
            </div>
            <el-empty v-else description="暂无病史记录"></el-empty>
          </el-card>
          
          <el-card class="appointments-card">
            <template #header>
              <div class="card-header">
                <span>预约记录</span>
                <el-button type="primary" link @click="handleAddAppointment">
                  <el-icon><Plus /></el-icon> 新增预约
                </el-button>
              </div>
            </template>
            <div v-if="patientAppointments.length > 0">
              <el-table :data="patientAppointments" style="width: 100%" border stripe>
                <el-table-column prop="id" label="预约ID" width="80"></el-table-column>
                <el-table-column prop="doctorName" label="医生" width="100"></el-table-column>
                <el-table-column prop="appointmentTime" label="预约时间"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150">
                  <template #default="scope">
                    <el-button size="small" @click="viewAppointment(scope.row.id)">查看</el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="cancelAppointment(scope.row.id)"
                      v-if="scope.row.status === '待确认' || scope.row.status === '已确认'">
                      取消
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <el-empty v-else description="暂无预约记录"></el-empty>
          </el-card>
        </el-col>
      </el-row>
      
      <el-empty v-else description="未找到患者信息"></el-empty>
    </div>
    
    <!-- 编辑患者对话框 -->
    <el-dialog
      title="编辑患者信息"
      v-model="dialogVisible"
      width="600px"
      destroy-on-close>
      <el-form
        :model="form"
        :rules="rules"
        ref="patientFormRef"
        label-width="100px"
        class="patient-form">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入患者姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input-number v-model="form.age" :min="0" :max="120" style="width: 180px;"></el-input-number>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入地址"></el-input>
        </el-form-item>
        <el-form-item label="病史" prop="medicalHistory">
          <el-input
            type="textarea"
            v-model="form.medicalHistory"
            placeholder="请输入病史"
            rows="4">
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
    
    <!-- 新增预约对话框 -->
    <el-dialog
      title="新增预约"
      v-model="appointmentDialogVisible"
      width="600px"
      destroy-on-close>
      <el-form
        :model="appointmentForm"
        :rules="appointmentRules"
        ref="appointmentFormRef"
        label-width="100px"
        class="appointment-form">
        <el-form-item label="医生" prop="doctorId">
          <el-select v-model="appointmentForm.doctorId" placeholder="请选择医生" style="width: 100%;">
            <el-option
              v-for="doctor in doctors"
              :key="doctor.id"
              :label="doctor.name"
              :value="doctor.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="appointmentForm.appointmentTime"
            type="datetime"
            placeholder="选择预约时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预约原因" prop="reason">
          <el-input
            type="textarea"
            v-model="appointmentForm.reason"
            placeholder="请输入预约原因"
            rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="appointmentDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitAppointmentForm" :loading="appointmentSubmitting">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePatientStore } from '../../stores/patient'
import { useDoctorStore } from '../../stores/doctor'
import { useAppointmentStore } from '../../stores/appointment'
import { Edit, Plus, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()
const appointmentStore = useAppointmentStore()

// 患者ID
const patientId = computed(() => route.params.id)

// 患者信息
const patient = computed(() => patientStore.currentPatient)

// 患者预约
const patientAppointments = ref([])

// 医生列表
const doctors = ref([])

// 编辑对话框
const dialogVisible = ref(false)
const patientFormRef = ref(null)
const submitting = ref(false)
const form = ref({
  id: null,
  name: '',
  gender: '男',
  age: 30,
  phone: '',
  address: '',
  medicalHistory: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入患者姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请填写年龄', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 预约对话框
const appointmentDialogVisible = ref(false)
const appointmentFormRef = ref(null)
const appointmentSubmitting = ref(false)
const appointmentForm = ref({
  patientId: null,
  doctorId: null,
  appointmentTime: null,
  reason: '',
  status: '待确认'
})

// 预约表单验证规则
const appointmentRules = {
  doctorId: [
    { required: true, message: '请选择医生', trigger: 'change' }
  ],
  appointmentTime: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ]
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

// 返回患者列表
const goBack = () => {
  router.push('/patients')
}

// 编辑患者
const handleEdit = () => {
  if (patient.value) {
    form.value = { ...patient.value }
    dialogVisible.value = true
  }
}

// 提交编辑表单
const submitForm = () => {
  if (!patientFormRef.value) return
  
  patientFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await patientStore.updatePatient(form.value)
        dialogVisible.value = false
        // 重新获取患者详情
        await patientStore.fetchPatientById(patientId.value)
      } catch (error) {
        console.error('更新患者失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 新增预约
const handleAddAppointment = () => {
  appointmentForm.value = {
    patientId: patientId.value,
    doctorId: null,
    appointmentTime: new Date(),
    reason: '',
    status: '待确认'
  }
  appointmentDialogVisible.value = true
}

// 提交预约表单
const submitAppointmentForm = () => {
  if (!appointmentFormRef.value) return
  
  appointmentFormRef.value.validate(async (valid) => {
    if (valid) {
      appointmentSubmitting.value = true
      try {
        // 添加患者姓名
        const appointmentData = {
          ...appointmentForm.value,
          patientName: patient.value.name
        }
        
        await appointmentStore.createAppointment(appointmentData)
        appointmentDialogVisible.value = false
        
        // 重新获取预约列表
        fetchPatientAppointments()
      } catch (error) {
        console.error('创建预约失败:', error)
      } finally {
        appointmentSubmitting.value = false
      }
    }
  })
}

// 查看预约详情
const viewAppointment = (id) => {
  router.push(`/appointments/${id}`)
}

// 取消预约
const cancelAppointment = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await appointmentStore.cancelAppointment(id)
    
    // 重新获取预约列表
    fetchPatientAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
    }
  }
}

// 获取患者预约列表
const fetchPatientAppointments = async () => {
  try {
    const appointments = await appointmentStore.fetchAppointments()
    // 过滤出当前患者的预约
    patientAppointments.value = appointments.filter(a => 
      a.patientId === patientId.value || a.patientName === patient.value?.name
    )
  } catch (error) {
    console.error('获取患者预约失败:', error)
  }
}

// 获取医生列表
const fetchDoctors = async () => {
  try {
    const { data } = await doctorStore.fetchDoctors()
    doctors.value = data
  } catch (error) {
    console.error('获取医生列表失败:', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  if (patientId.value) {
    await patientStore.fetchPatientById(patientId.value)
    await fetchPatientAppointments()
    await fetchDoctors()
  }
})
</script>

<style scoped>
.patient-detail {
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

.patient-info-card,
.medical-history-card,
.appointments-card {
  margin-bottom: 20px;
}

.patient-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.patient-avatar h2 {
  margin: 10px 0 5px;
  font-size: 18px;
}

.patient-avatar p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.medical-history {
  line-height: 1.6;
  white-space: pre-line;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
