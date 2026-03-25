import { httpPost, httpWrap } from '@/utils/request'
export const apiGetConsumerRecord = data =>
  httpPost('activitymanage/channelcustomersaomarecord', data, { loading: true }) // 消费者扫码明细接口
export const apiGetAwardRecord = data => httpPost('activitymanage/channelcustomerawardrecord', data, { loading: true }) // 消费者领奖明细接口

// 筛选提领券
export const apiGetAwardRecordListReadStatiesDB = data =>
  httpWrap({
    url: 'AwardRecord.Award/V1/AwardRecordListReadStatiesDB',
    data,
    method: 'post',
    type: 4,
    options: { loading: false }
  })
