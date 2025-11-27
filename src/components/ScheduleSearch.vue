<template>
  <div class="schedule-search">
    <h2>查询可预约排班</h2>
    <div class="filters">
      <label>
        科室ID:
<<<<<<< Updated upstream
<<<<<<< HEAD
        <input type="number" v-model.number="filters.deptId" min="0" />
      </label>
      <label>
        医生ID:
        <input type="number" v-model.number="filters.doctorId" min="0" />
=======
        <input type="number" v-model="filters.deptId" />
      </label>
      <label>
        医生ID:
        <input type="number" v-model="filters.doctorId" />
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
        <input type="number" v-model="filters.deptId" />
      </label>
      <label>
        医生ID:
        <input type="number" v-model="filters.doctorId" />
>>>>>>> Stashed changes
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
<<<<<<< HEAD
          {{ schedule.scheduleDate }} - {{ schedule.timeSlot }} ({{ schedule.doctorName }} - {{ schedule.deptName }})
=======
          {{ schedule.scheduleDate }} - {{ schedule.timeSlot }} ({{ schedule.doctorName }} - {{ schedule.departmentName }})
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
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
<<<<<<< Updated upstream
<<<<<<< HEAD
import request from '../api/request';
import { ElMessage } from 'element-plus'; // 导入 Element Plus 的消息组件
=======
import request from '../api/request'; // 假设你有一个封装的request工具
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
import request from '../api/request'; // 假设你有一个封装的request工具
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
<<<<<<< HEAD
      this.selectedSchedule = null; 

      // 校验 deptId 和 doctorId
      if (this.filters.deptId !== null && this.filters.deptId < 0) {
        ElMessage.error('科室ID不能为负数。');
        this.filters.deptId = null; // 重置为 null
        return;
      }
      if (this.filters.doctorId !== null && this.filters.doctorId < 0) {
        ElMessage.error('医生ID不能为负数。');
        this.filters.doctorId = null; // 重置为 null
        return;
      }

=======
>>>>>>> Stashed changes
      try {
        const response = await request.get('/appointments/available-schedules', { // 移除重复的 /api
          params: this.filters
        });
        if (response.code === 200) {
<<<<<<< Updated upstream
          this.schedules = response.data.schedules; 
          if (this.schedules.length === 0) {
            // ElMessage.info('没有找到符合条件的排班。'); // 美化前的代码没有这一行
          }
=======
      try {
        const response = await request.get('/user/available-schedules', {
          params: this.filters
        });
        if (response.code === 200) {
          this.schedules = response.data.schedules; // 提取实际的排班数组
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
          this.schedules = response.data.schedules; // 提取实际的排班数组
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
<<<<<<< HEAD
      // ElMessage.success(`已选择 ${schedule.doctorName} 的 ${schedule.scheduleDate} ${schedule.timeSlot} 班次。`); // 美化前的代码没有这一行
    }
  },
  created() {
    this.searchSchedules(); 
=======
    }
  },
  created() {
    this.searchSchedules(); // 页面加载时自动查询一次
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
    }
  },
  created() {
    this.searchSchedules(); // 页面加载时自动查询一次
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
<<<<<<< HEAD
.filters input[type="number"]::-webkit-outer-spin-button,
.filters input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.filters input[type="number"] {
  -moz-appearance: textfield;
}

=======
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
>>>>>>> Stashed changes
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
