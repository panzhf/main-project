import { httpPost, httpGet } from '@/utils/request'
export const apiCloud = data => httpPost('request/cloudstorerequestapi', data)
export const apiCloudT = data => httpPost('retailcommon/registeruniversal', data, { requireAuth: false }) //不需要验证登录流程的云店公共接口--邀请注册模块
export const apiGetWxMobile = data => httpPost('commanage/getwxmobile', data, { requireAuth: false }) // 获取微信手机号
export const apiGetSubscribeTemplateId = data =>
  httpGet('commanage/getsubscribetemplateid', data, { requireAuth: false, loading: false }) // 获取订阅消息模板id
export const apiGetWxCodeScene = data => httpPost('commanage/getwxcodescene', data, { requireAuth: false }) // 获取太阳码参数
//data格式为:
// {
//     url: '/api/v1/Withdrawa/GetStoreRevenue', //云店相关接口地址
//     method: 'get', //云店相关接口的请求方式
//     data: {} //云店相关接口的请求参数--需要以JSON格式传过去给后端
// }
