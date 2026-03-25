<template>
  <view class="mobile-confirm full-container flex flex-column flex-middle" :style="themeVars">
    <view class="fs-32">当前负责人手机号</view>
    <view class="num mt-20 fw-bold">{{ leaderOldMobile }}</view>
    <view class="btn-group">
      <button class="primary-btn round" hover-class="button-action" @tap="handleEdit">修改店铺负责人手机号</button>
      <button class="primary-btn plain round mt-40" hover-class="button-action" @tap="handleBack">返回</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showPopup: false, // true: 显示弹窗
      popupContent: '', // 弹窗显示的内容
      leaderOldMobile: '', // 手机号码
      storeLeader: '' // 店铺负责人
    }
  },
  onLoad(options) {
    this.leaderOldMobile = options.leaderOldMobile
    this.storeLeader = options.storeLeader
  },
  onShow() {},
  methods: {
    handleEdit() {
      uni.navigateTo({
        url: `/shop/mobile/desc?leaderOldMobile=${this.leaderOldMobile}&storeLeader=${this.storeLeader}`
      })
    },
    handleBack() {
      this.$goBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-confirm {
  padding-top: 156rpx;
  .num {
    font-size: 48rpx;
  }
  .btn-group {
    width: 520rpx;
    margin-top: 120rpx;
  }
}
</style>
