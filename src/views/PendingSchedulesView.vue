<template>
  <div class="pending-schedules-container">
    <h1>待审核排班</h1>

    <el-table :data="pendingSchedules" v-loading="loading" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="scheduleId" label="排班ID" width="80"></el-table-column>
      <el-table-column prop="doctor.doctorName" label="医生姓名" width="120"></el-table-column>
      <el-table-column prop="doctor.departmentName" label="科室" width="120"></el-table-column>
      <el-table-column prop="scheduleDate" label="排班日期" width="120"></el-table-column>
      <el-table-column prop="timeSlot" label="时段" width="80"></el-table-column>
      <el-table-column prop="status" label="当前状态" width="100"></el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" type="success" @click="handleAuditSchedule(scope.row.scheduleId, 'approved')">批准</el-button>
          <el-button size="small" type="danger" @click="handleAuditSchedule(scope.row.scheduleId, 'rejected')">拒绝</el-button>
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

const pendingSchedules = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);
const loading = ref(false);

const fetchPendingSchedules = async () => {
  loading.value = true;
  try {
    const response = await request.get('/admin/schedules/pending', {
      params: {
        page: currentPage.value,
        limit: pageSize.value,
      },
    });
    if (response.code === 200) {
      pendingSchedules.value = response.data;
      total.value = response.total; // 假设后端返回total字段
    } else {
      ElMessage.error(response.message || '获取待审核排班失败');
    }
  } catch (error) {
    ElMessage.error('请求失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPendingSchedules();
});

const handlePageChange = (newPage) => {
  currentPage.value = newPage;
  fetchPendingSchedules();
};

const handleSizeChange = (newSize) => {
  pageSize.value = newSize;
  currentPage.value = 1; // 改变每页大小时重置到第一页
  fetchPendingSchedules();
};

// 待实现：审核（批准/拒绝）排班功能
const handleAuditSchedule = (scheduleId, auditResult) => {
  ElMessageBox.confirm(`确认${auditResult === 'approved' ? '批准' : '拒绝'}该排班?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      const response = await request.put(`/admin/schedules/${scheduleId}/audit`, {
        auditResult,
      });
      if (response.code === 200) {
        ElMessage.success(`${auditResult === 'approved' ? '批准' : '拒绝'}成功`);
        fetchPendingSchedules(); // 刷新列表
      } else {
        ElMessage.error(response.message || '操作失败');
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
.pending-schedules-container {
  padding: 20px;
}
</style>
