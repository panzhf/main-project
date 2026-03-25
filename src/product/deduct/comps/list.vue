<template>
  <view class="ticket-box">
    <view v-for="(item, index) in list" :key="index" class="ticket">
      <view class="flex flex-middle" @tap="handleDetail(item)">
        <view class="flex-1">
          <view class="ticket-item">
            <view class="ticket-key">扣减单号</view>
            <view class="ticket-val">{{ item.orderno }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-key">扣减状态</view>
            <view
              class="ticket-val"
              :class="item.status === 1 ? 'success-color' : item.status === 0 ? 'error-color' : ''"
            >
              {{ item.status | deduceFilter }}
              <text v-if="item.status === 1" class="fs-26 c-3">({{ item.audittype ? '人工审核' : '自动审核' }})</text>
            </view>
          </view>
          <view class="ticket-item">
            <view class="ticket-key">扣减时间</view>
            <view class="ticket-val">{{ item.status === 1 ? item.addtime : '' }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-key">扣减数量</view>
            <view class="ticket-val">{{ item.status === 1 ? item.deductcount : 0 }}</view>
          </view>
        </view>
        <text class="icon iconfont icon-more fs-26 c-3"></text>
      </view>
    </view>
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import { deduceFilter } from '@/filters'
import orderPocessMixin from '@/mixins/order-process'
import overdueMixin from 'packages/mixins/overdue'

export default {
  filters: { deduceFilter },
  mixins: [orderPocessMixin, overdueMixin],
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
        url: `/product/deduct/deduct-detail?orderNo=${item.orderno}&addTime=${item.addtime}&auditremark=${item.auditremark}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket-box {
  border-radius: 20rpx;
  .ticket {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 10rpx 40rpx;
    font-size: 28rpx;
    .ticket-item {
      display: flex;
      margin: 5rpx 0;
      padding: 10rpx 0;
      color: #000000;
      .ticket-key {
        flex: 2;
        text-align: left;
        color: #666666;
      }
      .ticket-val {
        flex: 7;
      }
      .img-warpper {
        display: flex;
        flex-wrap: wrap;
        .img-wrap {
          width: 120rpx;
          margin: 10rpx;
          .img {
            width: 100%;
            display: block;
          }
        }
      }
    }
  }
}
</style>
