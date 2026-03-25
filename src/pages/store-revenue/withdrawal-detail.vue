<template>
  <view v-if="isLoading" class="container">
    <view
      class="top-bg"
      :style="{
        'background-color':
          WithdrawalDetail.AuditStatus === 0 || WithdrawalDetail.WithdrawalStatus === 0
            ? '#FF9933'
            : WithdrawalDetail.AuditStatus === 2 || WithdrawalDetail.WithdrawalStatus === 2
            ? '#FF5E33'
            : '#02C567'
      }"
    >
      <view class="circle" :style="{ backgroundImage: `url(${circle})` }"></view>
    </view>
    <view class="itemWrapper top-wrapper">
      <view v-if="WithdrawalDetail.AuditStatus === 0" class="top-content">
        <text class="iconfont icontixianshenqingyitijiaoicon"></text>
        <view class="title">提现申请已提交</view>
        <view class="content">请等待审核，</view>
        <view class="content">预计1-5个工作日内审核完毕</view>
      </view>
      <view v-else-if="WithdrawalDetail.AuditStatus === 2" class="top-content">
        <text class="iconfont iconzhuyiicon"></text>
        <view class="title">审核不通过</view>
        <view class="content">{{ WithdrawalDetail.AuditRemark }}</view>
        <view class="content">提现款已全额返还至店铺可提现余额</view>
      </view>
      <view v-else-if="WithdrawalDetail.WithdrawalStatus === 1" class="top-content">
        <text class="iconfont icontixianchenggongicon"></text>
        <view class="title">提现成功</view>
        <view class="content">
          {{
            WithdrawalDetail.OperationType === 3
              ? '请查收公众号或微信服务通知中的红包发放通知'
              : '请查收“微信支付”的零钱入账通知'
          }}
        </view>
      </view>
      <view v-else-if="WithdrawalDetail.WithdrawalStatus === 2" class="top-content">
        <text class="iconfont iconzhuyiicon"></text>
        <view class="title">提现失败</view>
        <view class="content">{{ WithdrawalDetail.WxRetDesc }}</view>
        <view class="content">提现款已全额返还至店铺可提现余额</view>
      </view>
      <view v-else-if="WithdrawalDetail.WithdrawalStatus === 0" class="top-content">
        <text class="iconfont icontixianzhongicon"></text>
        <view class="title">提现中</view>
        <view class="content">提现处理中，预计5分钟内到账</view>
        <view class="content">
          {{
            WithdrawalDetail.OperationType === 3
              ? '稍后留意微信公众号或微信服务通知中的红包发放消息'
              : '稍后请留意微信到账结果'
          }}
        </view>
      </view>
    </view>
    <view class="itemWrapper">
      <view class="item border-b">
        <view class="label">提现金额：</view>
        <view class="content">￥{{ WithdrawalDetail.Amount }}</view>
      </view>
      <view class="item border-b">
        <view class="label">到账账户：</view>
        <view class="content" style="display: flex; align-items: center">
          <text style="margin-right: 8rpx">{{ WithdrawalDetail.NickName || '' }}</text>
          <image class="face" :src="WithdrawalDetail.Headpath || defaultAvatar" mode="aspectFill" lazy-load="false" />
        </view>
      </view>
      <view :class="['item', WithdrawalDetail.AuditStatus === 1 && WithdrawalDetail.WxBillNo ? 'border-b' : '']">
        <view class="label">提现时间：</view>
        <view class="content">{{ WithdrawalDetail.LastModified }}</view>
      </view>
      <view v-if="WithdrawalDetail.AuditStatus === 1 && WithdrawalDetail.WxBillNo" class="item">
        <view class="label">交易单号：</view>
        <view class="content">{{ WithdrawalDetail.WxBillNo }}</view>
      </view>
    </view>
  </view>
</template>
<script>
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      isLoading: false,
      circle: staticURL() + 'shop/circle.png',
      id: 0,
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg',
      WithdrawalDetail: {},
      type: 0 // 0-代表从首页门店营收进来   1-代表从活动分类渠道推广进来
    }
  },

  onLoad(options) {
    this.id = options.id - 0 || 0
    this.type = +options.type || 0
    this.GetWithdrawalDetail()
  },

  methods: {
    // 获取收入详情
    GetWithdrawalDetail() {
      const urlY = this.type === 1 ? 'ChannelReward' : this.type === 2 ? 'DirectlyAssets' : 'Withdrawa'
      apiCloud({
        url: `/api/v1/${urlY}/GetWithdrawalDetail`,
        method: 'get',
        data: JSON.stringify({ id: this.id })
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.WithdrawalDetail = res.return_data || {}
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
  overflow: hidden;
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
  .icontixianshenqingyitijiaoicon,
  .icontixianzhongicon {
    color: #ff9933;
  }
  .icontixianchenggongicon {
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
    margin-top: 10rpx;
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
  font-size: 24rpx;
  color: #3385ff;
}
.label {
  width: 200rpx;
  color: #333;
}
.content {
  color: #666;
  flex: 1;
  word-break: break-word;
  line-height: 70rpx;
}
.face {
  display: block;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}
.arrowRight {
  font-size: 18rpx;
  color: #999;
}
.border-b {
  border-bottom: 1px solid #eee;
}
</style>
