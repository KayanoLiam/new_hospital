<template>
  <div class="patient-list">
    <div class="page-title">
      <h2>患者管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon> 添加患者
      </el-button>
    </div>
    
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchForm.name" placeholder="输入患者姓名" clearable></el-input>
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
        v-loading="patientStore.loading"
        :data="filteredPatients"
        style="width: 100%"
        border
        stripe
        row-key="id"
        highlight-current-row>
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="gender" label="性别" width="80" align="center"></el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center"></el-table-column>
        <el-table-column prop="phone" label="电话" width="150"></el-table-column>
        <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
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
          v-if="filteredPatients.length > 10"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="filteredPatients.length"
          :page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange">
        </el-pagination>
      </div>
    </el-card>
    
    <!-- 添加/编辑患者对话框 -->
    <el-dialog
      :title="dialogTitle"
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePatientStore } from '../../stores/patient'
import { Plus, Search, Refresh, View, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const patientStore = usePatientStore()

// 搜索表单
const searchForm = ref({
  name: ''
})

// 分页相关
const pageSize = ref(10)
const currentPage = ref(1)

// 表单相关
const patientFormRef = ref(null)
const dialogVisible = ref(false)
const dialogTitle = ref('添加患者')
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

// 计算属性 - 过滤后的患者列表
const filteredPatients = computed(() => {
  if (!searchForm.value.name) {
    return patientStore.patients
  }
  return patientStore.patients.filter(p => 
    p.name.toLowerCase().includes(searchForm.value.name.toLowerCase())
  )
})

// 搜索相关方法
const handleSearch = () => {
  if (searchForm.value.name) {
    patientStore.fetchPatientsByName(searchForm.value.name)
  } else {
    patientStore.fetchPatients()
  }
}

const resetSearch = () => {
  searchForm.value.name = ''
  patientStore.fetchPatients()
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
    id: null,
    name: '',
    gender: '男',
    age: 30,
    phone: '',
    address: '',
    medicalHistory: ''
  }
  if (patientFormRef.value) {
    patientFormRef.value.resetFields()
  }
}

// 操作相关方法
const handleAdd = () => {
  dialogTitle.value = '添加患者'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑患者'
  form.value = { ...row }
  dialogVisible.value = true
}

const handleViewDetail = (id) => {
  router.push(`/patients/${id}`)
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('此操作将永久删除该患者信息, 是否继续?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await patientStore.deletePatient(id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  }
}

const submitForm = () => {
  if (!patientFormRef.value) return
  
  patientFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (form.value.id) {
          // 更新
          await patientStore.updatePatient(form.value)
        } else {
          // 新增
          await patientStore.createPatient(form.value)
        }
        dialogVisible.value = false
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
  patientStore.fetchPatients()
})
</script>

<style scoped>
.patient-list {
  padding: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-form {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.patient-form {
  max-width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
