<template>
  <div class="schedule-search">
    <h2>查询可预约排班</h2>
    <div class="filters">
      <label>
        科室:
        <el-select v-model="filters.deptId" placeholder="请选择科室" clearable @change="handleDeptChange">
          <el-option
            v-for="dept in departments"
            :key="dept.deptId"
            :label="dept.deptName"
            :value="dept.deptId">
          </el-option>
        </el-select>
      </label>
      <label>
        医生:
        <el-select v-model="filters.doctorId" placeholder="请选择医生" clearable>
          <el-option
            v-for="doctor in doctors"
            :key="doctor.doctorId"
            :label="doctor.doctorName + ' (' + doctor.title + ')'"
            :value="doctor.doctorId">
          </el-option>
        </el-select>
      </label>
      <label>
        时间段:
        <select v-model="filters.timeSlot">
          <option value="">所有</option>
          <option value="AM">上午</option>
          <option value="PM">下午</option>
        </select>
      </label>
      <label>
        日期:
        <el-date-picker
          v-model="filters.date"
          type="date"
          placeholder="选择日期"
          value-format="YYYY-MM-DD"
          clearable
        />
      </label>
      <button @click="searchSchedules">查询</button>
    </div>

    <div v-if="schedules.length > 0" class="schedule-results">
      <h3>查询结果</h3>
      <ul>
        <li v-for="schedule in schedules" :key="schedule.scheduleId" @click="selectSchedule(schedule)" :class="{ selected: selectedSchedule && selectedSchedule.scheduleId === schedule.scheduleId }">         {{ schedule.scheduleDate }} - {{ schedule.timeSlot }} ({{ schedule.doctorName }} - {{ schedule.departmentName }})
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
import { ElMessage, ElSelect, ElOption, ElDatePicker } from 'element-plus';


export default {
  name: 'ScheduleSearch',
  components: {
    ElSelect, // 注册 ElSelect 组件
    ElOption,  // 注册 ElOption 组件
    ElDatePicker // 注册 ElDatePicker 组件
  },
  data() {
    return {
      filters: {
        deptId: null,
        doctorId: null,
        timeSlot: '',
        date: null // 新增日期筛选字段
      },
      schedules: [],
      selectedSchedule: null,
      searched: false,
      departments: [], // 新增：科室列表
      doctors: [] // 新增：医生列表
    };
  },
  methods: {
    async fetchDepartments() {
      try {
        const response = await request.get('/user/appointments/departments');
        if (response.code === 200) {
          this.departments = response.data.departments;
        } else {
          ElMessage.error('获取科室列表失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取科室列表失败:', error);
        ElMessage.error('获取科室列表失败，请稍后重试');
      }
    },
    async fetchDoctorsByDept(deptId) {
      this.doctors = []; // 清空医生列表
      this.filters.doctorId = null; // 清空已选择的医生
      if (!deptId) {
        return;
      }
      try {
        const response = await request.get(`/user/appointments/doctors?deptId=${deptId}`);
        if (response.code === 200) {
          this.doctors = response.data.doctors;
        } else {
          ElMessage.error('获取医生列表失败: ' + response.message);
        }
      } catch (error) {
        console.error('获取医生列表失败:', error);
        ElMessage.error('获取医生列表失败，请稍后重试');
      }
    },
    handleDeptChange(deptId) {
      this.fetchDoctorsByDept(deptId);
      this.searchSchedules(); // 科室改变时重新搜索排班
    },
    async searchSchedules() {
      this.searched = true;
      // 构建查询参数
      const params = { ...this.filters };
      if (params.date) {
        // El-date-picker 已经配置了 value-format="YYYY-MM-DD"，所以直接使用即可
        // 后端通常期望YYYY-MM-DD格式的日期字符串
        // params.date = this.$moment(params.date).format('YYYY-MM-DD'); // 如果需要手动格式化，使用moment.js或其他库
      }
      try {
        const response = await request.get('/user/available-schedules', {
          params: params
        });
        if (response.code === 200) {
          this.schedules = response.data.schedules; // 提取实际的排班数组
          // alert(response.message); // 移除不必要的alert
        } else {
          // alert(response.message); // 移除不必要的alert
          ElMessage.error('查询排班失败: ' + response.message);
          this.schedules = [];
        }
      } catch (error) {
        console.error('查询排班失败:', error);
        ElMessage.error('查询排班失败，请稍后重试');
        this.schedules = [];
      }
    },
    selectSchedule(schedule) {
      if (schedule.availableCount === 0) {
        ElMessage.warning('该排班已无号源，请选择其他排班。'); // 使用ElMessage
        return;
      }
      this.selectedSchedule = schedule;
      this.$emit('schedule-selected', schedule);}
  },
  created() {
    this.fetchDepartments(); // 页面加载时获取科室列表
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


.filters input[type="number"]::-webkit-outer-spin-button,
.filters input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.filters input[type="number"] {
  -moz-appearance: textfield;
  appearance: none; /* Add this line */
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
