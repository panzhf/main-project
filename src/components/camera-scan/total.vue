<template>
  <view class="total-box flex flex-column" :style="themeVars">
    <view v-for="(item, index) in totalList" :key="index" class="item center-middle flex-1">
      <view class="num">{{ item.num }}</view>
      <view class="title">{{ item.name }}</view>
    </view>
    <view v-if="showLink" class="edit-color mb-30 tx-c" @tap="handleLink">
      商品列表
      <text class="icon iconfont icon-more edit-color fs-26 ml-10"></text>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    totalList: {
      type: Array,
      default: () => []
    },
    showLink: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleLink() {
      this.$emit('link')
    }
  }
}
</script>
<style lang="scss" scoped>
.total-box {
  height: calc(100vh - 800rpx);
  .item {
    .num {
      font-size: 60rpx;
      // color: $uni-text-color-primary;
      color: var(--theme-color, $uni-text-color-primary);
    }
  }
}
</style>
