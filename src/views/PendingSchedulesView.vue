<template>
  <div class="pending-schedules-container">
    <h1>待审核排班</h1>
    <el-table
      :data="pendingSchedules"
      border
      style="width: 100%; margin-top: 20px"
      header-align="center"
      stripe
    >
      <el-table-column prop="scheduleId" label="排班ID" width="80" align="center"></el-table-column>
      <el-table-column prop="doctorName" label="医生姓名" width="100" align="center"></el-table-column>
      <el-table-column prop="doctorTitle" label="医生职称" width="120" align="center"></el-table-column>
      <el-table-column prop="departmentName" label="科室" width="120" align="center"></el-table-column>
      <el-table-column prop="scheduleDate" label="排班日期" width="120" align="center"></el-table-column>
      <el-table-column prop="timeSlot" label="时间段" width="100" align="center"></el-table-column>
      <el-table-column prop="maxCount" label="最大预约数" width="100" align="center"></el-table-column>
      <el-table-column prop="availableCount" label="剩余预约数" width="100" align="center"></el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getScheduleStatusType(scope.row.status)">{{ getScheduleStatusText(scope.row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template #default="scope">
          <el-button
            type="success"
            size="small"
            @click="handleAuditSchedule(scope.row.scheduleId, 'approved')"
            :disabled="scope.row.status !== 'pending'"
          >批准</el-button>
          <el-button
            type="danger"
            size="small"
            @click="handleAuditSchedule(scope.row.scheduleId, 'rejected')"
            :disabled="scope.row.status !== 'pending'"
          >拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handlePageChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="limit"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background
      style="margin-top: 20px"
    ></el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import request from '../api/request';
import { ElMessage, ElMessageBox } from 'element-plus'; // 恢复 ElMessageBox 导入

console.log('PendingSchedulesView setup'); // 重新添加日志

const pendingSchedules = ref([]);
const currentPage = ref(1);
const limit = ref(10); // 将 pageSize 改为 limit
const total = ref(0);

const handlePageChange = (page) => { // 恢复函数
  console.log(`Current page: ${page}`);
  currentPage.value = page;
  fetchPendingSchedules();
};

const handleSizeChange = (newLimit) => { // 将 size 改为 newLimit
  console.log(`${newLimit} items per page`);
  limit.value = newLimit; // 将 pageSize.value 改为 limit.value
  currentPage.value = 1; // 更改每页显示数量时，重置到第一页
  fetchPendingSchedules();
};

const handleAuditSchedule = async (scheduleId, auditResult) => { // 恢复函数
  console.log(`Auditing schedule ${scheduleId} with result: ${auditResult}`);
  ElMessageBox.confirm(`确认${auditResult === 'approved' ? '批准' : '拒绝'}该排班?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    let reason = null;
    if (auditResult === 'rejected') {
      const { value, action } = await ElMessageBox.prompt('请输入拒绝理由', '拒绝排班', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPattern: /\S/,
        inputErrorMessage: '拒绝理由不能为空',
      });
      if (action === 'cancel') {
        ElMessage.info('已取消操作');
        return;
      }
      reason = value;
    }
    try {
      const response = await request.put(`/admin/schedules/${scheduleId}/audit`, {
        newStatus: auditResult, // 将 auditResult 更改为 newStatus
        reason,
      });
      if (response.code === 200) {
        ElMessage.success(`${auditResult === 'approved' ? '批准' : '拒绝'}排班成功`);
        fetchPendingSchedules();
      } else {
        ElMessage.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('Error auditing schedule:', error);
      ElMessage.error('操作失败：' + (error.message || '未知错误'));
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

const getScheduleStatusType = (status) => { // 恢复函数
  switch (status) {
    case 'pending':
      return ''; // 待审核 - 默认蓝色
    case 'approved':
      return 'success'; // 已批准 - 绿色
    case 'rejected':
      return 'danger'; // 已拒绝 - 红色
    default:
      return '';
  }
};

const getScheduleStatusText = (status) => { // 恢复函数
  switch (status) {
    case 'pending':
      return '待审核';
    case 'approved':
      return '已批准';
    case 'rejected':
      return '已拒绝';
    default:
      return '未知状态';
  }
};

const fetchPendingSchedules = async () => {
  console.log("Fetching pending schedules...");
  try {
    const response = await request.get('/admin/schedules/pending', {
      params: {
        page: currentPage.value,
        limit: limit.value, // 将 pageSize.value 改为 limit.value
      },
    });
    console.log("Backend response for pending schedules:", response);
    if (response.code === 200) {
      pendingSchedules.value = response.data.list; // 修正：从 response.data.list 获取
      total.value = response.data.total; // 修正：从 response.data.total 获取
    } else {
      ElMessage.error(response.message || '获取待审核排班失败');
    }
  } catch (error) {
    console.error("Error fetching pending schedules:", error);
    ElMessage.error('获取待审核排班失败：' + (error.message || '未知错误'));
  }
};

onMounted(() => {
  console.log('PendingSchedulesView mounted'); // 重新添加日志
  fetchPendingSchedules();
});
</script>

<style scoped>
.pending-schedules-container {
  padding: 20px;
}
.el-table {
  margin-top: 20px;
}
.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
