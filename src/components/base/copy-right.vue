<template>
  <view>
    <view class="copy-right" :style="{ color: color }">
      <text class="iconfont icon-logo-md"></text>
      <text>米多提供技术支持</text>
      <view class="complaint" @tap="clickComplaint">
        <image src="/static/complaint.png" class="icon-complaint" />
        投诉
      </view>
    </view>
  </view>
</template>

<script>
/**
 * 底部版权 组件
 * @props {String} [color = '#999'] 控制版权字体颜色
 * 使用方式 <CopyRight color="#5467ff" />
 */
export default {
  props: {
    color: {
      type: String,
      default: '#999'
    }
  },
  data() {
    return {}
  },
  methods: {
    clickComplaint() {
      uni.navigateTo({
        url: `/packages/src/rule/webview?pageType=complaint`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.copy-right {
  line-height: 24rpx;
  margin: 25rpx 0;
  text-align: center;
  color: #999999;
  font-size: 22rpx;
  position: relative;
  z-index: 1;
  padding-bottom: 120rpx;
  padding-bottom: calc(120rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
  .icon-logo-md {
    font-size: 24rpx;
    margin-right: 12rpx;
  }
  .icon-complaint {
    width: 23rpx;
    height: 21rpx;
    margin-right: 5rpx;
    vertical-align: middle;
    display: inline-block;
  }
  .complaint {
    height: 21rpx;
    display: inline-block;
    position: absolute;
    top: 0;
    right: 20rpx;
    vertical-align: middle;
    color: #aaa;
    font-size: 22rpx;
  }
}
</style>
