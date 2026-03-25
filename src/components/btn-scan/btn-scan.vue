<template>
  <view class="scan-bg" :style="calcStyle">
    <view class="scan-content flex flex-middle">
      <view class="scan-img flex flex-middle flex-center mr-20">
        <!-- <image :src="scanbg" /> -->
        <view class="iconfont icon-saoyisaoicon icon-scan"></view>
      </view>
      <view class="scan-txt">{{ scanText }}</view>
    </view>
  </view>
</template>
<script>
import { staticURL } from '@/config'
export default {
  props: {
    customStyle: {
      type: String,
      default: ''
    },
    scanText: {
      type: String,
      default: '扫一扫'
    }
  },
  data() {
    return {
      scanbg: staticURL() + 'shop/scan.png'
    }
  },
  computed: {
    calcStyle() {
      const s = []
      s.push(this.customStyle)
      s.push(this.themeVars)
      return s.join(';')
    }
  }
}
</script>
<style lang="scss" scoped>
.scan-bg {
  position: fixed;
  z-index: 100;
  left: 50%;
  bottom: 15%;
  border-radius: 48rpx;
  // background-color: #ff6440;
  background-color: var(--theme-color, $uni-color-primary);
  font-size: 34rpx;
  transform: translateX(-50%);
  .scan-content {
    padding: 10rpx 20rpx;
    .scan-img {
      width: 70rpx;
      height: 70rpx;
      background-color: #fff;
      border-radius: 50%;
      .icon-saoyisaoicon {
        color: var(--theme-color, $uni-color-primary);
        font-size: 40rpx;
      }
      // image {
      //   width: 44rpx;
      //   height: 39rpx;
      // }
    }
    .scan-txt {
      color: #fff;
    }
  }
}
</style>
