<template>
  <div class="appointment-management-container">
    <el-card class="page-header-card">
      <h1>预约挂号</h1>
    </el-card>
    <div class="content-wrapper">
      <el-card class="schedule-search-card">
        <template #header>
          <div class="card-header-title">查询可预约班次</div>
        </template>
        <ScheduleSearch ref="scheduleSearch" @schedule-selected="handleScheduleSelected" />
      </el-card>
      <el-card class="appointment-form-card" v-if="selectedSchedule">
        <template #header>
          <div class="card-header-title">填写预约信息</div>
        </template>
        <AppointmentForm :selectedSchedule="selectedSchedule" @appointment-success="handleAppointmentSuccess" @clear-selection="clearSelectedSchedule" @appointment-failed="handleAppointmentFailed" />
      </el-card>
    </div>
  </div>
</template>

<script>
import ScheduleSearch from '../components/ScheduleSearch.vue';
import AppointmentForm from '../components/AppointmentForm.vue';

export default {
  name: 'AppointmentView',
  components: {
    ScheduleSearch,
    AppointmentForm
  },
  data() {
    return {
      selectedSchedule: null
    };
  },
  methods: {
    handleScheduleSelected(schedule) {
      this.selectedSchedule = schedule;
    },
    handleAppointmentSuccess() {
      this.selectedSchedule = null; // 预约成功后清空选择
      this.$refs.scheduleSearch.searchSchedules(); // 预约成功后重新查询排班，更新号源信息
    },
    handleAppointmentFailed() {
      this.selectedSchedule = null; // 预约失败也清空选择
      this.$refs.scheduleSearch.searchSchedules(); // 预约失败后重新查询排班，更新号源信息
    },
    clearSelectedSchedule() {
      this.selectedSchedule = null;
    }
  }
}
</script>

<style scoped>
.appointment-management-container {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.page-header-card {
  margin-bottom: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  text-align: center;
  padding: 15px 0;
  background-color: #ffffff;
}

.page-header-card h1 {
  font-size: 32px;
  color: #007bff;
  margin: 0;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
}

.content-wrapper {
  display: grid;
  grid-template-columns: 1fr; /* Default to single column */
  gap: 25px;
}

@media (min-width: 992px) {
  .content-wrapper {
    grid-template-columns: 2fr 1fr; /* Two columns on larger screens */
  }
}

.schedule-search-card, .appointment-form-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.card-header-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 15px;
}

/* 调整子组件的内部样式，如果需要的话 */
.schedule-search-card :deep(.el-card__body),
.appointment-form-card :deep(.el-card__body) {
  padding: 20px;
}
</style>
