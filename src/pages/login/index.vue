<template>
  <view>
    <view v-if="loaded" class="page-login bg-f" :style="themeVars">
      <view class="login-box">
        <!-- 装修配置 -->
        <image class="mini-logo br-round" :src="loginPage.imgUrl" mode="scaleToFill" />
        <view class="fs-36 welcome tx-c">
          {{ loginPage.welcomeTip }}
          <view class="login-text fs-24">限门店用户登录使用，用于核销及活动等管理</view>
        </view>
        <!-- 账号登录 -->
        <view v-show="loginType === 1" class="login-form p-r">
          <view class="form-item bd-a">
            <input
              v-model.trim="account"
              class="form-value"
              type="text"
              maxlength="20"
              placeholder-class="placeholder"
              placeholder="请输入账号"
            />
          </view>
          <view class="form-item bd-a">
            <input
              v-model.trim="password"
              class="form-value"
              :class="password !== '' ? 'password-value' : ''"
              type="password"
              maxlength="20"
              placeholder-class="placeholder"
              placeholder="请输入密码"
            />
          </view>
          <view class="edit-color fs-24 forget-password" @tap="handleNavSetPassword">忘记密码？</view>
        </view>
        <!-- 验证码登录 -->
        <view v-show="loginType === 2" class="login-form">
          <view class="form-item bd-a">
            <input
              v-model.trim="mobile"
              class="form-value"
              type="number"
              maxlength="11"
              placeholder-class="placeholder"
              placeholder="请输入手机号"
            />
          </view>
          <view class="form-item bd-a">
            <view class="flex">
              <input
                v-model.trim="verifyCode"
                class="form-value"
                type="number"
                :maxlength="6"
                placeholder-class="placeholder"
                placeholder="请输入验证码"
                @focus="toggleBlur(0)"
                @blur="toggleBlur(1)"
              />
              <view class="code-tips">
                <verify-code :mobile="mobile" auth></verify-code>
              </view>
            </view>
          </view>
          <CodeTip :value="verifyCode" :is-blur="isCodeBlur" />
        </view>
        <button
          v-show="loginType !== 3"
          class="primary-btn submit-login round"
          hover-class="button-action"
          @tap="handleVerifyForm"
        >
          <text class="fw-bold">登录</text>
        </button>
      </view>
      <view class="rule-box flex flex-middle flex-center fs-24">
        <view class="rule-checked flex flex-middle pt-20 pb-20 pl-20" @tap="agreeRule = !agreeRule">
          <u-checkbox
            class="check-box"
            size="32"
            :value="agreeRule"
            shape="circle"
            :active-color="themeInfo.color"
          ></u-checkbox>
          <view class="rule">已阅读并同意</view>
        </view>
        <text class="edit-color pt-20 pb-20" @tap.stop="handleLinkRule('100000040')">《用户服务协议》</text>
        <text class="edit-color pt-20 pb-20 pr-20" @tap.stop="handleLinkRule('100000024')">《隐私政策》</text>
      </view>

      <view class="login-tab safe-area-inset-bottom">
        <view class="login-title fs-24">其它登录方式</view>
        <view class="login-tab-con flex flex-center">
          <button
            v-if="loginType !== 3"
            :open-type="openType"
            :phone-number-no-quota-toast="false"
            class="item wechat-login__small"
            hover-class="button-action"
            @getphonenumber="handleGetPhoneNumber"
          >
            <view v-if="!agreeRule || btnLoading" class="cover-button" @tap.stop="handleGetPhoneNumber"></view>
            <view class="curcle-line center-middle"><view class="iconfont icon-verify-login fs-38"></view></view>
            <view class="fs-24 c-3 pt-20">手机号快捷登录</view>
          </button>
          <template v-if="!hideAccountPwd">
            <view v-if="loginType !== 1" class="item" @tap="loginType = 1">
              <view class="curcle-line center-middle account">
                <view class="iconfont icon-zhanghaomimadengluicon fs-40"></view>
              </view>
              <view class="fs-24 c-3 pt-20">账号密码登录</view>
            </view>
          </template>
          <view v-if="loginType !== 2" class="item" @tap="loginType = 2">
            <view class="curcle-line center-middle verify">
              <view class="iconfont icon-shoujiyanzhengmadengluicon fs-38"></view>
            </view>
            <view class="fs-24 c-3 pt-20">验证码登录</view>
          </view>
        </view>
      </view>
    </view>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
    <common-popup
      v-model="showVerifyFail"
      content="一键获取手机号失败，请使用其他验证方式登录！"
      max-size
      @close="onVerifyFail"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
let cachedAccountInfo = null
function getCachedAccountInfo() {
  if (!cachedAccountInfo) {
    try {
      cachedAccountInfo = uni.getAccountInfoSync()
    } catch (e) {
      cachedAccountInfo = { miniProgram: { envVersion: '' } }
    }
  }
  return cachedAccountInfo
}
import { apiLoginByPwd, apiLoginByCode, apiLoginByWx } from '@/api/login'
import { apiGetstoreList } from '@/api/store'
import VerifyCode from '@/components/verify-code'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import commonPopupMixin from '@/mixins/common-popup'
import phoneVerifyMixin, { codeTipMixin } from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
import { decorationLoginMixin } from '@/mixins/decoration'
import { getJsCode, setNavigationBarColor, hideHomeButton, removeStorage } from '@/utils/set-mp'
import { getRsa } from '@/utils/rsa'
import { linkRuleDetail } from '@/utils/webview'
import { regMobile } from 'packages/utils/reg'
import { staticURL } from '@/config'
import dayjs from 'dayjs'
import { jumpToSpecial } from '@/utils/set-storage'
import { initGlobalTheme } from '@/config/decoration'
export default {
  components: {
    VerifyCode,
    CodeTip
  },
  mixins: [commonPopupMixin, phoneVerifyMixin, codeTipMixin, privacyMixin, decorationLoginMixin],
  data() {
    return {
      logo: staticURL() + 'login/logo.jpg',
      agreeRule: false, // 是否同意协议
      loginType: 2, // 登录类型 1密码登录 2验证码登录 3快捷登录
      mobile: '', // 手机号
      verifyCode: '', // 验证码
      account: '', // 账号
      password: '', // 密码
      btnLoading: false,
      testFlag: '',
      loaded: false
    }
  },
  computed: {
    hideAccountPwd() {
      // 专属版正式版隐藏账号密码登录，平台版或专属版体验版放开，用于微信审核
      const info = getCachedAccountInfo()
      return this.isSpecialMp && info.miniProgram.envVersion === 'release'
    }
  },
  async onLoad(options) {
    // 设置顶部导航的颜色
    setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#ffffff' })
    // 隐藏主页按钮
    hideHomeButton()
    // console.log('isSpecialMp', this.isSpecialMp)
    // 专属小程序获取主题色，平台版小程序不获取，使用默认主题
    if (this.isSpecialMp) {
      // 防止在其他页面跳登录页时没有缓存，重新获取一次主题
      await this.$store.dispatch('fetchGlobalTheme')
    } else {
      this.$store.commit('setThemeInfo', initGlobalTheme())
    }

    await this.fetchLoginDecoration()
    this.loaded = true
    this.testFlag = uni.getStorageSync('TestFlag') || ''
    uni.setNavigationBarTitle({
      title: this.testFlag
    })
    uni.$on('phone-verify', () => {
      this.loginType = 2
    })
    // 专属版体验版默认使用账号密码登录，避免审核时优先点手机号授权登录
    const info = getCachedAccountInfo()
    if (this.isSpecialMp && info.miniProgram.envVersion === 'trial') {
      this.loginType = 1
    }
    if (process.env.NODE_ENV === 'development') {
      let a = uni.getStorageSync('testAccount')
      if (a) {
        this.account = a.account
        this.password = a.password
        this.agreeRule = true
        this.loginType = 1
      }
    }
  },
  onShow() {
    // 设置顶部导航的颜色
    setNavigationBarColor({ frontColor: '#000000', backgroundColor: '#ffffff' })
    // 删除部分storage内容
    removeStorage()
  },
  onUnload() {
    uni.$off('phone-verify')
  },
  onShareAppMessage() {
    // 平台版和专属用各自默认名称
    return {
      title: '',
      path: ''
    }
  },
  methods: {
    handleVerifyForm() {
      /***校验登录***/
      switch (this.loginType) {
        case 1:
          /* 密码登录 */

          if (this.account === '') {
            // 账号校验
            this.$msg('账号不能为空')
            return
          }

          if (this.password === '') {
            // 密码校验
            this.$msg('密码不能为空')
            return
          }
          break
        case 2:
          /* 验证码登录 */

          if (this.mobile === '') {
            // 手机号校验
            this.$msg('请输入手机号')
            return
          }
          if (!regMobile(this.mobile)) {
            // 手机号校验
            this.$msg('请输入正确的手机号')
            return
          }

          if (this.verifyCode === '') {
            // 验证码校验
            this.$msg('验证码不能为空')
            return
          }
          break
      }

      if (!this.agreeRule) {
        // 同意协议
        this.$msg('请阅读并同意协议！')
        return
      }
      // 校验通过
      this.handleLogin()
    },
    async handleLogin() {
      getJsCode().then(js_code => {
        if (this.loginType === 1) {
          // 密码登录
          this.handleLoginByPwd(js_code)
        } else {
          // 验证码登录
          this.handleLoginByCode(js_code)
        }
      })
    },
    handleClickRule() {
      this.agreeRule = !this.agreeRule
    },
    handleLoginByPwd(js_code) {
      apiLoginByPwd({
        js_code,
        mobile: this.account,
        password: getRsa(this.password)
      }).then(res => {
        if (res.return_code === 0) {
          if (process.env.NODE_ENV === 'development') {
            uni.setStorageSync('testAccount', { account: this.account, password: this.password })
          }
          this.reLaunchShopIndex(res.return_data)
        } else {
          this.showTips(res.return_msg)
          this.$uploadLog({ type: 'login', desc: '账号密码登录失败', data: res, extend: { mobile: this.account } })
        }
      })
    },

    handleLoginByCode(js_code) {
      apiLoginByCode({
        js_code,
        mobile: this.mobile,
        code: this.verifyCode
      }).then(res => {
        if (res.return_code === 0) {
          this.reLaunchShopIndex(res.return_data)
        } else {
          this.showTips(res.return_msg)
          this.$uploadLog({ type: 'login', desc: '验证码登录失败', data: res, extend: { mobile: this.mobile } })
        }
      })
    },
    handleGetPhoneNumber(e) {
      if (!this.agreeRule) return this.$msg('请阅读并同意协议！')
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        this.btnLoading = false
        return
      }
      if (code) {
        if (this.btnLoading) return
        this.btnLoading = true
        this.loginByWx(code)
      }
    },
    async loginByWx(code) {
      // 微信手机号登录
      const js_code = await getJsCode()
      try {
        const res = await apiLoginByWx({
          js_code,
          mobilecode: code
        })
        if (res.return_code === 0) {
          this.reLaunchShopIndex(res.return_data)
        } else if (
          res.return_code === 50002 &&
          (res.return_msg.includes('手机号码解密失败') || res.return_msg.includes('code been used'))
        ) {
          // 一般出现这种情况可能是：1.checkSession检查状态不对 2.停留页面过长，code失效
          // 账号不存在也是这个状态码，需要过滤
          this.showTips('获取手机号失败，请重试')
        } else {
          this.showTips(res.return_msg)
          this.$uploadLog({ type: 'login', desc: '微信手机号登录失败', data: res })
        }
      } finally {
        this.btnLoading = false
      }
    },
    async reLaunchShopIndex(data) {
      let { token, accountinfo } = data
      uni.setStorageSync('token', token)
      uni.setStorageSync('accountinfo', JSON.stringify(accountinfo))
      uni.setStorageSync('isnullpassword', accountinfo.isnullpassword)
      uni.setStorageSync('nullpasswordPop', true)
      uni.setStorageSync('assets', true)
      const currentLoginDate = dayjs().format('YYYY-MM-DD HH:mm:ss')
      uni.setStorageSync('timeOfLogin', { getTokenTime: currentLoginDate })
      // this.$uploadLog({ type: 'login', desc: '账号登录', extend: { mobile: accountinfo.mobile } })
      // 账号下只有一家门店，直接跳到店铺主页，有多家则跳转到店铺切换页
      let res = await apiGetstoreList()
      if (this.$ck(res, true)) {
        let { list, totalcount } = res.return_data
        list = list || []
        const a = list.reduce((r, v) => r.concat(v.storelist), [])
        if (!totalcount) {
          this.showTips('该门店账号未激活，请先联系业务人员完成账号激活后再来登录！', '我知道了')
          this.$uploadLog({ type: 'account', desc: '激活门店为0', data: res })
          removeStorage()
          return
        }
        uni.setStorageSync('accountsyslist', JSON.stringify(a)) // 存储所有门店--便于自动切换门店,门店切换迟优化  同时兼容扫码和云店门店切换
        uni.setStorageSync('brandList', JSON.stringify(list))
        uni.setStorageSync('storeNumber', totalcount)
        if (totalcount === 1) {
          // setToken(a[0])
          jumpToSpecial(a[0])
        } else {
          uni.reLaunch({
            url: `/shop/change?from=login`
          })
        }
      }
    },
    handleConfirm() {
      this.showPopup = false
    },
    handleNavSetPassword() {
      uni.reLaunch({
        url: `/personal/password/edit?isnullpassword=2&from=loginpage`
      })
    },
    handleLinkRule(applyNo) {
      //查看规则协议内容
      linkRuleDetail(applyNo)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-login {
  min-height: 100vh;
  .login-box {
    width: 600rpx;
    padding-top: 75rpx;
    margin: 0 auto;
    // background: rgba(255, 255, 255, 0.9);
    // border-radius: 20rpx;
    .submit-login {
      margin: 80rpx 0 0 0;
      font-size: 36rpx;
      letter-spacing: 10rpx;
      // background-color: var(--theme-color, $uni-color-primary);
    }
  }
  .rule-box {
    line-height: 32rpx;
    margin: 10rpx 0;
    // font-size: 24rpx;
    color: $uni-text-color-grey;
    // text-align: center;
    .rule {
      margin-left: -20rpx;
    }
    // .rule-checked {
    //   .iconfont {
    //     padding-right: 6rpx;
    //   }
    // }
  }
  .login-tab {
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 30rpx;
    padding: 20rpx 0;
    font-size: 28rpx;
    color: $uni-text-color-black;
    .login-title {
      position: relative;
      width: 100%;
      height: 30rpx;
      line-height: 30rpx;
      text-align: center;
      overflow: hidden;
      color: #888;
      &:before {
        content: '';
        position: absolute;
        top: 15rpx;
        left: 30rpx;
        width: 254rpx;
        height: 1px;
        background: #e5e5e5;
      }
      &:after {
        content: '';
        position: absolute;
        top: 15rpx;
        right: 30rpx;
        width: 254rpx;
        height: 1px;
        background: #e5e5e5;
      }
    }
    .login-tab-con {
      margin: 40rpx 90rpx 0;
      text-align: center;
      .item {
        flex: 1;
        text-align: center;
      }
    }
    .curcle-line {
      width: 82rpx;
      height: 82rpx;
      // color: #ff7640;
      color: var(--theme-color, $uni-color-primary);
      margin: 0 auto;
      position: relative;
      &:before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        border-width: 1rpx;
        border-style: solid;
        // border: 1rpx solid rgba(255, 118, 64, 0.5);
        border-color: var(--theme-color, $uni-color-primary);
        opacity: 0.8;
        border-radius: 50%;
        transform: scale(0.5);
        box-sizing: border-box;
      }
      &.account {
        &:before {
          border-color: rgba(88, 190, 107, 0.5);
        }
        color: #58be6b;
      }
      &.verify {
        &:before {
          border-color: rgba(30, 141, 255, 0.5);
        }
        color: #1e8dff;
      }
    }
    .wechat-login__small {
      background-color: transparent;
    }
  }
  .forget-password {
    position: absolute;
    bottom: -70rpx;
    padding: 18rpx;
    right: -20rpx;
  }
}
// 表单
.form-item {
  color: #000;
  font-size: 30rpx;
  .form-key {
    margin-right: 30rpx;
    font-weight: 500;
    color: $uni-text-color-black;
  }
  .form-value {
    line-height: 100rpx;
    height: 100rpx;
    font-size: 34rpx;
    color: $uni-text-color;
    &.password-value {
      font-size: 28rpx !important;
    }
  }
  &:not(:nth-child(1)) {
    padding-top: 60rpx;
  }
  .code-tips {
    width: 193rpx;
  }
}
.welcome {
  color: #2a2a2a;
  padding: 30rpx 0 80rpx;
  .login-text {
    padding-top: 10rpx;
    color: #bfbfbf;
  }
}
.mini-logo {
  width: 120rpx;
  height: 120rpx;
  display: block;
  margin: 0 auto;
}
</style>
