<template>
  <view class="record-wrap">
    <view class="record-box">
      <view v-for="(item, index) in list" :key="index" class="record-content" @tap="dropDetail(item)">
        <view class="record-item-top flex flex-middle">
          <view>获得时间：</view>
          <view>{{ item.addtime }}</view>
          <view class="status" :class="{ 'primary-color': ['发放失败', '未领取'].includes(item.getstatus) }">
            {{ item.getstatus }}
          </view>
        </view>
        <view class="flex flex-middle mt-30 pb-30">
          <image v-if="item.picpath" class="record-icon mr-20" :src="item.picpath" mode="aspectFill" />
          <view v-else class="record-icon mr-20 flex flex-middle flex-center">
            <image class="record-icon-image" :src="item.picpath || awardIcon(item.type)" mode="widthFix" />
          </view>
          <view class="flex-1">
            <view class="record-item">
              <view class="record-title mb-10">{{ item.prizename }}</view>
              <view
                v-if="getStatusDesc(item.getstatus)"
                class="record-tip mb-10 ellipsis"
                :class="{ 'primary-color': item.getstatus === '发放失败' }"
              >
                {{ getStatusDesc(item.getstatus) }}
              </view>
              <view class="record-msg ellipsis">{{ item.code }}（{{ item.serialnumber }}）</view>
            </view>
          </view>
          <text class="iconfont icon-more"></text>
        </view>
        <view class="record-item-top bottom flex flex-middle">领奖人：{{ item.mdsalername || '-' }}</view>
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
    }
  },
  data() {
    return {}
  },
  methods: {
    dropDetail(item) {
      uni.navigateTo({
        url: `/scans/prize/detail?type=${item.type}&id=${item.awardid}&user=${encodeURIComponent(
          item.mdsalername || '-'
        )}`
      })
    },
    awardIcon(type) {
      switch (type) {
        case 0:
          return staticURL() + 'prizes/hb.png'
        case 1:
          return staticURL() + 'prizes/point.png'
        case 2:
          return staticURL() + 'prizes/volume.png'
        case 3:
          return staticURL() + 'prizes/gift.png'
        default:
          return staticURL() + 'reward/money.png'
      }
    },
    getStatusDesc(status) {
      switch (status) {
        case '发放成功':
          return '(请进入公众号领取，如已领取请忽略)'
        case '发放失败':
          return '(联系客服进行补发)'
        case '发放中':
          return '(请稍后刷新页面查看发放情况)'
        default:
          return ''
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.record-box {
  border-radius: 20rpx;
  .record-content {
    margin-bottom: 20rpx;
    margin-top: 20rpx;
    font-size: 28rpx;
    font-weight: 500;
    background-color: #fff;
    padding: 0 30rpx;
    border-radius: 10rpx;
    .record-icon {
      width: 100rpx;
      height: 100rpx;
      background: #efefef;
      .record-icon-image {
        width: 48rpx;
        height: 48rpx;
      }
    }
    .record-item-top {
      height: 85rpx;
      font-size: 26rpx;
      font-weight: 500;
      line-height: 36rpx;
      color: #666;
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
        font-size: 28rpx;
        color: #000;
        font-weight: bold;
      }
      .record-tip {
        color: #999;
      }
      .record-msg {
        color: #999;
      }
    }
    .iconfont {
      font-size: 18rpx;
      color: #333;
    }
  }
  .record-content:first-child {
    margin-top: 10rpx;
  }
}
</style>
