<template>
  <view class="tips-box" :style="themeVars">
    <view class="mr-10 name ellipsis ver-middle">{{ inviteText || '' }}</view>
    <text class="ver-middle">邀你激活</text>
    <view class="store">@{{ info.memberloginname || '' }}</view>
  </view>
</template>
<script>
export default {
  props: {
    info: {
      type: Object,
      default: () => {}
    },
    type: {
      type: Number,
      default: 0
    }
  },
  computed: {
    inviteText() {
      return this.type === 1
        ? `${this.info?.memberloginname || ''}`
        : `${this.info?.memberloginname || ''}${this.info?.dealername || ''}${this.info?.salesmanname || ''}`
    }
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.tips-box {
  padding: 24rpx 30rpx;
  background: #fff5f1;
  font-size: 28rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #000000;
  .name {
    max-width: 550rpx;
  }
  .ver-middle {
    display: inline-block;
    vertical-align: middle;
  }
  .store {
    color: var(--theme-color, $uni-color-primary);
  }
}
</style>
