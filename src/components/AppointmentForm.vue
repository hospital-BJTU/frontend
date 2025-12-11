<template>
  <div class="appointment-form">
    <h2>提交预约</h2>
    <div v-if="selectedSchedule">
      <p>您已选择：</p>
      <p>医生: {{ selectedSchedule.doctorName }} ({{ selectedSchedule.departmentName }})</p>
      <p>日期: {{ selectedSchedule.scheduleDate }} {{ selectedSchedule.timeSlot }}</p>
      <p>剩余号源: {{ selectedSchedule.availableCount }}</p>
      <label>
        具体时间段 (可选):
        <input type="text" v-model="specificTimeSlot" placeholder="例如: 09:00-09:30" />
      </label>
      <button @click="submitAppointment" :disabled="submitting">{{ submitting ? '提交中...' : '确认预约' }}</button>
      <button @click="cancelSelection">取消选择</button>
    </div>
    <p v-else>请先在上方选择一个可预约的排班。</p>
  </div>
</template>

<script>
import request from '../api/request';
import { ElMessage } from 'element-plus'; // 导入ElMessage用于提示
import { useRouter } from 'vue-router'; // 导入useRouter

export default {
  name: 'AppointmentForm',
  props: {
    selectedSchedule: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      specificTimeSlot: '',
      submitting: false,
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async submitAppointment() {
      if (!this.selectedSchedule) {
        ElMessage.warning('请先选择一个排班。');
        return;
      }

      this.submitting = true;
      const token = sessionStorage.getItem('token') || localStorage.getItem('token'); // 同时检查sessionStorage和localStorage
      if (!token) {
        ElMessage.warning('请先登录。');
        this.router.push('/login'); // 使用this.router
        this.submitting = false;
        return;
      }

      const payload = {
        scheduleId: this.selectedSchedule.scheduleId,
      };

      if (this.specificTimeSlot) {
        payload.specificTimeSlot = this.specificTimeSlot;
      }

      try {
        const response = await request.post('/user/appointments', payload, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.code === 200 || response.code === 201) {
          ElMessage.success('预约成功！');
          this.specificTimeSlot = '';
          this.$emit('appointment-success');
        } else {
          ElMessage.error(`预约失败: ${response.message}`);
          // 如果后端返回了错误信息，通常会在response.data.message中
          // 这里统一显示后端返回的message
        }
      } catch (error) {
        console.error('提交预约失败:', error);
        // 检查error.response是否存在，以获取后端返回的具体错误信息
        const errorMessage = error.response && error.response.data && error.response.data.message 
                             ? error.response.data.message 
                             : '提交预约失败，请稍后重试。';
        ElMessage.error(errorMessage);
      } finally {
        this.submitting = false;
      }
    },
    cancelSelection() {
      this.$emit('clear-selection');
      this.specificTimeSlot = '';
    }
  }
};
</script>

<style scoped>
.appointment-form {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.appointment-form label {
  display: block;
  margin-bottom: 10px;
}

.appointment-form input[type="text"] {
  width: calc(100% - 20px);
  padding: 8px;
  margin-top: 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.appointment-form button {
  padding: 10px 15px;
  margin-right: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.appointment-form button:first-of-type {
  background-color: #28a745;
  color: white;
}

.appointment-form button:first-of-type:hover:not(:disabled) {
  background-color: #218838;
}

.appointment-form button:last-of-type {
  background-color: #6c757d;
  color: white;
}

.appointment-form button:last-of-type:hover {
  background-color: #5a6268;
}

.appointment-form button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>
