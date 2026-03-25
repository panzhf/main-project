<template>
  <!--头部 start-->
  <view>
    <view catch:touchmove="handleTouchmove" class="titlebar" :style="style">
      <!--返回按钮 start-->
      <view v-if="showback" bind:tap="handleBack" class="back" @tap="handleBack">
        <view class="back-arrow" :style="{ borderColor: `${textcolor}` }"></view>
      </view>
      <!--返回按钮 end-->
      <!--标题 start-->
      <view class="title title-ios" :style="{ color: `${textcolor}` }">
        {{ title }}{{ TestFlag ? '--' + TestFlag : '' }}
      </view>
      <!--标题 end-->
      <!--标题-slot start-->
      <slot name="header" />
      <!--标题-slot end-->
    </view>
    <!-- 需要空间间距 -->
    <view :style="spaceStyle"></view>
  </view>
  <!--头部 end-->
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    bgcolor: {
      type: String,
      default: ''
    },
    bgPic: {
      type: String,
      default: ''
    },
    textcolor: {
      type: String,
      default: '#000'
    },
    showback: Boolean,
    mix: Boolean // 混合模式，优先判断背景色是否透明（透明度为0）透明则使用背景图，否则用背景色
  },
  data() {
    return {
      more: true,
      TestFlag: ''
    }
  },
  computed: {
    style() {
      /*
       * 顶部适配
       */
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      let styles = []
      styles.push(`padding-top: ${statusBarHeight}px`)
      styles.push(`height: ${44 + statusBarHeight}px`)

      // 根据mix混合模式优化背景显示逻辑
      if (this.mix) {
        // 混合模式：优先判断背景色是否透明，透明则使用背景图，否则用背景色
        if (this.isColorTransparent(this.bgcolor) && this.bgPic) {
          styles.push(`background-image: url(${this.bgPic})`)
        } else if (this.bgcolor) {
          styles.push(`background-color: ${this.bgcolor}`)
        }
      } else {
        // 非混合模式：直接应用背景图和背景色
        this.bgPic && styles.push(`background-image: url(${this.bgPic})`)
        this.bgcolor && styles.push(`background-color: ${this.bgcolor}`)
      }

      return styles.join(';')
    },
    spaceStyle() {
      let styles = []
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight
      styles.push(`height: ${44 + statusBarHeight}px`)
      return styles.join(';')
    }
  },
  /*
   * 创建组件
   */
  created() {
    /*
     * 是否有后续页面，允许返回
     */
    const currentPages = getCurrentPages()
    if (currentPages.length > 1) {
      this.more = true
    } else {
      this.more = false
    }
    this.TestFlag = uni.getStorageSync('TestFlag') || ''
  },
  methods: {
    // 判断颜色是否透明，兼容hex、rgb、rgba格式
    isColorTransparent(color) {
      if (!color) return true

      // 处理hex格式 (#RGB, #RRGGBB, #RGBA, #RRGGBBAA)
      if (color.startsWith('#')) {
        // 如果是#RGBA或#RRGGBBAA格式（带alpha通道）
        if (color.length === 5) {
          // #RGBA
          const alpha = parseInt(color.slice(4, 5).repeat(2), 16) // 转换为0-255范围
          return alpha === 0
        } else if (color.length === 9) {
          // #RRGGBBAA
          const alpha = parseInt(color.slice(7, 9), 16) // 转换为0-255范围
          return alpha === 0
        }
        // #RGB或#RRGGBB默认不透明
        return false
      }

      // 处理rgb格式 (rgb(R, G, B))
      if (color.startsWith('rgb(')) {
        // rgb格式默认不透明
        return false
      }

      // 处理rgba格式 (rgba(R, G, B, A))
      if (color.startsWith('rgba(')) {
        const matches = color.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/)
        if (matches && matches[1]) {
          const alpha = parseFloat(matches[1])
          return alpha === 0
        }
        return false
      }

      // 其他情况默认不透明
      return false
    },
    handleBack() {
      if (this.more) {
        uni.navigateBack()
      } else {
        uni.redirectTo({
          url: '/pages/index/index'
        })
      }
    }
  }
}
</script>

<style lang="scss">
.titlebar {
  height: 64px;
  width: 100%;
  position: fixed;
  left: 0;
  top: 0;
  color: #000;
  padding: 20px 0 0;
  box-sizing: border-box;
  background-size: 100% auto;
  z-index: 300;
  .title {
    font-weight: 500;
    font-size: 16px;
    height: 44px;
    line-height: 44px;
    position: absolute;
    bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    word-break: break-all;
    width: calc(100% - 184px);
    &.title-android {
      left: 90rpx;
    }
    &.title-ios {
      right: 186rpx;
      text-align: center;
    }
  }
  .back {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 44px;
    height: 44px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .back-arrow {
    width: 20rpx;
    height: 20rpx;
    border-left: #fff 2px solid;
    border-bottom: #fff 2px solid;
    transform: rotate(45deg);
    display: block;
  }
}
</style>
