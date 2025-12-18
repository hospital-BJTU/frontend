<template>
  <div class="doctor-dashboard">
    <div class="header">
      <h1>医生工作台</h1>
      <div class="user-info">
        <el-tag type="success">{{ username }}</el-tag>
        <el-tag type="warning">医生</el-tag>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :span="16">
        <el-card class="card">
          <div class="card-title">排班日历</div>
          <div class="card-content">
            <el-calendar v-model="calendarDate">
              <template #header>
                <div class="cal-header">
                  <span class="month-text">{{ formatMonth(calendarDate) }}</span>
                  <div class="header-actions">
                    <el-button size="small" @click="toToday">今天</el-button>
                    <el-button size="small" @click="prevMonth">上一月</el-button>
                    <el-button size="small" @click="nextMonth">下一月</el-button>
                  </div>
                </div>
              </template>
              <template #date-cell="{ data }">
                <div class="date-cell">
                  <div class="date-number">{{ data.day.split('-')[2] }}</div>
                  <div class="slot-tags" v-if="slotMap[data.day]">
                    <el-tag :type="slotTagType(data.day,'AM')" size="small" v-if="slotExists(data.day,'AM')" :class="slotPending(data.day,'AM') ? 'grey-tag' : ''" @click.stop="onSlotClick(data.day,'AM')">AM</el-tag>
                    <el-tag :type="slotTagType(data.day,'PM')" size="small" v-if="slotExists(data.day,'PM')" :class="slotPending(data.day,'PM') ? 'grey-tag' : ''" @click.stop="onSlotClick(data.day,'PM')">PM</el-tag>
                  </div>
                </div>
              </template>
            </el-calendar>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="card">
          <div class="card-title">班次信息</div>
          <div class="card-content">
            <div v-if="selectedSchedule">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="日期">{{ selectedSchedule.scheduleDate }}</el-descriptions-item>
                <el-descriptions-item label="班次">{{ selectedSchedule.timeSlot }}</el-descriptions-item>
                <el-descriptions-item label="科室">{{ selectedSchedule.departmentName }}</el-descriptions-item>
                <el-descriptions-item label="余号">{{ selectedSchedule.availableCount }}/{{ selectedSchedule.maxCount }}</el-descriptions-item>
              </el-descriptions>
              <div class="actions">
                <el-button type="warning" :disabled="!isDoctor || !selectedSchedule" @click="openLeaveDialog">申请请假</el-button>
                <el-button type="primary" :disabled="!isDoctor || !selectedSchedule" @click="startWork">开始上班</el-button>
              </div>
            </div>
            <div v-else>
              <el-alert title="请选择有排班的日期/班次" type="info" show-icon />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" v-if="working" style="margin-top: 16px;">
      <el-col :span="12">
        <el-card class="card">
          <div class="card-title">预约操作面板</div>
          <div class="card-content">
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
      <el-col :span="12">
        <el-card class="card queue-section">
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

    <el-dialog v-model="leaveDialogVisible" title="申请请假" width="500px">
      <el-input v-model="leaveReason" type="textarea" rows="4" placeholder="请输入请假原因" />
      <template #footer>
        <el-button @click="leaveDialogVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedSchedule" @click="submitLeave">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { doctorCallAppointment, doctorMissAppointment, doctorCompleteAppointment, getDoctorQueue, getDoctorScheduledDates, getDoctorScheduleDetailsByDate, requestScheduleLeave } from '@/api/appointment'

const router = useRouter()
const username = ref('')
const isDoctor = ref(false)
const apptId = ref('')
const result = ref(null)
const date = ref('')
const timeSlot = ref('AM')
const schedule = ref(null)
const counts = ref(null)
const queue = ref([])
const calendarDate = ref(new Date())
const slotMap = ref({})
const LEAVE_PENDING_KEY = 'doctorLeavePending'
const leavePendingMap = ref({})
const selectedSchedule = ref(null)
const working = ref(false)
  const leaveDialogVisible = ref(false)
  const leaveReason = ref('')
  const formatMonth = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    return `${y}年${m}月`
  }
  const toToday = () => {
    calendarDate.value = new Date()
  }
  const prevMonth = () => {
    const d = new Date(calendarDate.value)
    d.setMonth(d.getMonth() - 1)
    calendarDate.value = d
  }
  const nextMonth = () => {
    const d = new Date(calendarDate.value)
    d.setMonth(d.getMonth() + 1)
    calendarDate.value = d
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

const loadQueue = async () => {
  try {
    const params = { date: date.value, timeSlot: timeSlot.value }
    const res = await getDoctorQueue(params)
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
  } catch (e) {
    ElMessage.info('已取消退出')
  }
}

onMounted(() => {
  try {
    const raw = sessionStorage.getItem('user') || localStorage.getItem('user')
    if (raw) {
      const u = JSON.parse(raw)
      username.value = u.username || ''
      isDoctor.value = u.role === 'doctor'
    }
  } catch (e) {
    username.value = ''
  }
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  date.value = `${y}-${m}-${d}`
  if (isDoctor.value) {
    initMonth()
  }
})

const initMonth = async () => {
  try {
    const cur = calendarDate.value
    const y = cur.getFullYear()
    const m = String(cur.getMonth() + 1).padStart(2, '0')
    const params = { startMonth: `${y}-${m}` }
    const res = await getDoctorScheduledDates(params)
    const dates = res.data || []
    const map = {}
    for (const day of dates) {
      map[day] = { AM: { exists: false, pending: false }, PM: { exists: false, pending: false } }
    }
    slotMap.value = map
    leavePendingMap.value = getPendingStore()
    await loadDaySlots(dates)
  } catch (e) {
    slotMap.value = {}
  }
}

const loadDaySlots = async (dates) => {
  try {
    const list = Array.isArray(dates) ? dates : []
    const tasks = list.map(async (day) => {
      const res = await getDoctorScheduleDetailsByDate({ date: day })
      const details = res.data || []
      const am = details.find(d => d.timeSlot === 'AM') || null
      const pm = details.find(d => d.timeSlot === 'PM') || null
      const m = slotMap.value
      if (!m[day]) m[day] = { AM: { exists: false, pending: false }, PM: { exists: false, pending: false } }
      const amCancelled = !!(am && am.status === 'Cancelled')
      const pmCancelled = !!(pm && pm.status === 'Cancelled')
      m[day].AM.exists = !!am && !amCancelled
      m[day].PM.exists = !!pm && !pmCancelled
      const amAudit = am ? am.auditStatus : null
      const pmAudit = pm ? pm.auditStatus : null
      m[day].AM.pending = !!(leavePendingMap.value[day] && leavePendingMap.value[day].AM) && amAudit === 'leave_requested'
      m[day].PM.pending = !!(leavePendingMap.value[day] && leavePendingMap.value[day].PM) && pmAudit === 'leave_requested'
      slotMap.value = { ...m }
      notifyLeaveResultForDay(day, { amExists: m[day].AM.exists, pmExists: m[day].PM.exists }, { amAudit, pmAudit })
    })
    await Promise.all(tasks)
  } catch (e) {
    ElMessage.error(e.message || '加载日历失败')
  }
}

const selectSlot = async (day, slot) => {
  const m = slotMap.value
  const has = m[day] && m[day][slot] && m[day][slot].exists
  if (!has) return
  date.value = day
  timeSlot.value = slot
  try {
    const res = await getDoctorQueue({ date: day, timeSlot: slot })
    selectedSchedule.value = res && res.data ? res.data.schedule : null
  } catch (e) {
    selectedSchedule.value = null
  }
}

const slotExists = (day, slot) => {
  const s = slotMap.value[day]?.[slot]
  return !!(s && s.exists)
}

const slotPending = (day, slot) => {
  return !!(leavePendingMap.value[day] && leavePendingMap.value[day][slot])
}

const slotTagType = (day, slot) => {
  return slotPending(day, slot) ? '' : 'success'
}

const onSlotClick = (day, slot) => {
  if (slotPending(day, slot)) {
    ElMessageBox.alert('该班次正在请假审批中', '提示')
    return
  }
  selectSlot(day, slot)
}

const openLeaveDialog = () => {
  leaveReason.value = ''
  leaveDialogVisible.value = true
}

const submitLeave = async () => {
  try {
    if (!selectedSchedule.value) return
    const sid = selectedSchedule.value.scheduleId
    const res = await requestScheduleLeave(sid, { reason: leaveReason.value })
    ElMessage.success(res.message || '请假提交成功')
    leaveDialogVisible.value = false
    setPendingStore(selectedSchedule.value.scheduleDate, selectedSchedule.value.timeSlot)
    await initMonth()
    selectedSchedule.value = null
  } catch (e) {
    ElMessage.error(e.message || '请假提交失败')
  }
}

const startWork = async () => {
  if (!selectedSchedule.value) return
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const todayStr = `${y}-${m}-${d}`
  const isToday = selectedSchedule.value.scheduleDate === todayStr
  if (!isToday) {
    try {
      await ElMessageBox.confirm('不是今天的排班，是否继续', '提示', { type: 'warning' })
    } catch (e) {
      return
    }
  }
  router.push({ path: '/doctor/work', query: { date: selectedSchedule.value.scheduleDate, timeSlot: selectedSchedule.value.timeSlot } })
}

watch(calendarDate, () => {
  initMonth()
})

const getPendingStore = () => {
  try {
    const raw = localStorage.getItem(LEAVE_PENDING_KEY)
    if (!raw) return {}
    const obj = JSON.parse(raw)
    return obj && typeof obj === 'object' ? obj : {}
  } catch (e) {
    return {}
  }
}

const savePendingStore = (obj) => {
  try {
    localStorage.setItem(LEAVE_PENDING_KEY, JSON.stringify(obj))
  } catch (e) { void 0 }
}

const setPendingStore = (day, slot) => {
  const obj = getPendingStore()
  if (!obj[day]) obj[day] = {}
  obj[day][slot] = { ts: Date.now() }
  savePendingStore(obj)
  leavePendingMap.value = obj
  const s = slotMap.value[day]?.[slot]
  if (s) {
    s.pending = true
    slotMap.value = { ...slotMap.value }
  }
}

const clearPendingStore = (day, slot) => {
  const obj = getPendingStore()
  if (obj[day] && obj[day][slot]) {
    delete obj[day][slot]
    if (Object.keys(obj[day]).length === 0) delete obj[day]
    savePendingStore(obj)
    leavePendingMap.value = obj
    const s = slotMap.value[day]?.[slot]
    if (s) {
      s.pending = false
      slotMap.value = { ...slotMap.value }
    }
  }
}

const notifyLeaveResultForDay = (day, existsMap, auditMap) => {
  const pending = leavePendingMap.value[day] || {}
  if (pending.AM) {
    if (!existsMap.amExists) {
      ElMessageBox.alert(`您${day}AM的请假申请已通过`, '提示')
      clearPendingStore(day, 'AM')
    } else if (auditMap && auditMap.amAudit === 'approved') {
      ElMessageBox.alert(`您${day}AM的请假申请被拒绝`, '提示')
      clearPendingStore(day, 'AM')
    }
  }
  if (pending.PM) {
    if (!existsMap.pmExists) {
      ElMessageBox.alert(`您${day}PM的请假申请已通过`, '提示')
      clearPendingStore(day, 'PM')
    } else if (auditMap && auditMap.pmAudit === 'approved') {
      ElMessageBox.alert(`您${day}PM的请假申请被拒绝`, '提示')
      clearPendingStore(day, 'PM')
    }
  }
}
</script>

<style scoped>
.doctor-dashboard {
  padding: 24px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.user-info {
  display: flex;
  gap: 8px;
}
.card {
  min-height: 280px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
}
.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.actions {
  display: flex;
  gap: 8px;
}
.slot-tags {
  display: flex;
  gap: 6px;
  margin-top: 6px;
}
.date-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.date-number {
  font-weight: 600;
}
.counts {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}
.cal-header { display: flex; align-items: center; justify-content: space-between; }
.month-text { font-weight: 600; }
.header-actions { display: flex; gap: 8px; }
.grey-tag { background-color: #e5e7eb !important; border-color: #d1d5db !important; color: #374151 !important; }
</style>
