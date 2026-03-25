<template>
  <view class="bottom-mask">
    <image class="mask-con" :src="mask" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  data() {
    return {
      mask: staticURL() + 'common/mask.png'
    }
  }
}
</script>

<style lang="scss" scoped>
.bottom-mask {
  position: absolute;
  width: 100%;
  height: 30rpx;
  left: 0;
  bottom: 0;
  .mask-con {
    width: 100%;
    height: 30rpx;
    background-repeat: repeat-x;
    background-size: 100% 30rpx;
  }
}
</style>
