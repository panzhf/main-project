import { httpPost, httpGet, httpWrap } from '@/utils/request'
import { getExtConfig } from '@/config'

export const apiGetStoreInfo = data => httpGet('store/getstoreinfo', data, { loading: false, showToast: false }) // 门店基础信息
export const apiGetStoreData = data => httpGet(`store/getstoredata`, data, { loading: false, showToast: false }) // 店铺数据信息
export const apiUpdateStoreInfo = data => httpPost('store/updatestoreinfo', data) // 店铺信息修改
export const apiUpdateStoreMobile = data => httpPost('store/updatestorermobile', data) // 修改店铺负责人手机号
export const apiGetstoreList = data => {
  let params = { ...data }
  const config = getExtConfig()
  if (config.isSpecial === 1) {
    params.appid = config.appID || ''
  }
  return httpGet('store/getstorelist', params)
} // 获取门店列表

export const apiGetHomeNum = data => httpGet(`storemanage/gethomenum`, data, { loading: false, showToast: false }) // 获取首页数据（例如签收）

export const apiGetStoreRelationSalesmans = data => httpGet('store/getstorerelationsalesmans', data) // 获取门店所属业务员列表
export const apiGetdealerinfos = data => httpGet('store/getdealerinfos', data) // 获取门店报销所属经销商列表
// 获取门店最近一次报销所属报销人
export const apiGetStoreLastExpenseUser = data => httpGet('store/getstorelastexpenseuser', data, { loading: false })

export const apiStoreMdsetting = data => httpWrap({ url: 'store/mdsetting', method: 'get', type: 2, data }) // 获取是否显示客服电话
