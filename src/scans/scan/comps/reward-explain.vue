<template>
  <view v-if="showPopup" class="wrap-popup" @touchmove.stop="handleMove">
    <view class="common-popup" @touchmove.stop="handleMove">
      <view class="header fw-bold fs-32 text-center">- 扫码领奖说明 -</view>
      <view class="content fs-26 c-2a">
        <view class="item">
          本功能用于店老板参与扫码活动领取店老板奖励或店老板扫码登记信息待消费者扫了关联码之后获得奖励；
        </view>
        <view class="title">规则说明：</view>
        <view class="item">1.有效扫码个数指有效能参与领奖或登记成功的扫码数量（去重）；</view>
        <view class="item">2.全部扫码个数指所有识别成功的扫码数量（去重）；</view>
        <view class="item">3.已获得奖品可在我的资产或活动中心对应扫码活动中查看与领取；</view>
        <view class="title">注意：</view>
        <view class="item">1.扫码后，扫码结果记录显示会稍有延时显示；</view>
        <view class="item">2.扫码领奖活动内容最终解释权归活动主办方为准；</view>
      </view>
    </view>
    <view class="pop-close icon iconfont icon-guanbi1" @tap="handleClose"></view>
  </view>
</template>

<script>
export default {
  name: 'RewardPop',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      showPopup: false
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
    }
  },
  methods: {
    handleClose() {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
.pop-close {
  color: #fff;
  font-size: 60rpx;
  padding: 20rpx;
  margin-top: 40rpx;
}
.common-popup {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  animation-name: scale;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  width: 660rpx;
  @include box;
  .header {
    @include lh(100rpx);
  }
  .title {
    font-weight: bold;
    padding: 6px 0 20rpx 0;
  }
  .content {
    padding: 0 30rpx 40rpx;
    line-height: 40rpx;
    text-align: justify;
    .item {
      margin-bottom: 20rpx;
      font-size: 26rpx;
    }
  }
}
@keyframes scale {
  0% {
    transform: scale(0.98);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
