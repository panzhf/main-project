<template>
  <view :style="themeVars">
    <view v-if="!loading">
      <template v-if="register">
        <view class="tips-box">
          <text class="mr-10">{{ info.storename }}</text>
          邀你注册
          <text class="store">@{{ info.memberloginname }}</text>
        </view>
        <view class="form-box">
          <template v-if="isYzmMode">
            <info-cell :is-middle="true" :is-needed="true" :is-input="true">
              <view slot="left">手机号</view>
              <view slot="right" class="flex">
                <input
                  v-model.trim="form.mobile"
                  type="number"
                  placeholder-class="placeholder"
                  placeholder="请输入手机号"
                  :maxlength="11"
                  :focus="autoFocus"
                  class="input"
                />
              </view>
            </info-cell>
            <info-cell :is-middle="true" :is-needed="true" :is-input="true">
              <view slot="left" class="text-left">验证码</view>
              <view slot="right" class="flex flex-middle">
                <input
                  v-model.trim="yzm"
                  type="number"
                  placeholder="请输入验证码"
                  placeholder-class="placeholder"
                  :maxlength="6"
                  class="flex-1 input"
                />
                <VerifyCode :mobile="form.mobile" />
              </view>
            </info-cell>
            <CodeTip :value="yzm" :is-blur="isCodeBlur" custom-style="padding-left: 202rpx" />
          </template>
          <info-cell v-else :is-middle="true" :is-needed="true">
            <view slot="left">手机号</view>
            <view slot="right" class="flex">
              <view class="tx-l flex-1">{{ form.mobile }}</view>
              <button
                class="photo-button"
                :open-type="openType"
                :phone-number-no-quota-toast="false"
                hover-class="button-action"
                @getphonenumber="handleGetPhoneNumber"
              >
                微信授权手机号
              </button>
            </view>
          </info-cell>
          <VerifyCodeChange v-if="!isYzmMode" v-model="byYzm" custom-class="pt-10 pb-20" />
          <info-cell :is-middle="true" :is-input="true" :is-needed="true">
            <view slot="left">姓名</view>
            <view slot="right">
              <input
                v-model.trim="form.clerkname"
                type="text"
                class="input"
                maxlength="16"
                placeholder-class="placeholder"
                placeholder="请输入姓名"
              />
            </view>
          </info-cell>
        </view>
        <view :class="['button', isValid ? '' : 'disabled']" @click="handleSubmit">提交</view>
      </template>
      <template v-else>
        <view class="success-content text-center">
          <text class="iconfont icon-success"></text>
          <view class="title-text">注册资料提交成功，请等待审核~</view>
          <view v-if="showSubscribe" class="button" style="margin-top: 120rpx" @click="handleSubscribe">
            审核结果通知我
          </view>
        </view>
      </template>
    </view>
    <common-popup v-model="showPopup" type="tip" title="温馨提示" :content="popContent"></common-popup>
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetStoreInfo, apiGetStoreRrgister } from '@/api/sales'
import { apiGetUserMobile, apiValidateCode } from '@/api/common'
import { getUrlQuery } from '@/utils/index'
import { getJsCode } from '@/utils/set-mp'
import subscribeMsg from '@/mixins/subscribe-msg'
import VerifyCode from '@/components/verify-code'
import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import phoneVerifyMixin, { yzmMixin, codeTipMixin } from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
import { regMobile, regCode } from 'packages/utils/reg'

export default {
  components: {
    VerifyCode,
    VerifyCodeChange,
    CodeTip
  },
  mixins: [subscribeMsg, phoneVerifyMixin, yzmMixin, codeTipMixin, privacyMixin],
  data() {
    return {
      showPopup: false, // 显示弹窗  true：显示  false：不显示
      popContent: '', // 弹窗内容
      register: true,
      storeId: 0,
      m: 0,
      info: {},
      form: {
        clerkname: '',
        mobile: '' //手机号
      },
      showSubscribe: true,
      loading: true
    }
  },
  computed: {
    isValid() {
      return regMobile(this.form.mobile) && (this.isYzmMode ? regCode(this.yzm) : true) && !!this.form.clerkname
    }
  },
  onLoad(options) {
    uni.hideHomeButton()
    let scene = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : {}
    let s = Number(options.s || scene.s || 0)
    let m = Number(options.m || scene.m || 0)
    this.storeId = s
    this.m = m
  },
  onShow() {
    this.getData()
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    async getData() {
      let res = await apiGetStoreInfo({
        memberlogin: this.m,
        storeid: this.storeId,
        js_code: await getJsCode()
      })
      if (this.$ck(res)) {
        this.info = res.return_data
        this.loading = false
      }
    },
    async handleSubmit() {
      if (!this.isValid) return
      if (this.isYzmMode) {
        const v = await apiValidateCode({
          mobile: this.form.mobile,
          checkcode: this.yzm
        })
        if (!this.$ck(v)) return
      }
      let query = {
        memberlogin: this.m,
        storeid: this.storeId, //系统级门店ID
        clerkname: this.form.clerkname,
        mobile: this.form.mobile, //手机号
        wxno: '',
        qqno: '',
        headpath: '',
        isreview: 1, //是否需要审核 0：不需要 1：需要 不传默认0
        js_code: await getJsCode()
      }
      let res = await apiGetStoreRrgister(query)
      if (this.$ck(res, false)) {
        this.register = false
        this.noticeTempId = res.return_data.msgtemplateid
      } else {
        this.showTips(res.return_msg)
      }
    },
    handleGetPhoneNumber(e) {
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) this.decodeMobile(code)
    },
    async decodeMobile(code) {
      const js_code = await getJsCode()
      apiGetUserMobile({
        js_code,
        mobilecode: code,
        memberlogin: this.m
      }).then(res => {
        if (this.$ck(res, false) && res.return_data?.mobile) {
          this.form.mobile = res.return_data.mobile
        } else {
          this.showTips('获取手机号失败，请重试')
        }
      })
    },
    async handleSubscribe() {
      const res = await this.requestSubscribeMsg([this.noticeTempId])
      if (res[this.noticeTempId] === 'accept') {
        this.$msg('订阅成功')
        this.showSubscribe = false
      }
    },
    showTips(content) {
      // 显示提示信息
      this.popContent = content
      this.showPopup = true
    }
  }
}
</script>

<style lang="scss" scoped>
.success-content {
  height: 100vh;
  background: #fff;
}
.icon-success {
  font-size: 90rpx;
  color: #58be6b;
  margin: auto 0;
  display: inline-block;
  margin-top: 120rpx;
}
.title-text {
  margin-top: 50rpx;
  font-size: 36rpx;
  font-weight: bold;
  color: #000;
}
.tips-box {
  padding: 24rpx 30rpx;
  background: #fff5f1;
  font-size: 28rpx;
  font-weight: 500;
  color: #000;
  .store {
    // color: #ff7640;
    color: var(--theme-color, $uni-color-primary);
  }
}
.form-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx;
  margin: 20rpx;
  .input {
    line-height: 108rpx;
    text-align: left;
    height: 108rpx;
    color: #666;
  }
}
.photo-button {
  width: 200rpx;
  font-size: 24rpx;
  font-weight: 500;
  color: #0f80ff;
  border: none;
  background-color: #fff;
  border: 1rpx solid #0f80ff;
  border-radius: 28rpx;
  padding: 12rpx;
}
.button {
  width: 690rpx;
  height: 90rpx;
  // background: #ff7640;
  background: var(--theme-color, $uni-color-primary);
  border-radius: 45rpx;
  line-height: 90rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  margin: 60rpx auto 0;
  text-align: center;
  &.disabled {
    background: #ccc;
  }
}
</style>
