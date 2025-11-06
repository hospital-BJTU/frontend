// src/api/captcha.js
import request from './request'

// 生成验证码
export const generateCaptcha = () => {
  return request({
    url: '/captcha/generate',
    method: 'GET'
  })
}

// 验证验证码
export const verifyCaptcha = (payload) => {
  // payload: { captchaId: string, code: string }
  return request({
    url: '/captcha/verify',
    method: 'POST',
    data: payload
  })
}

// 调试用：查看验证码统计
export const getCaptchaStats = () => {
  return request({
    url: '/captcha/stats',
    method: 'GET'
  })
}