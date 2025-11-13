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
            <el-button type="primary" @click="loadAppointments" :loading="loading" icon="el-icon-search">查询</el-button>
          </div>
        </div>
      </template>

      <el-skeleton :rows="6" animated v-if="loading" />
      <div v-else>
        <el-table :data="appointments" v-if="appointments.length > 0" empty-text="暂无预约记录" class="appt-table">
          <el-table-column prop="appt_id" label="挂号ID" width="120" />
          <el-table-column prop="serial_number" label="接诊序号" width="100" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" effect="dark">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="appt_time" label="预约提交时间" width="180">
            <template #default="{ row }">
              <span class="datetime-display">{{ formatDateTime(row.appt_time) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="is_valid" label="记录有效" width="100">
            <template #default="{ row }">
              <el-tag :type="row.is_valid === 1 ? 'success' : 'info'" effect="dark">{{ row.is_valid === 1 ? '有效' : '已作废' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" fixed="right" width="200">
            <template #default="{ row }">
              <el-button size="small" type="info" plain @click="openDetail(row)" icon="el-icon-document">详情</el-button>
              <el-button
                size="small"
                type="danger"
                plain
                :disabled="!canCancel(row.status)"
                @click="confirmCancel(row)"
                icon="el-icon-close"
              >取消预约</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无预约记录" class="empty-data"></el-empty>
      </div>

      <div class="pager">
        <el-pagination
          background
          layout="prev, pager, next, jumper, total"
          :total="pagination.total"
          :page-size="pagination.limit"
          :current-page="pagination.page"
          @current-change="onPageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="预约详情" width="650px" class="detail-dialog">
      <div v-if="detail" class="detail-box">
        <div class="detail-item">
          <span class="label">挂号ID：</span><span class="detail-value">{{ detail.appt_id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">患者ID：</span><span class="detail-value">{{ detail.user_id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">排班ID：</span><span class="detail-value">{{ detail.schedule_id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">接诊序号：</span><span class="detail-value">{{ detail.serial_number }}</span>
        </div>
        <div class="detail-item">
          <span class="label">预约提交时间：</span><span class="detail-value">{{ formatDateTime(detail.appt_time) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <el-tag :type="statusTagType(detail.status)" effect="dark">{{ statusText(detail.status) }}</el-tag>
        </div>
        <div class="detail-item">
          <span class="label">记录有效：</span>
          <el-tag :type="detail.is_valid === 1 ? 'success' : 'info'" effect="dark">{{ detail.is_valid === 1 ? '有效' : '已作废' }}</el-tag>
        </div>
        <div class="detail-item" v-if="detail.waitingCount !== undefined">
          <span class="label">前方等待：</span><el-tag type="warning" effect="plain">{{ detail.waitingCount }}人</el-tag>
        </div>
        <div class="detail-item" v-if="detail.estimatedTime">
          <span class="label">预计就诊时间：</span><el-tag type="success" effect="plain">{{ detail.estimatedTime }}</el-tag>
        </div>
        <!-- 新增医生和科室信息 -->
        <div class="detail-item" v-if="detail.doctorName">
          <span class="label">医生姓名：</span><span class="detail-value">{{ detail.doctorName }}</span>
        </div>
        <div class="detail-item" v-if="detail.departmentName">
          <span class="label">科室名称：</span><span class="detail-value">{{ detail.departmentName }}</span>
        </div>
        <div class="detail-item" v-if="detail.scheduleDate">
          <span class="label">就诊日期：</span><span class="detail-value">{{ detail.scheduleDate }}</span>
        </div>
        <div class="detail-item" v-if="detail.timeSlot">
          <span class="label">时间段：</span><span class="detail-value">{{ detail.timeSlot }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
  <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, ElEmpty } from 'element-plus' // 导入 ElEmpty
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
    case 'cancelled': return 'danger' // 修改取消状态的标签类型为 danger
    case 'missed': return 'info' // 修改已过号的标签类型为 info，避免与取消重复
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
  max-width: 1400px; /* 进一步增加最大宽度 */
  margin: 35px auto; /* 调整外边距 */
  padding: 0 30px; /* 调整内边距 */
  font-family: 'Source Sans Pro', sans-serif; /* 更改字体为更现代的无衬线字体 */
}
.page-card {
  border-radius: 20px; /* 进一步增大圆角 */
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12); /* 增强阴影 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}
.page-card:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15); /* 悬停时阴影更明显 */
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 30px; /* 增加填充 */
  border-bottom: 1px solid #dcdfe6; /* 调整底部边框颜色 */
  margin-bottom: 30px; /* 增加底部外边距 */
  background: linear-gradient(to right, #eef2f5, #f5f7fa); /* 添加渐变背景色 */
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}
.title {
  font-size: 28px; /* 进一步增大标题字号 */
  font-weight: 900; /* 更粗的标题 */
  color: #2c3e50; /* 调整标题颜色 */
  letter-spacing: 0.8px; /* 增加字母间距 */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05); /* 添加文本阴影 */
}
.filters {
  display: flex;
  gap: 20px; /* 调整间距 */
  align-items: center;
}
.status-select {
  width: 180px; /* 调整选择框宽度 */
}
.el-button--primary {
  font-weight: 600;
  padding: 10px 20px;
}
.appt-table {
  margin-top: 0;
  border: 1px solid #e0e0e0;
  border-radius: 12px; /* 进一步增大表格圆角 */
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); /* 添加表格阴影 */
}
.appt-table .el-table__header-wrapper th {
  background-color: #f7f9fb; /* 表头背景色 */
  color: #3f51b5; /* 更改表头字体颜色 */
  font-weight: 800;
  padding: 16px 0; /* 调整表头行高 */
  border-bottom: 1px solid #dcdfe6;
}
.appt-table .el-table__cell {
  padding: 18px 0; /* 调整行高 */
  font-size: 15px;
  color: #555;
}
.appt-table .el-table__row:hover {
  background-color: #e8f5e9; /* 更柔和的行悬停效果 */
  cursor: pointer;
  transform: scale(1.005); /* 悬停时轻微放大 */
  transition: all 0.2s ease-in-out;
}
.datetime-display {
  font-weight: 600;
  color: #4a4a4a;
}
.el-tag {
  border-radius: 8px; /* 标签圆角 */
  padding: 5px 10px;
  font-size: 13px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding: 35px 0 15px; /* 调整内边距 */
}
.el-button--small {
  padding: 9px 18px;
  font-size: 15px;
  border-radius: 10px;
  transition: all 0.2s ease;
}
.el-button--small:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.detail-dialog .el-dialog__title {
  font-size: 24px;
  font-weight: 800;
  color: #2c3e50;
  padding-bottom: 18px;
  border-bottom: 1px solid #dcdfe6;
  margin-bottom: 25px;
}
.detail-dialog .el-dialog__body {
  padding: 25px 35px;
}
.detail-box {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); /* 响应式布局，调整最小宽度 */
  gap: 20px 30px; /* 调整间距 */
  padding: 15px 0;
}
.detail-item {
  display: flex;
  align-items: center;
  font-size: 17px;
  color: #333;
}
.detail-item .label {
  font-weight: 700;
  color: #333;
  margin-right: 15px;
  min-width: 100px; /* 确保标签宽度一致 */
}
.detail-value {
  color: #606266;
}
.error-message {
  color: #c0392b;
  margin-top: 30px;
  text-align: center;
  font-size: 1.3em;
  font-weight: 700;
  padding: 20px;
  background-color: #fcebeb;
  border: 1px solid #c0392b;
  border-radius: 10px;
}
.empty-data {
  padding: 60px 0;
  font-size: 1.2em;
  color: #a0a0a0;
}
</style>