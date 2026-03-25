<template>
  <view v-if="showDialog" class="dialog">
    <view class="dialog-mask"></view>
    <view class="dialog-content">
      <view class="dialog-title">奖励说明</view>
      <view class="dialog-desc">
        <view class="message">赏金来源：</view>
        <view class="box">
          推荐顾客扫描门店码或参与云店活动领取待解锁红包，顾客购买商品后，扫描包装内的二维码即可自动解锁到账，如红包券已设置赏金，则顾客每解锁一个红包，您都可获得一份赏金。
        </view>
      </view>
      <view class="dialog-desc">
        <view class="message">赏金领取指南：</view>
        <view class="box">
          1、若您获得的赏金属于红包零钱，可随时点击页面【前往提现】按钮进行提现，若获得品牌红包直接到微信零钱账号上；
        </view>
        <view class="box">2、若您获得的赏金属于微信红包，需手动点击领取（有效期为24小时），请留意微信消息领取；</view>
        <view class="box">3、若红包发放失败，请联系客服进行补发。</view>
      </view>
      <u-icon class="dialog-close" name="close-circle" color="#fff" size="60" @click="close"></u-icon>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    value: Boolean
  },
  computed: {
    showDialog: {
      get() {
        return this.value
      },
      set(val) {
        this.$emit('input', val)
      }
    }
  },
  methods: {
    close() {
      this.showDialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  z-index: 1;
  .dialog-mask {
    position: fixed;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 100;
  }
  .dialog-content {
    position: fixed;
    width: 600rpx;
    height: 700rpx;
    background: #fff;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 999;
    border-radius: 20rpx;
    // opacity: 0;
    // transform: translate3d(0, 0, 0) scale(1.2);
    // transition-property: transform, opacity;
  }
  .dialog-close {
    color: #fff;
    font-size: 60rpx;
    font-family: PingFang SC;
    position: absolute;
    padding: 10rpx;
    bottom: -120rpx;
    left: 50%;
    transform: translateX(-50%);
  }
  .dialog-title {
    position: absolute;
    top: -10rpx;
    width: 100%;
    height: 75rpx;
    line-height: 75rpx;
    background: url('https://stati.weixin12315.com/storemini/miniImages/miniposter/title-photo.png') no-repeat center
      top;
    background-size: 320rpx 75rpx;
    text-align: center;
    color: #fff;
    font-size: 32rpx;
    font-family: PingFang SC;
    z-index: 999;
  }
  .dialog-desc {
    padding: 0 40rpx;
    line-height: 40rpx;
    &:nth-of-type(2) {
      margin-top: 102rpx;
      margin-bottom: 51rpx;
    }
    .message {
      height: 52rpx;
      font-size: 26rpx;
      font-family: PingFang SC;
    }
    .box {
      font-size: 24rpx;
      color: #666;
      font-family: PingFang SC;
    }
  }
}
// .dialog-show .dialog-content {
//   opacity: 1;
//   transition-duration: 300ms;
//   transform: translate3d(0, 0, 0) scale(1);
//   transition-property: transform, opacity;
// }

// .dialog-out .dialog-content {
//   opacity: 0;
//   transition-duration: 300ms;
//   transform: translate3d(0, 0, 0) scale(0.815);
//   transition-property: transform, opacity;
// }
</style>
