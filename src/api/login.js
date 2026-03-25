import { httpPost } from '@/utils/request'

export const apiLoginByPwd = data => httpPost('omnipotentRetail/loginbypwd', data, { requireAuth: false }) // 账号密码登录
export const apiLoginByCode = data => httpPost('omnipotentRetail/loginbycode', data, { requireAuth: false }) // 验证码登录
export const apiLoginByWx = data => httpPost('omnipotentRetail/loginbywx', data, { requireAuth: false }) // 手机号登录（微信）
