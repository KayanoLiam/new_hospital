<template>
  <div class="appointment-list">
    <div class="page-title">
      <h2>预约管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加预约
      </el-button>
    </div>
    
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchForm.patientName" placeholder="输入患者姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="医生姓名">
          <el-input v-model="searchForm.doctorName" placeholder="输入医生姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="待确认" value="待确认"></el-option>
            <el-option label="已确认" value="已确认"></el-option>
            <el-option label="已完成" value="已完成"></el-option>
            <el-option label="已取消" value="已取消"></el-option>
            <el-option label="已过期" value="已过期"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="searchForm.date"
            type="date"
            placeholder="选择日期"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <el-card>
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部预约" name="all"></el-tab-pane>
        <el-tab-pane label="待确认" name="pending"></el-tab-pane>
        <el-tab-pane label="已确认" name="confirmed"></el-tab-pane>
        <el-tab-pane label="已完成" name="completed"></el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
      </el-tabs>
      
      <el-table
        v-loading="appointmentStore.loading"
        :data="filteredAppointments"
        style="width: 100%"
        border
        stripe
        row-key="id"
        highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="patientName" label="患者姓名" width="120"></el-table-column>
        <el-table-column prop="doctorName" label="医生姓名" width="120"></el-table-column>
        <el-table-column prop="department" label="科室" width="120"></el-table-column>
        <el-table-column label="预约时间" min-width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.appointmentTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleViewDetail(scope.row.id)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button
              size="small"
              type="success"
              @click="handleUpdateStatus(scope.row.id, '已确认')"
              v-if="scope.row.status === '待确认'">
              确认
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleUpdateStatus(scope.row.id, '已完成')"
              v-if="scope.row.status === '已确认'">
              完成
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleCancel(scope.row.id)"
              v-if="scope.row.status === '待确认' || scope.row.status === '已确认'">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-if="filteredAppointments.length > 10"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredAppointments.length"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加预约对话框 -->
    <el-dialog
      title="添加预约"
      v-model="dialogVisible"
      width="600px"
      destroy-on-close>
      <el-form
        :model="form"
        :rules="rules"
        ref="appointmentFormRef"
        label-width="100px"
        class="appointment-form">
        <el-form-item label="患者" prop="patientId">
          <el-select
            v-model="form.patientId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入患者姓名搜索"
            :remote-method="remoteSearchPatients"
            :loading="patientLoading"
            style="width: 100%;">
            <el-option
              v-for="patient in patientOptions"
              :key="patient.id"
              :label="patient.name"
              :value="patient.id">
              <span>{{ patient.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ patient.phone }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="医生" prop="doctorId">
          <el-select
            v-model="form.doctorId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入医生姓名搜索"
            :remote-method="remoteSearchDoctors"
            :loading="doctorLoading"
            @change="handleDoctorChange"
            style="width: 100%;">
            <el-option
              v-for="doctor in doctorOptions"
              :key="doctor.id"
              :label="`${doctor.name} (${doctor.department})`"
              :value="doctor.id">
              <span>{{ doctor.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">
                {{ doctor.department }} | {{ doctor.title }}
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="预约时间" prop="appointmentTime">
          <el-date-picker
            v-model="form.appointmentTime"
            type="datetime"
            placeholder="选择预约时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="预约原因" prop="reason">
          <el-input
            type="textarea"
            v-model="form.reason"
            placeholder="请输入预约原因"
            rows="3">
          </el-input>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            type="textarea"
            v-model="form.remark"
            placeholder="请输入备注"
            rows="2">
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
import { useRouter } from 'vue-router'
import { useAppointmentStore } from '../../stores/appointment'
import { usePatientStore } from '../../stores/patient'
import { useDoctorStore } from '../../stores/doctor'
import { Plus, Search, Refresh, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const appointmentStore = useAppointmentStore()
const patientStore = usePatientStore()
const doctorStore = useDoctorStore()

// 搜索表单
const searchForm = ref({
  patientName: '',
  doctorName: '',
  status: '',
  date: null
})

// 当前激活的标签页
const activeTab = ref('all')

// 分页相关
const pageSize = ref(10)
const currentPage = ref(1)

// 表单相关
const appointmentFormRef = ref(null)
const dialogVisible = ref(false)
const submitting = ref(false)
const form = ref({
  patientId: null,
  doctorId: null,
  appointmentTime: null,
  reason: '',
  remark: '',
  status: '待确认'
})

// 患者和医生选项
const patientOptions = ref([])
const doctorOptions = ref([])
const patientLoading = ref(false)
const doctorLoading = ref(false)

// 表单验证规则
const rules = {
  patientId: [
    { required: true, message: '请选择患者', trigger: 'change' }
  ],
  doctorId: [
    { required: true, message: '请选择医生', trigger: 'change' }
  ],
  appointmentTime: [
    { required: true, message: '请选择预约时间', trigger: 'change' }
  ]
}

// 计算属性 - 过滤后的预约列表
const filteredAppointments = computed(() => {
  let result = appointmentStore.appointments
  
  // 根据标签页过滤
  if (activeTab.value !== 'all') {
    const statusMap = {
      'pending': '待确认',
      'confirmed': '已确认',
      'completed': '已完成',
      'cancelled': '已取消'
    }
    result = result.filter(a => a.status === statusMap[activeTab.value])
  }
  
  // 根据搜索条件过滤
  if (searchForm.value.patientName) {
    result = result.filter(a => 
      a.patientName && a.patientName.toLowerCase().includes(searchForm.value.patientName.toLowerCase())
    )
  }
  
  if (searchForm.value.doctorName) {
    result = result.filter(a => 
      a.doctorName && a.doctorName.toLowerCase().includes(searchForm.value.doctorName.toLowerCase())
    )
  }
  
  if (searchForm.value.status) {
    result = result.filter(a => a.status === searchForm.value.status)
  }
  
  if (searchForm.value.date) {
    const searchDate = new Date(searchForm.value.date)
    searchDate.setHours(0, 0, 0, 0)
    
    result = result.filter(a => {
      if (!a.appointmentTime) return false
      const appointmentDate = new Date(a.appointmentTime)
      appointmentDate.setHours(0, 0, 0, 0)
      return appointmentDate.getTime() === searchDate.getTime()
    })
  }
  
  return result
})

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

// 搜索相关方法
const handleSearch = () => {
  // 本地过滤，不需要额外操作
}

const resetSearch = () => {
  searchForm.value = {
    patientName: '',
    doctorName: '',
    status: '',
    date: null
  }
}

// 标签页切换
const handleTabClick = () => {
  // 本地过滤，不需要额外操作
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 表单相关方法
const resetForm = () => {
  form.value = {
    patientId: null,
    doctorId: null,
    appointmentTime: new Date(),
    reason: '',
    remark: '',
    status: '待确认'
  }
  if (appointmentFormRef.value) {
    appointmentFormRef.value.resetFields()
  }
}

// 远程搜索患者
const remoteSearchPatients = async (query) => {
  if (query) {
    patientLoading.value = true
    try {
      const patients = await patientStore.fetchPatientsByName(query)
      patientOptions.value = patients
    } catch (error) {
      console.error('搜索患者失败:', error)
    } finally {
      patientLoading.value = false
    }
  } else {
    patientOptions.value = []
  }
}

// 远程搜索医生
const remoteSearchDoctors = async (query) => {
  if (query) {
    doctorLoading.value = true
    try {
      const { data } = await doctorStore.searchDoctors(query)
      doctorOptions.value = data
    } catch (error) {
      console.error('搜索医生失败:', error)
    } finally {
      doctorLoading.value = false
    }
  } else {
    doctorOptions.value = []
  }
}

// 医生选择变更
const handleDoctorChange = (doctorId) => {
  const selectedDoctor = doctorOptions.value.find(d => d.id === doctorId)
  if (selectedDoctor) {
    form.value.department = selectedDoctor.department
  }
}

// 操作相关方法
const handleAdd = () => {
  resetForm()
  dialogVisible.value = true
}

const handleViewDetail = (id) => {
  router.push(`/appointments/${id}`)
}

const handleUpdateStatus = async (id, status) => {
  try {
    await ElMessageBox.confirm(`确定要将预约状态更新为"${status}"吗?`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await appointmentStore.updateAppointmentStatus(id, status)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('更新预约状态失败:', error)
    }
  }
}

const handleCancel = async (id) => {
  try {
    await ElMessageBox.confirm('确定要取消该预约吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await appointmentStore.cancelAppointment(id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消预约失败:', error)
    }
  }
}

const submitForm = () => {
  if (!appointmentFormRef.value) return
  
  appointmentFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 获取患者和医生信息
        const patient = patientOptions.value.find(p => p.id === form.value.patientId)
        const doctor = doctorOptions.value.find(d => d.id === form.value.doctorId)
        
        // 构建预约数据
        const appointmentData = {
          ...form.value,
          patientName: patient ? patient.name : '',
          doctorName: doctor ? doctor.name : '',
          department: doctor ? doctor.department : ''
        }
        
        await appointmentStore.createAppointment(appointmentData)
        dialogVisible.value = false
      } catch (error) {
        console.error('创建预约失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  appointmentStore.fetchAppointments()
})
</script>

<style scoped>
.appointment-list {
  padding: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.appointment-form {
  max-width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
