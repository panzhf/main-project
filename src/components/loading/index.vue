<template>
  <view class="loading">
    <image class="logo" :src="loadingGif" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  data() {
    return {
      loadingGif: staticURL(true) + 'loading.gif'
    }
  }
}
</script>

<style lang="scss" scoped>
.loading {
  .logo {
    width: 360rpx;
    height: 360rpx;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 50%为自身尺寸的一半 */
  }
}
</style>
