<template>
  <view class="mobile-result">
    <view class="icon iconfont icon-success success-color fs-110"></view>
    <view class="c-0 fs-36 fw-bold mt-50">{{ pageType === 1 ? '修改' : '换绑' }}成功</view>
    <view class="fs-30 c-9 mt-30 fw-medium">
      {{
        pageType === 1 ? '请使用新手机号登录管理门店，确保相关功能的正常使用' : '请重新登录门店，确保相关功能的正常使用'
      }}
    </view>
    <button class="primary-btn round" hover-class="button-action" @tap="handleLogin">
      返回登录
      <text class="c-f fw-normal">({{ timeCount }}s)</text>
    </button>
  </view>
</template>

<script>
import { hideHomeButton } from '@/utils/set-mp'
import dayjs from 'dayjs'
export default {
  data() {
    return {
      pageType: 1, // 1 换绑手机号 2 换绑微信
      timeCount: 5, // 倒数15秒
      timer: null // 倒计时定时器
    }
  },
  onLoad(options) {
    this.pageType = Number(options.type) || 1
    this.timeCountDown()
  },
  onShow() {
    hideHomeButton()
  },
  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  },
  methods: {
    async logout() {
      // 退出登录
      const exitTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      let { mobile } = JSON.parse(uni.getStorageSync('accountinfo') || '{}')
      const timeOfLogin = { mobile, ...uni.getStorageSync('timeOfLogin'), exitTime }
      this.$uploadLog({
        type: 'logout',
        desc: this.pageType === 1 ? '修改手机号退出登录' : '换绑微信退出',
        extend: timeOfLogin
      })
      uni.reLaunch({ url: `/pages/login/index` })
    },
    timeCountDown() {
      const TIME_COUNT = 5
      if (!this.timer) {
        this.timeCount = TIME_COUNT
        this.timer = setInterval(() => {
          if (this.timeCount > 0 && this.timeCount <= TIME_COUNT) {
            this.timeCount--
          } else {
            clearInterval(this.timer)
            this.timer = null
            this.logout()
          }
        }, 1000)
      }
    },
    handleLogin() {
      this.logout()
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-result {
  padding: 120rpx 50rpx 0;
  min-height: 100vh;
  background-color: #fff;
  text-align: center;
  .tips {
    margin-top: 50rpx;
    padding: 23rpx 30rpx;
  }
  .primary-btn {
    margin: 90rpx 65rpx 0;
  }
}
</style>
