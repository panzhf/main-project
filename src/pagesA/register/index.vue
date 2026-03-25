<template>
  <view class="container" :style="themeVars">
    <template v-if="loaded">
      <view v-if="specialAccount" class="wrapper wrapper-redBull" :style="{ backgroundImage: `url(${bg})` }">
        <view class="main-redBull">
          <image class="avatar" :src="infoMessage.HeadPath" />
          <view class="name">华彬快速消费品集团</view>
          <view class="tips">邀请你注册成为TA的终端门店</view>
          <view class="invite">（邀请人：{{ DealerName || '总部' }}）</view>
          <view v-if="isYzmMode" class="mt-30 pl-30 pr-30">
            <info-cell :is-middle="true" :is-needed="true">
              <view slot="left" class="text-left">手机号</view>
              <view slot="right" class="tx-l">
                <input
                  v-model.trim="mobile"
                  type="number"
                  placeholder="请输入手机号"
                  placeholder-class="placeholder"
                  :maxlength="11"
                  :focus="autoFocus"
                  class="flex-1 input"
                />
              </view>
            </info-cell>
            <info-cell :is-middle="true" :is-needed="true" :is-input="true">
              <view slot="left" class="text-left">验证码</view>
              <view slot="right" class="flex flex-middle tx-l">
                <input
                  v-model.trim="yzm"
                  type="number"
                  placeholder="请输入验证码"
                  placeholder-class="placeholder"
                  :maxlength="6"
                  class="flex-1 input"
                />
                <VerifyCode :mobile="mobile" />
              </view>
            </info-cell>
            <CodeTip :value="yzm" custom-style="padding-left: 202rpx;text-align:left;color: #fcecc1" />
            <button
              class="register-button"
              :style="{
                backgroundImage: `url(${button})`,
                filter: `grayscale(${isValid ? 0 : 0.8})`
              }"
              :disabled="!isValid"
              @tap="handleCustomRegister"
            >
              注册
            </button>
          </view>
          <button
            v-else
            class="register-button"
            :style="{
              backgroundImage: `url(${button})`
            }"
            :open-type="openType"
            :phone-number-no-quota-toast="false"
            @getphonenumber="onGetPhoneNumber"
          >
            注册
          </button>
          <view class="invite-wrap">
            <view class="invite-title">活动详情</view>
            <view class="invite-text-centent">
              <view class="invite-text">
                <text>1.</text>
                华彬云店会阶段性开展线上促销给终端店引流；
              </view>
              <view class="invite-text">
                <text>2.</text>
                不定期开展线上战马、红牛等华彬集团旗下饮料优惠促销活动；
              </view>
              <view class="invite-text">
                <text>3.</text>
                点击注册即可参与本次活动；
              </view>
            </view>
          </view>
          <view class="product">
            <image :src="product" mode="widthFix" />
          </view>
        </view>
      </view>
      <view v-else class="wrapper">
        <view class="main">
          <image class="avatar" :src="infoMessage.HeadPath" />
          <view class="name">{{ infoMessage.CompanyName }}</view>
          <view class="tips">邀请你注册为他的终端门店</view>
          <view class="invite">（邀请人：{{ DealerName }}）</view>
          <view v-if="isYzmMode" class="mt-30 pl-30 pr-30">
            <info-cell :is-middle="true" :is-needed="true">
              <view slot="left" class="text-left">手机号</view>
              <view slot="right" class="tx-l">
                <input
                  v-model.trim="mobile"
                  type="number"
                  placeholder="请输入手机号"
                  placeholder-class="placeholder"
                  :maxlength="11"
                  :focus="autoFocus"
                  class="flex-1"
                />
              </view>
            </info-cell>
            <info-cell :is-middle="true" :is-needed="true" :is-input="true">
              <view slot="left" class="text-left">验证码</view>
              <view slot="right" class="flex flex-middle tx-l">
                <input
                  v-model.trim="yzm"
                  type="number"
                  placeholder="请输入验证码"
                  placeholder-class="placeholder"
                  :maxlength="6"
                  class="flex-1"
                  @focus="toggleBlur(0)"
                  @blur="toggleBlur(1)"
                />
                <VerifyCode :mobile="mobile" />
              </view>
            </info-cell>
            <CodeTip :value="yzm" :is-blur="isCodeBlur" custom-style="padding-left: 202rpx;text-align:left" />
            <button
              class="button button--large button--shadow register-button"
              :disabled="!isValid"
              @tap="handleCustomRegister"
            >
              注册
            </button>
          </view>
          <button
            v-else
            class="button button--large button--shadow register-button"
            :open-type="openType"
            :phone-number-no-quota-toast="false"
            @getphonenumber="onGetPhoneNumber"
          >
            注册
          </button>
          <VerifyCodeChange v-if="!isYzmMode" v-model="byYzm" align="center" custom-class="pt-30" />
        </view>
      </view>
    </template>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
      @cancel="handleCancel"
    >
      <view class="popup-store" @click="show = true">
        <text class="store-l">
          {{ mdStoreInfoList[chooseIndex].Name }}（{{ mdStoreInfoList[chooseIndex].Leader }}，{{
            mdStoreInfoList[chooseIndex].StoreNo
          }}）
        </text>
        <text class="store-r iconfont icon-arrow-right"></text>
      </view>
    </common-popup>
    <u-popup v-model="show" mode="bottom" height="480rpx" :safe-area-inset-bottom="true" border-radius="30">
      <view class="poup-bottom">
        <view
          v-for="(item, index) in mdStoreInfoList"
          :key="index"
          :class="['bottom-list', item.IsUsed == 1 || item.IsUsed == 2 ? 'disable' : '']"
          @click="handleChoose(item, index)"
        >
          <view class="list-l">{{ item.Name }}（{{ item.Leader }}，{{ item.StoreNo }}）</view>
          <view>
            <text :class="['list-r', 'iconfont', chooseIndex === index ? 'icon-checked' : '']"></text>
            <text v-if="item.IsUsed === 1">不可选</text>
            <text v-if="item.IsUsed === 2">待审核</text>
            <text v-if="item.AuditStatus === 1" class="ml-10">待激活</text>
          </view>
        </view>
      </view>
    </u-popup>
    <common-popup v-model="showVerifyFail" content="一键获取手机号失败，请手动输入！" max-size @close="onVerifyFail" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloudT, apiGetWxMobile, apiGetWxCodeScene } from '@/api/cloud-store'
import { apiValidateCode } from '@/api/common'
import { getJsCode, parseUrlSearch, hideHomeButton } from '@/utils/set-mp'
import { parseUrlQuery } from '@/utils/function'
import { staticDomain } from '@/config'
import VerifyCode from '@/components/verify-code'
import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import phoneVerifyMixin, { yzmMixin, codeTipMixin } from 'packages/mixins/phone-verify'
import privacyMixin from 'packages/mixins/privacy'
import { regMobile, regCode } from 'packages/utils/reg'
import { storeHeadImage } from '@/utils/default-picture'
export default {
  components: {
    VerifyCode,
    VerifyCodeChange,
    CodeTip
  },
  mixins: [phoneVerifyMixin, yzmMixin, codeTipMixin, privacyMixin],
  data() {
    return {
      loaded: false,
      chooseIndex: 0,
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '去设置', // 弹窗确认按钮文案
      popCancelText: '跳过', // 弹窗取消按钮文案
      show: false,
      bg: `${staticDomain}storemini/miniImages/register/bg.jpg`,
      product: `${staticDomain}storemini/miniImages/register/product.png`,
      button: `${staticDomain}storemini/miniImages/register/button.png`,
      m: '',
      c: 0,
      infoMessage: {},
      DealerName: '',
      waitStore: 0,
      DealerId: 0,
      isShowMdChoose: false, // 是否显示门店选择弹窗
      mdStoreInfoList: [], // 门店信息的集合
      reuseInfo: {}, // 复用门店/激活门店信息所需参数
      testMobile: '',
      optionsT: '',

      mobile: ''
    }
  },
  computed: {
    specialAccount() {
      return ['10004333', '10003913'].includes(this.m)
    },
    isValid() {
      return regMobile(this.mobile) && regCode(this.yzm)
    }
  },
  async onLoad(options) {
    hideHomeButton()
    if (!options.scene) return
    this.optionsT = options.scene
    let query
    // 区分旧码、新码
    if (decodeURIComponent(options.scene).includes('m=')) {
      query = parseUrlSearch(decodeURIComponent(options.scene))
    } else {
      let q = parseUrlQuery(decodeURIComponent(options.scene))
      let response = await apiGetWxCodeScene({
        encryptKet: q.s,
        overflag: q.t,
        js_code: await getJsCode()
      })
      if (this.$ck(response)) {
        query = parseUrlQuery(response.return_data.scene)
      }
    }
    this.DealerId = Number(query.dealerId || query.d)
    this.m = query.m
    this.c = query.c || 0
    let data = {
      m: this.m,
      dealerId: this.DealerId,
      c: this.c
    }
    apiCloudT({
      url: '/api/v1/StoreRegister/GetInvitedInfo',
      method: 'get',
      js_code: await getJsCode(),
      data: JSON.stringify(data)
    }).then(res => {
      this.loaded = true
      if (this.$ck(res)) {
        let info = res.return_data || {}
        !info.HeadPath && (info.HeadPath = storeHeadImage)
        this.infoMessage = info
        this.DealerId === 0 ? (this.DealerName = '总部') : (this.DealerName = this.infoMessage.DealerName || '')
      }
    })
  },
  onShow() {
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    async handleCustomRegister() {
      const v = await apiValidateCode({
        mobile: this.mobile,
        checkcode: this.yzm
      })
      if (!this.$ck(v)) return
      const res = await this.decodeMobile({ mobile: this.mobile })
      if (res) {
        this.checkMobile(this.mobile)
      }
    },
    // 注册
    async onGetPhoneNumber(e) {
      this.autoFocus = false
      const { errMsg, code, errno } = e.detail
      if (!errMsg.includes('user deny') && errno === 1400001) {
        this.showVerifyFail = true
        return
      }
      if (!code) return
      const res = await this.decodeMobile({ code })
      if (res) {
        this.checkMobile(res.mobile)
      }
    },
    async decodeMobile({ code, mobile }) {
      let param = {
        js_code: await getJsCode()
      }
      code && (param.mobilecode = code)
      // 传手机号只获取openid
      mobile && (param.mobile = mobile)
      const res = await apiGetWxMobile(param)
      const { return_code: status, return_data: data } = res
      if (code && (status !== 0 || !data)) {
        this.$msg('获取手机号失败，请重试')
        return false
      }
      // { openid, unionid, mobile }
      const { openid, unionid } = data
      uni.setStorageSync(
        'activateUserInfo',
        JSON.stringify({
          openid,
          unionid
        })
      )
      return data
    },
    async checkMobile(mobile) {
      let param = {
        m: this.m,
        mobile,
        channelID: this.c
      }
      const res = await apiCloudT({
        url: '/api/v1/StoreRegister/RegisterCheckMobile',
        method: 'get',
        js_code: await getJsCode(),
        data: JSON.stringify(param)
      })
      const { return_code: code, return_data: data, return_msg: msg } = res
      if (code === 0 && data.WaitActivateStoreInfos.length > 0) {
        this.mdStoreInfoList = data.WaitActivateStoreInfos
        let IsAdd = data.IsAdd
        this.reuseInfo = {
          m: this.m,
          c: this.c,
          mobile,
          MiniName: this.infoMessage.MiniName,
          EntName: this.infoMessage.EntName,
          dealerId: this.DealerId,
          IsSearchStore: this.infoMessage.IsSearchStore,
          IsShowChannel: this.infoMessage.IsShowChannel,
          waitStore: 1 //走激活流程
        }
        this.popType = 'confirm'
        this.popTitle = '提示'
        this.popContent = `手机号在其他业务创建过门店账号（${this.mdStoreInfoList.length}个），请直接激活！`
        IsAdd ? (this.popCancelText = '去新建') : (this.popCancelText = '')
        this.popConfirmText = '激活门店'
        this.showPopup = true
      } else if (code === 0 && data.StoreInfos) {
        this.reuseInfo = {
          m: this.m,
          c: this.c,
          mobile,
          MiniName: this.infoMessage.MiniName,
          EntName: this.infoMessage.EntName,
          dealerId: this.DealerId,
          IsSearchStore: this.infoMessage.IsSearchStore,
          IsShowChannel: this.infoMessage.IsShowChannel
        }
        // 判断是否有IsUsed=0的
        const hasIsUsed = data.StoreInfos.some(item => item.IsUsed === 0)
        if (hasIsUsed) {
          this.reuseInfo.waitStore = 2 //走复用流程
          // 数组是门店信息的集合，弹窗选择
          this.mdStoreInfoList = data.StoreInfos
          let IsAdd = data.IsAdd
          this.popType = 'confirm'
          this.popTitle = '提示'
          this.popContent = `手机号在其他业务创建过门店账号（${this.mdStoreInfoList.length}个），请直接复用或者创建一个新门店`
          IsAdd ? (this.popCancelText = '创建新门店') : (this.popCancelText = '')
          this.popConfirmText = '复用门店'
          this.showPopup = true
        } else {
          uni.redirectTo({
            url: `./form?reuseInfo=${JSON.stringify(this.reuseInfo)}&optionsT=${this.optionsT}`
          })
        }
      } else if (code === 37018) {
        // 已经创建10个门店跳转到登录页
        this.$msg(msg || '一个手机号最多创建10个门店，不可继续新建')
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/index'
          })
        }, 1500)
      } else {
        this.$msg(msg || '检查手机号失败')
      }
    },
    // 选择门店的回调
    handleChoose(item, index) {
      if (item.IsUsed === 1 || item.IsUsed === 2) return
      this.chooseIndex = index
      this.show = false
    },
    //弹窗选择激活门店/复用门店的回调
    handleConfirm() {
      let chooseInfo = this.mdStoreInfoList[this.chooseIndex]
      this.showPopup = false
      uni.redirectTo({
        url: `./form?chooseInfo=${JSON.stringify(chooseInfo)}&reuseInfo=${JSON.stringify(this.reuseInfo)}`
      })
    },
    //弹窗选择新建门店的回调
    handleCancel() {
      this.reuseInfo.waitStore = 3 //走新建流程
      uni.redirectTo({
        url: `./form?reuseInfo=${JSON.stringify(this.reuseInfo)}&optionsT=${this.optionsT}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.container {
  height: 100%;
  background-color: #fff;
}
.popup-store {
  display: flex;
  justify-content: space-between;
  height: 72rpx;
  padding: 0 20rpx;
  margin-top: 29rpx;
  font-size: 24rpx;
  line-height: 72rpx;
  background-color: #f6f6f6;
  .store-l {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .store-r {
    font-size: 24rpx;
    color: #999;
  }
}
.poup-bottom {
  .bottom-list {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 95rpx;
    font-size: 28rpx;
    padding: 0 30rpx;
    border-bottom: 1rpx solid #eee;
    .list-l {
      width: 80%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .icon-checked {
      color: var(--theme-color, $uni-color-primary);
    }
    .disable {
      background-color: #f6f6f6;
      color: #ccc;
    }
  }
}
.main {
  padding-top: 170rpx;
  width: 100%;
  text-align: center;
  .avatar {
    margin-bottom: 40rpx;
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    border: 1rpx solid #ddd;
  }
  .name,
  .tips {
    font-weight: bold;
    font-size: 30rpx;
    color: #000;
  }
  .invite {
    margin-top: 35rpx;
    font-size: 28rpx;
  }
  .button.register-button {
    position: relative;
    margin: 115rpx auto 0;
    width: 600rpx;
    height: 90rpx;
  }
}
.wrapper-redBull {
  color: #fcecc1 !important;
  background-size: 100% 100%;
  background-position: center;
  .main-redBull {
    padding-top: 75rpx;
    width: 100%;
    text-align: center;
    .avatar {
      margin-bottom: 40rpx;
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      border: 1rpx solid #ddd;
    }
    .name,
    .tips {
      font-weight: bold;
      font-size: 28rpx;
    }
    .invite {
      font-weight: bold;
      margin-top: 35rpx;
      font-size: 28rpx;
    }
    .register-button {
      position: relative;
      margin: 80rpx auto 0;
      width: 640rpx;
      height: 70rpx;
      line-height: 70rpx;
      color: var(--theme-color, $uni-color-primary);
      font-weight: bold;
      background-size: 90% 100%;
      background-repeat: no-repeat;
      background-position: center;
      background-color: transparent;
      font-size: 32rpx;
      &::after {
        border: none;
        border-radius: 0;
      }
    }
    .invite-wrap {
      padding-top: 70rpx;
      .invite-title {
        font-weight: bold;
        font-size: 34rpx;
      }
      .invite-text-centent {
        font-size: 28rpx;
        text-align: left;
        padding: 14rpx 0 0 65rpx;
        .invite-text {
          margin: 10rpx 0;
          text {
            margin-right: 20rpx;
          }
        }
      }
    }
    .product {
      width: 65%;
      margin: 50rpx auto 0;
      image {
        width: 100%;
        display: block;
      }
    }
    .input {
      color: #fff;
    }
    // 表单
    ::v-deep {
      .cell-line__needed {
        color: #fcecc1;
      }
      .cell-line__key {
        color: #fff;
      }
      .code-tips .sent-code {
        color: #fff;
      }
    }
  }
}
</style>
