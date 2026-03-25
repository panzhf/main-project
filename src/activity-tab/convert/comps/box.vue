<template>
  <view class="invite-box" :style="{ backgroundImage: `url(${pics.actMiddle} )` }">
    <view class="invite-box__top" :style="topStyle">
      <slot name="title" />
    </view>
    <view class="invite-box__content">
      <slot name="content" />
    </view>
    <image class="invite-box__bottom" :src="pics.actBottom" mode="scaleToFill" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    // 顶部背景图 URL，不传则用默认 box-top
    topImage: {
      type: String,
      default: ''
    },
    // 顶部高度，如 '100rpx'、'130rpx'，不传则 100rpx
    topHeight: {
      type: String,
      default: '100rpx'
    }
  },
  data() {
    return {
      pics: {
        actTop: staticURL() + 'convert/box-top.png',
        actMiddle: staticURL() + 'convert/box-middle.jpg',
        actBottom: staticURL() + 'convert/box-bottom.png'
      }
    }
  },
  computed: {
    topStyle() {
      const img = this.topImage || this.pics.actTop
      const h = this.topHeight || '100rpx'
      const num = parseInt(h, 10) || 100
      const s = []
      s.push(`background-image:url(${img})`)
      s.push(`height:${h}`)
      s.push(`background-size:710rpx ${num}rpx`)
      return s.join(';')
    }
  }
}
</script>

<style lang="scss" scoped>
.invite-box {
  margin: 0 20rpx 20rpx 20rpx;
  position: relative;
  border-radius: 10rpx;
  background-repeat: repeat-y;
  background-size: 710rpx auto;
  &__top {
    width: 710rpx;
    height: 100rpx;
    color: #fff;
    line-height: 68rpx;
    font-size: 30rpx;
    padding: 0 30rpx;
    box-sizing: border-box;
    background-size: 710rpx 100rpx;
  }
  &__bottom {
    height: 30rpx;
    width: 710rpx;
    margin-bottom: -10rpx;
  }
  &__content {
    padding: 0 20rpx;
    .item {
      padding: 30rpx 0;
    }
  }
}
</style>
