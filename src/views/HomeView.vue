<template>
  <div class="home-page">
    <h1>欢迎来到智慧医疗服务平台</h1>
    <p>请选择您需要办理的业务：</p>
    <div class="button-group">
      <el-button type="primary" @click="goToScheduleSearch">查询可预约班次</el-button>
      <el-button type="success" @click="goToAppointmentBooking">进行预约</el-button>
      <el-button type="info" @click="goToAppointmentRecords">查询预约记录</el-button>
    </div>
  </div>
</template>

<script setup>
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router' // 导入 useRouter

const router = useRouter() // 在顶层获取 router 实例

const goToScheduleSearch = () => {
  ElMessage.info('跳转到查询可预约班次页面')
  router.push('/appointments') // 导航到预约页面
}

const goToAppointmentBooking = () => {
  ElMessage.info('跳转到进行预约页面')
  router.push('/appointments') // 导航到预约页面
}

const goToAppointmentRecords = () => {
  ElMessage.info('跳转到查询预约记录页面')
  router.push('/appointment-records') // 导航到预约记录页面
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
  background-color: #f0f2f5;
  color: #333;
}

h1 {
  font-size: 2.5em;
  color: #007bff;
  margin-bottom: 20px;
}

p {
  font-size: 1.2em;
  margin-bottom: 30px;
}

.button-group {
  display: flex;
  gap: 20px;
}

.el-button {
  padding: 15px 30px;
  font-size: 1.1em;
  border-radius: 8px;
}
</style>