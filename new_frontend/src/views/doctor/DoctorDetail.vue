<template>
  <div class="doctor-detail">
    <div class="page-header">
      <div class="page-title">
        <el-page-header @back="goBack" :title="'返回医生列表'" :content="'医生详情'"></el-page-header>
      </div>
      <div class="page-actions">
        <el-button type="primary" @click="handleEdit">
          <el-icon><Edit /></el-icon> 编辑医生
        </el-button>
      </div>
    </div>
    
    <div v-loading="doctorStore.loading">
      <el-row :gutter="20" v-if="doctor">
        <el-col :xs="24" :md="8">
          <el-card class="doctor-info-card">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            <div class="doctor-avatar">
              <el-avatar :size="100" :icon="UserFilled"></el-avatar>
              <h2>{{ doctor.name }}</h2>
              <p>{{ doctor.department }} | {{ doctor.title }}</p>
            </div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="医生ID">{{ doctor.id }}</el-descriptions-item>
              <el-descriptions-item label="性别">{{ doctor.gender }}</el-descriptions-item>
              <el-descriptions-item label="电话">{{ doctor.phone }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ doctor.email }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <el-card class="schedule-card">
            <template #header>
              <div class="card-header">
                <span>出诊安排</span>
                <el-button type="primary" link @click="handleAddSchedule">
                  <el-icon><Plus /></el-icon> 添加排班
                </el-button>
              </div>
            </template>
            <div class="schedule-list" v-if="schedules.length > 0">
              <el-timeline>
                <el-timeline-item
                  v-for="(schedule, index) in schedules"
                  :key="index"
                  :timestamp="schedule.date"
                  :type="getScheduleType(schedule.period)">
                  <div class="schedule-item">
                    <span>{{ schedule.period }}</span>
                    <el-tag size="small" :type="getScheduleTagType(schedule.period)">
                      {{ schedule.available ? '可预约' : '已满' }}
                    </el-tag>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
            <el-empty v-else description="暂无排班信息"></el-empty>
          </el-card>
        </el-col>
        
        <el-col :xs="24" :md="16">
          <el-card class="introduction-card">
            <template #header>
              <div class="card-header">
                <span>医生简介</span>
              </div>
            </template>
            <div class="introduction" v-if="doctor.introduction">
              <p>{{ doctor.introduction }}</p>
            </div>
            <el-empty v-else description="暂无简介信息"></el-empty>
          </el-card>
          
          <el-card class="appointments-card">
            <template #header>
              <div class="card-header">
                <span>预约记录</span>
              </div>
            </template>
            <div v-if="doctorAppointments.length > 0">
              <el-table :data="doctorAppointments" style="width: 100%" border stripe>
                <el-table-column prop="id" label="预约ID" width="80"></el-table-column>
                <el-table-column prop="patientName" label="患者姓名" width="100"></el-table-column>
                <el-table-column prop="appointmentTime" label="预约时间"></el-table-column>
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="scope">
                    <el-button size="small" @click="viewAppointment(scope.row.id)">查看</el-button>
                    <el-button 
                      size="small" 
                      type="success" 
                      @click="updateAppointmentStatus(scope.row.id, '已确认')"
                      v-if="scope.row.status === '待确认'">
                      确认
                    </el-button>
                    <el-button 
                      size="small" 
                      type="danger" 
                      @click="updateAppointmentStatus(scope.row.id, '已取消')"
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
      
      <el-empty v-else description="未找到医生信息"></el-empty>
    </div>
    
    <!-- 编辑医生对话框 -->
    <el-dialog
      title="编辑医生信息"
      v-model="dialogVisible"
      width="600px"
      destroy-on-close>
      <el-form
        :model="form"
        :rules="rules"
        ref="doctorFormRef"
        label-width="100px"
        class="doctor-form">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入医生姓名"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="男">男</el-radio>
            <el-radio label="女">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="科室" prop="department">
          <el-select v-model="form.department" placeholder="请选择科室" style="width: 100%;">
            <el-option
              v-for="item in departmentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="form.title" placeholder="请选择职称" style="width: 100%;">
            <el-option
              v-for="item in titleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="introduction">
          <el-input
            type="textarea"
            v-model="form.introduction"
            placeholder="请输入医生简介"
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
    
    <!-- 添加排班对话框 -->
    <el-dialog
      title="添加排班"
      v-model="scheduleDialogVisible"
      width="500px"
      destroy-on-close>
      <el-form
        :model="scheduleForm"
        :rules="scheduleRules"
        ref="scheduleFormRef"
        label-width="100px"
        class="schedule-form">
        <el-form-item label="日期" prop="date">
          <el-date-picker
            v-model="scheduleForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="时段" prop="period">
          <el-select v-model="scheduleForm.period" placeholder="请选择时段" style="width: 100%;">
            <el-option label="上午" value="上午"></el-option>
            <el-option label="下午" value="下午"></el-option>
            <el-option label="晚上" value="晚上"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="可预约" prop="available">
          <el-switch v-model="scheduleForm.available"></el-switch>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="scheduleForm.remark"
            placeholder="请输入备注"
            rows="3">
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="scheduleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitScheduleForm" :loading="scheduleSubmitting">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDoctorStore } from '../../stores/doctor'
import { useAppointmentStore } from '../../stores/appointment'
import { Edit, Plus, UserFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const doctorStore = useDoctorStore()
const appointmentStore = useAppointmentStore()

// 医生ID
const doctorId = computed(() => route.params.id)

// 医生信息
const doctor = computed(() => doctorStore.currentDoctor)

// 医生预约
const doctorAppointments = ref([])

// 医生排班
const schedules = ref([
  { date: '2025-05-01', period: '上午', available: true },
  { date: '2025-05-01', period: '下午', available: false },
  { date: '2025-05-02', period: '上午', available: true },
  { date: '2025-05-02', period: '下午', available: true },
  { date: '2025-05-03', period: '上午', available: true }
])

// 科室选项
const departmentOptions = [
  { value: '内科', label: '内科' },
  { value: '外科', label: '外科' },
  { value: '妇产科', label: '妇产科' },
  { value: '儿科', label: '儿科' },
  { value: '眼科', label: '眼科' },
  { value: '耳鼻喉科', label: '耳鼻喉科' },
  { value: '口腔科', label: '口腔科' },
  { value: '皮肤科', label: '皮肤科' },
  { value: '神经科', label: '神经科' },
  { value: '精神科', label: '精神科' },
  { value: '中医科', label: '中医科' },
  { value: '放射科', label: '放射科' },
  { value: '检验科', label: '检验科' },
  { value: '急诊科', label: '急诊科' }
]

// 职称选项
const titleOptions = [
  { value: '主任医师', label: '主任医师' },
  { value: '副主任医师', label: '副主任医师' },
  { value: '主治医师', label: '主治医师' },
  { value: '住院医师', label: '住院医师' },
  { value: '医师', label: '医师' }
]

// 编辑对话框
const dialogVisible = ref(false)
const doctorFormRef = ref(null)
const submitting = ref(false)
const form = ref({
  id: null,
  name: '',
  gender: '男',
  department: '',
  title: '',
  phone: '',
  email: '',
  introduction: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入医生姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  department: [
    { required: true, message: '请选择科室', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 排班对话框
const scheduleDialogVisible = ref(false)
const scheduleFormRef = ref(null)
const scheduleSubmitting = ref(false)
const scheduleForm = ref({
  date: '',
  period: '',
  available: true,
  remark: ''
})

// 排班表单验证规则
const scheduleRules = {
  date: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  period: [
    { required: true, message: '请选择时段', trigger: 'change' }
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

// 获取排班时间线类型
const getScheduleType = (period) => {
  const typeMap = {
    '上午': 'primary',
    '下午': 'success',
    '晚上': 'warning'
  }
  return typeMap[period] || 'info'
}

// 获取排班标签类型
const getScheduleTagType = (period) => {
  const typeMap = {
    '上午': '',
    '下午': 'success',
    '晚上': 'warning'
  }
  return typeMap[period] || ''
}

// 返回医生列表
const goBack = () => {
  router.push('/doctors')
}

// 编辑医生
const handleEdit = () => {
  if (doctor.value) {
    form.value = { ...doctor.value }
    dialogVisible.value = true
  }
}

// 提交编辑表单
const submitForm = () => {
  if (!doctorFormRef.value) return
  
  doctorFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        await doctorStore.updateDoctor(form.value)
        dialogVisible.value = false
        // 重新获取医生详情
        await doctorStore.fetchDoctorById(doctorId.value)
      } catch (error) {
        console.error('更新医生失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 添加排班
const handleAddSchedule = () => {
  scheduleForm.value = {
    date: new Date(),
    period: '上午',
    available: true,
    remark: ''
  }
  scheduleDialogVisible.value = true
}

// 提交排班表单
const submitScheduleForm = () => {
  if (!scheduleFormRef.value) return
  
  scheduleFormRef.value.validate(async (valid) => {
    if (valid) {
      scheduleSubmitting.value = true
      try {
        // 格式化日期
        const date = new Date(scheduleForm.value.date)
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        
        // 添加到排班列表
        schedules.value.push({
          date: formattedDate,
          period: scheduleForm.value.period,
          available: scheduleForm.value.available,
          remark: scheduleForm.value.remark
        })
        
        scheduleDialogVisible.value = false
        ElMessage.success('添加排班成功')
      } catch (error) {
        console.error('添加排班失败:', error)
        ElMessage.error('添加排班失败')
      } finally {
        scheduleSubmitting.value = false
      }
    }
  })
}

// 查看预约详情
const viewAppointment = (id) => {
  router.push(`/appointments/${id}`)
}

// 更新预约状态
const updateAppointmentStatus = async (id, status) => {
  try {
    await ElMessageBox.confirm(`确定要将预约状态更新为"${status}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await appointmentStore.updateAppointmentStatus(id, status)
    
    // 重新获取预约列表
    fetchDoctorAppointments()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新预约状态失败:', error)
    }
  }
}

// 获取医生预约列表
const fetchDoctorAppointments = async () => {
  try {
    const appointments = await appointmentStore.fetchAppointmentsByDoctorId(doctorId.value)
    doctorAppointments.value = appointments
  } catch (error) {
    console.error('获取医生预约失败:', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  if (doctorId.value) {
    await doctorStore.fetchDoctorById(doctorId.value)
    await fetchDoctorAppointments()
  }
})
</script>

<style scoped>
.doctor-detail {
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

.doctor-info-card,
.schedule-card,
.introduction-card,
.appointments-card {
  margin-bottom: 20px;
}

.doctor-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.doctor-avatar h2 {
  margin: 10px 0 5px;
  font-size: 18px;
}

.doctor-avatar p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.introduction {
  line-height: 1.6;
  white-space: pre-line;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
