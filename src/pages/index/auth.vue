<template>
  <view
    id="Loading"
    style="position: fixed; top: 40%; left: 50%; transform: translate(-50%, -50%); width: 300rpx; text-align: center"
  >
    {{ text }}
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>
<script>
import { apiBindOpenId, apigetclerkapproveToken } from '@/api/common'
import { getJsCode } from '@/utils/set-mp'
import { saveClerkApprove } from '@/utils/set-storage'
export default {
  data() {
    return {
      authorizeUrl: '',
      from: '',
      openid: '',
      busy: false,
      text: '正在授权中'
    }
  },
  onLoad(options) {
    this.from = options.from || ''
    uni.navigateTo({
      url: `/pages/index/auth-webview?from=${this.from}`
    })
  },
  onShow() {
    this.$refs.privacyPopup && this.$refs.privacyPopup.refresh()

    uni.$once('getOpenid', res => {
      this.openid = res
      this.onMessage()
    })
  },
  methods: {
    async onMessage() {
      if (this.busy) return
      this.busy = true
      // 以下默认为负责人/店员授权公众号绑定openid,绑定后获取mtoken，跳转到指定页面。若有其他逻辑，请区分
      try {
        const res = await apiBindOpenId({ openid: this.openid })
        if (this.$ck(res)) {
          const {
            clerkId: clerkid,
            memberLogin: memberlogin,
            storeId: storeid
          } = JSON.parse(uni.getStorageSync('storeSettingInfo'))
          const js_code = await getJsCode()
          const tokenRes = await apigetclerkapproveToken({
            memberlogin, //当前登录的品牌商id
            storeid, //当前登录的门店ID
            clerkid, //当前登录的店员ID
            js_code
          })
          if (this.$ck(tokenRes)) {
            saveClerkApprove(tokenRes.return_data)
            uni.reLaunch({
              url: uni.getStorageSync('directPath') || '/pages/index/index',
              success() {
                uni.removeStorageSync('directPath')
              }
            })
          } else {
            // 当mtoken获取失败时重置到登录页
            uni.reLaunch({
              url: `/pages/login/index`
            })
          }
        }
      } catch (e) {
        uni.reLaunch({
          url: `/pages/login/index`
        })
      }
    }
  }
}
</script>
