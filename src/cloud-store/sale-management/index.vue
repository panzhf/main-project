<template>
  <view class="container">
    <view class="wrapper">
      <view v-for="(item, index) in SystemControl" :key="index" class="controlWrapper" @tap="handleControl(item)">
        <view class="controlItem">
          <view class="controlText">{{ item.text }}</view>
          <view v-if="item.num" class="controlNum">{{ item.num }}</view>
          <view class="iconfont icon-arrow-right controlMore"></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      SystemControl: [
        { type: 'order', icon: 'icontuichu', text: '售后订单', url: '' },
        { type: 'city', icon: 'icontuichu', text: '售后地址', url: '' }
      ]
    }
  },
  methods: {
    handleControl(item) {
      switch (item.type) {
        case 'city':
          uni.navigateTo({
            url: './address'
          })
          break
        case 'order':
          uni.navigateTo({
            url: './order'
          })
          break
        default:
          uni.navigateTo({
            url: item.url
          })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f7f7f7;
  overflow: hidden;
}
.controlWrapper {
  width: 690rpx;
  min-height: 100rpx;
  line-height: 100rpx;
  border-radius: 10rpx;
  margin: 20rpx auto 0;
  background-color: #fff;
  .controlItem {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20rpx;
    .controlText {
      font-size: 30rpx;
    }
    .controlNum {
      color: var(--theme-color, $uni-color-primary);
      font-size: 30rpx;
      margin-right: 10rpx;
    }
    .controlMore {
      font-size: 21rpx;
      width: 30rpx;
      text-align: right;
      color: #999;
      line-height: 1;
      margin-top: 11rpx;
    }
  }
}
</style>
