import { httpPost } from '@/utils/request'
export const apiGetCashCouponList = data => httpPost('writeoff/getcashcouponlist', data, { loading: true }) // 1 获取现金卡券列表
export const apiCreateCashCouponCode = data => httpPost('writeoff/createcashcouponcode', data, { loading: true }) // 2 生成现金卡券核销码
export const apiGetCouponDetail = data => httpPost('writeoff/cashcoupondetail', data, { loading: true }) // 3 现金卡券详情
export const apiGetCouponResult = data => httpPost('writeoff/writeoffcashcouponresult', data, { loading: false }) // 3 现金卡券核销结果
