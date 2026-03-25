<template>
  <view class="password-result" :style="themeVars">
    <view class="icon iconfont icon-success success-color fs-110"></view>
    <view class="c-0 fs-36 fw-bold mt-50">修改成功</view>
    <view class="fs-30 c-9 mt-30 fw-medium">
      您可以使用
      <text v-if="mobile">手机号{{ mobile }}</text>
      新设置的密码
    </view>
    <view class="fs-30 c-9 fw-medium">登录米多平台应用。</view>
    <view v-if="!isSpecialMp" class="primary-color fs-28 fw-medium bg-opacity-10 tips">
      本次修改影响应用：万能零售助手小程序、新经销助手小程序、金牌导购员小程序、业务帮帮小程序、经销商H5后台、门店H5后台、导购员H5后台。
    </view>
    <button v-if="passwordSetType !== 1" class="primary-btn round" hover-class="button-action" @tap="handleLogin">
      返回登录
      <text class="c-f fw-normal">({{ timeCount }}s)</text>
    </button>
    <button v-else class="primary-btn round" hover-class="button-action" @tap="handleBack">
      返回
      <text class="c-f fw-normal">({{ timeCount }}s)</text>
    </button>
  </view>
</template>

<script>
import { hideHomeButton } from '@/utils/set-mp'
import dayjs from 'dayjs'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      mobile: '', // 手机号码
      passwordSetType: 1, // 类型 0密码修改  1设置密码  2忘记密码
      timeCount: 15, // 倒数15秒
      timer: null // 倒计时定时器
    }
  },
  computed: {
    ...mapState(['isSpecialMp'])
  },
  onLoad(options) {
    this.mobile = options.mobile || ''
    this.passwordSetType = parseInt(options.passwordSetType)
    if (this.passwordSetType !== 1) {
      // 密码修改与验证码修改 需要隐藏主页按钮与显示倒计时
      hideHomeButton()
    }
    this.timeCountDown()
  },
  onShow() {},
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
        desc: '修改密码退出登录',
        extend: timeOfLogin
      })
      uni.reLaunch({ url: `/pages/login/index` })
    },
    timeCountDown() {
      const TIME_COUNT = 15
      if (!this.timer) {
        this.timeCount = TIME_COUNT
        this.timer = setInterval(() => {
          if (this.timeCount > 0 && this.timeCount <= TIME_COUNT) {
            this.timeCount--
          } else {
            clearInterval(this.timer)
            this.timer = null
            if (this.passwordSetType !== 1) {
              this.logout()
            } else {
              this.handleBack()
            }
          }
        }, 1000)
      }
    },
    handleLogin() {
      this.logout()
    },
    handleBack() {
      uni.reLaunch({ url: `/pages/index/index` })
    }
  }
}
</script>

<style lang="scss" scoped>
.password-result {
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
