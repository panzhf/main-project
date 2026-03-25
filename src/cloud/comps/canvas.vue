<template>
  <view>
    <view v-if="shareImgFlag === 1" class="share-mask" catchtouchmove="true" @tap="hideShareView">
      <view v-if="shareContainer" class="share-view">
        <view class="share-view-con">
          <image
            style="width: 630rpx; border-radius: 20rpx; margin-top: 40rpx"
            mode="widthFix"
            :show-menu-by-longpress="true"
            :src="shareImg"
            @tap.stop="handlepreview"
          />
        </view>
        <!-- <view v-if="type === 'live'" class="saveBtnWrapper" @tap.stop="saveImage('1')">保存图片</view> -->
        <u-icon class="close" name="close-circle" color="#fff" size="72" @click="hideShareView"></u-icon>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      shareImgFlag: 0,
      shareImg: '',
      footer: true,
      // 直播分享专用
      shareContainer: true,
      type: ''
    }
  },

  watch: {
    shareImgFlag(val) {
      if (!val) {
        this.shareImgFlag = 0
        this.shareImg = ''
        this.footer = true
        // 直播分享专用
        this.shareContainer = true
        this.type = ''
      }
    }
  },

  methods: {
    handlepreview() {
      let that = this
      wx.previewImage({
        current: that.shareImg, // 当前显示图片的http链接
        urls: [that.shareImg] // 需要预览的图片http链接列表
      })
    },
    show(path) {
      this.shareImg = path
      this.shareImgFlag = 1
      this.type = ''
    },
    hideShareView() {
      this.shareImgFlag = false
    },
    reset() {
      this.shareImgFlag = 0
      this.shareImg = ''
      this.footer = true
      // 直播分享专用
      this.shareContainer = true
      this.type = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-generate {
  background-color: #ff4d4d;
  color: #fff;
  width: 80%;
  text-align: center;
  line-height: 80rpx;
  height: 80rpx;
  margin: 0 auto;
  border-radius: 40rpx;
  margin-top: 50rpx;
}
.share-mask {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 200;
  display: block;
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
  &.hide {
    display: none;
  }
  .handle-box {
    position: absolute;
    bottom: 0;
    background-color: #fff;
    height: 200rpx;
    width: 100%;
    border-radius: 20rpx 20rpx 0px 0px;
    display: flex;

    .handle-box-item {
      display: flex;
      flex-direction: column;
      flex: 1;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      position: relative;
      .share-tips {
        position: absolute;
        top: -36rpx;
        z-index: 1;
        right: -100rpx;
        background: #ffffff;
        border: 1rpx solid #cbcbcb;
        box-shadow: 0rpx 0rpx 6rpx 0rpx rgba(0, 0, 0, 0.06);
        border-radius: 20rpx;
        font-size: 22rpx;
        padding: 7rpx 12rpx;
        &:before {
          content: '';
          position: absolute;
          top: 50rpx;
          right: 250rpx;
          width: 0;
          height: 0;
          border: solid transparent;
          pointer-events: none;
          margin-top: -7rpx;
          border-color: transparent;
          border-top-color: #cccccc;
          border-width: 12rpx;
        }

        &:after {
          content: '';
          position: absolute;
          top: 50rpx;
          right: 250rpx;
          width: 0;
          height: 0;
          border: solid transparent;
          pointer-events: none;
          margin-top: -6rpx;
          border-color: transparent;
          border-top-color: #fff;
          border-width: 10rpx;
        }
      }
      &::after {
        border: none;
      }
      .icon-box1,
      .icon-box2 {
        border-radius: 50%;
        width: 100rpx;
        height: 100rpx;
        display: flex;
        justify-content: center;
        align-items: center;

        .iconfenxiangicon,
        .iconbaocundaoxiangceicon {
          font-size: 40rpx;
          color: #fff;
        }
      }

      .icon-box1 {
        background-color: #02c668ff;
      }

      .icon-box2 {
        background-color: #ff8b3e;
      }

      .handle-title {
        margin-top: 19rpx;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
      }
    }
    .share-button {
      padding-top: 24rpx;
      .handle-title {
        margin-top: 0;
      }
    }
  }
}
.share-canvas {
  border: 1px solid #c3c3c3;
  width: 750px;
  height: 1334px;
  position: fixed;
  z-index: -1;
  top: -10000000px;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
.share-view {
  position: absolute;
  left: 50%;
  top: 45%;
  margin: -508rpx 0 0 -315rpx;
  .saveBtnWrapper {
    margin: 0 auto;
    margin-top: 50rpx;
    width: 400rpx;
    height: 70rpx;
    background-color: #ff4b40;
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #ffffff;
    line-height: 36rpx;
    border-radius: 35rpx;
    line-height: 70rpx;
    text-align: center;
  }
  .share-view-con {
    position: relative;
    .share-view-close {
      position: absolute;
      z-index: 1;
      padding: 10px;
      top: 0;
      right: 0;
      width: 20rpx;
      height: 20rpx;
    }
    .share-save-btn {
      width: 630rpx;
      height: 80rpx;
      line-height: 80rpx;
      color: #fff;
      font-size: 30rpx;
      text-align: center;
      margin-top: 30rpx;
    }
  }
}
.close {
  position: absolute;
  font-weight: 400;
  bottom: -100rpx;
  left: 50%;
  transform: translate(-50%);
  color: #fff;
}
</style>
