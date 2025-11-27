import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'  // 修改导入路径
import LoginView from '../views/LoginView.vue'  // 修改导入路径
import RegisterView from '../views/RegisterView.vue'  // 修改导入路径
import AppointmentView from '../views/AppointmentView.vue' // 导入预约视图
const AppointmentRecordsView = () => import('../views/AppointmentRecordsView.vue')
import DoctorDashboardView from '../views/DoctorDashboardView.vue'
const DoctorWorkView = () => import('../views/DoctorWorkView.vue')
import AdminDashboardView from '../views/AdminDashboardView.vue' // 导入管理员视图
const PendingSchedulesView = () => import('../views/PendingSchedulesView.vue') // 恢复动态导入
const LeaveRequestsView = () => import('../views/LeaveRequestsView.vue') // 恢复动态导入

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,  // 更新组件引用
        meta: { requiresAuth: true }
    },
    {
        path: '/doctor',
        name: 'DoctorDashboard',
        component: DoctorDashboardView,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },
    {
        path: '/doctor/work',
        name: 'DoctorWork',
        component: DoctorWorkView,
        meta: { requiresAuth: true, roles: ['doctor'] }
    },
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: AdminDashboardView,
        meta: { requiresAuth: true, roles: ['admin'] }, // 假设只有管理员可以访问
        children: [
            { path: 'dashboard', name: 'AdminDashboardHome', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'users', name: 'AdminUsers', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'roles', name: 'AdminRoles', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'doctors', name: 'AdminDoctors', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'departments', name: 'AdminDepartments', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'schedules', name: 'AdminSchedules', component: PendingSchedulesView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'appointments', name: 'AdminAppointments', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'logs', name: 'AdminLogs', component: AdminDashboardView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'pending-schedules', name: 'AdminPendingSchedules', component: PendingSchedulesView, meta: { requiresAuth: true, roles: ['admin'] } },
            { path: 'leave-requests', name: 'AdminLeaveRequests', component: LeaveRequestsView, meta: { requiresAuth: true, roles: ['admin'] } },
        ]
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,  // 更新组件引用
        meta: { requiresAuth: false }
    },
    {
        path: '/register',
        name: 'Register',
        component: RegisterView,  // 更新组件引用
        meta: { requiresAuth: false }
    },
    {
        path: '/appointments',
        name: 'Appointments',
        component: AppointmentView,
        meta: { requiresAuth: true }
    },
    {
        path: '/appointment-records',
        name: 'AppointmentRecords',
        component: AppointmentRecordsView,
        meta: { requiresAuth: true }
    }
]
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.path} to ${to.path}`);
    const isAuthenticated = !!(sessionStorage.getItem('token') || localStorage.getItem('token'))
    let role = null
    try {
        const u = sessionStorage.getItem('user') || localStorage.getItem('user')
        if (u) role = JSON.parse(u).role
    } catch (e) {
        role = null
    }

    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
        if (role === 'doctor') next('/doctor')
        else next('/')
    } else if (to.meta.roles && (!role || !to.meta.roles.includes(role))) {
        next('/')
    } else {
        next()
    }
})

export default router