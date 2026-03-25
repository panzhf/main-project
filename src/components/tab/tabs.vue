<template>
  <view :style="themeVars">
    <view class="tabs">
      <view
        v-for="(item, index) in tabs"
        :key="index"
        :class="['tab__item', value === item.value ? 'is-active' : '']"
        @tap="handleSwitch(item.value)"
      >
        <view class="tab__label">{{ item.label }}</view>
        <view v-if="item.count">（{{ item.count > 99 ? '99+' : item.count }}）</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      default() {
        return []
      }
    },
    value: {
      type: Number,
      default: 0,
      twoWay: true
    }
  },
  data() {
    return {
      chooseValue: 0
    }
  },
  methods: {
    handleSwitch(value) {
      this.chooseValue = value
      this.$emit('handleTabChange', this.chooseValue)
    }
  }
}
</script>

<style lang="scss" scoped>
.tabs {
  left: 0;
  top: 0;
  display: flex;
  width: 100%;
  background-color: #fff;
  z-index: 111;
  .tab__item {
    display: flex;
    justify-content: center;
    flex: 1;
    line-height: 70rpx;
    text-align: center;
    font-size: 26rpx;
    &.is-active {
      color: var(--theme-color, $uni-color-primary);
      .tab__label {
        &::after {
          opacity: 0.1;
        }
      }
    }
    .tab__label {
      position: relative;
      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 25rpx;
        margin: 0 auto;
        width: 46rpx;
        height: 20rpx;
        background-color: var(--theme-color, $uni-color-primary);
        border-radius: 10rpx;
        opacity: 0;
      }
    }
  }
}
</style>
