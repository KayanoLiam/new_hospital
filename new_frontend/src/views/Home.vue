<template>
  <div class="home-container">
    <div class="welcome-section">
      <h1>欢迎使用医院管理系统</h1>
      <p>高效管理患者、医生和预约信息</p>
    </div>
    
    <el-row :gutter="20" class="dashboard-cards">
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="dashboard-card" shadow="hover" @click="navigateTo('/patients')">
          <div class="card-content">
            <el-icon class="card-icon"><User /></el-icon>
            <div class="card-info">
              <h2>患者管理</h2>
              <p>管理患者信息、病历和就诊记录</p>
              <div class="card-count" v-if="patientCount !== null">
                <span>{{ patientCount }}</span>
                <span>患者总数</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="dashboard-card" shadow="hover" @click="navigateTo('/doctors')">
          <div class="card-content">
            <el-icon class="card-icon"><UserFilled /></el-icon>
            <div class="card-info">
              <h2>医生管理</h2>
              <p>管理医生信息、专业和排班</p>
              <div class="card-count" v-if="doctorCount !== null">
                <span>{{ doctorCount }}</span>
                <span>医生总数</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="8">
        <el-card class="dashboard-card" shadow="hover" @click="navigateTo('/appointments')">
          <div class="card-content">
            <el-icon class="card-icon"><Calendar /></el-icon>
            <div class="card-info">
              <h2>预约管理</h2>
              <p>管理患者预约、就诊安排</p>
              <div class="card-count" v-if="appointmentCount !== null">
                <span>{{ appointmentCount }}</span>
                <span>预约总数</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="dashboard-charts">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>最近预约</span>
              <el-button class="button" text @click="navigateTo('/appointments')">
                查看全部
              </el-button>
            </div>
          </template>
          <div v-loading="loading">
            <el-empty v-if="!recentAppointments.length" description="暂无预约数据"></el-empty>
            <el-table v-else :data="recentAppointments" style="width: 100%" size="large">
              <el-table-column prop="patientName" label="患者姓名" width="100"></el-table-column>
              <el-table-column prop="doctorName" label="医生姓名" width="100"></el-table-column>
              <el-table-column prop="appointmentTime" label="预约时间"></el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span>系统公告</span>
            </div>
          </template>
          <div class="notice-list">
            <div class="notice-item" v-for="(notice, index) in notices" :key="index">
              <div class="notice-title">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ notice.title }}</span>
              </div>
              <div class="notice-content">{{ notice.content }}</div>
              <div class="notice-time">{{ notice.time }}</div>
            </div>
            <el-empty v-if="!notices.length" description="暂无公告"></el-empty>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { User, UserFilled, Calendar, InfoFilled } from '@element-plus/icons-vue'
import { usePatientStore } from '../stores/patient'
import { useDoctorStore } from '../stores/doctor'
import { useAppointmentStore } from '../stores/appointment'

const router = useRouter()
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()
const appointmentStore = useAppointmentStore()

// 统计数据
const patientCount = ref(null)
const doctorCount = ref(null)
const appointmentCount = ref(null)
const loading = ref(false)

// 最近预约
const recentAppointments = ref([])

// 系统公告
const notices = ref([
  {
    title: '系统升级通知',
    content: '系统将于2025年5月1日进行升级维护，届时系统将暂停使用4小时。',
    time: '2025-04-20'
  },
  {
    title: '新功能上线',
    content: '患者在线预约功能已上线，欢迎使用。',
    time: '2025-04-15'
  },
  {
    title: '节假日安排',
    content: '五一劳动节期间（5月1日-5月5日）门诊安排已更新，请查看详情。',
    time: '2025-04-10'
  }
])

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    // 获取患者数据
    const patients = await patientStore.fetchPatients()
    patientCount.value = patients.length
    
    // 获取医生数据
    const { data: doctors } = await doctorStore.fetchDoctors()
    doctorCount.value = doctors.length
    
    // 获取预约数据
    const appointments = await appointmentStore.fetchAppointments()
    appointmentCount.value = appointments.length
    
    // 处理最近预约数据
    recentAppointments.value = appointments
      .slice(0, 5)
      .map(appointment => ({
        ...appointment,
        patientName: appointment.patientName || '未知患者',
        doctorName: appointment.doctorName || '未知医生',
        appointmentTime: formatDateTime(appointment.appointmentTime || new Date()),
        status: appointment.status || '待确认'
      }))
  } catch (error) {
    console.error('获取首页数据失败:', error)
  } finally {
    loading.value = false
  }
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

// 页面导航
const navigateTo = (path) => {
  router.push(path)
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.welcome-section {
  text-align: center;
  margin-bottom: 30px;
}

.welcome-section h1 {
  font-size: 28px;
  color: #303133;
  margin-bottom: 10px;
}

.welcome-section p {
  font-size: 16px;
  color: #606266;
}

.dashboard-cards {
  margin-bottom: 30px;
}

.dashboard-card {
  height: 180px;
  cursor: pointer;
  transition: all 0.3s;
}

.dashboard-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-content {
  display: flex;
  height: 100%;
  align-items: center;
}

.card-icon {
  font-size: 48px;
  margin-right: 20px;
  color: #409EFF;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 15px;
  border-radius: 8px;
}

.card-info {
  flex: 1;
}

.card-info h2 {
  font-size: 20px;
  margin: 0 0 10px 0;
  color: #303133;
}

.card-info p {
  color: #606266;
  margin: 0 0 15px 0;
}

.card-count {
  display: flex;
  flex-direction: column;
}

.card-count span:first-child {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
}

.card-count span:last-child {
  font-size: 14px;
  color: #909399;
}

.dashboard-charts {
  margin-bottom: 20px;
}

.chart-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notice-list {
  padding: 0 10px;
}

.notice-item {
  padding: 15px 0;
  border-bottom: 1px solid #EBEEF5;
}

.notice-item:last-child {
  border-bottom: none;
}

.notice-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}

.notice-title .el-icon {
  color: #409EFF;
  margin-right: 8px;
}

.notice-content {
  color: #606266;
  margin-bottom: 8px;
  line-height: 1.5;
}

.notice-time {
  color: #909399;
  font-size: 12px;
}
</style>
