<template>
  <view class="container">
    <view class="listContainer">
      <view v-for="(item, index) in list" :key="index">
        <block>
          <view class="itemWrapper">
            <view class="listTitle" @tap="showContent(index)">
              <view class="circle"><u-icon name="search" color="#fff" size="20"></u-icon></view>
              <view style="flex: 1">{{ item.title }}</view>
              <view :class="['iconfont', 'icon-arrow-right', item.flag]"></view>
            </view>
            <view v-if="item.flag" class="listCon">
              <view class="circle" style="margin-top: 4rpx; background-color: #ff9933">
                <text style="color: #fff">A</text>
              </view>
              <text selectable="true">{{ item.content }}</text>
            </view>
          </view>
        </block>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  data() {
    return {
      list: [
        {
          title: '如何提现？',
          flag: false,
          content:
            '可提现余额不为0时，可点击“提现”进行提现操作。提现前需先绑定提现账户。\n 注：店员帐号无提现权限，仅店主帐号可提现；提现的微信号需完成微信实名认证。'
        },
        {
          title: '提现额度有限制吗？',
          flag: false,
          content: '有的，因为提现是采用微信企业付款发放的，微信限制单笔/单日最多可提现5000元。'
        },
        { title: '提现次数有限制吗？', flag: false, content: '有的，最多10次。' },
        {
          title: '为什么订单实收款比订单实付款少？',
          flag: false,
          content: '因为订单支付到微信商户账户，需扣除微信结算手续费。'
        },
        {
          title: '提现成功后的钱去哪里了？',
          flag: false,
          content: '提现成功的钱直接入账到了绑定的提现账户（微信零钱），可在提现记录中查看提现详情。'
        },
        {
          title: '提现失败后的钱去哪里了？',
          flag: false,
          content: '提现失败后的钱款是不做扣除的，会原路返还至可提现余额中，可再次进行提现。'
        },
        { title: '退款订单会扣除手续费吗？', flag: false, content: '不会。' },
        {
          title: '客户下单支付的订单款，是到品牌商账户，还是直接到账门店账户？',
          flag: false,
          content: '先到账品牌商账户，当订单完成交易后，门店店主可提现至个人微信账户。'
        },
        {
          title: '订单款什么时候可以提现？',
          flag: false,
          content:
            '订单完成交易后（消费者已到店核销提货/确认收货）才能结算入账至可提现 余额。若订单发生退款，则对应订单款不能结算。'
        },
        { title: '可提现至银行卡吗？', flag: false, content: '暂不支持提现至银行卡。' },
        { title: '提现到账需要多久？', flag: false, content: '提现成功基本即时到账。' },
        { title: '订单手续费支持开发票吗？', flag: false, content: '支持，请联系品牌商处理。' }
      ]
    }
  },
  methods: {
    showContent(index) {
      this.list[index].flag = !this.list[index].flag
    }
  }
}
</script>


<style lang="scss" scoped>
.container {
  background-color: #f7f7f7;
}
.listContainer {
  background-color: #f7f7f7;
  padding: 20rpx 0 40rpx;
}
.itemWrapper {
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
  box-shadow: 0px 0px 6px 0px rgba(153, 153, 153, 0.24);
}
.listTitle {
  font-size: 32rpx;
  line-height: 46rpx;
  padding: 22rpx 0;
  display: flex;
  align-items: center;
  text {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .iconfont {
    font-size: 22rpx;
    color: #999;
    height: 46rpx;
    &.true {
      transform: rotate(90deg);
    }
  }
}
.listCon {
  display: flex;
  padding: 23rpx 0;
  font-size: 28rpx;
  color: #666;
  word-break: break-all;
  line-height: 46rpx;
  margin-bottom: 30rpx;
  > text {
    flex: 1;
    text-align: justify;
    text-justify: newspaper;
    word-break: break-all;
  }
}
.circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffbaa8;
}
</style>

