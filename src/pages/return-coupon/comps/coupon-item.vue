<template>
  <view class="coupon-box pb-10">
    <view class="item flex flex-middle">
      <image :src="item.voucherimg" class="img" />
      <view class="info">
        <view class="title ellipsis-1 fs-28 fw-bold c-0">
          {{ item.vouchername }}
        </view>
        <view class="detail fs-24 c-9">
          <view>券码：{{ item.vouchercode }}</view>
          <view>发放时间：{{ item.receivetime }}</view>
          <view v-if="tabIndex === 1">报销时间：{{ item.reimbursetime }}</view>
          <view v-else>过期时间：{{ item.validtime }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    tabIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  onload() {},
  methods: {
    navUrl(voucherid) {
      uni.navigateTo({
        url: `/pages/cash-coupon/detail?id=${voucherid}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/style.scss';
.coupon-box {
  padding: 30rpx 0 10rpx;
}
</style>
