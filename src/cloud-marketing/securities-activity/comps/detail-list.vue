<template>
  <view class="item-box">
    <view class="left">
      <image :src="clerk.UserHeadPath" mode="scaleToFill" class="soldOut" lazy-load="false" />
    </view>
    <view class="right">
      <view class="right-name">{{ clerk.NickName }} ID：{{ clerk.CustomerId }}</view>
      <view class="right-row">
        <view class="right-row-left">面值</view>
        <view class="right-row-right">{{ clerk.Denominations }}元 {{ clerk.VouchersTitle }}</view>
      </view>
      <view class="right-row">
        <view class="right-row-left">状态</view>
        <view v-if="clerk.Status === 1" class="right-row-right">未使用</view>
        <view v-if="clerk.Status === 2" class="right-row-right">已使用</view>
        <view v-if="clerk.Status === 3" class="right-row-right">已过期</view>
      </view>
      <view class="right-row">
        <view class="right-row-left">领取时间</view>
        <view class="right-row-right">{{ clerk.PublishedTime }}</view>
      </view>
      <view class="right-row">
        <view class="right-row-left">使用时间</view>
        <view v-if="clerk.Status === 2" class="right-row-right">{{ clerk.UsingDate }}</view>
      </view>
      <view class="right-operation">
        <view v-if="clerk.OrderNumber" class="detail" @tap.stop="handleDetail">订单详情</view>
        <!-- <view class="cancel" wx:else @tap.stop="handleCancel">手动核销</view> -->
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    clerk: {
      type: Object,
      default() {
        return {}
      }
    }
  },
  methods: {
    /** 详情 */
    handleDetail() {
      uni.navigateTo({
        url: `/cloud-store/order-management/detail?orderNumber=${this.clerk.OrderNumber}`
      })
    },
    /** 手动核销 */
    handleCancel() {
      uni.navigateTo({
        url: `/pages/management/verification-mgm?VouchersTitle=${this.clerk.VouchersTitle}&type=2`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.item-box {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #ffffff;
  background-color: #fff;
  margin: 10rpx 0;
  border-radius: 10rpx;
  .left {
    width: 200rpx;
    .soldOut {
      width: 100%;
      height: 200rpx;
    }
  }
  .right {
    flex: 1;
    margin-left: 20rpx;
    .right-name {
      color: #000;
      font-size: 26rpx;
    }
    .right-row {
      font-size: 26rpx;
      display: flex;
      color: #b5b5b5;
      margin: 8rpx 0;
      .right-row-left {
        width: 120rpx;
      }
    }
    .right-operation {
      display: flex;
      font-size: 26rpx;
      justify-content: flex-end;
      .cancel,
      .detail {
        background-color: #fdc522;
        padding: 10rpx 15rpx;
        border-radius: 20rpx;
        color: #fff;
        font-size: 22rpx;
      }
      .detail {
        margin-left: 20rpx;
      }
    }
  }
}
</style>
