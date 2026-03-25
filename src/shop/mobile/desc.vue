<template>
  <view class="mobile-desc full-container flex flex-column flex-middle" :style="themeVars">
    <view class="tip-content">
      <template v-if="pageType === 1">
        <view>修改手机号后，将会更换当前门店的负责人手机号信息。您原来的手机号不可再登录当前门店。</view>
        <view class="mt-30">原有门店及门店下产生的数据及资产均由修改后的手机号继承。</view>
        <view class="mt-30">修改手机号后，若想继续管理原有门店，需使用更换后的手机号登录当前小程序。</view>
        <view class="mt-30">为保证账户安全，请手机号认证后修改手机号。</view>
      </template>
      <template v-if="pageType === 2">
        <view>绑定微信用于当前门店账号的参与开箱扫码活动和门店收入提现等，请谨慎换绑！</view>
        <view class="mt-30">换绑微信后，只能用换绑后的微信参与开箱扫码等活动和完成微信红包等收入提现。</view>
        <view class="mt-30">同时，为保证账户安全，请进行手机号认证，认证完成后系统将自动换绑微信。</view>
      </template>
    </view>
    <view class="btn-group">
      <button class="primary-btn round" hover-class="button-action" @tap="handleEdit">验证码验证</button>
      <button
        :open-type="openType"
        :phone-number-no-quota-toast="false"
        hover-class="button-action"
        class="mt-40 primary-btn round p-r"
        :class="verifyState ? 'disabled c-f' : 'wechat'"
        @getphonenumber="handleGetPhoneNumber"
      >
        <!-- 按钮防重复点击，添加遮罩层 -->
        <view
          v-if="!agreeRule || btnLoading || verifyState"
          class="cover-button"
          @tap.stop="handleGetPhoneNumber"
        ></view>
        微信手机号授权
      </button>
      <button class="primary-btn plain round mt-40" hover-class="button-action" @tap="handleBack">
        返回，我再想想
      </button>
    </view>
    <view class="flex flex-middle fs-24" @tap="agreeRule = !agreeRule">
      <view v-if="agreeRule" class="icon iconfont icon-checked fs-28 primary-color mr-5"></view>
      <view v-else class="icon iconfont icon-unchecked fs-28 c-9 mr-5"></view>
      勾选表示已阅读并同意
      <text class="link" @tap.stop="handleLinkRule('100000028')">《重要提醒》</text>
    </view>
    <common-popup
      v-model="showVerifyFail"
      content="一键获取手机号失败，请使用其他验证方式修改！"
      max-size
      @close="onVerifyFail"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiWxMobileCheck } from '@/api/common'
import { linkRuleDetail } from '@/utils/webview'
import phoneVerifyMixin from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
export default {
  mixins: [phoneVerifyMixin, privacyMixin],
  data() {
    return {
      agreeRule: false, // true 用户已勾选
      leaderOldMobile: '', // 旧手机号
      storeLeader: '', // 负责人姓名
      btnLoading: false, // 判断是否可点击
      pageType: 1 // 1 换绑手机号 2 换绑微信
    }
  },
  onLoad(options) {
    this.pageType = Number(options.type) || 1
    this.leaderOldMobile = options.leaderOldMobile
    this.storeLeader = options.storeLeader
  },
  methods: {
    handleEdit() {
      if (!this.agreeRule) return this.$msg('请阅读并同意《重要提醒》')
      uni.navigateTo({
        url: `/shop/mobile/verify-by-code?leaderOldMobile=${this.leaderOldMobile}&storeLeader=${this.storeLeader}&type=${this.pageType}`
      })
    },
    handleBack() {
      this.$goBack({ delta: 2 })
    },
    handleLinkRule(applyNo) {
      //查看规则协议内容
      linkRuleDetail(applyNo)
    },
    handleGetPhoneNumber(e) {
      if (this.verifyState) return
      if (!this.agreeRule) {
        // 同意协议
        this.$msg('请阅读并同意《重要提醒》')
        return
      }

      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.btnLoading = false
        this.showVerifyFail = true
        return
      }
      if (code) {
        if (this.btnLoading) return
        this.btnLoading = true
        this.checkPhoneByWx(code)
      }
    },
    async checkPhoneByWx(code) {
      // 微信手机校验
      const memberlogin = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}').memberLogin || ''
      try {
        const res = await apiWxMobileCheck({
          mobilecode: code,
          mobile: this.leaderOldMobile,
          memberlogin
        })
        if (res.return_code === 0) {
          this.$msg('验证成功', { icon: 'success' })
          setTimeout(() => {
            // 判断是换绑手机号还是换绑微信
            if (this.pageType === 1) {
              this.navEditMobile()
            } else {
              uni.$emit('ruleVerifySuccess')
              uni.navigateBack()
            }
          }, 1500)
        } else if (res.return_code === 50002 && res.return_msg.includes('手机号码解密失败')) {
          // 一般出现这种情况可能是：1.checkSession检查状态不对 2.停留页面过长，code失效
          this.$msg('获取手机号失败，请重试')
        } else {
          this.$msg(res.return_msg)
        }
      } finally {
        this.btnLoading = false
      }
    },
    navEditMobile() {
      uni.navigateTo({
        url: `/shop/mobile/edit?leaderOldMobile=${this.leaderOldMobile}&storeLeader=${this.storeLeader}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-desc {
  padding: 78rpx 60rpx;
}
.tip-content {
  font-size: 30rpx;
  line-height: 40rpx;
}
.btn-group {
  width: 520rpx;
  margin-top: 120rpx;
  margin-bottom: 50rpx;
}
.link {
  color: $uni-color-edit;
  padding: 24rpx 0;
}
</style>
