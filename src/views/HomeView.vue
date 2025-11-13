<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header">
        <div class="logo-container">
          <img src="@/assets/logo.png" alt="Logo" class="logo"/>
          <span class="app-title">智慧医疗服务平台</span>
        </div>
        <div class="header-right">
          <!-- 可以放置其他导航项或用户中心入口 -->
        </div>
      </el-header>
      <el-main class="main-content">
        <div class="hero-section">
          <h1>欢迎来到智慧医疗服务平台</h1>
          <p class="subtitle">您的健康，我们守护</p>
          <div class="button-group">
            <el-button type="primary" size="large" @click="goToScheduleSearch">查询可预约班次</el-button>
            <el-button type="success" size="large" @click="goToAppointmentBooking">进行预约</el-button>
            <el-button type="info" size="large" @click="goToAppointmentRecords">查询预约记录</el-button>
          </div>
        </div>

        <div class="features-section">
          <h2 class="section-title">我们的服务亮点</h2>
          <el-row :gutter="20" class="feature-cards">
            <el-col :span="8">
              <el-card class="feature-card">
                <i class="icon el-icon-first-aid-kit"></i>
                <h3>专家预约</h3>
                <p>轻松预约全国知名专家，享受专业医疗服务。</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="feature-card">
                <i class="icon el-icon-chat-dot-round"></i>
                <h3>在线咨询</h3>
                <p>足不出户与医生在线交流，获取健康建议。</p>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="feature-card">
                <i class="icon el-icon-files"></i>
                <h3>健康档案</h3>
                <p>一站式管理个人健康数据，随时随地查阅。</p>
              </el-card>
            </el-col>
          </el-row>
        </div>

      </el-main>
      <el-footer class="footer">
        © 2025 智慧医疗服务平台. All rights reserved.
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToScheduleSearch = () => {
  ElMessage.info('跳转到查询可预约班次页面')
  router.push('/appointments')
}

const goToAppointmentBooking = () => {
  ElMessage.info('跳转到进行预约页面')
  router.push('/appointments')
}

const goToAppointmentRecords = () => {
  ElMessage.info('跳转到查询预约记录页面')
  router.push('/appointment-records')
}
</script>

<style scoped>
.common-layout {
  min-height: 100vh; /* 使用 min-height */
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(to right, #409EFF, #79BBFF);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 100; /* 确保在最上层 */
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  margin-right: 10px;
}

.app-title {
  font-size: 1.8em;
  font-weight: bold;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #f0f2f5 0%, #e0e6ed 100%);
  color: #333;
  padding: 40px 20px; /* 增加整体内边距 */
}

.hero-section {
  text-align: center;
  margin-bottom: 60px; /* 增加底部外边距 */
  padding: 60px 20px;
  background: #fff; /* 白色背景 */
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  width: 100%;
}

.hero-section h1 {
  font-size: 3.8em;
  color: #0056b3;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-section .subtitle {
  font-size: 1.6em;
  margin-bottom: 50px;
  color: #666;
}

.button-group {
  display: flex;
  gap: 30px; /* 调整按钮间距 */
  justify-content: center;
}

.el-button--large {
  padding: 20px 40px;
  font-size: 1.3em;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.el-button--large:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.features-section {
  width: 100%;
  max-width: 1200px;
  margin-bottom: 40px;
}

.section-title {
  font-size: 2.5em;
  color: #0056b3;
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.section-title::after {
  content: '';
  display: block;
  width: 80px;
  height: 4px;
  background-color: #007bff;
  margin: 15px auto 0;
  border-radius: 2px;
}

.feature-cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-card {
  text-align: center;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
}

.feature-card .icon {
  font-size: 4em;
  color: #007bff;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.8em;
  color: #333;
  margin-bottom: 15px;
}

.feature-card p {
  font-size: 1.1em;
  color: #777;
  line-height: 1.6;
}

.footer {
  background-color: #2c3e50;
  color: white;
  text-align: center;
  padding: 20px 0;
  font-size: 1em;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}
</style>