<template>
  <view v-if="!loading" class="audit-detail" :style="themeVars">
    <view class="bulk">
      <view class="head">基本信息</view>
      <view class="row">
        <view class="left">姓名</view>
        <view class="right">{{ info.leader }}</view>
      </view>
      <view class="row">
        <view class="left">手机号</view>
        <view class="right">{{ info.mobile }}</view>
      </view>
    </view>
    <view class="bulk mt-20">
      <view class="head">审核信息</view>
      <view class="row">
        <view class="left">审核备注</view>
        <view class="right">
          <view>{{ info.isreview | filterState }}</view>
          <view v-if="info.reviewremark" class="remark">
            {{ info.reviewremark }}
          </view>
        </view>
      </view>
      <view class="row">
        <view class="left">审核时间</view>
        <view class="right">{{ info.reviewtime }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiGetclerkReviewDetail } from '@/api/sales.js'
export default {
  filters: {
    filterState(val) {
      switch (val) {
        case 0:
          return '待审核'
        case 1:
          return '审核通过'
        case 2:
          return '审核不通过'
        default:
          break
      }
    }
  },
  data() {
    return {
      id: 0,
      info: {},
      loading: true
    }
  },
  onLoad(options) {
    this.id = options.id
    this.getData()
  },
  methods: {
    async getData() {
      let res = await apiGetclerkReviewDetail({ sysclerkid: this.id })
      if (this.$ck(res)) {
        this.info = res.return_data
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bulk {
  background-color: #fff;
  border-radius: 10rpx;
  padding: 20rpx 20rpx;
  .head {
    font-size: 30rpx;
    font-weight: bold;
    color: #000000;
    position: relative;
    &::after {
      content: '';
      position: absolute;
      // background: #ff7640;
      background: var(--theme-color, $uni-color-primary);
      width: 60rpx;
      height: 8rpx;
      opacity: 0.5;
      border-radius: 4rpx;
      left: 0rpx;
      top: 30rpx;
    }
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding-bottom: 40rpx;
    border-bottom: 1rpx solid #e5e5e5ff;
    margin-top: 40rpx;
    .left {
      width: 200rpx;
    }
    .right {
      flex: 1;
      text-align: right;
      .remark {
        font-size: 24rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
      }
    }
    &:last-child {
      border: none;
      padding-bottom: 20rpx;
    }
  }
}
.audit-detail {
  padding: 20rpx;
}
</style>
