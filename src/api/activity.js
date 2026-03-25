import { httpPost, httpGet, httpWrap } from '@/utils/request'
export const apiGetActivityInfo = data => httpPost('activitymanage/v1/getactivityinfo', data, { loading: true }) // 1 获取活动信息
export const apiGetInviteInfo = data => httpGet('activitymanage/getstoreinviterewardsinfo', data, { loading: true }) // 2 获取门店邀请有礼活动详情
export const apiGetInviteStoreList = data => httpPost('activitymanage/getstoreinvitelist', data, { loading: true }) // 3 获取门店邀请有礼活动门店列表
export const apiGetCode = data => httpPost('storemanage/getregistercode', data, { loading: true, requireAuth: false }) // 4 获取门店注册太阳码
export const apiGetInviteDetail = data =>
  httpGet('commanage/getstoreactinfo', data, { loading: true, requireAuth: false }) // 5 获取门店邀请活动详情

export const apiGetStoreDealer = data =>
  httpPost('commanage/getregisterdealerlist', data, { loading: true, requireAuth: false }) // 6 获取所属经销商列表

export const apiGetStoreRegisterMobile = (data, loading = true) =>
  httpPost('commanage/getstoreregistermobile', data, { loading, requireAuth: false }) // 7 获取门店注册手机号
export const apiSubmitRegister = data =>
  httpPost('commanage/storeregister', data, { loading: true, requireAuth: false }) // 8 门店提交注册
export const apiGetStoreTypes = data => httpGet('commanage/getstoretypes', data, { loading: true, requireAuth: false }) // 9 获取门店类型

// 渠道有礼获取返利明细
export const apiGetActivityAwardlists = data => httpPost('activitymanage/getawardlists', data, { isMkt: true }) // 渠道返利奖励记录列表

// 活动中心
export const apiGetActivityBanner = () => httpGet('activitymanage/gethomepagebanner') // 首页banner
export const apiGetActivityList = data => httpPost('activitymanage/getpageactivity', data) // 活动列表
export const apiActivityDetail = data => httpPost('activitymanage/getstoreactivityinfo', data) // 活动详情
export const apiGetCouponList = data => httpPost('activitymanage/getsendcouponlist', data) // 红包券-发券记录
export const apiGetRewardList = data => httpPost('activitymanage/getmyrewardlist', data) // 红包券-我的赏金
export const apiGetStoreNewActs = data =>
  httpWrap({
    url: 'outact/GetStoreNewActs',
    data,
    method: 'post',
    type: 5,
    options: { loading: false }
  }) // 装修中心-获取门店活动列表
