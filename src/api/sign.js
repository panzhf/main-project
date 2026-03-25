import { httpPost } from '@/utils/request'
export const apiGetGignList = data => httpPost('goodsmanage/getgoodssigninlist', data, { loading: true }) // 1 获取货品签收列表
export const apiGetGignDetail = data => httpPost('goodsmanage/getgoodssignindetail', data, { loading: true }) // 2 获取货品签收详情
export const apiGetCodeList = data => httpPost('goodsmanage/getsignincodedetail', data, { loading: true }) // 3 获取货品物流码明细
export const apiGetScanCodeDetail = data => httpPost('goodsmanage/getorderscancodedetail', data, { loading: true }) // 4 扫码商品列表详情
export const apiScanSign = data => httpPost('goodsmanage/scancodeinsign', data, { loading: true }) // 5 商品扫码签收
export const apiSignAll = data => httpPost('goodsmanage/goodssignin', data, { loading: true }) // 6 商品一键签收
export const apiFinishOrder = data => httpPost('goodsmanage/requestendgoods', data, { loading: true }) // 7 商品提前结单

export const apiFastSign = data => httpPost('goodsmanage/storefastsign', data, { loading: true }) // 8 快速签收
export const apiComfirmSign = data => httpPost('goodsmanage/storefastcomfirmsign', data, { loading: true }) // 9 确认完成签收
