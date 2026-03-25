<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: waiter-yu
 * @Date: 2021-12-30 11:56:07
 * @Email: 18720528747@163.com
 * @LastEditTime: 2021-12-30 11:57:35
-->
<template>
  <view class="components-image">
    <image
      :mode="mode"
      show-menu-by-longpress
      :lazy-load="lazyLoad"
      :src="imgSrc"
      :data-id="index"
      class="img"
      @load="onImageLoaded"
    />
  </view>
</template>

<script>
export default {
  props: {
    mode: {
      type: String,
      default: ''
    },
    lazyLoad: {
      type: Boolean,
      default: false
    },
    src: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    index: {
      //自定义属性，用于轮播图数据回显
      type: [String, Number],
      default: ''
    }
  },
  data() {
    return {
      imgSrc: ''
    }
  },
  watch: {
    src: {
      handler(val) {
        this.setSrc()
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 设置路径
     */
    setSrc() {
      let imgSrc = this.src
      if (this.size && imgSrc.indexOf('data:image') === -1 && imgSrc.indexOf('?') === -1) {
        imgSrc += `?imageMogr2/thumbnail/${this.size}x${this.size}`
      }
      this.imgSrc = imgSrc
    },
    onImageLoaded(e) {
      this.$emit('load', e)
    }
  }
}
</script>

<style lang="scss" scoped>
.components-image {
  display: block;
  overflow: hidden;
  width: 100%;
  height: 100%;
  .img {
    width: 100%;
    height: 100%;
  }
}
</style>
