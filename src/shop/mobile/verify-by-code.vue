<template>
  <view :style="themeVars">
    <view class="password-form">
      <view class="form-item bd-c">
        <view class="form-key">手机号</view>
        <view>{{ leaderOldMobile }}</view>
      </view>
      <view class="form-item bd-c">
        <view class="form-key">验证码</view>
        <input
          v-model="verifyCode"
          class="form-value"
          type="number"
          :maxlength="6"
          placeholder-class="placeholder"
          placeholder="请输入验证码"
          @focus="toggleBlur(0)"
          @blur="toggleBlur(1)"
        />
        <view class="code-tips">
          <verify-code :mobile="leaderOldMobile" auth></verify-code>
        </view>
      </view>
      <CodeTip :value="verifyCode" :is-blur="isCodeBlur" custom-style="padding-left: 148rpx" />
    </view>
    <button class="primary-btn round mr-20 ml-20 mt-60" hover-class="button-action" @tap="handleCheck">验证</button>
  </view>
</template>

<script>
import { apiValidateCode } from '@/api/common'
import verifyCode from '@/components/verify-code'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import { codeTipMixin } from 'packages/mixins/phone-verify'
export default {
  components: {
    verifyCode,
    CodeTip
  },
  mixins: [codeTipMixin],
  data() {
    return {
      leaderOldMobile: '', // 手机号
      storeLeader: '', // 店铺负责人
      verifyCode: '', // 验证码
      account: '', // 账号
      password: '', //密码
      pageType: 1 // 1 换绑手机号 2 换绑微信
    }
  },
  onLoad(options) {
    this.pageType = Number(options.type) || 1
    this.leaderOldMobile = options.leaderOldMobile
    this.storeLeader = options.storeLeader
  },
  methods: {
    async handleCheck() {
      /* 验证码验证 */
      if (this.verifyCode === '') {
        // 验证码校验
        this.$msg('验证码不能为空')
        return
      }
      let res = await apiValidateCode({
        mobile: this.leaderOldMobile,
        checkcode: this.verifyCode
      })
      if (this.$ck(res, true)) {
        if (this.pageType === 1) {
          uni.navigateTo({
            url: `/shop/mobile/edit?leaderOldMobile=${this.leaderOldMobile}&storeLeader=${this.storeLeader}`
          })
        } else {
          uni.$emit('ruleVerifySuccess')
          uni.navigateBack({
            delta: 2
          })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.password-form {
  margin: 20rpx;
  padding-bottom: 40rpx;
  background-color: #fff;
  border-radius: 10rpx;
  .form-item {
    display: flex;
    margin: 0 30rpx 0;
    align-items: center;
    line-height: 100rpx;
    font-size: 30rpx;
    .form-key {
      width: 118rpx;
      color: #666;
    }
    .form-value {
      height: 118rpx;
      flex: 1;
    }
    &:nth-child(1) {
      padding-top: 10rpx;
    }
  }
  .code-tips {
    width: 193rpx;
  }
  .edit-type {
    color: $uni-color-edit;
  }
}
</style>
