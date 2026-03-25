import { httpPost } from '@/utils/request'
export const apiGetActivationInfo = (data, loading = true) =>
  httpPost('commanage/getstoreactivateinfo', data, { requireAuth: false, loading: loading }) // 1 门店激活信息
export const apiGetStoreByNo = (data, loading = true) =>
  httpPost('commanage/getstorebynoinfo', data, { requireAuth: false, loading: loading }) // 2 根据门店编号获取门店信息
export const apiStoreActivate = data => httpPost('commanage/storeactivate', data, { requireAuth: false }) // 3 门店激活

export const apiGetStoreDetail = (data, loading = true) =>
  httpPost('retailcommon/getstoreinfo  ', data, { requireAuth: false, loading }) //  4 获取门店信息
