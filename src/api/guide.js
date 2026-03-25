import { httpPost, httpWrap } from '@/utils/request'
export const apiGetCode = data => httpPost('salermanage/getwxcode', data) // 生成太阳码

export const apiGuideList = data => httpWrap({ url: 'saler/listsaler', method: 'post', type: 2, data }) // 导购员列表
export const apiGuideDetail = data => httpWrap({ url: 'saler/getsalesmanbyid', method: 'get', type: 2, data }) // 导购员详情/审核详情

export const apiEditGuide = data => httpWrap({ url: 'saler/editsaler', method: 'post', type: 2, data }) // 修改导购
export const apiReviewGuide = data => httpWrap({ url: 'saler/reviewsaler', method: 'post', type: 2, data }) // 审核导购

export const apiAddGuide = data => httpWrap({ url: 'saler/addsaler', method: 'post', type: 2, data }) // 添加导购

export const apidelGuide = data =>
  httpWrap({
    url: `saler/deletesaler?memberlogin=${data.m}&salerid=${data.id}&storeid=${data.storeid}`,
    method: 'post',
    type: 2,
    data: {}
  }) // 删除导购

export const apiModifyMobile = data => httpWrap({ url: 'saler/modifysalermobile', method: 'post', type: 2, data }) // 3 修改手机
export const apiGuideStatus = data => httpWrap({ url: 'saler/enablesaler', method: 'post', type: 2, data }) // 3 修改导购状态
