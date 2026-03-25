<template>
  <view>
    <view v-for="(item, index) in list" :key="index" class="ticket bg-f">
      <view class="item">
        <view class="key">用户信息:</view>
        <view class="val">
          {{ item.NickName }}
          <text class="ml20">Id：{{ item.CustomerId }}</text>
        </view>
      </view>
      <view class="item">
        <view class="key">赠品名称:</view>
        <view class="val">{{ item.GoodsName }}</view>
      </view>
      <view class="item">
        <view class="key">赠品ID:</view>
        <view class="val">{{ item.GoodsId }}</view>
      </view>
      <view class="item">
        <view class="key">核销数量:</view>
        <view class="val">{{ item.Number }}</view>
      </view>
      <view class="item">
        <view class="key">赠品面值:</view>
        <view class="val">{{ item.Price }}元</view>
      </view>
      <view class="item">
        <view class="key">核销人员:</view>
        <view class="val">{{ item.CheckUserName }}</view>
      </view>
      <view class="item">
        <view class="key">核销时间:</view>
        <view class="val">{{ item.CheckTime }}</view>
      </view>
    </view>
  </view>
</template>
<script>
/* 赠品 */
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket {
  margin-bottom: 30rpx;
  background-color: #fff;
  padding: 30rpx;
  .item {
    display: flex;
    font-size: 24rpx;
    margin: 10rpx 0;
    .key {
      width: 150rpx;
      color: #666;
    }
    .val {
      flex: 1;
      padding-left: 10rpx;
    }
  }
}
</style>
