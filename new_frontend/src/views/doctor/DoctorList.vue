<template>
  <div class="doctor-list">
    <div class="page-title">
      <h2>医生管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加医生
      </el-button>
    </div>
    
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="医生姓名">
          <el-input v-model="searchForm.keyword" placeholder="输入医生姓名" clearable></el-input>
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="searchForm.department" placeholder="选择科室" clearable>
            <el-option
              v-for="item in departmentOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
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
      <el-table
        v-loading="doctorStore.loading"
        :data="doctorStore.doctors"
        style="width: 100%"
        border
        stripe
        row-key="id"
        highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80" align="center"></el-table-column>
        <el-table-column prop="department" label="科室" width="120"></el-table-column>
        <el-table-column prop="title" label="职称" width="120"></el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱" show-overflow-tooltip></el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleViewDetail(scope.row.id)">
              <el-icon><View /></el-icon> 查看
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(scope.row)">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row.id)">
              <el-icon><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-if="doctorStore.totalDoctors > 10"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="doctorStore.totalDoctors"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑医生对话框 -->
    <el-dialog
      :title="dialogTitle"
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDoctorStore } from '../../stores/doctor'
import { Plus, Search, Refresh, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const doctorStore = useDoctorStore()

// 搜索表单
const searchForm = ref({
  keyword: '',
  department: ''
})

// 分页相关
const pageSize = ref(10)
const currentPage = ref(1)

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

// 表单相关
const doctorFormRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('添加医生')
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

// 搜索相关方法
const handleSearch = () => {
  const query = {}
  
  if (searchForm.value.keyword) {
    query.keyword = searchForm.value.keyword
  }
  
  if (searchForm.value.department) {
    query.department = searchForm.value.department
  }
  
  doctorStore.fetchDoctors(query)
}

const resetSearch = () => {
  searchForm.value.keyword = ''
  searchForm.value.department = ''
  doctorStore.fetchDoctors()
}

// 分页相关方法
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchDoctors()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchDoctors()
}

// 获取医生列表
const fetchDoctors = () => {
  const query = {
    page: currentPage.value - 1,
    size: pageSize.value
  }
  
  if (searchForm.value.keyword) {
    query.keyword = searchForm.value.keyword
  }
  
  if (searchForm.value.department) {
    query.department = searchForm.value.department
  }
  
  doctorStore.fetchDoctors(query)
}

// 表单相关方法
const resetForm = () => {
  form.value = {
    id: null,
    name: '',
    gender: '男',
    department: '',
    title: '',
    phone: '',
    email: '',
    introduction: ''
  }
  if (doctorFormRef.value) {
    doctorFormRef.value.resetFields()
  }
}

// 操作相关方法
const handleAdd = () => {
  dialogTitle.value = '添加医生'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑医生'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleViewDetail = (id) => {
  router.push(`/doctors/${id}`)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该医生信息, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await doctorStore.deleteDoctor(id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const submitForm = () => {
  if (!doctorFormRef.value) return
  
  doctorFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (form.value.id) {
          // 更新
          await doctorStore.updateDoctor(form.value)
        } else {
          // 新增
          await doctorStore.createDoctor(form.value)
        }
        dialogVisible.value = false
        // 重新获取列表
        fetchDoctors()
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

// 页面加载时获取数据
onMounted(() => {
  doctorStore.fetchDoctors()
})
</script>

<style scoped>
.doctor-list {
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

.doctor-form {
  max-width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
