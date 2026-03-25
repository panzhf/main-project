<template>
  <movable-area class="ai-entry-area" :style="{ top: `${moveInfo.top}px`, height: `${moveInfo.height}px` }">
    <movable-view class="ai-entry-view" inertia direction="all" x="626rpx" y="500rpx">
      <image :src="aiEntry" class="ai-entry-icon" @tap="handleNav" />
    </movable-view>
  </movable-area>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    aiFloatIcon: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      moveInfo: {
        top: 44,
        height: 603
      }
    }
  },
  computed: {
    aiEntry() {
      return this.aiFloatIcon || staticURL() + 'ai.png'
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
      this.$emit('ai-entry')
    }
  }
}
</script>

<style lang="scss" scoped>
.ai-entry-area {
  position: fixed;
  left: 0;
  width: 100%;
  z-index: 100;
  pointer-events: none; // 让area不触发底部点击
}
.ai-entry-view {
  width: 124rpx;
  height: 138rpx;
  pointer-events: auto; // 恢复菜单点击
}
.ai-entry-icon {
  width: 124rpx;
  height: 138rpx;
}
</style>
