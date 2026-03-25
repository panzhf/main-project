<template>
  <view class="ticket-box">
    <view v-for="item in list" :key="item.productno" class="ticket">
      <view class="ticket-item">
        <view class="ticket-item-left">物流码</view>
        <view class="ticket-item-right">{{ item.serialnumber }}</view>
      </view>
      <view class="ticket-item">
        <view class="ticket-item-left">出货数量</view>
        <view class="ticket-item-right">{{ item.storagecount }}</view>
      </view>
      <view class="ticket-item">
        <view class="ticket-item-left">商品信息</view>
        <view class="ticket-item-right">{{ item.productname }}</view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.ticket-box {
  margin-bottom: 20rpx;
  .ticket {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 20rpx 30rpx 10rpx;
    font-size: 28rpx;
    .ticket-item {
      display: flex;
      padding: 10rpx 0;
      .ticket-item-left {
        flex: 2;
        text-align: left;
        color: #666666;
      }
      .ticket-item-right {
        flex: 7;
        color: #000000;
      }
    }
  }
}
</style>
