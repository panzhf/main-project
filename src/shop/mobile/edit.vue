<template>
  <view :style="themeVars">
    <view class="password-form">
      <view class="form-item bd-c">
        <view class="form-key">手机号</view>
        <input
          v-model="newMobile"
          class="form-value"
          type="number"
          maxlength="11"
          placeholder-class="placeholder"
          placeholder="请输入新手机号"
        />
      </view>
      <view class="form-item bd-c">
        <view class="form-key">验证码</view>
        <input
          v-model="verifyCode"
          class="form-value"
          type="number"
          maxlength="6"
          placeholder-class="placeholder"
          placeholder="请输入验证码"
          @focus="toggleBlur(0)"
          @blur="toggleBlur(1)"
        />
        <view class="code-tips">
          <verify-code :mobile="newMobile"></verify-code>
        </view>
      </view>
      <CodeTip :value="verifyCode" :is-blur="isCodeBlur" custom-style="padding-left: 148rpx" />
    </view>
    <button
      class="primary-btn round mr-20 ml-20 mt-60"
      hover-class="button-action"
      :class="[!isVerify ? 'disabled' : '']"
      @tap="handleCheck"
    >
      确认修改
    </button>
  </view>
</template>

<script>
import verifyCode from '@/components/verify-code'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import { codeTipMixin } from 'packages/mixins/phone-verify'
import { apiUpdateStoreMobile } from '@/api/store'
import { hideHomeButton } from '@/utils/set-mp'
export default {
  components: {
    verifyCode,
    CodeTip
  },
  mixins: [codeTipMixin],
  data() {
    return {
      storeId: 0,
      memberLogin: '',
      isVerify: true,
      newMobile: '', // 手机号
      oldMobile: '', //旧手机号
      verifyCode: '', // 验证码
      account: '', // 账号
      password: '', //密码
      storeLeader: '',
      companyName: ''
    }
  },
  onLoad(options) {
    this.oldMobile = options.leaderOldMobile
    this.storeLeader = options.storeLeader
  },
  onShow() {
    // 隐藏主页按钮
    hideHomeButton()
    let info = JSON.parse(uni.getStorageSync('storeSettingInfo'))
    this.storeId = info.storeId
    this.memberLogin = info.memberLogin
    this.companyName = info.memberLoginName
  },
  methods: {
    async handleCheck() {
      // 校验登录
      if (this.newMobile === '') {
        // 手机号校验
        this.$msg('请输入新手机号')
        return
      }
      if (!/^(1[3-9])\d{9}$/.test(this.newMobile)) {
        // 手机号校验
        this.$msg('请输入正确的手机号')
        return
      }
      if (this.verifyCode === '') {
        // 验证码校验
        this.$msg('验证码不能为空')
        return
      }
      // 校验通过
      this.updateStoreMobile()
    },
    async updateStoreMobile() {
      // 更新手机号
      let res = await apiUpdateStoreMobile({
        code: this.verifyCode,
        oldmobile: this.oldMobile,
        newmobileno: this.newMobile,
        newleader: this.storeLeader,
        companyname: this.companyName
      })
      if (this.$ck(res, true)) {
        uni.reLaunch({ url: `/shop/mobile/result` })
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
