/*
 * 单独对页面进行设置
 */
import store from '@/store'
import log from 'packages/utils/wx-log'
// 设置导航颜色
export function setNavigationBarColor({ frontColor = '#000000', backgroundColor = '#FF7640' } = {}) {
  uni.setNavigationBarColor({
    frontColor,
    backgroundColor
  })
}

// 隐藏home
export function hideHomeButton() {
  if (uni.canIUse('hideHomeButton')) {
    uni.hideHomeButton()
  }
}

// 登录
export function getJsCode() {
  return new Promise(function (resolve, reject) {
    uni.login({
      // 获取登录凭证（code）
      provider: 'weixin',
      success: function success(res) {
        if (res.code) {
          resolve(res.code)
        } else {
          reject(res)
        }
      },
      fail: function fail(err) {
        reject(err)
      }
    })
  })
}

// 获取页面参数
export function parseUrlSearch(search) {
  let oGetVars = {}
  for (let aItKey, nKeyId = 0, aCouples = search.substr(0).split(','); nKeyId < aCouples.length; nKeyId++) {
    aItKey = aCouples[nKeyId].split('=')
    oGetVars[decodeURIComponent(aItKey[0])] = aItKey.length > 1 ? decodeURIComponent(aItKey[1]) : ''
  }
  return oGetVars
}

// 返回登录页清除数据
export function removeStorage() {
  try {
    resetStorage()
    const excludeKeys = ['TestFlag', 'systemInfo', 'testAccount', 'stopUpdateTipsMap'] // 不需清除数据的key
    const res = uni.getStorageInfoSync() // 获取所有的key
    const removeKeys = res.keys.filter(item => !excludeKeys.includes(item))
    removeKeys.forEach(key => uni.removeStorageSync(key))
  } catch (e) {
    log.error({
      type: 'removeStorage',
      data: JSON.stringify(e)
    })
  }
}
// 切换品牌等关键节点需要清除数据
export function resetStorage() {
  try {
    const keys = ['userMenuInfo', 'personalInfo', 'storeSettingInfo', 'leaderOpenid', 'authorizeUrl']
    keys.forEach(key => uni.removeStorageSync(key))
    store.commit('resetState')
    getApp().globalData.isDealerBinded = false
  } catch (e) {
    log.error({
      type: 'resetStorage',
      data: JSON.stringify(e)
    })
  }
}
