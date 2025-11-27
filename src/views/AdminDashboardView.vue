<template>
  <el-container class="admin-dashboard-container">
    <el-aside width="200px" class="admin-sidebar">
      <el-menu
        default-active="1"
        class="el-menu-vertical-demo"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Menu /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-sub-menu index="2">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">所有用户</el-menu-item>
          <el-menu-item index="/admin/roles">角色管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="/admin/doctors">
          <el-icon><Cherry /></el-icon>
          <span>医生管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/departments">
          <el-icon><OfficeBuilding /></el-icon>
          <span>科室管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/schedules">
          <el-icon><Calendar /></el-icon>
          <span>排班管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/pending-schedules">
          <el-icon><Clock /></el-icon>
          <span>待审核排班</span>
        </el-menu-item>
        <el-menu-item index="/admin/leave-requests">
          <el-icon><DocumentDelete /></el-icon>
          <span>请假请求</span>
        </el-menu-item>
        <el-menu-item index="/admin/appointments">
          <el-icon><List /></el-icon>
          <span>预约管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/logs">
          <el-icon><Document /></el-icon>
          <span>日志管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="admin-header">
        <h1>管理员面板</h1>
        <div class="header-right">
          <el-button type="danger" @click="handleLogout">退出登录</el-button>
        </div>
      </el-header>
      <el-main class="admin-main-content">
        <router-view></router-view>
        <!-- <div>测试路由视图是否工作</div> -->
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import {
  Menu,
  User,
  Cherry,
  OfficeBuilding,
  Calendar,
  List,
  Document,
  Clock,
  DocumentDelete
} from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'; // 导入 onMounted

console.log('AdminDashboardView setup'); // 新增的调试日志

const router = useRouter()

// const handleSelect = (index) => {
//   console.log('Selected menu item:', index);
//   router.push(index);
// };

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (e) {
    ElMessage.info('已取消退出')
  }
}

onMounted(() => {
  console.log('AdminDashboardView mounted');
});
</script>

<style scoped>
.admin-dashboard-container {
  height: 100vh;
  height: 100dvh;
}

.admin-sidebar {
  background-color: #545c64;
  color: #fff;
}

.el-menu-vertical-demo {
  height: 100%;
  border-right: none;
}

.admin-header {
  background-color: #ffffff;
  color: #333;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  justify-content: space-between;
}

.header-right {
  display: flex;
  align-items: center;
}

.admin-header h1 {
  margin: 0;
  font-size: 24px;
}

.admin-main-content {
  background-color: #f0f2f5;
  padding: 20px;
}

.welcome-card {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.welcome-card h2 {
  color: #333;
  margin-bottom: 15px;
}

.welcome-card p {
  color: #666;
  font-size: 16px;
}
</style>
