<template>
  <u-mask
    :show="showDialog"
    :custom-style="{ background: 'rgba(0, 0, 0, 0.9)' }"
    :mask-click-able="false"
    :zoom="false"
    z-index="100"
  >
    <view class="desc-dialog flex flex-column" @tap.stop="() => {}">
      <!-- #ifdef MP-WEIXIN -->
      <view :style="{ height: top }"></view>
      <!-- #endif -->
      <scroll-view class="content flex-1" :scroll-y="true" :enable-flex="true" :style="{ height: scrollViewHeight }">
        <view class="wrapper">
          <view class="title">活动说明</view>
          <view class="label">活动名称</view>
          <view class="text">{{ ruleInfo.activityname }}</view>
          <view class="label">活动时间</view>
          <view class="text">{{ ruleInfo.starttime }} 至 {{ ruleInfo.endtime }}</view>
          <template v-if="ruleInfo.activitytext">
            <view class="label">活动规则</view>
            <u-parse class="text" :html="ruleInfo.activitytext" :tag-style="parseStyle"></u-parse>
          </template>
        </view>
      </scroll-view>
      <view class="close-btn flex flex-center">
        <view class="iconfont icon-close2 fw-bold" @tap.stop="close"></view>
      </view>
    </view>
  </u-mask>
</template>

<script>
import dialogMixin from 'packages/mixins/dialog'
import richTextMixin from 'packages/mixins/rich-text'
export default {
  mixins: [dialogMixin, richTextMixin],
  props: {
    // 活动说明内容
    ruleInfo: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // #ifdef MP-WEIXIN
      top: '',
      // #endif
      scrollViewHeight: ''
    }
  },
  mounted() {
    let sys = uni.getSystemInfoSync()
    // #ifdef MP-WEIXIN
    this.top = sys.statusBarHeight + 44 + 'px'
    // 关闭按钮100=60+40
    this.scrollViewHeight = `calc(${sys.windowHeight}px - ${this.top} - 100rpx)`
    // #endif
    // #ifdef H5
    this.scrollViewHeight = `calc(${sys.windowHeight}px - 100rpx)`
    // #endif
  },
  methods: {
    // 点击关闭按钮
    handleCloseDialog() {
      this.$emit('update:isShow', false)
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: desc-dialog;
.#{$prefix} {
  height: 100%;
  font-size: 28rpx;
  color: #fff;

  .wrapper {
    padding: 20rpx 30rpx;
  }
}
.title {
  display: flex;
  align-items: center;
  margin: 10rpx 0 60rpx;
  padding: 0 10rpx;
  font-size: 40rpx;
  font-weight: bold;

  &:before {
    content: '';
    flex: 1;
    height: 2rpx;
    margin-right: 20rpx;
    background-color: #fff;
  }
  &:after {
    content: '';
    flex: 1;
    height: 2rpx;
    margin-left: 20rpx;
    background-color: #fff;
  }
}

.label {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 145rpx;
  height: 56rpx;
  font-weight: bold;
  color: #333;
  background-color: #fff4db;
  border-radius: 10rpx;
}

.text {
  margin-top: 30rpx;
  margin-bottom: 60rpx;

  ::v-deep img {
    max-width: 100%;
  }
}
.close-btn {
  margin-bottom: 40rpx;
  .iconfont {
    font-size: 60rpx;
  }
}
</style>
