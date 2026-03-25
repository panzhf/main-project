<template>
  <view
    class="cell-line flex"
    :class="[isMiddle ? 'flex-middle' : '', isInput ? 'form-css' : '', isShowLine ? 'bd-e' : '']"
    :style="cellStyle"
    @tap.stop="handleClick"
  >
    <view class="cell-line__needed" :class="!isNeeded ? 'none-show' : ''">*</view>
    <view v-if="isShowLeft" class="cell-line__key">
      <slot name="left"></slot>
    </view>
    <view class="cell-line__value flex-1" :class="[isTwoLine ? 'ellipsis-2' : '', isWordbreak ? 'wb-ba' : '']">
      <slot name="right"></slot>
    </view>
    <view v-if="isLink" class="cell-line__more">
      <text v-if="iconType === 'more'" class="icon iconfont icon-more"></text>
      <text v-else-if="iconType === 'address'" class="cell-line__more icon iconfont icon-address"></text>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    isLink: Boolean, // 是否点击,
    isMiddle: Boolean, // 是否垂直居中,
    iconType: {
      // 图标类型
      type: String,
      default: 'more'
    },
    cellStyle: {
      // 样式
      type: String,
      default: ''
    },
    isInput: Boolean, // 是否是表单,
    isNeeded: Boolean, // 是否是必须,
    isTwoLine: {
      // 显示两行
      type: Boolean,
      default: true
    },
    isShowLine: {
      // 显示底部边框线
      type: Boolean,
      default: true
    },
    isShowLeft: {
      // 显示左侧key
      type: Boolean,
      default: true
    },
    isWordbreak: Boolean // 内容换行
  },
  data() {
    return {}
  },
  methods: {
    handleClick() {
      this.$emit('tap')
    }
  }
}
</script>
<style lang="scss" scoped>
.cell {
  &-line {
    padding: 35rpx 30rpx 35rpx 0;
    line-height: 40rpx;
    font-size: 30rpx;
    &.form-css {
      padding: 0 30rpx 0 0;
    }
    &__key {
      min-width: 160rpx;
      color: #666;
    }
    &__needed {
      margin-right: 5rpx;
      color: #dd2726;
      &.none-show {
        opacity: 0;
      }
    }
    &__value {
      flex: 1;
      margin-left: 30rpx;
      text-align: right;
      color: #333;
    }
    &__more {
      color: $uni-text-color;
      width: 40rpx;
      text-align: right;
      .icon-more {
        font-size: 26rpx;
      }
      .icon-address {
        font-size: 30rpx;
      }
    }
  }
}
</style>
