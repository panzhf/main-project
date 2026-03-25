<template>
  <view class="none-content flex flex-center flex-column flex-middle text-center" :style="customStyle">
    <image
      :src="calcIcon"
      :mode="mode"
      class="banner-box"
      :style="{ width: iconWidth + 'rpx', height: iconHeight + 'rpx' }"
    />
    <view class="msg">{{ msg }}</view>
    <slot />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { mapState } from 'vuex'
export default {
  props: {
    icon: {
      type: String,
      default: staticURL() + 'shop/default.png'
    },
    iconWidth: {
      type: [String, Number],
      default: 256 // 图片宽度，单位rpx
    },
    iconHeight: {
      type: [String, Number],
      default: 196 // 图片高度，单位rpx
    },
    iconMode: {
      type: String,
      default: 'scaleToFill' // 图片裁剪模式，同image的mode属性
    },
    msg: {
      type: String,
      default: '暂无数据'
    },
    customStyle: {
      type: String,
      default: ''
    },
    useIcon: {
      type: Boolean,
      default: false // 专属小程序使用，true表示使用传入的icon
    }
  },
  computed: {
    ...mapState(['isSpecialMp']),
    calcIcon() {
      return this.isSpecialMp && !this.useIcon ? staticURL() + 'shop/default-normal.png' : this.icon
    }
  }
}
</script>

<style lang="scss" scoped>
.none-content {
  padding: 200rpx 150rpx;
  .msg {
    padding-top: 40rpx;
    font-size: 26rpx;
    color: #666;
  }
}
</style>
