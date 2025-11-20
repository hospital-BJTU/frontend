<template>
  <div class="doctor-work">
    <div class="header">
      <h1>医生工作台 · 叫号</h1>
      <div class="user-info">
        <el-tag type="success">{{ username }}</el-tag>
        <el-tag type="warning">医生</el-tag>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="10">
        <el-card class="card">
          <div class="card-title">预约操作面板</div>
          <div class="card-content">
            <el-descriptions :column="2" border v-if="schedule">
              <el-descriptions-item label="日期">{{ schedule.scheduleDate }}</el-descriptions-item>
              <el-descriptions-item label="班次">{{ schedule.timeSlot }}</el-descriptions-item>
              <el-descriptions-item label="科室">{{ schedule.departmentName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="余号">{{ schedule.availableCount }}/{{ schedule.maxCount }}</el-descriptions-item>
            </el-descriptions>
            <el-input v-model="apptId" placeholder="输入预约ID" />
            <div class="actions">
              <el-button type="success" :disabled="!isDoctor || !apptId" @click="handleCall">开始叫号</el-button>
              <el-button type="danger" :disabled="!isDoctor || !apptId" @click="handleMiss">过号处理</el-button>
              <el-button type="info" :disabled="!isDoctor || !apptId" @click="handleComplete">接诊完成</el-button>
            </div>
            <div v-if="result">
              <el-descriptions title="操作结果" :column="1" border>
                <el-descriptions-item label="预约ID">{{ result.appointmentId }}</el-descriptions-item>
                <el-descriptions-item label="状态">{{ result.status }}（{{ result.statusDescription }}）</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="14">
        <el-card class="card">
          <div class="card-title">当前队列</div>
          <div class="counts" v-if="counts">
            <el-tag type="warning">待就诊: {{ counts.pending }}</el-tag>
            <el-tag type="info">已叫号: {{ counts.called }}</el-tag>
            <el-tag type="danger">已过号: {{ counts.missed }}</el-tag>
            <el-tag type="success">已完成: {{ counts.completed }}</el-tag>
          </div>
          <el-table :data="queue" empty-text="暂无队列" @row-click="onRowClick">
            <el-table-column prop="appointmentId" label="预约ID" min-width="100" />
            <el-table-column prop="patientName" label="患者" min-width="120" />
            <el-table-column prop="serialNumber" label="序号" min-width="80" />
            <el-table-column label="状态" min-width="100">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="appointmentTime" label="提交时间" min-width="160">
              <template #default="{ row }">
                <span>{{ formatDateTime(row.appointmentTime) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { doctorCallAppointment, doctorMissAppointment, doctorCompleteAppointment, getDoctorQueue } from '@/api/appointment'

const router = useRouter()
const route = useRoute()
const username = ref('')
const isDoctor = ref(false)
const apptId = ref('')
const result = ref(null)
const schedule = ref(null)
const counts = ref(null)
const queue = ref([])

const loadQueue = async () => {
  try {
    const date = route.query.date
    const timeSlot = route.query.timeSlot
    const res = await getDoctorQueue({ date, timeSlot })
    if (res && res.data && res.data.schedule) {
      schedule.value = res.data.schedule
      counts.value = res.data.counts
      queue.value = res.data.queue
    } else {
      schedule.value = null
      counts.value = null
      queue.value = []
    }
  } catch (e) {
    schedule.value = null
    counts.value = null
    queue.value = []
  }
}

const handleCall = async () => {
  try {
    const res = await doctorCallAppointment(apptId.value)
    ElMessage.success(res.message)
    result.value = res.data
    await loadQueue()
  } catch (e) {
    ElMessage.error(e.message || '叫号失败')
  }
}

const handleMiss = async () => {
  try {
    const res = await doctorMissAppointment(apptId.value)
    ElMessage.success(res.message)
    result.value = res.data
    await loadQueue()
  } catch (e) {
    ElMessage.error(e.message || '过号失败')
  }
}

const handleComplete = async () => {
  try {
    const res = await doctorCompleteAppointment(apptId.value)
    ElMessage.success(res.message)
    result.value = res.data
    await loadQueue()
  } catch (e) {
    ElMessage.error(e.message || '接诊完成失败')
  }
}

const statusTagType = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'called': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'default'
    case 'missed': return 'danger'
    default: return ''
  }
}

const statusText = (status) => {
  switch (status) {
    case 'pending': return '待就诊'
    case 'called': return '已叫号'
    case 'completed': return '已完成'
    case 'cancelled': return '已取消'
    case 'missed': return '已过号'
    default: return status || '-'
  }
}

const formatDateTime = (dt) => {
  if (!dt) return '-'
  const d = new Date(dt)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

const onRowClick = (row) => {
  apptId.value = row.appointmentId
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (e) { ElMessage.info('已取消退出') }
}

onMounted(async () => {
  try {
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (raw) {
      const u = JSON.parse(raw)
      username.value = u.username || ''
      isDoctor.value = u.role === 'doctor'
    }
  } catch (e) { username.value = '' }
  await loadQueue()
})
</script>

<style scoped>
.doctor-work {
  padding: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.user-info { display: flex; gap: 8px; }
.card { min-height: 280px; }
.card-title { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
.card-content { display: flex; flex-direction: column; gap: 12px; }
.actions { display: flex; gap: 8px; }
.counts { display: flex; gap: 8px; margin-bottom: 8px; }
</style>