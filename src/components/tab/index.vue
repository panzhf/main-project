<template>
  <view :style="themeVars">
    <view class="tab-box">
      <view
        class="active-bar"
        :style="{
          transform: `translateX(${translateX}px)`,
          width: `${width}px`,
          height: `${drawHeight}rpx`,
          backgroundColor: `${activeBagColor}`
        }"
      ></view>
      <view
        v-for="(item, index) in tab"
        :key="index"
        :class="['tab-item', activeIndex === index ? 'active' : '']"
        :style="{ color: activeIndex === index ? activeColor : inactiveColor }"
        @tap="handleChange(item, index)"
      >
        {{ item.name || item }}
        <view v-if="showCount && item.count" class="quantity">{{ item.count > 99 ? '99+' : item.count }}</view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * activeIndex 选中索引
 * tab tab 数据 字符串数组/对象数组
 * drawWidth 底部滑条宽度
 * drawHeight 底部滑条高度
 * activeColor 选中颜色
 * inactiveColor 未选中颜色
 * activeBagColor 选中条颜色
 */
export default {
  props: {
    activeIndex: {
      type: Number,
      default: -1
    },
    tab: {
      type: Array,
      default: () => {
        return []
      }
    },
    drawWidth: {
      type: String,
      default: ''
    },
    drawHeight: {
      type: String,
      default: '1'
    },
    activeColor: {
      type: String,
      default: '#000'
    },
    inactiveColor: {
      type: String,
      default: '#000'
    },
    activeBagColor: {
      type: String,
      default: '#FF7640'
    },
    isLoading: {
      type: Boolean,
      default: false // 用于判断tab是否正在加载数据，防止tab切换数据错乱
    },
    // 显示数量
    showCount: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      translateX: 0,
      active: this.activeIndex,
      //tab的宽度
      tabWidth: 0
    }
  },
  computed: {
    //滑动条的宽度
    width() {
      if (this.drawWidth) {
        return this.drawWidth
      } else {
        return this.tabWidth / this.tab.length
      }
    }
  },
  mounted() {
    this.getWidth()
    if (this.drawWidth) {
      let query = uni.createSelectorQuery().in(this)
      //选择id
      let that = this
      query
        .select('.tab-box')
        .boundingClientRect(function (rect) {
          let width = rect.width / that.tab.length / 2 - Number(that.width) / 2
          that.translateX = width + (rect.width / that.tab.length) * that.activeIndex
          // that.translateX = rect.width / that.tab.length / 2 - Number(that.width) / 2
        })
        .exec()
    }
  },
  methods: {
    handleChange(item, index) {
      if (this.isLoading) return
      if (this.activeIndex === index) return
      if (this.drawWidth) {
        let query = uni.createSelectorQuery().in(this)
        //选择id
        let that = this
        query
          .select('.tab-box')
          .boundingClientRect(function (rect) {
            // 滑块位置=居中的位置+每一项的宽度乘以当前索引
            let width = rect.width / that.tab.length / 2 - Number(that.width) / 2
            that.translateX = width + (rect.width / that.tab.length) * index
          })
          .exec()
      } else {
        this.translateX = index * this.width
      }
      this.$emit('update:activeIndex', index)
      this.$emit('change', item)
    },
    getWidth() {
      let query = uni.createSelectorQuery().in(this)
      //选择id
      let that = this
      query
        .select('.tab-box')
        .boundingClientRect(function (rect) {
          that.tabWidth = rect.width
        })
        .exec()
    }
  }
}
</script>

<style lang="scss" scoped>
.tab-box {
  display: flex;
  box-sizing: border-box;
  height: 86rpx;
  position: relative;
  background-color: #fff;
  .active-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 3rpx;
    background-color: #ff7640;
    transition: all 0.3s;
    border-radius: 3rpx;
  }
  .tab-item {
    font-size: 28rpx;
    font-family: PingFang SC;
    color: #666;
    line-height: 86rpx;
    flex: 1;
    text-align: center;
    border-bottom: 1rpx solid #eeeeee;
    position: relative;
    .quantity {
      position: absolute;
      top: 4rpx;
      right: 24%;
      min-width: 40rpx;
      height: 30rpx;
      background: $bg-color;
      border-radius: 15rpx 15rpx 15rpx 0;
      text-align: center;
      color: #ffffff;
      font-size: 22rpx;
      font-weight: 500;
      padding: 0 4rpx;
      box-sizing: border-box;
      line-height: 30rpx;
    }
    &.active {
      font-weight: bold;
      font-size: 32rpx;
    }
  }
}
</style>
