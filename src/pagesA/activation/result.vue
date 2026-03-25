<template>
  <view class="success-content bg-f flex flex-column flex-middle" :style="themeVars">
    <text class="iconfont icon-success"></text>
    <view class="fs-36 fw-bold">激活成功，快登录试试吧~</view>
    <button class="primary-btn round" hover-class="button-action" @tap="handleSSOLogin(1)">立即扫码</button>
    <button class="primary-btn round inverse plain" hover-class="button-action" @tap="handleSSOLogin(0)">
      进入门店
    </button>
  </view>
</template>
<script>
import { ssoLoginMixin } from '@/mixins/sso-login'
export default {
  mixins: [ssoLoginMixin],
  data() {
    return {}
  },
  onLoad(options) {
    options.ssotoken && (this.ssoToken = options.ssotoken)
    options.storeid && (this.ssoStoreId = options.storeid)
    this.$uploadLog({ type: 'activation', desc: '激活成功' })
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/register-result.scss';
</style>
