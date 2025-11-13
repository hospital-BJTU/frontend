<template>
  <div class="appointments-page">
    <el-card class="page-card">
      <template #header>
        <div class="card-header">
          <div class="title">我的预约记录</div>
          <div class="filters">
            <el-select v-model="filters.status" placeholder="按状态筛选" clearable class="status-select">
              <el-option label="全部" :value="undefined" />
              <el-option label="待就诊" value="pending" />
              <el-option label="已叫号" value="called" />
              <el-option label="已完成" value="completed" />
              <el-option label="已取消" value="cancelled" />
              <el-option label="已过号" value="missed" />
            </el-select>
            <el-button type="primary" @click="loadAppointments" :loading="loading">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="appointments" v-loading="loading" empty-text="暂无预约记录" class="appt-table">
        <el-table-column prop="appt_id" label="挂号ID" min-width="110" />
        <el-table-column prop="serial_number" label="接诊序号" min-width="100" />
        <el-table-column label="状态" min-width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="appt_time" label="预约提交时间" min-width="170">
          <template #default="{ row }">
            <span>{{ formatDateTime(row.appt_time) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="is_valid" label="记录有效" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_valid === 1 ? 'success' : 'info'">{{ row.is_valid === 1 ? '有效' : '已作废' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" min-width="120">
          <template #default="{ row }">
            <el-button size="small" @click="openDetail(row)">详情</el-button>
            <el-button
              size="small"
              type="danger"
              plain
              :disabled="!canCancel(row.status)"
              @click="confirmCancel(row)"
            >取消预约</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, jumper"
          :total="pagination.total"
          :page-size="pagination.limit"
          :current-page="pagination.page"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="预约详情" width="520px">
      <div v-if="detail" class="detail-box">
        <div class="detail-row"><span class="label">挂号ID：</span><span>{{ detail.appt_id }}</span></div>
        <div class="detail-row"><span class="label">患者ID：</span><span>{{ detail.user_id }}</span></div>
        <div class="detail-row"><span class="label">接诊序号：</span><span>{{ detail.serial_number }}</span></div>
        <div class="detail-row"><span class="label">预约提交时间：</span><span>{{ formatDateTime(detail.appt_time) }}</span></div>
        <div class="detail-row"><span class="label">状态：</span>
          <el-tag :type="statusTagType(detail.status)">{{ statusText(detail.status) }}</el-tag>
        </div>
        <div class="detail-row"><span class="label">记录有效：</span>
          <el-tag :type="detail.is_valid === 1 ? 'success' : 'info'">{{ detail.is_valid === 1 ? '有效' : '已作废' }}</el-tag>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div> <!-- 显示错误消息 -->
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserAppointments, getAppointmentDetail, cancelAppointment } from '@/api/appointment'

const appointments = ref([])
const loading = ref(false)
const filters = ref({ status: undefined })
const pagination = ref({ page: 1, limit: 10, total: 0 })
const errorMessage = ref('') // 新增错误消息状态

const detailVisible = ref(false)
const detail = ref(null)

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

const canCancel = (status) => ['pending', 'called'].includes(status)

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

const loadAppointments = async () => {
  loading.value = true
  try {
    const res = await getUserAppointments({
      status: filters.value.status,
      page: pagination.value.page,
      limit: pagination.value.limit
    })
    // 将后端字段映射为 tb_appointment 命名
    const rows = (res.data.appointments || []).map(r => ({
      appt_id: r.appointmentId,
      user_id: r.userId,
      schedule_id: r.scheduleId,
      serial_number: r.serialNumber,
      status: r.status,
      appt_time: r.appointmentTime,
      is_valid: r.isValid ?? 1, // 列表返回中未包含时默认有效
      // 保留原有展示辅助字段，避免影响状态标签和未来展示
      statusDescription: r.statusDescription,
      doctorName: r.doctorName,
      departmentName: r.departmentName,
      scheduleDate: r.scheduleDate,
      timeSlot: r.timeSlot
    }))
    appointments.value = rows
    const p = res.data.pagination || { page: 1, limit: 10, total: 0 }
    pagination.value.page = p.page
    pagination.value.limit = p.limit
    pagination.value.total = p.total
  } catch (e) {
    console.error('加载预约记录失败:', e); // 详细日志
    errorMessage.value = e.message || '查询失败，请稍后重试。' // 设置错误消息
    ElMessage.error(errorMessage.value)
  } finally {
    loading.value = false
  }
}

const onPageChange = (page) => {
  pagination.value.page = page
  loadAppointments()
}

const openDetail = async (row) => {
  try {
    const res = await getAppointmentDetail(row.appt_id)
    // 详情同样映射为 tb_appointment 命名
    const d = res.data || {}
    detail.value = {
      appt_id: d.appointmentId,
      user_id: d.userId,
      schedule_id: d.scheduleId,
      serial_number: d.serialNumber,
      status: d.status,
      appt_time: d.appointmentTime,
      is_valid: d.isValid ?? 1,
      // 保留辅助信息
      waitingCount: d.waitingCount,
      estimatedTime: d.estimatedTime
    }
    detailVisible.value = true
  } catch (e) {
    ElMessage.error(e.message || '获取详情失败')
  }
}

onMounted(() => {
  loadAppointments()
})

const confirmCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确认取消该预约？', '提示', {
      confirmButtonText: '是',
      cancelButtonText: '否',
      type: 'warning'
    })
    const res = await cancelAppointment(row.appt_id)
    ElMessage.success(res.message || '预约取消成功')
    // 取消后列表默认不再显示（isValid=0）；为稳妥，刷新列表
    loadAppointments()
  } catch (e) {
    // 如果是用户点击“否”，MessageBox 会抛出异常，这里忽略即可
    if (e && e !== 'cancel' && e !== 'close') {
      ElMessage.error(e.message || '取消失败')
    }
  }
}
</script>

<style scoped>
.appointments-page {
  max-width: 1080px;
  margin: 24px auto;
  padding: 0 16px;
}
.page-card {
  border-radius: 12px;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.title {
  font-size: 20px;
  font-weight: 600;
  color: #0a2540;
}
.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}
.status-select {
  width: 180px;
}
.appt-table {
  margin-top: 8px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 16px 8px 8px;
}
.detail-box {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.detail-row .label {
  color: #606266;
  margin-right: 8px;
}
.error-message {
  color: #f56c6c;
  margin-top: 10px;
  text-align: center;
}
</style>