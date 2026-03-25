<template>
  <view class="activityWrapper" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="activity-item">
      <view class="activity-item-row">
        <view class="activity-item-left">活动ID:</view>
        <view class="activity-item-right">
          <view class="activity-item-content">{{ item.Id }}</view>
          <view class="state">{{ item.StatusMessage }}</view>
        </view>
      </view>
      <view class="activity-item-row">
        <view class="activity-item-left">活动名称：</view>
        <view class="activity-item-right">
          <view class="activity-item-content">{{ item.Name }}</view>
        </view>
      </view>
      <view class="activity-item-row">
        <view class="activity-item-left">开始时间：</view>
        <view class="activity-item-right">
          <view class="activity-item-content">{{ item.StartTime }}</view>
        </view>
      </view>
      <view class="activity-item-row">
        <view class="activity-item-left">结束时间：</view>
        <view class="activity-item-right">
          <view class="activity-item-content">{{ item.EndTime }}</view>
        </view>
      </view>
      <view class="activity-item-row">
        <view class="activity-item-left" style="width: 100px">
          {{ item.Status == 1 ? '活动开始还有' : '活动结束还剩' }}：
        </view>
        <view class="activity-item-right">
          <view class="state">{{ item.ActivityTime }}</view>
          <view class="hot-detai" @tap="handleDetail(item)">
            活动详情
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
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
  methods: {
    handleDetail(e) {
      uni.navigateTo({
        url: `./detail?Id=${e.Id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.activityWrapper {
  .activity-item {
    background-color: #fff;
    padding: 32rpx;
    margin-bottom: 20rpx;
    .activity-item-row {
      display: flex;
      margin-bottom: 24rpx;
      .activity-item-left {
        width: 140rpx;
        margin-right: 20rpx;
        font-size: 28rpx;
        color: #666666;
      }
      .activity-item-right {
        flex: 1;
        display: flex;
        justify-content: space-between;
        .activity-item-content {
          font-size: 28rpx;
          color: #000;
        }
        .state {
          font-size: 28rpx;
          color: var(--theme-color, $uni-color-primary);
        }
        .gray {
          color: #9a9a9a;
        }
        .hot-detai {
          font-size: 28rpx;
          color: #1266ff;
          .icon-arrow-right {
            font-size: 20rpx;
            padding-left: 5rpx;
          }
        }
      }
    }
  }
}
</style>
