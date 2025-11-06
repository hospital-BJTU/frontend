// src/api/appointment.js
import request from './request'

// 查询当前登录患者的预约列表
export const getUserAppointments = (params = {}) => {
  const { status, page = 1, limit = 10 } = params
  return request({
    url: '/appointments/user',
    method: 'GET',
    params: { status, page, limit }
  })
}

// 查询预约详情
export const getAppointmentDetail = (apptId) => {
  return request({
    url: `/appointments/${apptId}`,
    method: 'GET'
  })
}

// 取消预约（如需）
export const cancelAppointment = (apptId) => {
  return request({
    url: `/appointments/${apptId}/cancel`,
    method: 'PUT'
  })
}