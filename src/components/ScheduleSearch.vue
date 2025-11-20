<template>
  <div class="schedule-search">
    <h2>查询可预约排班</h2>
    <div class="filters">
      <label>
        科室ID:
        <input type="number" v-model="filters.deptId" />
      </label>
      <label>
        医生ID:
        <input type="number" v-model="filters.doctorId" />
      </label>
      <label>
        开始日期:
        <input type="date" v-model="filters.startDate" />
      </label>
      <label>
        结束日期:
        <input type="date" v-model="filters.endDate" />
      </label>
      <label>
        时间段:
        <select v-model="filters.timeSlot">
          <option value="">所有</option>
          <option value="AM">上午</option>
          <option value="PM">下午</option>
        </select>
      </label>
      <button @click="searchSchedules">查询</button>
    </div>

    <div v-if="schedules.length > 0" class="schedule-results">
      <h3>查询结果</h3>
      <ul>
        <li v-for="schedule in schedules" :key="schedule.scheduleId" @click="selectSchedule(schedule)" :class="{ selected: selectedSchedule && selectedSchedule.scheduleId === schedule.scheduleId }">
          {{ schedule.scheduleDate }} - {{ schedule.timeSlot }} ({{ schedule.doctorName }} - {{ schedule.deptName }})
          <br>
          剩余号源: {{ schedule.availableCount }} / {{ schedule.maxCount }}
          <span v-if="schedule.availableCount === 0" class="no-slots"> (已无号源)</span>
        </li>
      </ul>
    </div>
    <p v-else-if="searched && schedules.length === 0">没有找到可预约的排班。</p>
  </div>
</template>

<script>
import request from '../api/request'; // 假设你有一个封装的request工具

export default {
  name: 'ScheduleSearch',
  data() {
    return {
      filters: {
        deptId: null,
        doctorId: null,
        startDate: '',
        endDate: '',
        timeSlot: ''
      },
      schedules: [],
      selectedSchedule: null,
      searched: false
    };
  },
  methods: {
    async searchSchedules() {
      this.searched = true;
      try {
        const response = await request.get('/appointments/available-schedules', { // 移除重复的 /api
          params: this.filters
        });
        if (response.code === 200) {
          this.schedules = response.data.schedules; // 提取实际的排班数组
        } else {
          alert(response.message);
          this.schedules = [];
        }
      } catch (error) {
        console.error('查询排班失败:', error);
        alert('查询排班失败，请稍后重试');
        this.schedules = [];
      }
    },
    selectSchedule(schedule) {
      if (schedule.availableCount === 0) {
        alert('该排班已无号源，请选择其他排班。');
        return;
      }
      this.selectedSchedule = schedule;
      this.$emit('schedule-selected', schedule);
    }
  },
  created() {
    this.searchSchedules(); // 页面加载时自动查询一次
  }
};
</script>

<style scoped>
.schedule-search {
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.filters label {
  margin-right: 15px;
}

.filters input, .filters select, .filters button {
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.filters button {
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.filters button:hover {
  background-color: #0056b3;
}

.schedule-results ul {
  list-style: none;
  padding: 0;
}

.schedule-results li {
  padding: 10px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.schedule-results li:hover {
  background-color: #f0f0f0;
}

.schedule-results li.selected {
  background-color: #e6f7ff;
  border-color: #91d5ff;
}

.no-slots {
  color: red;
  font-weight: bold;
}
</style>
