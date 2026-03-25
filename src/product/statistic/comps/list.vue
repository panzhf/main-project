<template>
  <view class="sort-content">
    <view class="ticket-box">
      <view v-for="(item, index) in list" :key="index" class="ticket flex-middle" @tap="handleDetail(item)">
        <v-img class="ticket-pic" :src="item.picurl" :size="120" />
        <view class="flex-1">
          <view class="ticket-item">
            <view class="ticket-key">商品编号</view>
            <view class="ticket-val">{{ item.productno }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-key">商品名称</view>
            <view class="ticket-val ellipsis-2">{{ item.productname }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-key">剩余库存</view>
            <view class="ticket-val">{{ item.stockcount }}</view>
          </view>
        </view>
        <text class="icon iconfont icon-more fs-22 c-6"></text>
      </view>
    </view>
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import { orderSignStatusFilter } from '@/filters'
import orderPocessMixin from '@/mixins/order-process'
import baseSetMixin from '@/mixins/base-set'
import overdueMixin from 'packages/mixins/overdue'

export default {
  filters: { orderSignStatusFilter },
  mixins: [orderPocessMixin, baseSetMixin, overdueMixin],
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
  methods: {
    handleDetail(item) {
      uni.navigateTo({
        url: `/product/statistic/detail?productId=${item.productid}&productFormatId=${item.productformatid}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket-box {
  border-radius: 20rpx;
  .ticket-pic {
    width: 120rpx;
    height: 120rpx;
    margin: 30rpx 20rpx 30rpx 30rpx;
    background: #f6f6f6;
  }
  .ticket {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 10rpx 40rpx;
    font-size: 28rpx;
    display: flex;
    .ticket-item {
      display: flex;
      padding: 5rpx 0;
      .ticket-key {
        width: 140rpx;
        text-align: left;
        color: #666666;
      }
      .ticket-val {
        color: #000000;
        flex: 1;
      }
    }
  }
}
</style>
