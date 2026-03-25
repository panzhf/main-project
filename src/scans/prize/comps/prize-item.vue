<template>
  <view class="record-wrap">
    <view class="record-box">
      <view v-for="(item, index) in list" :key="index" class="record-content" @tap="dropDetail(item)">
        <view class="record-item-top flex flex-middle">
          <view>中奖时间：</view>
          <view>{{ item.addtime }}</view>
          <view class="status" :class="{ 'primary-color': ['发放失败', '未领取'].includes(item.status) }">
            {{ item.status }}
          </view>
        </view>
        <view class="flex flex-middle mt-30 pb-30">
          <image v-if="item.prizeimg" class="record-icon mr-20" :src="item.prizeimg" mode="aspectFill" />
          <view v-else class="record-icon mr-20 flex flex-middle flex-center">
            <image
              class="record-icon-image"
              :src="awardIcon(item.prizeimgclass)"
              :class="{ 'record-icon-image-big': item.prizeimgclass === 'hongbao' }"
              mode="widthFix"
            />
          </view>
          <view class="flex-1">
            <view class="record-item">
              <view class="record-title mb-10">{{ item.prizename }}</view>
              <view
                v-if="item.statustips != ''"
                class="record-tip mb-10 ellipsis"
                :class="{ 'primary-color': item.getstatus === '发放失败' }"
              >
                {{ item.statustips }}
              </view>
              <text v-if="awardTabType === 1" class="code fs-22 c-9">码ID：{{ item.code }}</text>
              <text v-else class="type">{{ item.typename }}</text>
            </view>
          </view>
          <text class="iconfont icon-more"></text>
        </view>
      </view>
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
    },
    showSalername: {
      type: Boolean,
      default: true
    },
    awardTabType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {
    dropDetail(item) {
      const type = this.awardTabType === 1 ? item.type : item.prizetype
      uni.navigateTo({
        url: `/scans/prize/detail?id=${item.recordid}&awardTabType=${this.awardTabType}&type=${type}&activitytype=${item.activitytype}`
      })
    },
    awardIcon(type) {
      switch (type) {
        case 'honbao':
          return staticURL() + 'prizes/hb.png'
        case 'jifen':
          return staticURL() + 'prizes/point.png'
        case 'quan':
          return staticURL() + 'prizes/volume.png'
        default:
          return staticURL() + 'reward/money.png'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.record-box {
  border-radius: 20rpx;
  .record-content {
    margin-top: 20rpx;
    margin-bottom: 20rpx;
    padding: 0 30rpx;

    border-radius: 10rpx;
    background-color: #fff;

    font-size: 28rpx;
    font-weight: 500;
    .record-icon {
      width: 100rpx;
      height: 100rpx;

      background: #efefef;
      .record-icon-image {
        width: 48rpx;
        height: 48rpx;
      }
      .record-icon-image-big {
        width: 80rpx;
        height: 80rpx;
      }
    }
    .record-item-top {
      height: 85rpx;

      color: #666;

      font-size: 26rpx;
      font-weight: 500;
      line-height: 36rpx;
      &:not(.bottom) {
        border-bottom: 1rpx solid #eee;
      }
      &.bottom {
        border-top: 1rpx solid #eee;
      }
      .status {
        margin-left: auto;

        font-size: 28rpx;
        &:not(.primary-color) {
          color: #333;
        }
      }
    }
    .record-item {
      font-size: 22rpx;
      font-weight: 500;
      .record-title {
        color: #000;

        font-size: 28rpx;
        font-weight: bold;
      }
      .record-tip {
        color: #999;
      }
      .record-msg {
        color: #999;
      }
      .type {
        padding: 2rpx 10rpx;

        color: #ccc;
        border: 1px solid #ccc;
        border-radius: 6rpx;

        font-size: 20rpx;
      }
    }
    .iconfont {
      color: #333;

      font-size: 18rpx;
    }
  }
  .record-content:first-child {
    margin-top: 10rpx;
  }
}
</style>
