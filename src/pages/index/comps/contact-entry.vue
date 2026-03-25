<template>
  <view>
    <movable-area class="contact-entry-area" :style="{ top: `${moveInfo.top}px`, height: `${moveInfo.height}px` }">
      <movable-view class="contact-entry-view" inertia direction="all" x="626rpx" y="500rpx">
        <image :src="aiEntry" class="contact-entry-icon" @tap="handleNav" />
      </movable-view>
    </movable-area>
    <ServiceButton ref="serviceButton" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import ServiceButton from 'packages/components/service-center/service-button'
export default {
  components: {
    ServiceButton
  },
  data() {
    return {
      aiEntry: staticURL() + 'shop/contact.png',
      moveInfo: {
        top: 44,
        height: 603
      }
    }
  },
  mounted() {
    const { screenHeight, windowHeight, system, statusBarHeight } = uni.getSystemInfoSync()
    // 判断是否iPhone横条
    const isIphoneX = !!(system.toLowerCase().search('ios') + 1) && screenHeight >= 812
    this.moveInfo.top = statusBarHeight + 44
    // 去除tabbar和navbar
    this.moveInfo.height = windowHeight - 50 - (isIphoneX ? 34 : 0) - this.moveInfo.top
  },
  methods: {
    handleNav() {
      this.$refs.serviceButton && this.$refs.serviceButton.show()
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-entry-area {
  position: fixed;
  left: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none; // 让area不触发底部点击
}
.contact-entry-view {
  width: 124rpx;
  height: 138rpx;
  pointer-events: auto; // 恢复菜单点击
}
.contact-entry-icon {
  width: 124rpx;
  height: 138rpx;
}
</style>
