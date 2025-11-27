import request from './request'

// 生成验证码
export function generateCaptcha() {
  return request({
    url: '/captcha/generate',
<<<<<<< Updated upstream
<<<<<<< HEAD
    method: 'get'
=======
    method: 'get',
    params: { _t: Date.now() }
>>>>>>> 16bd7400f4a7b2f8ed2b379b3664930ebe28314d
=======
    method: 'get',
    params: { _t: Date.now() }
>>>>>>> Stashed changes
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
