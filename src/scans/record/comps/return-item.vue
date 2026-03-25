<template>
  <view class="record-wrap">
    <view class="record-box">
      <view v-for="(item, index) in list" :key="index" class="record-content">
        <view class="record-item-top flex flex-middle">
          <view>返利时间：</view>
          <view>{{ item.time }}</view>
        </view>
        <view class="mt-30 record-item-wrap">
          <view class="record-item">
            <view class="record-title mb-20 flex">
              <text>{{ item.shareprizemodelfirstdesc }}</text>
              <text class="primary-color right">{{ item.shareprizemodelseconddesc }}</text>
            </view>
            <view class="record-msg ellipsis flex flex-middle">
              <view class="flex-1">登记箱码：{{ item.relationcode }}（{{ item.relationserialnumber }}）</view>
              <view
                class="iconfont icon-more fs-20"
                :class="item.showMore ? 'icon-more-hidden' : 'icon-more-show'"
                @tap="changeShowMore(index)"
              ></view>
            </view>
            <view v-if="item.showMore">
              <view class="record-msg ellipsis">扫码人：{{ item.scanpersonnickname }}</view>
              <view class="record-msg ellipsis">关联码：{{ item.fwcode }}（{{ item.fwserialnumber }}）</view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { staticURL } from '@/config'
export default {
  mixins: [],
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
      moneyAvatar: staticURL() + 'reward/money.png'
    }
  },
  created() {},
  methods: {
    changeShowMore(index) {
      this.$emit('showMore', index)
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
    padding: 0 30rpx 30rpx;
    border-radius: 10rpx;
    .record-item-top {
      height: 85rpx;
      font-size: 28rpx;
      font-weight: 500;
      line-height: 36rpx;
      color: #666666;
      border-bottom: 1rpx solid #eeeeee;
      .status {
        margin-left: auto;
        font-weight: 500;
        color: #000000;
      }
    }
    .record-item {
      font-size: 24rpx;
      font-weight: 500;
      .record-title {
        font-size: 28rpx;
        color: #000000;
        font-weight: bold;
        .right {
          margin-left: auto;
        }
      }
      .record-msg {
        color: #666666;
        margin-bottom: 10rpx;
      }
    }
    .record-item-wrap {
      position: relative;
    }
    .icon-more {
      color: #666666;
      padding: 20rpx;
      margin: -20rpx;
    }
    .icon-more-hidden {
      transform: rotate(-90deg);
    }
    .icon-more-show {
      transform: rotate(90deg);
    }
    .iconfont {
      font-size: 18rpx;
      color: #333333;
    }
  }
  .record-content:first-child {
    margin-top: 10rpx;
  }
}
</style>
