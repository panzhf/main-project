<template>
  <view class="container">
    <view class="distribution">
      <view class="weui-cells weui-cells_after-title">
        <view class="flex-cell">
          <view v-for="(item, index) in list" :key="index">
            <view class="weui-cell weui-check__label" @tap="handleDeliveryMode(index)">
              <view style="font-size: 30rpx">{{ item.name }}</view>
              <view class="weui-cell__hd">
                <view class="iconfont icon-arrow-right"></view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      list: [
        { value: '1', name: '配送方式' },
        { value: '2', name: '运费设置' }
      ]
    }
  },
  methods: {
    handleDeliveryMode(index) {
      if (index === 0) {
        uni.navigateTo({
          url: `./way`
        })
      } else {
        uni.navigateTo({
          url: `./freight`
        })
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  position: relative;
  background-color: #fff;
  height: 100%;
  .distribution {
    .page-section-title {
      padding: 10rpx 20rpx 10rpx;
      border-bottom: 1px solid #ccc;
      font-weight: bold;
    }
    .flex-cell {
      padding: 20rpx 20rpx;
      .weui-cell {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;
        line-height: 40px;
      }
      .weui-cell:first-child {
        border-bottom: 1px solid #eee;
      }
    }
  }
  .btn {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: 30rpx;
  }
  .icon-arrow-right {
    font-size: 20rpx;
    color: #999;
  }
}
</style>
