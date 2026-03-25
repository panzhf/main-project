<template>
  <view v-if="needUpgradeTip" class="warning-tips fs-22">
    <slot />
    <text class="link" @tap="drowReturnVoucher">查看返货券</text>
  </view>
</template>
<script>
export default {
  props: {},
  data() {
    return {}
  },
  computed: {
    needUpgradeTip() {
      return this.$store.state.upgradeTip.needUpgradeTip
    }
  },
  methods: {
    drowReturnVoucher() {
      uni.redirectTo({ url: '/pages/return-coupon/index' })
    }
  }
}
</script>
<style lang="scss" scoped>
.warning-tips {
  color: #ff5e33;
  background: #fff5f1;
  margin-top: -20rpx;
  margin-bottom: 20rpx;
  padding: 10rpx 30rpx;
  line-height: 30rpx;
  .link {
    color: #3385ff;
  }
}
</style>
