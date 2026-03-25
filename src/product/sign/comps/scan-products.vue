<template>
  <view v-if="showPopup" class="wrap-popup" @touchmove.stop="handleMove">
    <view class="common-popup big" @touchmove.stop="handleMove">
      <view class="infos">
        <view class="infos-title infos-row">
          <view class="line1">商品名称</view>
          <view v-if="intype === 1" class="line2">订单数量</view>
          <view class="line3">出货数量</view>
          <view class="line4">已签收数量</view>
        </view>
        <scroll-view style="height: 650rpx" scroll-y="true" scroll-left="120" :show-scrollbar="false">
          <view v-for="(item, index) in list" :key="index" class="infos-content infos-row bd-e">
            <view class="line1 product flex flex-middle">
              <!-- <image class="product-size" :src="item.producturl" /> -->
              <view class="product-name ellipsis-2">{{ item.productname }}</view>
            </view>
            <view v-if="intype === 1" class="line2">{{ item.ordercount }}</view>
            <view class="line3">{{ item.storagecount }}</view>
            <view class="line4">{{ item.insigncount }}</view>
          </view>
        </scroll-view>
        <view class="infos-bottom"></view>
        <view class="pop-close icon iconfont icon-guanbi1" @tap="handleClose"></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ScanProducts',
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    value: {
      type: Boolean,
      default: false
    },
    intype: {
      type: Number,
      default: 1
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
    },
    handleMove() {}
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
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
.common-popup {
  background-color: #fff;
  border-radius: 15rpx;
  animation-name: scale;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  @include box;
  &.big {
    width: 680rpx;
  }
}
.pop-close {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  z-index: 10;
  left: 50%;
  color: #fff;
  font-size: 48rpx;
  bottom: -120rpx;
  transform: translate(-50%, 0);
}
.infos {
  position: relative;
  &-row {
    padding: 20rpx 30rpx;
    line-height: 40rpx;
    display: flex;
    .line1 {
      flex: 4;
      text-align: center;
      word-break: break-all;
    }
    .line2 {
      flex: 2;
      text-align: center;
    }
    .line3 {
      flex: 2;
      text-align: center;
    }
    .line4 {
      flex: 2;
      text-align: center;
    }
  }
  &-title {
    font-weight: 700;
    font-size: 24rpx;
    line-height: 36rpx;
    background: #f4f4f4;
    border-top-left-radius: 15rpx;
    border-top-right-radius: 15rpx;
  }
  &-content {
    font-size: 24rpx;
  }
  &-bottom {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 680rpx;
    height: 100rpx;
    background: linear-gradient(0deg, #ffffff 0%, rgba(255, 255, 255, 0.4) 100%);
    border-radius: 0px 0px 15rpx 15rpx;
  }
}
.product {
  &-size {
    width: 60rpx;
    height: 60rpx;
    flex-shrink: 0;
  }
  &-name {
    font-size: 24rpx;
    line-height: 28rpx;
    margin-left: 10rpx;
    text-align: center;
  }
}
@keyframes scale {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
</style>
