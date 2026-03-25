import { httpGet, httpPost } from '@/utils/request'
// 消息中心
export const apiMessageList = data => httpPost('message/querymemberinternalmessage', data)
export const apiMessageRead = data => httpPost('message/markmemberinternalmessageread', data, { loading: false })
// 获取订阅配置
export const apiSubscribeSetting = data => httpGet('message/getmembermessagesubscribedetail', data, { loading: false })
// 回传订阅结果
export const apiSubscribeReport = data => httpPost('message/addmessagesubscriberecord', data, { loading: false })
// 获取未读消息数
export const apiUnreadMessageCount = data => httpPost('message/getunreadnoticecount', data, { loading: false })
