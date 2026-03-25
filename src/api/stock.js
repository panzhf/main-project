import { httpPost } from '@/utils/request'
export const apiDeduce = data => httpPost('goodsmanage/inventorydeduction', data, { loading: true }) // 1 库存扣减
export const apiGetDeduceStatistics = data => httpPost('/goodsmanage/deductionstatistics', data, { loading: true }) // 2 库存扣减统计
export const apiDeduceSubmit = data => httpPost('goodsmanage/inventorydeductionsubmit', data, { loading: true }) // 3 库存扣减提交
export const apiGetDeduceInfo = data => httpPost('goodsmanage/getinventorydeductioninfo', data, { loading: true }) // 4 库存扣减信息

export const apiGetDeduceList = data => httpPost('goodsmanage/inventorydeductionlist', data, { loading: true }) // 5 库存扣减记录
export const apiGetDeduceDetail = data => httpPost('goodsmanage/inventorydeductiondetail', data, { loading: true }) // 6 库存扣减明细

export const apiGetStockList = data => httpPost('statement/inventorystatisticslist', data, { loading: true }) // 7 库存统计列表
export const apiGetStockDetail = data => httpPost('statement/inventorydetail', data, { loading: true }) // 8 库存明细
export const apiGetSmallscaleDetail = data => httpPost('statement/smallscaledetail', data, { loading: true }) // 9 小标明细
