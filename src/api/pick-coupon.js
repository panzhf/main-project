import { httpWrap, httpPost } from '@/utils/request'
export const apiListUnuseCoupon = data => httpWrap({ url: 'exchangevoucher/listunusecoupon', method: 'post', data }) // 1 获取待核销提领券列表
export const apiBatchWriteoffCoupon = data => httpPost('writeoff/batchwriteoffcoupon', data) // 2 批量核销提领券
export const apiSingleWriteoffCoupon = data => httpPost('writeoff/singlewriteoffcoupon', data) // 3 单个 核销提领券
export const apiWriteoffRewardList = data => httpWrap({ url: 'writeoff/getwriteoffrewardlist', method: 'post', data }) // 4 核销奖励列表

export const apiGiftList = data => httpWrap({ url: 'writeoff/giftlist', method: 'post', data }) // 5 实物核销记录
export const apiPickupList = data => httpWrap({ url: 'exchangevoucher/listcouponrecord', method: 'post', data }) // 6-1 提领券核销记录 按记录
export const apiPickupListByCoupon = data =>
  httpWrap({ url: 'exchangevoucher/listcouponrecordbycoupon', method: 'post', data }) // 6-2 提领券核销记录 按券

export const apiPickupListRecord = data => httpWrap({ url: 'expense/listcouponrecord', method: 'post', data }) // 7 提领券已报销接口
export const apiGetStorePageByAsset = data => httpWrap({ url: 'expense/storepagebyasset', method: 'post', data }) // 门店分页获取报销资产统计按券查看
export const apiGiftListRecord = data => httpWrap({ url: 'expense/reimburselist', method: 'post', data }) // 8 实物已报销接口
export const apiExpenseDetail = data => httpWrap({ url: 'expense/expensedetail', method: 'get', data }) // 9 提领券报销明细

export const apiPickupConfirm = data => httpWrap({ url: 'expense/couponconfirm', method: 'get', data }) // 10 门店领券确认报销
export const apiGiftConfirm = data => httpWrap({ url: 'expense/confirmreimburse', method: 'post', data }) // 11 实物确认报销

export const apiNotConfirmPickup = data => httpWrap({ url: 'expense/exchangeunreimburselist', method: 'post', data }) // 12 提领券未报销接口

export const apiNotConfirmGift = data => httpWrap({ url: 'expense/unreimburselist', method: 'post', data }) // 13 实物未报销接口

export const apiGiftDetail = data => httpWrap({ url: 'expense/reimbursedetail', method: 'get', data }) // 14 实物报销明细

export const apiWriteoffProduct = data => httpPost('writeoff/writeoffproduct', data) // 15 实物核销接口

export const apiScanSourceCodeWriteOff = data => httpPost('writeoff/scansourcecodewriteoff', data) // 智能营销码核销

export const apiAwaitReiburserList = data => httpWrap({ url: 'reimburse/reimburseprizelist', data, method: 'post' }) // 16 待报销明细

// 获取源码信息码, 关联奖品类型:0-默认,4-动销码领奖
export function apiScanSourcecodeInfo(data) {
  return httpPost(`writeoff/getsourcecodeinfo`, data, { loading: true })
}

export const apiScanCodeWriteoff = data => httpPost('writeoff/scanncodewriteoff', data) // N元换购核销单独一个接口

// 判断是否N元换购
export const apiIsNCode = data => httpPost('writeoff/checksubsidygoodsactivity', data)
