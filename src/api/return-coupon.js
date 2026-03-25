import { httpPost } from '@/utils/request'
export const apiGetConvertDetail = data =>
  httpPost('activitymanage/getexchangeactivityInfodetail', data, { loading: true })
export const apiGetReturnCouponList = data => httpPost('writeoff/getsubsidygoodsvoucherlist', data, { loading: true })
export const apiGetReturnCouponDetail = data =>
  httpPost('writeoff/getsubsidygoodsvoucherdetail', data, { loading: true })
export const apiRenturnCouponWriteOff = data =>
  httpPost('writeoff/getsubsidygoodsvoucherwriteofflist', data, { loading: true })

export const apiGetSubsidygoodsvoucherliststatistics = data =>
  httpPost('writeoff/getsubsidygoodsvoucherliststatistics', data, { loading: true })
