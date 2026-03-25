<template>
  <view :style="tipsTop" class="favorite-tip flex flex-middle">
    <view class="iconfont icongonggaotubiao"></view>
    <view>{{ msg }}</view>
    <view class="close iconfont iconguanbi" @tap="handleHideTip"></view>
  </view>
</template>

<script>
export default {
  name: 'FavoriteTip',
  props: {
    msg: {
      type: String,
      default: '添加小程序，使用更方便'
    }
  },
  data() {
    return {
      tipsTop: ''
    }
  },
  mounted() {
    const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
    this.tipsTop = `top: ${44 + statusBarHeight}px;`
  },
  methods: {
    handleHideTip() {
      this.$emit('hideTip')
    }
  }
}
</script>

<style lang="scss" scoped>
.favorite-tip {
  position: fixed;
  top: 10rpx;
  right: 55rpx;
  border-radius: 10rpx;
  line-height: 50rpx;
  padding: 4rpx 0 4rpx 20rpx;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 24rpx;
  z-index: 980;
  &::after {
    content: '';
    display: block;
    position: absolute;
    z-index: 1;
    width: 0;
    height: 0;
    right: 76rpx;
    top: -9rpx;
    border-bottom: 10rpx solid rgba(0, 0, 0, 0.8);
    border-left: 10rpx solid transparent;
    border-right: 10rpx solid transparent;
  }
  .close {
    padding: 0 20rpx;
    font-size: 12rpx;
  }
  .icongonggaotubiao {
    margin-right: 10rpx;
  }
  .icongonggaotubiao,
  .iconguanbi {
    font-size: 24rpx;
  }
}
</style>
