import { httpPost, httpGet } from '@/utils/request'
export const apiGetOrderGoods = data => httpPost('placeorder/getordergoods', data, { loading: true }) // 1 获取商品信息
export const apiGetClassifyList = data => httpGet('placeorder/getordergoodsclassify', data, { loading: true }) // 2 获取商品分类
export const apiCreateOrder = data => httpPost('placeorder/createorder', data, { loading: true }) // 3 创建订单
export const apiGetOrderList = data => httpPost('placeorder/getorderlist', data, { loading: true }) // 4 订单列表
export const apiOrderDetail = data => httpPost('placeorder/getorderdetail', data, { loading: true }) // 5 ==订单详情
export const apiCancelOrder = data => httpPost('placeorder/cancelorder', data, { loading: true }) // 6 ==取消订单
export const apiGetChannelBasicSetting = data => httpGet('storemanage/getantichannelbasicset', data, { loading: true }) // 7 获取后台基础设置
export const apiGetDealerForOrder = data => httpPost('placeorder/getorderbydealer', data, { loading: true }) // 8 门店订单所属经销商
export const apiGoodsListForOrder = data => httpPost('placeorder/getorderdeliverydetail', data, { loading: true }) // 9 订单收货明细
export const apiGetOrderStatistics = data => httpGet('order/getordernumber', data, { loading: false }) // 订单统计
