<template>
  <div class="appointment-management">
    <h1>预约挂号</h1>
    <ScheduleSearch @schedule-selected="handleScheduleSelected" />
    <AppointmentForm :selectedSchedule="selectedSchedule" @appointment-success="handleAppointmentSuccess" @clear-selection="clearSelectedSchedule" />
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
      // 可以在这里触发 ScheduleSearch 重新查询，以更新号源信息
      // this.$refs.scheduleSearch.searchSchedules(); 
    },
    clearSelectedSchedule() {
      this.selectedSchedule = null;
    }
  }
}
</script>

<style scoped>
.appointment-management {
  padding: 20px;
}
</style>
