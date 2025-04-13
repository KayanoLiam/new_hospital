import { createRouter, createWebHistory } from 'vue-router'

// 路由懒加载
const Home = () => import('../views/Home.vue')
const PatientList = () => import('../views/patient/PatientList.vue')
const PatientDetail = () => import('../views/patient/PatientDetail.vue')
const DoctorList = () => import('../views/doctor/DoctorList.vue')
const DoctorDetail = () => import('../views/doctor/DoctorDetail.vue')
const AppointmentList = () => import('../views/appointment/AppointmentList.vue')
const AppointmentDetail = () => import('../views/appointment/AppointmentDetail.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/patients',
    name: 'PatientList',
    component: PatientList,
    meta: { title: '患者管理' }
  },
  {
    path: '/patients/:id',
    name: 'PatientDetail',
    component: PatientDetail,
    meta: { title: '患者详情' }
  },
  {
    path: '/doctors',
    name: 'DoctorList',
    component: DoctorList,
    meta: { title: '医生管理' }
  },
  {
    path: '/doctors/:id',
    name: 'DoctorDetail',
    component: DoctorDetail,
    meta: { title: '医生详情' }
  },
  {
    path: '/appointments',
    name: 'AppointmentList',
    component: AppointmentList,
    meta: { title: '预约管理' }
  },
  {
    path: '/appointments/:id',
    name: 'AppointmentDetail',
    component: AppointmentDetail,
    meta: { title: '预约详情' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// 全局前置守卫 - 设置页面标题
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 医院管理系统` : '医院管理系统'
  next()
})

export default router
