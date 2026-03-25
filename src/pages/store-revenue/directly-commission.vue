<template>
  <view v-if="isLoading" :style="themeVars">
    <view class="top-bg" :style="bgStyle"></view>
    <view class="itemWrapper top-wrapper">
      <view class="top-content">
        <!-- 累计结算佣金 -->
        <view class="top-hand">
          <view class="price">￥{{ list.CumulativeCommission || 0 }}</view>
          <view class="tips">累计结算佣金</view>
        </view>
        <view class="wite"></view>
        <!-- 待结算佣金 -->
        <view class="top-hand">
          <view class="price">￥{{ list.NoCumulativeCommission || 0 }}</view>
          <view class="tips">待结算佣金</view>
        </view>
      </view>
      <u-icon class="iconshuoming" name="question-circle" color="#000" size="34" @tap="show = true"></u-icon>
    </view>

    <!-- 直营售出明细 -->
    <view class="itemWrapper top-wrapper">
      <view class="top-store">
        <!-- 直营订单累计售出 -->
        <view class="store-cent">
          <view class="store-hand">{{ list.TotalAmount || 0 }}</view>
          <view class="store-end">直营订单累计售出</view>
        </view>
        <!-- 累计订单 -->
        <view class="store-cent">
          <view class="store-hand">{{ list.Count || 0 }}</view>
          <view class="store-end">累计订单</view>
        </view>
      </view>
      <!-- 直营售出明细 -->
      <navigator class="base-store" hover-class="none" url="./income-list?OrderType=1">
        <view class="base-name">直营售出明细</view>
        <view class="icon iconfont icon-arrow-right"></view>
      </navigator>
    </view>
    <common-popup
      v-model="show"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
    ></common-popup>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      popType: 'tip', //弹窗类型
      popTitle: '提示', // 弹窗标题
      popContent: '提现请在“直营推广”、“渠道推广”模块中操作', // 弹窗内容
      popConfirmText: '我知道了', // 弹窗确认按钮文案
      list: {},
      show: false,
      isLoading: false
    }
  },
  computed: {
    ...mapState(['isSpecialMp']),
    bgStyle() {
      let style = []
      // if (this.isSpecialMp) {
      //   style.push(`background-image: linear-gradient(${this.themeInfo.color}, #f7f7f7)`)
      // } else {
      //   style.push(`background-image: linear-gradient(#f7725c, #ffb250, #f7f7f7)`)
      // }
      style.push(`background-image: linear-gradient(${this.themeInfo.color}, #f7f7f7)`)
      return style.join(';')
    }
  },
  onLoad() {
    this.getGetDirectlyRevenue()
  },
  methods: {
    // 直营佣金统计
    getGetDirectlyRevenue() {
      apiCloud({
        url: '/api/v1/Withdrawa/GetDirectlyRevenue',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          this.list = res.return_data
          this.isLoading = true
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.itemWrapper {
  position: relative;
  z-index: 99;
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
  box-shadow: 0px 0px 6px 0px rgba(153, 153, 153, 0.24);
  .icon-arrow-right {
    color: #999;
    font-size: 20rpx;
  }
  .iconshuoming {
    position: absolute;
    top: 30rpx;
    right: 40rpx;
  }
}

.top-bg {
  position: absolute;
  top: -20rpx;
  left: 0;
  width: 750rpx;
  height: 400rpx;
  z-index: 1;
}
.top-wrapper {
  .top-content {
    padding: 60rpx 0 80rpx;
    display: flex;
    align-items: center;
    .wite {
      width: 1px;
      height: 80rpx;
      background: #eeeeee;
      border-left: 1rpx solid #eeeeee;
    }
    .top-hand {
      width: 49%;
      text-align: center;
      .price {
        font-size: 40rpx;
        font-weight: 800;
        text-align: center;
        color: var(--theme-color, #ff5e33);
        margin-bottom: 27rpx;
      }
      .tips {
        font-size: 26rpx;
        font-weight: 500;
        color: #666666;
      }
    }
  }
  .top-store {
    display: flex;
    align-items: center;
    padding: 36rpx 0;
    border-bottom: 1rpx solid #eeeeee;
    .store-cent {
      width: 50%;
      .store-hand {
        font-size: 32rpx;
        color: var(--theme-color, #ff5e33);
      }
      .store-end {
        font-size: 28rpx;
      }
    }
  }
  .base-store {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 34rpx;
    .base-name {
      font-size: 30rpx;
      font-weight: 500;
      color: #000000;
    }
  }
}
</style>
