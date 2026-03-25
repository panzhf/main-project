/**
 * appId: 小程序appId
 * 如果appId与当前小程序一致说明是跳转页面
 * path: 打开的页面，为空则打开首页
 * envVersion: 打开的小程序版本，develop（开发版），trial（体验版），release（正式版）
 * 仅在当前小程序为开发版或体验版时此参数有效。如果当前小程序是正式版，则打开的小程序必定是正式版。
 * onlyMp: 仅打开小程序，不跳转当前小程序页面
 * scene: 小程序场景类型，用于识别不同小程序类型
 */
import { getExtConfig } from '@/config'
import { apiGetMpInfo } from 'packages/api/common'
import { toLowerKey } from 'miduo-utils'

let ALL_MPS = [] // 当前品牌商开通的小程序列表

async function navigateToMP({
  appId = '',
  path = '',
  envVersion = 'release',
  onlyMp = false,
  type,
  scene,
  isReLanuch = false
} = {}) {
  appId = appId.replace(/^\s+|\s+$/g, '')
  if (!appId && !path) return

  if (type === 7) {
    // 公众号文章
    uni.setStorageSync('webViewPath', path)
    if (isReLanuch) {
      uni.reLaunch({
        url: `/packages/src/rule/webview`
      })
    } else {
      uni.navigateTo({
        url: `/packages/src/rule/webview`
      })
    }
    return
  }

  if (path && !path.startsWith('/')) path = `/${path}`

  // 小程序类型映射对象
  const o = {
    memberclub: 0,
    cloudshop: 1,
    guideassistant: 2,
    retailassistant: 3,
    retailspecial: 14
  }

  // 获取小程序列表
  if (ALL_MPS.length === 0) {
    const storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    const memberLogin = storeSettingInfo.memberLogin
    if (memberLogin) {
      const res = await apiGetMpInfo({ m: memberLogin, types: Object.values(o) })
      if (res && res.return_data) {
        ALL_MPS = toLowerKey(res, true).return_data
      }
    }
  }

  // 处理 scene 参数
  if (scene) {
    // 查找对应小程序appid
    appId = ALL_MPS.find(item => item.type === o[scene])?.appid || appId
    if (!appId) return msg('目标小程序未授权')
  }
  const c = toLowerKey(getExtConfig())
  // 跳转小程序情况：1. 明确是跳转小程序 2. 链接设置的appid与小程序实际appid不一致 3. 链接不是零售助手/门店专属小程序相关链接
  if (
    onlyMp ||
    (!onlyMp && appId && c.appid !== appId) ||
    (scene && !['retailassistant', 'retailspecial'].includes(scene))
  ) {
    uni.navigateToMiniProgram({
      appId,
      path,
      envVersion,
      fail(err) {
        if (err.errMsg.includes('myself')) {
          // 跳转当前小程序页面
          uni.navigateTo({
            url: path
          })
          return
        }
        // 打开失败
        if (!err.errMsg.includes('cancel') && !err.errMsg.includes('navigation is in progress')) {
          msg('跳转小程序失败，请检查小程序ID或页面路径是否正确')
        }
      }
    })
    return
  }
  if (isReLanuch) {
    uni.reLaunch({
      url: path,
      fail() {
        msg('跳转失败，请检查页面路径是否正确')
      }
    })
  } else {
    uni.navigateTo({
      url: path,
      fail() {
        msg('跳转失败，请检查页面路径是否正确')
      }
    })
  }
}
function msg(title, { icon = 'none', duration = 2000, mask = true } = {}) {
  title &&
    uni.showToast({
      title,
      duration,
      mask,
      icon
    })
}
export default navigateToMP
