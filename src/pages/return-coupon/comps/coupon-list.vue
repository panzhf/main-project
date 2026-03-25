<template>
  <view class="coupon-box" @tap.stop="navUrl(item)">
    <view v-if="activiyTabIndex === 2" class="icon iconfont icon-yiguoqi diabled-icon"></view>
    <view v-if="activiyTabIndex === 1" class="icon iconfont icon-yishiyong diabled-icon"></view>
    <view class="item flex flex-middle">
      <image :src="item.voucherimg" class="img" />
      <view class="info flex-1">
        <view class="title ellipsis-1 fs-28 fw-bold" :class="activiyTabIndex === 0 ? 'c-0' : 'c-9'">
          {{ item.vouchername }}
        </view>
        <view class="detail fs-24 c-9">
          <view>返货券ID： {{ item.voucherid }}</view>
          <view v-if="activiyTabIndex === 0">未使用： {{ item.unusedcount }}张</view>
          <view v-if="activiyTabIndex === 0">有效期不足30天： {{ item.validcount }}张</view>
        </view>
      </view>
      <view class="icon iconfont icon-arrow-right fs-20"></view>
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
    activiyTabIndex: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      money: 1.8
    }
  },
  onload() {},
  methods: {
    navUrl(item) {
      this.$emit('url', item)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../style/style.scss';
</style>
