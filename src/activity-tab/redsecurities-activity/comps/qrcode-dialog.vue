<template>
  <view :class="['money-dialog', showMoneyDialog === 1 ? 'dialog-show' : 'dialog-out']">
    <view class="dialog-mask"></view>
    <view class="dialog-content">
      <view class="dialog-title">
        <view class="follow">关注公众号 {{ publicCode.CompanyName }}</view>
        <view class="msg">（前往公众号-个人中心进行提现）</view>
        <view class="round-left"></view>
        <view class="round-left1"></view>
        <view class="round-right"></view>
        <view class="round-right1"></view>
      </view>
      <view class="dialog-middle">
        <view class="photo">
          <image class="img-photo" :src="publicCode.QRUrl" @tap="saveImgToPhotosAlbumTap" />
        </view>
        <view class="message">长按下载二维码图片</view>
      </view>
      <u-icon class="dialog-close" name="close-circle" color="#fff" size="60" @click="changeshowMoneyDialog"></u-icon>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    showMoneyDialog: {
      type: Number,
      default: 0
    },
    publicCode: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  methods: {
    changeshowMoneyDialog() {
      this.$emit('handleCloseQr', 0)
    },
    saveImgToPhotosAlbumTap() {
      uni.previewImage({
        current: this.publicCode.QRUrl, // 当前显示图片的http链接
        urls: [this.publicCode.QRUrl] // 需要预览的图片http链接列表
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.money-dialog {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
  .dialog-mask {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }
  .dialog-content {
    position: absolute;
    width: 600rpx;
    height: 722rpx;
    background: #fff;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    z-index: 999;
    border-radius: 20rpx;
    opacity: 0;
    transform: translate3d(0, 0, 0) scale(1.2);
    -webkit-transform: translate3d(0, 0, 0) scale(1.2);
    -webkit-transition-property: -webkit-transform, opacity;
    transition-property: transform, opacity;
  }
  .dialog-title {
    position: relative;
    border-top: 1rpx solid transparent;
    width: 100%;
    height: 195rpx;
    text-align: center;
    border-radius: 20rpx 20rpx 0 0;
    background: linear-gradient(135deg, #f7725c 0%, #ffb250 100%);
    .follow {
      margin-top: 68rpx;

      font-size: 32rpx;
      font-family: PingFang SC;
      font-weight: 700;
      color: #fff;
    }
    .msg {
      padding-top: 16rpx;
      font-size: 26rpx;
      font-family: PingFang SC;
      color: #fff;
      opacity: 0.7;
    }
    .round-left,
    .round-left1 {
      position: absolute;
      right: 0;
      top: 170rpx;
      width: 25rpx;
      height: 45rpx;
      border-radius: 25rpx 0 0 25rpx;
      line-height: 50rpx;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10;
    }
    .round-left1 {
      background: #fff;
      z-index: 5;
    }
    .round-right,
    .round-right1 {
      position: absolute;
      left: 0;
      top: 170rpx;
      width: 25rpx;
      height: 45rpx;
      border-radius: 0 25rpx 25rpx 0;
      line-height: 50rpx;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10;
    }
    .round-right1 {
      background: #fff;
      z-index: 5;
    }
  }
  .dialog-middle {
    border-radius: 30rpx 30rpx 0 0;
    .photo {
      width: 430rpx;
      height: 430rpx;
      margin: auto;
      margin-top: 36rpx;
      .img-photo {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
    .message {
      margin-top: 10rpx;
      text-align: center;
      font-size: 24rpx;
      color: #999;
      font-family: PingFang SC;
    }
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
}
.dialog-show .dialog-content {
  opacity: 1;
  -webkit-transition-duration: 300ms;
  transition-duration: 300ms;
  -webkit-transform: translate3d(0, 0, 0) scale(1);
  transform: translate3d(0, 0, 0) scale(1);
  -webkit-transition-property: -webkit-transform, opacity;
  transition-property: transform, opacity;
}

.dialog-out .dialog-content {
  opacity: 0;
  -webkit-transition-duration: 300ms;
  transition-duration: 300ms;
  -webkit-transform: translate3d(0, 0, 0) scale(0.815);
  transform: translate3d(0, 0, 0) scale(0.815);
  -webkit-transition-property: -webkit-transform, opacity;
  transition-property: transform, opacity;
}
</style>
