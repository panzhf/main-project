<template>
  <view>
    <web-view :src="authorizeUrl" @message="onMessage" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>
<script>
export default {
  data() {
    return {
      authorizeUrl: '',
      from: ''
    }
  },
  onLoad(options) {
    this.from = options.from || ''
    this.authorizeUrl =
      this.from === 'registerstore' ? uni.getStorageSync('registerAuthorizeUrl') : uni.getStorageSync('authorizeUrl')
  },
  onShow() {
    this.$refs.privacyPopup && this.$refs.privacyPopup.refresh()
  },
  methods: {
    async onMessage(e) {
      this.show = false
      // 授权成功，获取openid
      let { openid } = e.detail.data[0]

      // 1 邀请有礼注册门店 获取openid
      if (this.from === 'registerstore') {
        this.$store.dispatch('updateStoreRegisterAuthResult', {
          openid
        })
        uni.removeStorageSync('registerAuthorizeUrl')
        return
      }
      // 2 其他
      uni.$emit('getOpenid', openid)
    }
  }
}
</script>
