<template>
  <view class="fs-26 pt-50 pb-50 pl-40 pr-40">
    <view class="fw-bold fs-32 tx-c mb-30">{{ type === 5 ? '字段说明' : '统计说明' }}</view>
    <block v-if="type === 1">
      <!-- 店主显示 -->
      <template v-if="roleType === 2">
        <view class="pt-10 pb-10">
          <text class="fw-bold">红包零钱：</text>
          可提现的红包零钱余额。是当前门店账号的负责人参与品牌商各项活动所获得的红包零钱。
        </view>
        <view class="pt-10 pb-10">
          <text class="fw-bold">积分：</text>
          可兑换的积分余额。是当前门店账号的负责人参与品牌商各项活动所获得的积分。
        </view>
        <view class="pt-10 pb-10">
          <text class="fw-bold">云店收入：</text>
          当前门店的云店总收入，包括云店营收和佣金收入。
        </view>
      </template>
      <!-- 店员显示 -->
      <template v-if="roleType === 3">
        <view class="pt-10 pb-10">
          <text class="fw-bold">红包零钱：</text>
          可提现的红包零钱余额。是当前登录门店账号参与品牌商各项活动所获得的红包。
        </view>
      </template>
    </block>
    <block v-else-if="type === 2">
      <view class="pt-10 pb-10">
        <text class="fw-bold">开箱数量：</text>
        门店扫动销码的个数。
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">核销数量：</text>
        门店给消费者核销的数量（含提领券、实物、赠品和订单）。
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">签收数量：</text>
        门店签收的商品数量。
      </view>
    </block>
    <block v-else-if="[3, 4].includes(type)">
      <view v-if="type === 3" class="pt-10 pb-10">
        1、若您获得的红包属于红包零钱，可随时点击【前往提现】按钮进行提现。
      </view>
      <view v-else class="pt-10 pb-10">1、若您获得的红包属于红包零钱，请前往品牌商公众号或者会员小程序进行提现。</view>
      <view class="pt-10 pb-10">
        2、若您获得的红包属于微信红包，需手动点击领取(有效期为24小时)，请留意微信消息领取。
      </view>
      <view class="pt-10 pb-10">3、若红包发放失败，请联系客服进行补发。</view>
    </block>
    <block v-else-if="type === 5">
      <view class="pt-10 pb-10">
        <text class="fw-bold">首次进店：</text>
        用户首次授权并进入您的云店
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">入会时间：</text>
        用户成为会员的时间
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">可用积分：</text>
        用户剩余可用积分
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">可用卡券：</text>
        用户剩余未过期的提领券、优惠券、提货卡
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">订单数量：</text>
        用户在您的云店下单并已完成的订单（不包含退款订单）
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">已核订单：</text>
        用户在您的云店下单并完成核销的订单
      </view>
      <view class="pt-10 pb-10">
        <text class="fw-bold">累计扫码次数/个数：</text>
        扫码数据统计的码类型范围为“智能营销码（防伪码、箱码）、超级导购码、智慧微商码、微信二维码
      </view>
    </block>
  </view>
</template>

<script>
export default {
  props: {
    type: {
      type: Number,
      default: 1 // 1首页红包零钱 2首页数据概览 3核销奖励红包提示(负责人) 4核销奖励红包提示(非负责人)
    },
    roleType: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {}
  }
}
</script>

