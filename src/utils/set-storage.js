import { apigetclerkapproveToken, apiGetUserMenu, apiSearchMpInfo } from '@/api/common'
import { ck, msg as showToast } from '@/utils'
import { getJsCode, resetStorage } from '@/utils/set-mp'
import { uploadLog } from 'packages/utils/wx-log'
import dayjs from 'dayjs'
import store from '@/store'
import { getExtConfig } from '@/config'

/*
设置选择门店的token
switchType: 0手动切换  1门店切换 2扫码核销切换
 */
// Helper function to handle scan code switch type
function handleScanCodeSwitch(code, msg, memberloginname, res, memberlogin) {
  const shortName = memberloginname.slice(0, 4)

  if (code === 600018 || msg.includes('账号已被禁用')) {
    const errorMsg =
      code === 600018
        ? `此码属于${shortName}，你的门店账号未激活，需激活`
        : `此码属于${shortName}，你的门店账号被禁用，需解禁`

    showToast(errorMsg, { duration: 4000 })
    uploadLog({
      type: 'scanCode',
      desc: '扫码核销自动切换品牌失败',
      data: res,
      extend: { memberlogin, memberloginname }
    })
    return false // Indicate termination
  }

  return true // Indicate success
}

// Helper function to handle account not activated
async function handleAccountNotActivated(data, item, memberlogin, memberloginname, res) {
  uploadLog({
    type: 'account',
    desc: '未激活',
    data: res,
    extend: { memberlogin, memberloginname }
  })

  if (data.allowActivateState === 0) {
    uni.showModal({
      title: '温馨提示',
      content: '该帐号未激活，请联系品牌激活后登录',
      confirmText: '好的',
      showCancel: false
    })
    return
  }

  store.commit('setActivateBrand', item)
  const { activatetype, salesmanid, storeno, dealerid } = data
  const content =
    activatetype === 2 ? '该门店未激活，需要验证门店编号进行激活，激活后可立即使用' : '该门店未激活，激活后可立即使用'

  uni.showModal({
    title: '温馨提示',
    content,
    success: async e => {
      if (!e.confirm) return

      const mobile = JSON.parse(uni.getStorageSync('accountinfo')).mobile || ''
      const param = `from=login&salemanId=${salesmanid}&m=${memberlogin}&mobile=${mobile}&dealerId=${dealerid}`
      const url =
        activatetype === 2
          ? `/pagesA/activation/index?${param}`
          : `/pagesA/activation/form?${param}&type=1&storeNo=${storeno}`

      const config = getExtConfig()
      if (!config.isSpecial) {
        // 平台版内切换平台版或专属版
        const res = await apiSearchMpInfo({
          MemberLogin: memberlogin
        })
        if (!res || !res.return_data) {
          // 可能返回 {return_code: 50002, return_data: null}
          uni.navigateTo({ url })
          return
        }
        const { isspecial, appid } = res?.return_data || {}
        if (res.return_code === 0 && isspecial && appid) {
          // 平台版跳出专属版
          uni.navigateToMiniProgram({
            appId: appid,
            path: url,
            fail() {
              uni.showToast({
                icon: 'none',
                title: '小程序打开失败'
              })
            }
          })
        } else {
          // 没有开通专属版，常规跳转
          uni.navigateTo({ url })
        }
      } else {
        uni.navigateTo({ url })
      }
    }
  })
}

// Helper function to handle account disabled
function handleAccountDisabled(msg, res, memberlogin, memberloginname) {
  uni.showModal({
    title: '温馨提示',
    content: msg,
    showCancel: false,
    success: ({ confirm }) => {
      if (confirm) {
        // 这里就是点击“确定”后的回调
        uni.reLaunch({
          url: '/pages/login/index'
        })
      }
    }
  })

  uploadLog({
    type: 'account',
    desc: '没通过校验',
    data: res,
    extend: { memberlogin, memberloginname }
  })
}

export async function setToken(item, switchType = 0) {
  const js_code = await getJsCode()
  const { memberlogin, memberloginname, systemid: storeid, clerkid } = item

  store.commit('setActivateBrand', {})

  const res = await apigetclerkapproveToken({
    memberlogin, //当前登录的品牌商id
    storeid, //当前登录的门店ID
    clerkid, //当前登录的店员ID
    js_code
  })

  const { return_code: code, return_data: data, return_msg: msg } = res

  // Success case
  if (code === 0) {
    resetStorage()
    saveClerkApprove(data)
    setStoreSetting(item, switchType)
    return
  }

  // Store switch - no prompt, don't interrupt process
  if (switchType === 1) {
    return
  }

  // Scan code verification switch
  if (switchType === 2) {
    const shouldContinue = handleScanCodeSwitch(code, msg, memberloginname, res, memberlogin)
    if (!shouldContinue) return
    // Continue with current brand verification if not terminated
    return
  }

  // Account not activated
  if (code === 600018) {
    handleAccountNotActivated(data, item, memberlogin, memberloginname, res)
    return
  }

  // Account disabled
  if (msg.includes('账号已被禁用')) {
    handleAccountDisabled(msg, res, memberlogin, memberloginname)
    return
  }

  // Default error case
  showToast(msg)
}
// 设置选择门店的信息
export async function setStoreSetting(info, switchType) {
  let {
    systemid,
    memberlogin,
    clerkid,
    memberloginname,
    roletype,
    mainpartno,
    mainpartname,
    appno,
    memberloginheadpath
  } = info
  // systemid:门店系统级的id
  // roleType：1-店主2-负责人-3店员
  let storeSettingInfo = {
    storeId: systemid,
    clerkId: clerkid,
    memberLogin: memberlogin,
    memberLoginName: memberloginname,
    roleType: roletype,
    mainpartNo: mainpartno,
    mainpartName: mainpartname,
    memberLoginHeadPath: memberloginheadpath,
    appno
  }

  uni.setStorageSync('storeSettingInfo', JSON.stringify(storeSettingInfo))
  // 获取全局主题色
  store.dispatch('fetchGlobalTheme')
  setStoreRule(switchType)
  const storeNumber = uni.getStorageSync('storeNumber')
  const brandList = JSON.parse(uni.getStorageSync('brandList') || '[]')
  const storeList = brandList.map(({ memberlogin, memberloginname, storelist, roletype, status }) => {
    return {
      memberlogin,
      memberloginname,
      num: storelist.length,
      roletype,
      status
    }
  })

  const descText = {
    0: '选择品牌',
    1: '自动切换门店',
    2: '扫码核销自动切换品牌'
  }
  uploadLog({
    type: 'login',
    desc: descText[switchType],
    extend: {
      memberlogin,
      memberloginname,
      storename: mainpartname,
      ...(roletype === 3 && { clerk: true }),
      ...(storeNumber > 1 ? { multipleStore: true, total: storeNumber, storeList } : { singleStore: true })
    }
  })
}
// 设置选择门店的权限
export async function setStoreRule(switchType) {
  let res = await apiGetUserMenu()
  if (ck(res)) {
    uni.setStorageSync('userMenuInfo', JSON.stringify(res.return_data))
    if (switchType !== 0) return
    if (uni.getStorageSync('leaderOpenid')) {
      uni.reLaunch({
        url: uni.getStorageSync('directPath') || '/pages/index/index?from=storelist',
        success() {
          uni.removeStorageSync('directPath')
        }
      })
    } else {
      checkAuthorize()
    }
  }
}
// 检查是否授权
export async function checkAuthorize() {
  // 兼容
  if (!uni.getStorageSync('leaderOpenid') && uni.getStorageSync('authorizeUrl')) {
    uni.navigateTo({
      url: `/pages/index/auth`
    })
  }
}

// 存储信息
export function saveClerkApprove(p) {
  uni.setStorageSync('mToken', p.mToken)
  uni.setStorageSync('leaderOpenid', p.openid)
  uni.setStorageSync('authorizeUrl', p.authorizeurl)
  const currentLoginDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
  uni.setStorageSync('timeOfLogin', { ...uni.getStorageSync('timeOfLogin'), getMTokenTime: currentLoginDate })
}

// 专属版跳转
export async function jumpToSpecial(item) {
  const { memberlogin } = item
  if (!memberlogin) return
  const config = getExtConfig()
  if (!config.isSpecial) {
    // 平台版内切换平台版或专属版
    const res = await apiSearchMpInfo({
      MemberLogin: memberlogin
    })
    if (!res) {
      setToken(item)
      return
    }
    const { isspecial, appid } = res?.return_data || {}
    if (res.return_code === 0 && isspecial && appid) {
      // 平台版跳出专属版
      uni.navigateToMiniProgram({
        appId: appid,
        path: '/pages/index/index',
        fail() {
          uni.showToast({
            icon: 'none',
            title: '小程序打开失败'
          })
        }
      })
    } else {
      // 没有开通专属版，常规跳转
      setToken(item)
    }
  } else {
    // 专属版内跳转
    setToken(item)
  }
}
