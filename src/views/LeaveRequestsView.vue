<template>
  <div class="leave-requests-container">
    <h1>请假请求</h1>

    <el-table :data="leaveRequests" v-loading="loading" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="scheduleId" label="排班ID" width="80"></el-table-column>
      <el-table-column prop="doctor.doctorName" label="医生姓名" width="120"></el-table-column>
      <el-table-column prop="doctor.departmentName" label="科室" width="120"></el-table-column>
      <el-table-column prop="scheduleDate" label="排班日期" width="120"></el-table-column>
      <el-table-column prop="timeSlot" label="时段" width="80"></el-table-column>
      <el-table-column prop="auditStatus" label="状态" width="100"></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleApproveLeave(scope.row.scheduleId)">批准</el-button>
          <el-button size="small" type="danger" @click="handleRejectLeave(scope.row.scheduleId)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px; text-align: right;"
    >
    </el-pagination>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import request from '../api/request'; // 假设您有一个通用的请求模块

const leaveRequests = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const fetchLeaveRequests = async () => {
  loading.value = true;
  try {
    const response = await request.get('/admin/schedules/leave-requests', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
      },
    });
    if (response.code === 200) {
      leaveRequests.value = response.data;
      total.value = response.total; // 假设后端返回total字段
    } else {
      ElMessage.error(response.message || '获取请假请求失败');
    }
  } catch (error) {
    ElMessage.error('请求失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchLeaveRequests();
});

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchLeaveRequests();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 改变每页大小时重置到第一页
  fetchLeaveRequests();
};

const handleApproveLeave = (scheduleId) => {
  ElMessageBox.confirm('确认批准该请假请求？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await request.put(`/admin/schedules/${scheduleId}/approve-leave`);
      if (response.code === 200) {
        ElMessage.success('请假请求已批准');
        fetchLeaveRequests(); // 刷新列表
      } else {
        ElMessage.error(response.message || '批准失败');
      }
    } catch (error) {
      ElMessage.error('请求失败: ' + error.message);
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};

const handleRejectLeave = (scheduleId) => {
  ElMessageBox.prompt('请输入拒绝原因', '拒绝请假请求', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '拒绝原因不能为空',
  }).then(async ({ value: reason }) => {
    try {
      const response = await request.put(`/admin/schedules/${scheduleId}/reject-leave`, {
        reason,
      });
      if (response.code === 200) {
        ElMessage.success('请假请求已拒绝');
        fetchLeaveRequests(); // 刷新列表
      } else {
        ElMessage.error(response.message || '拒绝失败');
      }
    } catch (error) {
      ElMessage.error('请求失败: ' + error.message);
    }
  }).catch(() => {
    ElMessage.info('已取消操作');
  });
};
</script>

<style scoped>
.leave-requests-container {
  padding: 20px;
}
</style>
