<template>
  <view class="sort-content" :style="themeVars">
    <view class="ticket-box">
      <view v-for="(item, index) in list" :key="index" class="ticket">
        <view class="ticket-item">
          <view class="ticket-key">物流码</view>
          <view class="ticket-val">{{ item.serialnumber }}</view>
        </view>
        <view class="ticket-item">
          <view class="ticket-key">标签类型</view>
          <view class="ticket-val">{{ item.tagstype | tagstyleFilter }}</view>
        </view>
        <view class="ticket-item">
          <view class="ticket-key">商品信息</view>
          <view class="ticket-val">{{ item.productno }}-{{ item.productname }}</view>
        </view>
        <view class="ticket-item">
          <view class="ticket-key">扫描时间</view>
          <view class="ticket-val">{{ item.addtime }}</view>
        </view>
        <view class="ticket-item">
          <view class="ticket-key">商品数量</view>
          <view class="ticket-val">{{ item.productcount }}</view>
        </view>
      </view>
    </view>
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import { tagstyleFilter } from '@/filters'
import orderPocessMixin from '@/mixins/order-process'
import overdueMixin from 'packages/mixins/overdue'

export default {
  filters: { tagstyleFilter },
  mixins: [orderPocessMixin, overdueMixin],
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    addTime: {
      type: String,
      default: ''
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
      .ticket-key {
        flex: 2;
        text-align: left;
        color: #666666;
      }
      .ticket-val {
        word-break: break-all;
        flex: 7;
        color: #000000;
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
    .ticket-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      .right {
        display: flex;
        .textBtn {
          padding: 10rpx 15rpx;
          border: 1px solid var(--theme-color, #ff5e34);
          border-radius: 50rpx;
        }
        .detail-btn {
          color: var(--theme-color, #ff5e34);
        }
        .confirm-btn {
          margin-left: 10px;
          background-color: var(--theme-color, #ff5e34);
          color: #fff;
        }
      }
    }
  }
}
</style>
