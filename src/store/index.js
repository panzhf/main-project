import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { apiGetStoreInfo } from '@/api/store'
import { apiGetChannelBasicSetting } from '@/api/order'
import { apiGetRegisterInfo, apiGetExtraList } from '@/api/common'
import { apiGlobalTheme } from '@/api/decoration'
import { initGlobalTheme } from '@/config/decoration'
import { getExtConfig } from '@/config'
import { msg, ck } from '@/utils'
import { getJsCode } from '@/utils/set-mp'
import moduleUpgradeTip from 'packages/store/modules/upgrade-tip'
import messageCenter from './modules/message-center'
import moduleTabbar from 'packages/store/modules/tabbar'

import moduleScanTransfer from 'packages/store/modules/scan-transfer'
import moduleScanAuth from 'packages/store/modules/scan-auth'
Vue.use(Vuex)
const getDefaultState = () => {
  return {
    alreadyWXBind: false, //判断是否绑定过微信
    showFavoritesTips: true, // 首页提示
    storeInfo: {}, // 店铺信息
    storeRegisterAddress: {
      // 门店注册 激活地址
      province: '',
      city: '',
      area: '',
      street: '',
      address: '',
      lanandlat: '',
      houseNumber: ''
    },
    storeRegisterAuthResult: {
      openid: '' // 注册时获取 公众号openid
    },
    inviteActivityInfo: {
      // 邀请有礼的活动信息
      actimgpath: '',
      acttitle: '',
      sharetext: '',
      shareimgpath: ''
    },
    userOpenid: '', // 微信用户在品牌公众号下的openid
    refreshTag: false, // 启用刷新
    showOverdue: false, // 首页弹过期提示,true已提示过
    choosedGoodsList: [], // 已选的商品列表
    fcBasicSet: {
      //  获取防窜后台基础设置，每次都要获取最新
      isopendealerordersystem: 0, //是否开启经销商订单系统；0否；1是；默认0
      isuploadpayvoucher: 0, //是否需要上传支付凭证；0否；1是；默认0；
      signintype: 0, // 签收入库方式,1:扫码签收,2:一键签收,默认1扫码签收 3两者
      isopenorderprice: 0
    },
    assetsInfo: { isGetData: false },
    activateBrand: {}, // 正在被激活的品牌信息
    writeoffResult: {}, // 核销结果
    guideManage: {
      ismdadddginfo: 0, //是否手动添加导购注册1-是0-否
      ismdinvitationdgregister: 0, //是否邀请导购注册1-是0-否
      ismdmodifydginfo: 0, //是否修改导购1-是0-否
      ismddeldg: 0 //是否删除导购1-是0-否
    },
    // 门店专属小程序信息
    // isFetchedSpecial: false,
    isSpecialMp: false,
    themeInfo: {
      color: '#FF7640' // 平台版默认主题颜色。宝洁: #026dcc
    }
  }
}
const state = getDefaultState()

// 防重复调用的缓存
let fetchGlobalThemePromise = null

const store = new Vuex.Store({
  state,
  getters: {
    showOrderPrice(state) {
      // 下单显示订购价
      return !!state.fcBasicSet?.isopenorderprice
    },
    isExpires(state) {
      return state.storeInfo.isexpires || 0
    },
    themeVars(state) {
      const style = []
      style.push(`--theme-color: ${state.themeInfo.color}`)
      return style.join(';')
    }
  },
  mutations: {
    updateRefreshTag(state, val) {
      state.refreshTag = val
    },
    alreadyWXBindFn(state, val) {
      state.alreadyWXBind = val
    },
    setUserOpenid(state, val) {
      state.userOpenid = val
    },
    setShowFavoritesTips(state, val) {
      state.showFavoritesTips = val
    },
    setShowOverdue(state, val) {
      state.showOverdue = val
    },
    updateStoreInfo(state, obj) {
      let tempObj = Object.assign(state.storeInfo, { ...obj })
      state.storeInfo = { ...tempObj }
    },
    updateAssetInfo(state, obj) {
      state.assetsInfo = { ...obj }
    },
    updateFcBasicInfo(state, obj) {
      state.fcBasicSet = { ...obj }
    },
    updateGuideManage(state, obj) {
      state.guideManage = { ...obj }
    },
    updateStoreRegisterInfo(state, obj) {
      state.storeRegisterAddress = { ...obj }
    },
    updateStoreRegisterAuthResult(state, obj) {
      let tempObj = Object.assign(state.storeRegisterAuthResult, { ...obj })
      state.storeRegisterAuthResult = { ...tempObj }
    },
    updateInviteActivityInfo(state, obj) {
      let tempObj = Object.assign(state.inviteActivityInfo, { ...obj })
      state.inviteActivityInfo = { ...tempObj }
    },
    updateChoosedGoodsList(state, obj) {
      state.choosedGoodsList = [...obj]
    },
    updateWriftoffResult(state, obj) {
      state.writeoffResult = { ...obj }
    },
    setActivateBrand(state, data) {
      state.activateBrand = data
    },
    setSpecialMp(state, data) {
      // state.isFetchedSpecial = true
      state.isSpecialMp = data
    },
    setThemeInfo(state, themeInfo) {
      state.themeInfo = themeInfo
    },
    resetState(state) {
      const defaultState = getDefaultState()
      const excludeKeys = ['themeInfo', 'isSpecialMp']
      Object.keys(state).forEach(key => {
        if (!excludeKeys.includes(key)) {
          state[key] = defaultState[key]
        }
      })
      const excludeMoudleKeys = ['theme']

      // 遍历所有模块并重置其状态
      const modules = store._modulesNamespaceMap || {}
      for (const path in modules) {
        // path 一般是模块名+ `/`，像 `task/`
        const module = modules[path]
        const moduleKey = path.replace(/\/$/, '')
        if (excludeMoudleKeys.includes(moduleKey)) {
          state[moduleKey] = module.state || {}
        } else {
          const moduleDefaultState =
            typeof module._rawModule.state === 'function' ? module._rawModule.state() : module._rawModule.state || {}
          state[moduleKey] = moduleDefaultState
        }
      }
    }
  },
  actions: {
    setStoreInfo({ commit }, params) {
      // 获取店铺基础信息
      return new Promise(resolve => {
        apiGetStoreInfo({
          storeid: params.storeid,
          m: params.m
        })
          .then(res => {
            if (ck(res)) {
              const { return_code: code, return_msg: msg } = res
              let storeInfoNew = {}
              for (let a in res.return_data) {
                storeInfoNew[a] = res.return_data[a] == null ? '' : res.return_data[a]
              }
              commit('updateStoreInfo', storeInfoNew)
              resolve({ code, msg })
            }
          })
          .catch(() => {
            // 接口异常重置
            // msg('网络开小差，请重试！')
          })
      })
    },
    updateStoreInfo({ commit }, data) {
      // 更新店铺信息
      data && commit('updateStoreInfo', data)
    },
    getAssetInfo({ commit }) {
      // 获取资产
      return new Promise((resolve, reject) => {
        apiGetExtraList()
          .then(res => {
            if (res.return_code === 0) {
              commit('updateAssetInfo', {
                isGetData: true,
                ...res.return_data
              })
              resolve()
            } else {
              commit('updateAssetInfo', { isGetData: false })
              reject('error')
              msg('获取数据失败，请重试')
            }
          })
          .catch(() => {
            commit('updateAssetInfo', { isGetData: false })
            // 接口异常重置
            reject('error')
            // msg('网络开小差，请重试！')
          })
      })
    },
    updateAssetInfo({ commit }, data) {
      // 更新店铺信息
      data && commit('updateAssetInfo', data)
    },
    updateWriftoffResult({ commit }, data) {
      // 核销结果
      data && commit('updateWriftoffResult', data)
    },
    getFcBasicInfo({ commit }) {
      // 获取防窜基础设置
      apiGetChannelBasicSetting()
        .then(res => {
          if (res.return_code === 0) {
            commit('updateFcBasicInfo', res.return_data)
          } else {
            msg(res.return_msg)
          }
        })
        .catch(() => {
          // 接口异常重置
          // msg('网络开小差，请重试！')
        })
    },
    async getStoreSet({ commit }) {
      // 获取后台门店配置
      const { memberLogin: m } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      apiGetRegisterInfo({
        js_code: await getJsCode(),
        m,
        d: 0,
        salesmanid: 0
      })
        .then(res => {
          if (res.return_code === 0) {
            // 获取门店配置里的导购管理配置信息
            const salermanage = res.return_data.basicsettings?.salermanage
            salermanage && commit('updateGuideManage', salermanage)
          } else {
            msg(res.return_msg)
          }
        })
        .catch(() => {})
    },

    updateFcBasicInfo({ commit }, data) {
      // 更新防窜
      data && commit('updateFcBasicInfo', data)
    },
    updateStoreRegisterInfo({ commit }, data) {
      data && commit('updateStoreRegisterInfo', data)
    },
    updateStoreRegisterAuthResult({ commit }, data) {
      data && commit('updateStoreRegisterAuthResult', data)
    },
    updateInviteActivityInfo({ commit }, data) {
      data && commit('updateInviteActivityInfo', data)
    },
    updateChoosedGoodsList({ commit }, data) {
      data && commit('updateChoosedGoodsList', data)
    },
    setShowOverdue({ commit }, data) {
      commit('setShowOverdue', data)
    },
    setalreadyWXBindFn({ commit }, data) {
      data && commit('alreadyWXBindFn', data)
    },
    initSpecialMp({ commit }) {
      return new Promise(resolve => {
        const config = getExtConfig()
        const d = config && config.isSpecial
        commit('setSpecialMp', !!d)
        resolve()
      })
    },
    async fetchGlobalTheme({ commit, state }, params = {}) {
      // 如果已经有正在进行的请求，直接返回该 Promise
      if (fetchGlobalThemePromise) {
        return fetchGlobalThemePromise
      }

      // 创建新的请求 Promise
      fetchGlobalThemePromise = (async () => {
        try {
          // await dispatch('initSpecialMp')
          const storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')

          const hasMemberLogin = storeSettingInfo && storeSettingInfo.memberLogin
          // 专属小程序或者门店登录过的，或者传了params.m，查询主题色
          if (state.isSpecialMp || hasMemberLogin || params.m) {
            let memberLogin

            if (state.isSpecialMp) {
              // 专属小程序，从 extConfig 获取
              memberLogin = getExtConfig().memberLogin
            } else if (params.m) {
              // 不是专属小程序，但传了 params.m，使用 params.m
              memberLogin = params.m
            } else {
              // 不是专属小程序，从 storeSettingInfo 获取
              memberLogin = storeSettingInfo.memberLogin
            }

            const res = await apiGlobalTheme({ memberLogin, sourcetype: 8 })
            if (!res || res.return_code !== 0) {
              commit('setThemeInfo', initGlobalTheme())
              return
            }
            const components = res.return_data || []
            components.forEach(item => {
              const data = JSON.parse(item.data)
              if (item.code === 'GlobalTheme') {
                commit('setThemeInfo', data)
              }
            })
          } else {
            commit('setThemeInfo', initGlobalTheme())
          }
        } finally {
          // 请求完成后清除缓存，允许下次重新请求
          fetchGlobalThemePromise = null
        }
      })()

      return fetchGlobalThemePromise
    }
  },
  modules: {
    upgradeTip: moduleUpgradeTip,
    messageCenter,
    // theme: moduleTheme,
    tabbar: moduleTabbar,
    scanTransfer: moduleScanTransfer,
    scanAuth: moduleScanAuth
  },
  plugins: [
    createPersistedState({
      // 使用持久化插件,注意: 不是所有的数据有必要持久化
      key: 'app_data',
      paths: ['storeInfo'], // 持久化部分数据
      storage: {
        getItem: key => uni.getStorageSync(key),
        setItem: (key, value) => uni.setStorageSync(key, value),
        removeItem: key => uni.removeStorageSync(key)
      }
    })
  ]
})

export default store
