<template>
  <view v-if="showPopup" class="wrap-popup" @touchmove.stop="handleMove">
    <view class="common-popup big" @touchmove.stop="handleMove">
      <view class="title fs-32 fw-bold tx-c pt-20 pb-20">- 已扫码统计 -</view>
      <view class="ml-30 fs-28 c-0 fw-bold pt-10 pb-10">
        商品种类
        <text class="primary-color mr-30 ml-10">{{ kindCount }}</text>
        已扫码总数
        <text class="primary-color ml-10">{{ storageTotalCount }}</text>
      </view>
      <view class="ml-30 fs-22 pt-10 pb-20 c-9">注意：已扫码不代表已扣减，需要品牌商审核通过后才生效</view>
      <view class="infos">
        <view class="infos-title infos-row">
          <view class="line1">商品编码</view>
          <view class="line2">商品名称</view>
          <view class="line3">已扫码数量</view>
        </view>
        <scroll-view style="height: 650rpx" scroll-y="true" scroll-left="120" :show-scrollbar="false">
          <view v-for="(item, index) in list" :key="index" class="infos-content infos-row bd-e">
            <view class="line1 ellipsis-1">{{ item.productno }}</view>
            <view class="line2 ellipsis-1">
              {{ item.productname }}
            </view>
            <view class="line3">{{ item.storagecount }}</view>
          </view>
          <view v-if="list.length === 0" class="tx-c pt-20 fs-24 c-6">暂无扫码数据~</view>
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
    kindCount: {
      type: Number,
      default: 0
    },
    storageTotalCount: {
      type: Number,
      default: 0
    },
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
  padding: 0 20rpx;
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
      flex: 6;
      text-align: center;
      word-break: break-all;
    }
    .line3 {
      flex: 3;
      text-align: center;
    }
  }
  &-title {
    font-weight: 700;
    font-size: 24rpx;
    line-height: 36rpx;
    background: #f4f4f4;
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
    text-align: left;
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
