<template>
  <view>
    <button
      class="mobile-button"
      :open-type="openType"
      :phone-number-no-quota-toast="false"
      hover-class="button-action"
      @getphonenumber="handleGetPhoneNumber"
    >
      {{ mobile ? '重新授权' : '微信授权手机号' }}
    </button>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
  </view>
</template>

<script>
import { apiGetWxMobile } from '@/api/cloud-store'
import { getJsCode } from '@/utils/set-mp'
import commonPopupMixin from '@/mixins/common-popup'
import phoneVerifyMixin from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
export default {
  mixins: [commonPopupMixin, phoneVerifyMixin, privacyMixin],
  props: {
    value: {
      type: String,
      default: ''
    },
    memberlogin: {
      type: String,
      default: ''
    }
  },
  methods: {
    async handleGetPhoneNumber(e) {
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (code) {
        const res = await apiGetWxMobile({
          mobilecode: code,
          js_code: await getJsCode(),
          memberlogin: this.memberlogin
        })
        if (res.return_code === 0) {
          this.$emit('input', res.return_data.mobile)
        } else if (res.return_msg.includes('手机号码解密失败')) {
          this.showTips('获取手机号失败，请重试')
        } else {
          this.showTips(res.return_msg)
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.mobile-button {
  width: 200rpx;
  font-size: 24rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #0f80ff;
  border: none;
  background-color: #fff;
  border: 1rpx solid #0f80ff;
  border-radius: 28rpx;
  padding: 12rpx;
}
</style>
