import { httpPost } from '@/utils/request'

export const apiGetPersonalInfo = data => httpPost('personalCenter/getInfobymob', data) // 个人信息获取
export const apiResetPassword = data => httpPost('personalCenter/resetpwd', data) // 通过原密码修改密码
export const apiResetPasswordByCode = data => httpPost('personalCenter/setpwdbycode', data) // 通过验证码修改密码
export const apiSetInitialPassword = data => httpPost('personalCenter/setinitialpwd', data) // 设置初始密码
export const apiLogout = data => httpPost('personalCenter/loginout', data) // 退出登录
export const apiUpdateUserName = data => httpPost('personalCenter/updateusername', data) // 修改名称
export const apiUpdateUserHeadimg = data => httpPost('personalCenter/updateheadimg', data) // 修改头像
