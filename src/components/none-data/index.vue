<template>
  <view
    :class="['none-content flex flex-center flex-column flex-middle text-center', onType != 1 ? 'on' : '']"
    :style="customStyle"
  >
    <image :src="icon" class="banner-box" />
    <view class="msg" :style="{ color: textColor }">{{ msg }}</view>
    <slot />
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    icon: {
      type: String,
      default: staticURL() + 'no-data.png'
    },
    msg: {
      type: String,
      default: '暂无数据'
    },
    textColor: {
      type: String,
      default: '#666'
    },
    onType: {
      type: String,
      default: '1'
    },
    customStyle: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
.none-content {
  padding: 200rpx 0;
  margin: 0 auto;
  &.on {
    padding: 200rpx 0 60rpx;
  }
  .banner-box {
    width: 389rpx;
    height: 228rpx;
  }
  .msg {
    padding-top: 30rpx;
    font-size: 30rpx;
  }
}
</style>
