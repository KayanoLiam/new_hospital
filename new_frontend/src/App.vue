<template>
  <div class="app-container">
    <el-config-provider :locale="zhCn">
      <el-container class="main-container">
        <!-- 侧边栏 -->
        <el-aside width="220px" class="sidebar">
          <div class="logo-container">
            <h1 class="logo">医院管理系统</h1>
          </div>
          <el-menu
            :router="true"
            :default-active="activeMenu"
            class="sidebar-menu"
            background-color="#001529"
            text-color="#fff"
            active-text-color="#409EFF">
            <el-menu-item index="/">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </el-menu-item>
            <el-menu-item index="/patients">
              <el-icon><User /></el-icon>
              <span>患者管理</span>
            </el-menu-item>
            <el-menu-item index="/doctors">
              <el-icon><UserFilled /></el-icon>
              <span>医生管理</span>
            </el-menu-item>
            <el-menu-item index="/appointments">
              <el-icon><Calendar /></el-icon>
              <span>预约管理</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        
        <!-- 主内容区 -->
        <el-container class="content-container">
          <!-- 顶部导航 -->
          <el-header class="main-header">
            <div class="header-left">
              <el-icon class="menu-toggle" @click="toggleSidebar"><Menu /></el-icon>
              <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                <el-breadcrumb-item v-if="currentRoute">{{ currentRoute }}</el-breadcrumb-item>
              </el-breadcrumb>
            </div>
            <div class="header-right">
              <el-dropdown>
                <span class="user-dropdown">
                  管理员 <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item>个人信息</el-dropdown-item>
                    <el-dropdown-item>设置</el-dropdown-item>
                    <el-dropdown-item divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>
          
          <!-- 内容区 -->
          <el-main class="main-content">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </el-main>
          
          <!-- 页脚 -->
          <el-footer class="main-footer">
            医院管理系统 &copy; {{ currentYear }}
          </el-footer>
        </el-container>
      </el-container>
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { HomeFilled, User, UserFilled, Calendar, Menu, ArrowDown } from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 路由相关
const route = useRoute()
const currentRoute = computed(() => {
  const routeMap = {
    '/': '首页',
    '/patients': '患者管理',
    '/doctors': '医生管理',
    '/appointments': '预约管理'
  }
  
  // 处理详情页
  if (route.path.includes('/patients/')) return '患者详情'
  if (route.path.includes('/doctors/')) return '医生详情'
  if (route.path.includes('/appointments/')) return '预约详情'
  
  return routeMap[route.path] || ''
})

// 当前激活的菜单
const activeMenu = computed(() => {
  // 处理详情页的菜单高亮
  if (route.path.includes('/patients/')) return '/patients'
  if (route.path.includes('/doctors/')) return '/doctors'
  if (route.path.includes('/appointments/')) return '/appointments'
  
  return route.path
})

// 侧边栏折叠状态
const sidebarCollapsed = ref(false)
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// 当前年份
const currentYear = computed(() => new Date().getFullYear())

// 页面加载时的处理
onMounted(() => {
  // 可以在这里添加初始化逻辑
})
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
}

.main-container {
  height: 100%;
}

/* 侧边栏样式 */
.sidebar {
  background-color: #001529;
  color: white;
  height: 100%;
  transition: width 0.3s;
  overflow: hidden;
}

.logo-container {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  color: white;
  font-size: 18px;
  margin: 0;
  white-space: nowrap;
}

.sidebar-menu {
  border-right: none;
}

/* 头部样式 */
.main-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
}

.menu-toggle {
  font-size: 20px;
  margin-right: 20px;
  cursor: pointer;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 内容区样式 */
.content-container {
  flex-direction: column;
  height: 100%;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 页脚样式 */
.main-footer {
  text-align: center;
  padding: 15px 0;
  color: #999;
  font-size: 14px;
  background-color: #f0f2f5;
  border-top: 1px solid #e8e8e8;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

/* 全局卡片样式 */
.el-card {
  margin-bottom: 20px;
  border-radius: 4px;
}

/* 全局表格样式 */
.el-table th {
  background-color: #f5f7fa !important;
}

/* 全局表单样式 */
.form-container {
  max-width: 800px;
  margin: 0 auto;
}

/* 页面标题样式 */
.page-title {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}
</style>
