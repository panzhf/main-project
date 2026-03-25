<template>
  <view :style="themeVars">
    <view class="newPassword-form">
      <view v-if="passwordSetType === 0" class="form-item bd-c">
        <view class="form-key">原密码</view>
        <input
          v-model="oldPassword"
          class="form-value"
          type="password"
          :maxlength="20"
          placeholder-class="placeholder"
          placeholder="请输入原密码"
        />
      </view>
      <view v-if="passwordSetType === 2" class="form-item bd-c">
        <view class="form-key">手机号</view>
        <input
          v-if="from === 'loginpage'"
          v-model.trim="mobile"
          class="form-value"
          type="number"
          maxlength="11"
          placeholder-class="placeholder"
          placeholder="请输入手机号"
        />
        <view v-else class="form-value">{{ mobile }}</view>
      </view>
      <view v-if="passwordSetType === 2" class="form-item bd-c">
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
          <verify-code :mobile="mobile" auth></verify-code>
        </view>
      </view>
      <CodeTip :value="verifyCode" :is-blur="isCodeBlur" custom-style="padding-left: 148rpx" />
      <view class="form-item bd-c">
        <view class="form-key">新密码</view>
        <input
          v-model="newPassword"
          class="form-value"
          type="password"
          :maxlength="20"
          placeholder-class="placeholder"
          placeholder="请输入8-20位数字和字母组合密码"
        />
      </view>
      <view class="form-item bd-c">
        <view class="form-key">新密码</view>
        <input
          v-model="confirmPassword"
          class="form-value"
          type="password"
          :maxlength="20"
          placeholder-class="placeholder"
          placeholder="请再次确认新密码"
        />
      </view>
    </view>
    <view class="edit-type fs-26 tx-r mt-30 mr-40">
      <text v-if="passwordSetType === 0" @tap="passwordSetType = 2">忘记密码？验证码修改</text>
      <text v-if="passwordSetType === 2 && from !== 'loginpage'" @tap="passwordSetType = 0">通过密码修改</text>
    </view>
    <button class="primary-btn round mr-20 ml-20 mt-60" hover-class="button-action" @tap="handleCheck">
      {{ from === 'loginpage' ? '确认修改' : passwordSetType == 1 ? '设置密码' : '修改密码' }}
    </button>
    <view v-if="from === 'loginpage'" class="mt-20 fs-24 c-9 tx-c">修改登录密码，会影响米多平台多端应用的登录</view>
  </view>
</template>

<script>
import { apiResetPassword, apiResetPasswordByCode, apiSetInitialPassword } from '@/api/personal'
import { apiResetForgetPasswordByCode } from '@/api/common'
import { getJsCode } from '@/utils/set-mp'
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
      passwordSetType: 0, // 类型 0密码修改  1设置密码  2忘记密码
      clerkId: '', // 经销商ID
      mobile: '', // 手机号
      verifyCode: '', // 验证码
      oldPassword: '', // 原密码
      newPassword: '', //密码
      confirmPassword: '', //密码
      from: '',
      loginCode: ''
    }
  },
  onLoad(options) {
    //options.isnullpassword=1 是指原来没有密码，需要设置密码
    // //console.log(' parseInt(options.isnullpassword):', parseInt(options.isnullpassword))
    this.passwordSetType = parseInt(options.isnullpassword)
    this.mobile = options.mobile || ''
    this.from = options.from || ''
    // 通过参数判断是设置密码、还是修改密码
    if (this.passwordSetType === 1) {
      uni.setNavigationBarTitle({
        title: '设置密码'
      })
    } else {
      uni.setNavigationBarTitle({
        title: '修改密码'
      })
    }
  },
  methods: {
    editPassword() {
      switch (this.passwordSetType) {
        case 0:
          // 通过原密码修改密码
          this.resetPassword()
          break
        case 2:
          if (this.from === 'loginpage') {
            // 通过验证码修改密码
            getJsCode().then(js_code => {
              this.loginCode = js_code
              this.resetPasswordByCode()
            })
          } else {
            this.resetPasswordByCode()
          }
          break
        default:
          // 设置初始密码
          this.setInitialPassword()
          break
      }
    },

    async resetPassword() {
      let storeInfo = JSON.parse(uni.getStorageSync('storeSettingInfo'))
      this.clerkId = storeInfo.clerkId
      // 通过原密码修改密码
      let res = await apiResetPassword({
        clerkid: this.clerkId,
        oldpassword: this.oldPassword,
        newpassword: this.newPassword,
        confirmpassword: this.confirmPassword
      })
      if (this.$ck(res, true)) {
        this.navSuccess()
      }
    },

    async resetPasswordByCode() {
      let res
      // 通过验证码修改密码
      if (this.from === 'loginpage') {
        res = await apiResetForgetPasswordByCode({
          code: this.verifyCode,
          mobile: this.mobile,
          js_code: this.loginCode,
          newpassword: this.newPassword,
          confirmpassword: this.confirmPassword
        })
      } else {
        res = await apiResetPasswordByCode({
          code: this.verifyCode,
          mobile: this.mobile,
          newpassword: this.newPassword,
          confirmpassword: this.confirmPassword
        })
      }
      if (this.$ck(res, true)) {
        this.navSuccess()
      }
    },

    async setInitialPassword() {
      // 设置初始密码
      let res = await apiSetInitialPassword({
        password: this.newPassword,
        password2: this.confirmPassword
      })
      if (this.$ck(res, true)) {
        uni.setStorageSync('isnullpassword', 0)
        this.navSuccess()
      }
    },
    navSuccess() {
      uni.reLaunch({ url: `/personal/password/result?mobile=${this.mobile}&passwordSetType=${this.passwordSetType}` })
    },
    async initLoginCode() {
      // 预先获取login的code
      this.loginCode = await getJsCode()
    },
    handleCheck() {
      // 校验
      switch (this.passwordSetType) {
        case 0:
          /******0密码登录******/
          if (this.oldPassword === '') {
            // 密码校验
            this.$msg('原密码不能为空')
            return
          }
          break
        case 2:
          /******2验证码登录******/
          if (!this.mobile) {
            // 手机号校验
            this.$msg('请输入手机号')
            return
          }
          if (!/^(1[3-9])\d{9}$/.test(this.mobile)) {
            // 手机号校验
            this.$msg('请输入正确的手机号')
            return
          }
          if (!this.verifyCode) {
            // 验证码校验
            this.$msg('验证码不能为空')
            return
          }
          break
      }

      /***新密码校验***/
      if (!this.newPassword) {
        this.$msg('请输入新密码')
        return
      } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(this.newPassword)) {
        this.$msg('新密码需为“8-20位字母与数字组合”')
        return
      }

      if (!this.confirmPassword) {
        this.$msg('请重复新密码')
        return
      } else if (this.newPassword !== this.confirmPassword) {
        this.$msg('两次输入的新密码不一致')
        return
      }

      // 校验通过
      this.editPassword()
    }
  }
}
</script>

<style lang="scss" scoped>
.newPassword-form {
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
      line-height: 118rpx;
      flex: 1;
    }
    &:nth-child(1) {
      padding-top: 10rpx;
    }
  }
  .code-tips {
    width: 193rpx;
  }
}
.edit-type {
  color: $uni-color-edit;
}
</style>
