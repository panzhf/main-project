<template>
  <view>
    <view v-for="(item, index) in list" :key="index" class="box flex">
      <v-img class="ticket-pic" :src="type === 'productGift' ? item.productimg : item.voucherimg" :size="120" />
      <view class="ticket flex-1">
        <view v-if="['pickup', 'returnCoupon', 'productGift'].includes(type) && item.customerid" class="item">
          <view class="key">用户信息:</view>
          <view class="val ellipsis">{{ item.customerid }}-{{ item.customername || '未知' }}</view>
        </view>
        <view v-if="type === 'pickup'" class="item">
          <view class="key">提领券信息:</view>
          <view class="val ellipsis-1">{{ item.voucherid }}-{{ item.vouchername }}</view>
        </view>
        <view v-if="type === 'productGift'" class="item">
          <view class="key">实物信息:</view>
          <view class="val ellipsis-1">{{ item.productid }}-{{ item.productname }}</view>
        </view>
        <view v-if="type === 'pickup'" class="item">
          <view class="key">提领券码:</view>
          <view class="val ellipsis-1">{{ item.couponcode }}</view>
        </view>
        <view v-if="type === 'productGift'" class="item">
          <view class="key">实物兑奖码:</view>
          <view class="val ellipsis">{{ item.prizecode }}</view>
        </view>
        <block v-if="type === 'returnCoupon'">
          <view class="item">
            <view class="key">
              {{ item.writeoffcodetype === 2 ? '提领券' : item.writeoffcodetype === 3 ? '实物兑奖码' : '兑奖二维码' }}:
            </view>
            <view class="val ellipsis-1">{{ item.writeoffcodetype === 2 ? item.code : item.writeoffcode }}</view>
          </view>
          <view class="item">
            <view class="key">获得返货券:</view>
            <view class="val ellipsis-1">{{ item.vouchername }}</view>
          </view>
          <view class="item">
            <view class="key">返货券码:</view>
            <view class="val ellipsis-1">{{ item.vouchercode }}</view>
          </view>
        </block>
        <view class="item">
          <view class="key">核销人员:</view>
          <view class="val">{{ type === 'returnCoupon' ? item.writeoffname : item.leader }}</view>
        </view>
        <view v-if="['pickup', 'returnCoupon'].includes(type)" class="item">
          <view class="key">核销方式:</view>
          <view class="val">{{ type === 'returnCoupon' ? '门店核销' : item.method }}</view>
        </view>
        <view class="item">
          <view class="key">核销时间:</view>
          <view class="val">{{ type === 'returnCoupon' ? item.writeofftime : item.addtime }}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
/* pickup提领券  productGift 实物 returnCoupon 返货券*/
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
@import '../styles/ticket.scss';
.val {
  width: 330rpx;
}
</style>
