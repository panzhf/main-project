<template>
  <view v-if="isLoading" class="container">
    <view
      class="top-bg"
      :style="{
        'background-color': IncomeDetail.State === 0 ? '#FF9933' : IncomeDetail.State === 1 ? '#FF5E33' : '#02C567'
      }"
    >
      <view class="circle" :style="{ 'background-image': `url(${circle})` }"></view>
    </view>
    <view class="itemWrapper top-wrapper">
      <view v-if="IncomeDetail.State === 0" class="top-content">
        <text class="iconfont icondaijiesuanicon"></text>
        <view class="title">待结算</view>
        <view class="content">{{ IncomeDetail.DeliveryMode === 0 ? '消费者确认收货后' : '消费者到店核销提货后' }}</view>
        <view class="content">
          {{ IncomeDetail.DeliveryMode === 0 ? '将在7天后自动结算至可提现余额' : '将在24小时内自动结算至可提现余额' }}
        </view>
      </view>
      <view v-else-if="IncomeDetail.State === 1" class="top-content">
        <text class="iconfont iconzhuyiicon"></text>
        <view class="title">已退款</view>
        <view class="content">已全额退款给消费者</view>
        <view class="content">退款时间：{{ IncomeDetail.UpdataTime }}</view>
      </view>
      <view v-else-if="IncomeDetail.State === 2" class="top-content">
        <text class="iconfont iconyijiesuanicon"></text>
        <view class="title">已结算</view>
        <view class="content">已结算至可提现余额</view>
        <view class="content">结算时间：{{ IncomeDetail.SettleTime }}</view>
      </view>
    </view>
    <view class="itemWrapper">
      <view class="item border-b" @tap="goToOrder">
        <view class="label">订单号：</view>
        <view class="content order-num">
          {{ IncomeDetail.OrderNumber }}
          <text class="iconfont icon-arrow-right arrowRight"></text>
        </view>
      </view>
      <view class="item border-b">
        <view class="label">支付时间：</view>
        <view class="content">{{ IncomeDetail.PayTime }}</view>
      </view>
      <view class="item border-b">
        <view class="label">订单实付款：</view>
        <view class="content">￥{{ IncomeDetail.PayMoney }}</view>
      </view>
      <view class="item border-b">
        <view class="label">
          手续费：
          <u-icon name="question-circle" color="#3385ff" size="28" @tap="showTips(0)"></u-icon>
        </view>
        <view class="content">￥{{ IncomeDetail.ServiceCharge }}</view>
      </view>
      <view class="item border-b">
        <view class="label">
          分销佣金：
          <u-icon name="question-circle" color="#3385ff" size="28" @tap="showTips(1)"></u-icon>
        </view>
        <view class="content">
          <text v-if="IncomeDetail.CurrentDistributorIncome > 0 || IncomeDetail.ParenteDistributorIncome > 0">-</text>
          ￥{{ IncomeDetail.CurrentDistributorIncome + IncomeDetail.ParenteDistributorIncome }}
        </view>
      </view>
      <view class="item border-b">
        <view class="label">
          退款金额：
          <u-icon name="question-circle" color="#3385ff" size="28" @tap="showTips(2)"></u-icon>
        </view>
        <view class="content">{{ IncomeDetail.RefundIncome }}</view>
      </view>
      <view class="item border-b">
        <view class="label">
          退差额：
          <u-icon name="question-circle" color="#3385ff" size="28" @tap="showTips(3)"></u-icon>
        </view>
        <view class="content">{{ IncomeDetail.SpreadIncome }}</view>
      </view>
      <view class="item">
        <view class="label">订单实收款：</view>
        <view class="content">￥{{ IncomeDetail.StoreIncome }}</view>
      </view>
    </view>
    <view class="itemWrapper">
      <view class="item" style="line-height: 70rpx">
        <view class="label" style="font-size: 30rpx; color: #000">
          订单平台补助费：
          <u-icon name="question-circle" color="#3385ff" size="28" @tap="showTips(4)"></u-icon>
        </view>
        <view class="content">￥{{ IncomeDetail.StoreCouponReturnAmount }}</view>
      </view>
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
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '我知道了', // 弹窗确认按钮文案
      isLoading: false,
      circle: staticURL() + 'shop/circle.png',
      recordId: 0,
      show: false,
      IncomeDetail: {},
      rate: 0.6,
      MemberLogin: ''
    }
  },
  async onLoad(options) {
    this.recordId = options.recordId - 0 || 0
    const res = await apiCloud({
      url: '/api/v1/Common/GetLoginClerkInfoDetail',
      method: 'get',
      data: JSON.stringify({})
    })
    if (this.$ck(res)) {
      // this.rate =
      //   res.return_data.MemberLogin === '10003644' ||
      //   res.return_data.MemberLogin === '10003911' ||
      //   res.return_data.MemberLogin === '10003361'
      //     ? 0.2
      //     : 0.6
      this.MemberLogin = res.return_data.MemberLogin
    }
    await this.QueryStoreIncomeDetail()
  },

  methods: {
    goToOrder() {
      uni.navigateTo({
        url: `/cloud-store/order-management/detail?orderNumber=${this.IncomeDetail.OrderNumber}`
      })
    },
    showTips(num) {
      let title =
        num === 0
          ? '手续费说明'
          : num === 1
          ? '分销佣金'
          : num === 2
          ? '退款金额'
          : num === 3
          ? '退差额说明'
          : '订单平台补助费'
      let content =
        num === 0
          ? `微信支付结算手续费（微信收取），费率${this.rate}%`
          : num === 1
          ? '订单中分销商品的佣金总和（分销员获得）'
          : num === 2
          ? '订单中售后退款的金额（退回买家）'
          : num === 3
          ? '订单中发生了退差额（退回买家）'
          : '订单中商品参与营销活动对应的平台补助费用'
      this.popTitle = title
      if (this.MemberLogin === '10004100' && num === 0) {
        content = `交易结算手续费，费率${this.rate}%`
      }
      this.popContent = content
      this.show = true
    },
    // 获取收入详情
    QueryStoreIncomeDetail() {
      apiCloud({
        url: '/api/v1/Withdrawa/QueryStoreIncomeDetail',
        method: 'get',
        data: JSON.stringify({ recordId: this.recordId })
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.IncomeDetail = res.return_data || {}
          this.rate = res.return_data.Rate * 100
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
button {
  background: transparent;
  border-radius: 0;
  box-sizing: content-box;
  text-align: left;
}
.container {
  height: 100%;
  position: relative;
  background-color: #f7f7f7;
  padding-bottom: 30rpx;
}
.itemWrapper {
  position: relative;
  z-index: 99;
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
  box-shadow: 0px 0px 6px 0px rgba(153, 153, 153, 0.24);
  box-sizing: border-box;
}
.top-bg {
  position: absolute;
  top: -20rpx;
  left: 0;
  width: 750rpx;
  height: 400rpx;
  z-index: 1;
  background-color: #ff9933;
  .circle {
    position: absolute;
    bottom: -19rpx;
    width: 300%;
    left: -340rpx;
    right: 0;
    height: 100rpx;
  }
}
.top-wrapper {
  height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .top-content {
    text-align: center;
    .price {
      font-size: 60rpx;
      padding-bottom: 40rpx;
    }
  }
  .iconfont {
    font-size: 70rpx;
    padding: 15rpx 0;
  }
  .icondaijiesuanicon {
    color: #ff9933;
  }
  .iconyijiesuanicon {
    color: #02c567;
  }
  .iconzhuyiicon {
    color: #ff5e33;
  }
  .title {
    padding: 15rpx 0;
    font-size: 40rpx;
  }
  .content {
    margin-top: 5rpx;
    font-size: 26rpx;
    color: #aaa;
  }
}
.item {
  color: #666;
  line-height: 90rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
}
.iconshuoming {
  font-size: 28rpx;
  color: #3385ff;
}
.order-num {
  position: relative;
  margin-right: 20rpx;
}
.iconjiantou2 {
  position: absolute;
  top: 50%;
  right: -20rpx;
  transform: translateY(-50%);
  font-size: 18rpx;
}
.label {
  flex: 1;
  color: #333;
}
.content {
  color: #666;
}
.arrowRight {
  font-size: 18rpx;
  color: #999;
}
.border-b {
  border-bottom: 1px solid #eee;
}
</style>
