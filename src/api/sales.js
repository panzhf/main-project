import { httpPost, httpGet } from '@/utils/request'

// export const apiGetUserInfoRule = data => httpGet('clerkmanage/getclerkauthority', data, { loading: false }) // 获取用户权限集合

export const apiGetUserInfoRule = data => httpGet('clerkmanage/getmenuconfig', data, { loading: false }) // 获取用户权限集合

export const apiGetclerklist = data => httpPost('clerkmanage/getclerklist', data, { loading: true }) // 获取店员列表
export const apiGetclerkAuditlist = data => httpPost('clerkmanage/listreviewclerk', data, { loading: true }) // 获取审核列表
export const apiGetclerkEdid = data => httpPost('clerkmanage/updateclerk', data, { loading: true }) // 修改店员信息
export const apiGetclerkDetail = data => httpGet('clerkmanage/getclerkinfo', data, { loading: true }) // 获取店员信息
export const apiGetclerkDelete = data => httpPost('clerkmanage/deleteclerk', data, { loading: true }) // 删除店员
export const apiGetRegisterCode = data => httpPost('clerkmanage/getregistercode', data, { loading: true }) // 邀请店员注册获取太阳码
export const apiGetclerkReviewDetail = data => httpGet('clerkmanage/getclerkreviewdetail', data, { loading: true }) // 获取审核详情
export const apiGetnoticeboard = data => httpGet('clerkmanage/getnoticeboard', data, { loading: true }) // 获取公告栏
export const apiGetclerkReviewClerk = data => httpPost('clerkmanage/reviewclerk', data, { loading: true }) // 审核店员
export const apiGetStoreInfo = data =>
  httpPost('retailcommon/getstoreinfo', data, { loading: true, requireAuth: false }) // 注册查看门店信息
export const apiGetStoreRrgister = data =>
  httpPost('retailcommon/insertclerk', data, { loading: true, requireAuth: false }) // 注册店员
