<template>
  <view v-if="dialogVisible" class="share-popup" :style="themeVars" @touchmove.stop="() => {}">
    <view class="share-popup-box">
      <view class="share-button red" @tap="openSunshine('store')">小程序太阳码</view>
      <view :class="{ red: showWxVideo }" class="share-button" @tap="openSunshine('card')">邀请用户领取会员卡</view>
      <view v-if="showWxVideo" class="share-button" @tap="openWxShare">微信视频号扩展链接</view>
      <u-icon class="close" name="close-circle" color="#fff" size="72" @click="handleClose"></u-icon>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    showWxVideo: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    open() {
      this.dialogVisible = true
    },
    openSunshine(type) {
      this.dialogVisible = false
      this.$emit('openSunshine', type)
    },
    openWxShare() {
      this.dialogVisible = false
      uni.navigateTo({
        url: `./poup-video`
      })
    },
    handleClose() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.share-popup {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100;
  .share-popup-box {
    width: 500rpx;
    padding: 104rpx 75rpx;
    border-radius: 20px;
    background-color: #fff;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .share-button {
      border: 1px solid #cccccc;
      text-align: center;
      font-size: 28rpx;
      height: 70rpx;
      line-height: 70rpx;
      border-radius: 36px;
      font-weight: 700;
      color: #333333;
      &:nth-child(n + 1) {
        margin-top: 30rpx;
      }
    }
    .red {
      border: none;
      color: #fff;
      background-color: var(--theme-color, $uni-color-primary);
    }
    .close {
      position: absolute;
      font-weight: 400;
      bottom: -140rpx;
      left: 50%;
      transform: translate(-50%);
      color: #fff;
    }
  }
}
</style>
