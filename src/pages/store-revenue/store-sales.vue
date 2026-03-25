<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="top-bg" :style="bgStyle"></view>
    <view class="itemWrapper top-wrapper">
      <view class="top-content">
        <view class="tips">可提现金额</view>
        <view class="price">￥{{ ClerkRegistration.Balance || 0 }}</view>
        <view :class="['button', !ClerkRegistration.Balance ? 'disabled' : '']" @tap="handleWithdrawal(1)">提现</view>
        <u-icon class="iconshuoming" name="question-circle" @click="show = true"></u-icon>
      </view>
    </view>
    <view class="itemWrapper">
      <navigator class="item border-b" hover-class="none" url="./withdrawal-record?currentTab=1">
        <view class="label">
          提现中金额
          <text class="count-price">￥{{ ClerkRegistration.CashWithdrawalAmount || 0 }}</text>
        </view>
        <view class="icon iconfont icon-arrow-right"></view>
      </navigator>
      <navigator class="item border-b" hover-class="none" url="./withdrawal-record?currentTab=2">
        <view class="label">
          已提现金额
          <text class="count-price">￥{{ ClerkRegistration.WithdrawalAmount || 0 }}</text>
        </view>
        <view class="icon iconfont icon-arrow-right"></view>
      </navigator>
      <navigator class="item" hover-class="none" url="./withdrawal-record?currentTab=0">
        <view class="label">提现记录</view>
        <view class="icon iconfont icon-arrow-right"></view>
      </navigator>
    </view>
    <view class="itemWrapper">
      <view class="item border-b">
        <view class="label revenue-item">
          <view class="price">￥{{ ClerkRegistration.Income || 0 }}</view>
          <view class="text">订单累计收入</view>
        </view>
        <view class="label revenue-item">
          <view class="price">{{ ClerkRegistration.OrderNum || 0 }}</view>
          <view class="text">累计订单</view>
        </view>
      </view>
      <navigator class="item border-b" style="margin-top: 15rpx" hover-class="none" url="./income-list?currentTab=0">
        <view class="label">
          订单待结算金额：
          <text style="margin-left: 5rpx; font-weight: bold">￥{{ ClerkRegistration.WaitIncome || 0 }}</text>
        </view>
        <view class="icon iconfont icon-arrow-right"></view>
      </navigator>
      <navigator class="item" hover-class="none" url="./income-list" style="flex: 1">
        <view class="label">订单收入明细</view>
        <view class="icon iconfont icon-arrow-right"></view>
      </navigator>
    </view>
    <!-- <view v-if="!ClerkRegistration.OpenID" class="itemWrapper">
      <view class="item">
        <view class="label">提现账户绑定</view>
        <view class="click" @click="WXBind(2)">立即绑定</view>
      </view>
      <view class="item-tips">
        <view class="tips">
          <text class="iconfont iconzhuyi"></text>
          绑定微信号用于门店订单款收入提现，请谨慎
        </view>
      </view>
    </view>
    <view v-if="ClerkRegistration.OpenID" class="itemWrapper">
      <view class="item">
        <view class="label">提现账户绑定</view>
        <view style="color: #999">已绑定</view>
      </view>
      <view class="item">
        <view class="label" style="display: flex">
          <image class="face" :src="avatarUrl || defaultAvatar" mode="aspectFill" lazy-load="false" />
          <text>{{ nickName || '' }}</text>
        </view>
        <view class="click" @tap="WXBind(3)">换绑</view>
      </view>
    </view> -->
    <!-- 绑定信息 -->
    <bind-account ref="bindAccount" class="block mt-30" />
    <navigator class="question" hover-class="none" url="./question-comps">
      <view>常见问题</view>
    </navigator>
    <u-popup v-model="show" mode="center" width="600rpx" height="auto" border-radius="20" closeable="true">
      <view style="font-size: 26rpx; padding: 50rpx">
        <view class="title" style="font-weight: bold; font-size: 32rpx; text-align: center; margin-bottom: 20rpx">
          店铺营收说明
        </view>
        <view>
          已支付的订单实收款均算入订单累计收入（不含退款，不含购物券抵扣金额），订单交易完成则结算至可提现余额。（注：每笔订单已按{{
            rate
          }}%扣取{{ msg }}，如该订单含有平台补贴费则一起结算）
        </view>
        <view style="padding: 2rpx 0">
          <view style="font-weight: bold; font-size: 28rpx">可提现余额</view>
          <view>已结算且未提现的订单实收总额+该订单平台补贴费（如有）</view>
        </view>
        <view style="padding: 2rpx 0">
          <view style="font-weight: bold; font-size: 28rpx">订单累计收入</view>
          <view>累计收入=可提现余额+提现中金额+已提现金额+待结算金额</view>
        </view>
        <view style="padding: 2rpx 0">
          <view style="font-weight: bold; font-size: 28rpx">待结算金额</view>
          <view>
            订单已支付但交易未完成的订单实收总额，消费者到店核销提货后，将在核销成功后的第2天(T+2)自动结算对应订单实收款+订单平台补助费（如有）至可提现余额，配送订单则在确认收货7天后。若订单发生了退款、退货则数值可能发生变化。
          </view>
        </view>
        <view style="padding: 2rpx 0">
          <view style="font-weight: bold; font-size: 28rpx">订单实收款</view>
          <view>订单实收款=订单实付款- {{ msg }} -分销佣金（如有） -部分退款（如有）-退差额（如有）</view>
        </view>
        <view style="padding: 2rpx 0">
          <view style="font-weight: bold; font-size: 28rpx">订单平台补助费</view>
          <view>该订单商品参与营销活动对应的平台补助费用</view>
        </view>
      </view>
    </u-popup>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
import BindAccount from '@/components/bind-account'
import getUserOpenId from '@/mixins/get-user-openid.js'
import { mapState } from 'vuex'
export default {
  components: {
    BindAccount
  },
  mixins: [getUserOpenId],
  data() {
    return {
      isLoading: false,
      show: false,
      avatarUrl: '',
      nickName: '',
      showClose: false,
      dialogContentType: -1, //0-店铺营收说明  1-未绑定提现账户 2-绑定  3-换绑
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg',
      ClerkRegistration: {},
      rate: 0.6,
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '去设置', // 弹窗确认按钮文案
      popCancelText: '跳过', // 弹窗取消按钮文案
      MemberLogin: ''
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
    },
    msg() {
      return this.MemberLogin === '10004100' ? '交易结算手续费' : '微信手续费'
    }
  },
  async onShow() {
    const res = await apiCloud({
      url: '/api/v1/Common/GetLoginClerkInfoDetail',
      method: 'get',
      data: JSON.stringify({})
    })
    if (this.$ck(res)) {
      this.rate = res.return_data.WXServiceRate * 100 || 0
      this.MemberLogin = res.return_data.MemberLogin
    }
    await this.GetCloudAssetInfo()
  },
  onPullDownRefresh() {
    this.GetCloudAssetInfo()
  },
  methods: {
    async handleWithdrawal(type) {
      if (!this.ClerkRegistration.Balance) return

      if (!this.ClerkRegistration.OpenID) {
        this.popType = 'confirm'
        this.popTitle = ''
        this.popContent = '您还未绑定提现账户哦,请先绑定再提现！'
        this.popConfirmText = '去绑定'
        this.popCancelText = '关闭'
        this.dialogContentType = type
        this.showPopup = true
        return
      }
      this.getUserOpenId().then(res => {
        if (res.userOpenid !== this.ClerkRegistration.OpenID) {
          this.popType = 'confirm'
          this.popTitle = ''
          this.popContent = '当前门店账号绑定的微信账号与当前登录微信账号不一致，无法提现云店收入至微信。'
          this.popConfirmText = '换绑微信'
          this.popCancelText = '知道了'
          this.dialogContentType = 4
          this.showPopup = true
          return
        }
        uni.navigateTo({
          url: './withdrawal'
        })
      })
    },
    // 绑定/换绑微信
    WXBind(type) {
      this.popType = 'confirm'
      type === 2 ? (this.popTitle = '绑定微信号') : (this.popTitle = '换绑微信号')
      this.popContent = '是否绑定当前登录的微信号为提现账户?'
      this.popConfirmText = '确定绑定'
      this.popCancelText = '取消'
      this.dialogContentType = type
      this.showPopup = true
    },
    // 获取云店个人资产
    GetCloudAssetInfo() {
      apiCloud({
        url: '/api/v1/Withdrawa/GetCloudAssetInfo',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        uni.stopPullDownRefresh()
        this.isLoading = true
        if (this.$ck(res)) {
          this.ClerkRegistration = res.return_data || {}
          this.avatarUrl = this.ClerkRegistration.Headpath || ''
          this.nickName = this.ClerkRegistration.NickName || ''
          this.rate = res.return_data.WXServiceRate * 100 || 0
        }
      })
    },
    // 弹窗回调
    handleConfirm() {
      this.showPopup = false
      if (this.dialogContentType === 1) {
        this.WXBind(2)
      }
      if (this.dialogContentType === 2) {
        this.$refs.bindAccount.handleBind()
      }
      if (this.dialogContentType === 4) {
        this.$refs.bindAccount.handleBindWx()
      }
    }
  }
}
</script>


<style lang="scss" scoped>
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70rpx;
  background-color: var(--theme-color, #ff5e33);
  border-radius: 35rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #fff;
}
.icon-arrow-right {
  color: #999;
  font-size: 20rpx;
}
.container {
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
}
.count-price {
  margin-left: 15rpx;
  font-weight: bold;
  color: var(--theme-color, #ff3835);
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
    text-align: center;
    padding: 10rpx 95rpx 40rpx;
    .tips {
      font-size: 26rpx;
      color: #666;
      padding-bottom: 50rpx;
    }
    .price {
      font-size: 60rpx;
      padding-bottom: 40rpx;
      font-weight: bold;
    }
    .iconshuoming {
      position: absolute;
      right: 36rpx;
      top: 28rpx;
      font-size: 32rpx;
      color: #666;
    }
    .disabled {
      background-color: #ccc;
      color: #fff;
    }
  }
}
.item {
  line-height: 90rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
}
.item-tips {
  display: flex;
  justify-content: flex-end;
  .tips {
    display: inline-block;
    font-size: 26rpx;
    color: #f26432;
    padding: 5rpx 10rpx;
    text-align: right;
    background-color: #fff5f0;
    .iconzhuyi {
      font-size: 26rpx;
    }
  }
}

.label {
  flex: 1;
  font-size: 30rpx;
  color: #000;
}
.openid-content {
  color: #aaaaaa;
  font-size: 26rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.click {
  color: #579bfb;
}
.face {
  display: block;
  width: 70rpx;
  height: 70rpx;
  margin-right: 20rpx;
  border-radius: 50%;
}
.arrowRight {
  font-size: 18rpx;
  color: #999;
  transform: rotate(-90deg);
}
.border-b {
  border-bottom: 1px solid #eee;
}
.revenue-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  .price {
    font-size: 34rpx;
    // color: #ff3835;
    color: var(--theme-color, #ff3835);
    font-weight: bold;
  }
  .text {
    margin-top: -30rpx;
    font-size: 24rpx;
    color: #333;
  }
}
.question {
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-style: 24rpx;
  color: #579bfb;
}
.block {
  display: block;
  padding: 0 30rpx;
}
</style>
