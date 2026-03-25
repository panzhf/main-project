<template>
  <view class="code-tips">
    <text v-show="verifyCodeFlag" class="sent-code" @tap="handleGetVerifyCode">获取验证码</text>
    <text v-show="!verifyCodeFlag" class="time-count">{{ timeCount }}秒后重新发送</text>
  </view>
</template>

<script>
// <VerifyCode :mobile="mobile" /> 一般情况使用
// <VerifyCode :mobile="mobile" auth /> 需要判断账号时使用
import { apiAuthCode, apiNoAuthCode } from '@/api/common'
import { getJsCode } from '@/utils/set-mp'
export default {
  props: {
    mobile: {
      type: String,
      default: ''
    },
    // authType: {
    //   type: String,
    //   default: 'authed' // noAuth：普通获取验证码，authed：判断手机号是否在系统注册有账户信息（pages/login/index, personal/password/edit, shop/mobile/verify-by-code）
    // }
    auth: Boolean // 默认false，普通获取验证码
  },
  data() {
    return {
      timeCount: 60, // 倒数60秒
      verifyCodeFlag: true, // 可以获取验证码为true 已获取为false
      timer: null, // 倒计时定时器
      canGetCode: true // 是否可以获取验证码
    }
  },
  watch: {
    canGetCode(v) {
      if (!this.canGetCode) {
        setTimeout(() => {
          this.canGetCode = !this.canGetCode
        }, 2000)
      }
    }
  },
  beforeDestroy() {
    this.clearInterval()
  },
  methods: {
    reset() {
      this.verifyCodeFlag = true
      this.canGetCode = true
      this.timeCount = 60
      this.clearInterval()
    },
    clearInterval() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    async handleGetVerifyCode() {
      // 获取验证码
      if (this.mobile === '') {
        // 手机号校验
        this.$msg('请输入手机号')
        return
      }
      if (!/^(1[3-9])\d{9}$/.test(this.mobile)) {
        // 手机号校验
        this.$msg('请输入正确的手机号')
        return
      }
      getJsCode().then(js_code => {
        this.authCode(js_code)
      })
    },
    async authCode(js_code) {
      if (!this.canGetCode) return
      this.canGetCode = false

      const res = await (this.auth ? apiAuthCode : apiNoAuthCode)({
        mobile: this.mobile,
        js_code
      })

      if (this.$ck(res, true)) {
        const TIME_COUNT = 60
        if (!this.timer) {
          this.timeCount = TIME_COUNT
          this.verifyCodeFlag = false
          this.timer = setInterval(() => {
            if (this.timeCount > 0 && this.timeCount <= TIME_COUNT) {
              this.timeCount--
            } else {
              this.verifyCodeFlag = true
              clearInterval(this.timer)
              this.timer = null
            }
          }, 1000)
        }
        this.$msg('发送成功')
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.code-tips {
  width: 193rpx;
  text-align: right;
  @include lh(100rpx, 100rpx);
  @include border-left(#aaa, 60rpx, 0, 38rpx);
  .sent-code {
    padding: 20rpx 0;
    color: #0f80ff;
    font-size: 26rpx;
  }
  .time-count {
    font-size: 24rpx;
    color: #bfbfbf;
  }
}
</style>
