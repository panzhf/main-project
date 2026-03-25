import { httpGet } from '@/utils/request'
export const apiGetStoreRevenue = data => httpGet('Withdrawa/GetStoreRevenue', data) // 门店营收
