/*
 * @Description 用于自动切换门店
 */
import { setToken } from '@/utils/set-storage'
import { apiGetstoreList } from '@/api/store'
import { uploadLog } from 'packages/utils/wx-log'
import { apiGetMemberInfo, apiSearchMpInfo } from '@/api/common'
import { getExtConfig } from '@/config'

const switchBrandsmixin = {
  methods: {
    async autoSwitchStore(memberLogin) {
      /*
      1、判断品牌
      2、当前品牌不是码关联的品牌，则判断关联的品牌是否过期，如果过期则提示过期终止核销流程
      3、没有关联的品牌下的门店，则提示去联系注册
      4、筛选关联的品牌的正常状态门店，自动切换到第一个正常状态门店；如果没有正常状态门店，则接第4点
      5、切换到关联品牌的第一个门店，未激活则提示未激活，已被禁用则提示已禁用
      */
      let storeObj = JSON.parse(uni.getStorageSync('storeSettingInfo'))
      if (memberLogin !== storeObj.memberLogin) {
        let brandList = await this.getBrandStoreList()

        const s = brandList.find(i => i.memberlogin === memberLogin)
        if (!s) {
          uploadLog({
            type: 'scanCode',
            desc: `扫码核销自动切换品牌失败,在${memberLogin}下没有门店`
          })
          // 获取该品牌的品牌名称
          let res = await apiGetMemberInfo({
            memberlogin: memberLogin
          })
          if (this.$ck(res, true)) {
            const name = this.getShortName(res.return_data.companyname)
            this.$msg(`此码属于${name}，需在此品牌下注册门店`, { duration: 4000 })
            return Promise.reject()
          }
          return
        }

        const shortName = this.getShortName(s.memberloginname)
        if (s.isexpires === 1) {
          // 产品要求，截取品牌名称前四个字
          this.$msg(`此码属于${shortName}，品牌账号已到期`, { duration: 4000 })
          return Promise.reject()
        }

        const storeList = s.storelist
        if (storeList.length === 0) return this.$msg(`在${shortName}下没有门店哦`, { duration: 4000 })
        // 门店状态：0-禁用,1-启用,3-未激活 4、未激活已禁用
        const d = storeList.find(i => i.status === 1)
        if (!d) {
          const msg = storeList[0].status === 3 ? '你的门店账号未激活，需激活' : '你的门店账号被禁用，需解禁'
          this.$msg(`此码属于${shortName}，${msg}`, { duration: 4000 })
          return Promise.reject()
        }
        const config = getExtConfig()
        if (!config.isSpecial) {
          // 平台版内切换平台版或专属版
          const res = await apiSearchMpInfo({
            MemberLogin: memberLogin
          })
          if (!res || !res.return_data) {
            // 可能返回 {return_code: 50002, return_data: null}
            await setToken(d, 2)
            return
          }
          const { isspecial, appid, miniprogramname = '小程序' } = res?.return_data || {}
          if (res.return_code === 0 && isspecial && appid) {
            // 平台版跳出专属版
            uni.showModal({
              title: '温馨提示',
              content: `该商品属于${shortName}，请使用${miniprogramname}核销`,
              showCancel: false,
              success: () => {
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
              }
            })
            return Promise.reject()
          } else {
            // 没有开通专属版，常规跳转
            await setToken(d, 2)
          }
        } else {
          await setToken(d, 2)
        }
      }
    },
    getShortName(longName) {
      return longName !== '' ? longName.slice(0, 4) : ''
    },
    async getBrandStoreList() {
      let res = await apiGetstoreList()
      if (this.$ck(res, true)) {
        const storeList = res.return_data.list
        uni.setStorageSync('storeNumber', res.return_data.totalcount)
        return storeList
      } else {
        return []
      }
    },
    verifyMemberLogin(memberLogin, actType = 1) {
      const TypeObj = {
        1: '陈列有礼',
        2: 'N元换购',
        3: '宴席有礼'
      }
      return new Promise(resolve => {
        let settingStr = uni.getStorageSync('storeSettingInfo')
        if (!settingStr || !memberLogin) return resolve()
        let storeObj = JSON.parse(settingStr)
        if (storeObj.memberLogin !== memberLogin) {
          return uni.reLaunch({
            url: '/pages/login/index'
          })
        }
        if (storeObj.roleType === 3) {
          this.$msg(`仅门店负责人才可参与${TypeObj[actType]}活动。`)
          return setTimeout(() => {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }, 3000)
        }
        resolve()
      })
    }
  }
}
export default switchBrandsmixin
