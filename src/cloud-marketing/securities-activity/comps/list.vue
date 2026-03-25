<template>
  <view class="activityWrapper">
    <view v-for="(item, index) in list" :key="index" class="activity-item" @tap="handleDetail(item)">
      <view class="activity-info">
        <view class="activity-info-left">
          <image :src="discount" mode="scaleToFill" class="activity-info-left-img" lazy-load="false" />
        </view>
        <view class="activity-info-right">
          <view class="activity-info-right-title">
            {{ item.Title }}
          </view>
          <view class="activity-info-row">
            <view class="activity-info-row-left">活动时间：</view>
            <view class="activity-info-row-right">
              {{ item.StartTime }}至
              <view>{{ item.EndTime }}</view>
            </view>
          </view>
          <view class="activity-info-row">
            <view class="activity-info-row-left">关联购物券：</view>
            <view class="activity-info-row-right">{{ item.ShoppingVouchersTitle }}</view>
          </view>
          <view class="activity-info-row">
            <view class="activity-info-row-left">面值：</view>
            <view class="activity-info-row-right">{{ item.ShoppingVouchersDenominations }} 元</view>
          </view>
          <view class="activity-info-row">
            <view class="activity-info-row-left">领取限制：</view>
            <view class="activity-info-row-right">
              <text v-if="item.LimitUserNum">{{ item.LimitUserNum }} 张</text>
              <text v-else>无限制</text>
            </view>
          </view>
        </view>
      </view>
      <view class="count-box" @tap.stop="handleGetDetail(item)">
        <view v-if="item.State === 0" class="count-state">进行中</view>
        <view v-if="item.State === 1" class="count-state">已结束</view>
        <view v-if="item.State === 2" class="count-state">未开始</view>
        <view class="count">
          查看活动明细
          <text class="iconfont icon-arrow-right"></text>
        </view>
      </view>
      <text class="iconfont icon-arrow-right handback"></text>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
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
    return {
      discount: staticURL() + 'shop/vouchers.png'
    }
  },
  methods: {
    handleDetail(e) {
      uni.navigateTo({
        url: `./list-activity?Id=${e.Id}`
      })
    },
    /** 查看活动明细明细 */
    handleGetDetail(item) {
      uni.navigateTo({
        url: `./detail?Id=${item.Id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.activityWrapper {
  background-color: #f9f9f9;
  .activity-item {
    background-color: #fff;
    padding: 30rpx 30rpx 0 30rpx;
    position: relative;
    margin-bottom: 30rpx;
    .handback {
      font-size: 22rpx;
      position: absolute;
      right: 58rpx;
      top: 36%;
    }
    .count-box {
      display: flex;
      justify-content: space-between;
      font-size: 24rpx;
      margin-top: 19rpx;
      padding-bottom: 30rpx;
      .count-state {
        color: var(--theme-color, $uni-color-primary);
      }
      .count {
        color: #999999;
        .icon-arrow-right {
          font-size: 20rpx;
          padding-left: 5rpx;
        }
        .count-number {
          color: #ff3835;
        }
      }
    }
    .activity-info {
      background-color: #f9f9f9;
      padding: 21rpx;
      display: flex;
      .activity-info-left {
        width: 118rpx;
        height: 118rpx;
        border-radius: 50%;
        overflow: hidden;
        .activity-info-left-img {
          width: 100%;
          height: 100%;
        }
      }
      .activity-info-right {
        flex: 1;
        margin-left: 20rpx;
        .activity-info-right-title {
          color: #333333;
          font-size: 28rpx;
          margin-bottom: 23rpx;
        }
        .activity-info-row {
          display: flex;
          font-size: 24rpx;
          color: #666666;
          margin: 8rpx 0;
          .activity-info-row-left {
            width: 146rpx;
          }
          .activity-info-row-right {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
