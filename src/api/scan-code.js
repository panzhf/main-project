import { httpPost, httpGet, httpWrap } from '@/utils/request'

/*扫码*/
export function apiSalesActivityscancode(data) {
  return httpPost(`activitymanage/activityscancode`, data)
}

/*奖项*/
export function apiSalesRewardstatus(data, loading = false) {
  return httpPost(`activitymanage/getreward`, data, { loading })
}

/*解析经纬度*/
export function apiCommanageGetlocation(data) {
  return httpGet(`commanage/getlocation`, data)
}

// 获取活动详情
export const apiGetactivityDetail = data => httpGet('activitymanage/getactivitydetail', data, { loading: true })
// 获取开箱记录
export const apiGetChannelpinunpackingrecord = data =>
  httpPost('activitymanage/channelpinunpackingrecord', data, { loading: true })
// 获取领奖记录
export const apiGetChannelpinawardrecord = data =>
  httpPost('activitymanage/channelpinawardrecord', data, { loading: true })
// 获取返利列表
export const apiGetChannelpinrebatedetail = data =>
  httpPost('activitymanage/channelpinrebatedetail', data, { loading: true })

/** 奖品详情 */
export function apiGetPrizeDetail(data) {
  return httpPost(`activitymanage/channelpinawarddetail`, data)
}
// 领取记录红包统计
export const apiGetAwardRecordStat = data => httpPost('activitymanage/getawardrecordstat', data)

// 获取扫码奖品
export const apiGetsweetprizelist = data =>
  httpWrap({ url: 'inner/common/sweepprizelist', data, method: 'post', type: 3 })
// 获取扫码奖品统计数据
export const apiGetsweepprizestatistics = data =>
  httpWrap({ url: 'inner/common/getsweepprizestatistics', data, method: 'post', type: 3, options: { loading: false } })
// 获取营销奖品
export const apiGetmarketprizelist = data =>
  httpWrap({ url: 'inner/common/marketprizelist', data, method: 'post', type: 3 })
// 获取营销奖品统计数据
export const apiGetmarketprizestatistics = data =>
  httpWrap({ url: 'inner/common/getmarketprizestatistics', data, method: 'post', type: 3, options: { loading: false } })
// 获取扫码奖品详情
export const apiGetsweetprizedetail = data =>
  httpWrap({ url: 'inner/common/sweepprizedetail', data, method: 'post', type: 3 })
// 获取营销奖品详情
export const apiGetmarketprizedetail = data =>
  httpWrap({ url: 'inner/common/marketprizedetail', data, method: 'post', type: 3 })
