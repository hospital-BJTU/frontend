import request from './request'

// 生成验证码
export function generateCaptcha() {
  return request({
    url: '/captcha/generate',
    method: 'get'
  })
}

// 验证验证码
export function verifyCaptcha(data) {
  return request({
    url: '/captcha/verify',
    method: 'post',
    data
  })
}
