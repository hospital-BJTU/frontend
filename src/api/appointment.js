// src/api/appointment.js
import request from './request'

// 查询当前登录患者的预约列表
export const getUserAppointments = (params = {}) => {
  const { status, page = 1, limit = 10 } = params
  return request({
<<<<<<< HEAD
    url: '/appointments/user',
=======
    url: '/user/appointments',
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
    method: 'GET',
    params: { status, page, limit }
  })
}

// 查询预约详情
export const getAppointmentDetail = (apptId) => {
  return request({
<<<<<<< HEAD
    url: `/appointments/${apptId}`,
=======
    url: `/user/appointments/${apptId}`,
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
    method: 'GET'
  })
}

// 取消预约（如需）
export const cancelAppointment = (apptId) => {
  return request({
<<<<<<< HEAD
    url: `/appointments/${apptId}/cancel`,
    method: 'PUT'
  })
}
=======
    url: `/user/appointments/${apptId}/cancel`,
    method: 'PUT'
  })
}

export const doctorCallAppointment = (apptId) => {
  return request({
    url: `/doctor/appointments/${apptId}/call`,
    method: 'PUT'
  })
}

export const doctorMissAppointment = (apptId) => {
  return request({
    url: `/doctor/appointments/${apptId}/miss`,
    method: 'PUT'
  })
}

export const doctorCompleteAppointment = (apptId) => {
  return request({
    url: `/doctor/appointments/${apptId}/complete`,
    method: 'PUT'
  })
}

export const getDoctorQueue = (params = {}) => {
  return request({
    url: '/doctor/queue',
    method: 'GET',
    params
  })
}

export const getDoctorScheduledDates = (params = {}) => {
  return request({
    url: '/doctor/schedules/calendar',
    method: 'GET',
    params
  })
}

export const getDoctorScheduleDetailsByDate = (params = {}) => {
  return request({
    url: '/doctor/schedules/details',
    method: 'GET',
    params
  })
}

export const requestScheduleLeave = (scheduleId, data = {}) => {
  return request({
    url: `/doctor/schedules/${scheduleId}/leave`,
    method: 'PUT',
    data
  })
}
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
