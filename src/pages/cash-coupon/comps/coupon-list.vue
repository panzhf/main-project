<template>
  <view class="coupon-item" @tap.stop="navUrl(item.voucherid)">
    <view class="alpha">
      <view v-if="activiyTabIndex === 2" class="icon iconfont icon-yiguoqi diabled-icon"></view>
      <view v-if="activiyTabIndex === 1" class="icon iconfont icon-yishiyong diabled-icon"></view>
      <view v-if="activiyTabIndex" class="disabled-mask"></view>
      <view class="alpha-box">
        <view class="circle top-left-circle"></view>
        <view class="circle top-right-circle"></view>
        <view v-if="activiyTabIndex === 0 && item.isbeexpire" class="icon-tag">快过期</view>
        <view class="coupon-info flex-middle" @tap.stop="handleCheck(item)">
          <view class="coupon-check">
            <slot name="check"></slot>
          </view>
          <view class="coupon-money primary-color" :style="{ 'font-size': `${setFontsize(item.denominations)}rpx` }">
            {{ item.denominations }}
            <text class="fs-30 ml-10">元</text>
          </view>
          <view class="coupon-title">
            <view class="title ellipsis-1">{{ item.vouchername }}</view>
            <view class="time">券码：{{ item.couponcode }}</view>
            <view class="time">领取时间：{{ item.addtime }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="beta">
      <view class="circle left-circle"></view>
      <view class="circle right-circle"></view>
      <view class="beta-content">
        <view class="left">
          <view class="c-9 fs-24 ml-30">过期时间：{{ item.endtime }}</view>
        </view>
        <view class="right fs-24 c-0 pr-30 pl-30">
          {{ activiyTabIndex === 0 ? '去使用' : '查看详情' }}
          <text class="icon iconfont icon-arrow-right fs-22 c-0 ml-10"></text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    activiyTabIndex: {
      type: Number,
      default: 0
    },
    showCheckFlag: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      money: 1.8
    }
  },
  onload() {},
  methods: {
    handleCheck(item) {
      if (this.activiyTabIndex === 0 && this.showCheckFlag) {
        this.$emit('check', item)
      } else {
        this.navUrl(item.voucherid)
      }
    },
    setFontsize(money) {
      let len = `${money}`.length
      if (len === 0) return
      let fontSize = 60
      if (len > 3) {
        len > 5 ? (fontSize = 40) : len > 4 ? (fontSize = 45) : (fontSize = 50)
      }

      return fontSize
    },
    navUrl(voucherid) {
      this.$emit('url', voucherid)
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-item {
  background: #fff;
  margin-bottom: 20rpx;
  position: relative;
  .disabled-mask {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    opacity: 0.5;
    background: #fff;
    z-index: 1;
    height: 100%;
  }
  .diabled-icon {
    position: absolute;
    top: 0;
    right: 30rpx;
    font-size: 150rpx;
    z-index: 3;
    color: #000;
  }
  .alpha {
    position: relative;
    overflow: hidden;
    .alpha-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1rpx solid #eeeeee;
      border-bottom: none;
      border-top-left-radius: 10rpx;
      border-top-right-radius: 10rpx;
      .coupon-info {
        display: flex;
        height: 144rpx;
        margin-right: 30rpx;
        position: relative;
        .coupon-money {
          width: 212rpx;
          margin-right: 20rpx;
          font-size: 60rpx;
          font-weight: 700;
          text-align: center;
          white-space: nowrap;
        }
        .coupon-check {
          position: absolute;
          left: 0;
          top: 0;
          height: 124rpx;
          box-sizing: border-box;
          padding: 10rpx;
        }
        .coupon-title {
          display: flex;
          flex: 1;
          flex-direction: column;
          justify-content: center;
          font-size: 24rpx;
          line-height: 1;
          .title {
            color: #000;
            font-size: 28rpx;
            font-weight: 700;
          }
          .time {
            display: flex;
            align-items: center;
            padding: 14rpx 0 0;
            font-size: 24rpx;
            color: #333;
          }
        }
      }
    }
    .right {
      width: 120rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
      border-radius: 25rpx;
      margin: 0 30rpx 0 0;
      font-size: 24rpx;
    }
    .coupon-used-text {
      color: #fff;
      background: #dadada;
    }
  }
  .coupon-used-bg {
    background-color: #9a9a9a;
  }
  .beta {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    .beta-content {
      display: flex;
      height: 74rpx;
      line-height: 74rpx;
      justify-content: space-between;
      font-size: 24rpx;
      border-top: 1rpx dashed #eeeeee;
      border-left: 1rpx solid #eeeeee;
      border-right: 1rpx solid #eeeeee;
      border-bottom: 1rpx solid #eeeeee;
      border-bottom-left-radius: 10rpx;
      border-bottom-right-radius: 10rpx;
      .left {
        color: #999;
      }
      .right {
        color: #000;
      }
      .check-active {
        color: rgba(102, 102, 102, 0.5);
      }
    }
  }
  .icon-tag {
    top: 0;
    right: 0;
    position: absolute;
    width: 90rpx;
    height: 32rpx;
    font-size: 22rpx;
    color: #fff;
    text-align: center;
    border-bottom-left-radius: 10rpx;
    border-top-right-radius: 10rpx;
    background-color: $uni-bg-color-primary;
  }
  .circle {
    position: absolute;
    width: 26rpx;
    height: 26rpx;
    border-radius: 50%;
    border: 1rpx solid #eeeeee;
    background: #f4f4f4;
    z-index: 2;
  }
  .left-circle {
    top: 0;
    left: 0;
    transform: translate(-50%, -50%);
  }
  .right-circle {
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
  }
  .top-left-circle {
    bottom: 0;
    left: 0;
    transform: translate(-50%, 50%);
  }
  .top-right-circle {
    bottom: 0;
    right: 0;
    transform: translate(50%, 50%);
  }
}
</style>
