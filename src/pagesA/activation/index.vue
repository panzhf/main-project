<template>
  <view :style="themeVars">
    <template v-if="!showStore">
      <!-- <tips v-if="slotType !== 2" :info="info"></tips> -->
      <view v-if="activateType" class="form-box">
        <template v-if="activateType === 1">
          <template v-if="isYzmMode">
            <info-cell :is-middle="true" :is-needed="true" :is-input="true">
              <view slot="left">手机号</view>
              <view slot="right" class="flex">
                <input
                  v-model.trim="mobile"
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
                  @focus="toggleBlur(0)"
                  @blur="toggleBlur(1)"
                />
                <VerifyCode ref="verifyCode" :mobile="mobile" />
              </view>
            </info-cell>
            <CodeTip :value="yzm" :is-blur="isCodeBlur" custom-style="padding-left: 180rpx" />
          </template>
          <info-cell v-else :is-show-line="false" :is-two-line="false" :is-middle="true" :is-needed="true">
            <view slot="left">手机号</view>
            <view slot="right" class="flex">
              <view class="tx-l flex-1">{{ mobile }}</view>
              <get-mobile v-model="mobile" :memberlogin="m"></get-mobile>
            </view>
          </info-cell>
        </template>
        <info-cell v-if="activateType === 2" :is-show-line="false" :is-middle="true" :is-input="true" :is-needed="true">
          <view slot="left">门店编号</view>
          <view slot="right" class="flex flex-middle">
            <input
              v-model.trim="storeNo"
              type="text"
              class="input flex-1"
              maxlength="20"
              placeholder-class="placeholder-small"
              placeholder="20个字，仅含英文、数字、- _"
              :disabled="!activateMode.includes(1)"
            />
            <view v-if="activateMode.includes(2)" class="scan-btn shrink-0 ml-10" @tap="handleScan">
              {{ storeNo ? '重 扫' : '扫码录入' }}
            </view>
          </view>
        </info-cell>
      </view>
      <VerifyCodeChange v-if="activateType === 1 && !isYzmMode" v-model="byYzm" custom-class="pr-40" />
      <button
        v-if="activateType"
        class="primary-btn round ml-30 mr-30 mt-60"
        :class="{ disabled: !isValid }"
        @tap="handleSubmit"
      >
        下一步
      </button>
    </template>
    <view v-else style="min-height: 100vh" class="page-store bg-f">
      <view class="c-0 store-tips tx-c">
        <view class="fs-36 fw-bold">{{ mobile }}</view>
        <view class="fs-32">
          系统监测到该手机号在{{ info.memberloginname }}下有多个门店账号，请选择要激活的门店账号
        </view>
      </view>
      <view class="store-list fs-32 c-0">
        <view v-for="(item, index) in storeList" :key="index" class="item">
          <view class="flex">
            <view class="ellipsis flex-1 fw-bold mr-40">{{ item.storename }}</view>
            <view
              class="fw-normal ml-40 primary-color fs-28"
              :class="[3, 4].includes(item.status) ? ' edit-color' : 'primary-color'"
              @tap="handleNavForm(1, item)"
            >
              {{ [3].includes(item.status) ? '未激活' : [4].includes(item.status) ? '已禁用' : '已激活' }}
              <text v-if="[3, 4].includes(item.status)" class="icon iconfont icon-arrow-right fs-20 ml-10"></text>
            </view>
          </view>
          <view class="fs-30 c-6">（{{ item.leader }}）</view>
        </view>
      </view>
      <template v-if="showStoreListBtn">
        <view style="height: 120rpx"></view>
        <view class="footer bg-f">
          <button class="primary-btn plain round" @click="showStore = false">返回上一步</button>
        </view>
      </template>
    </view>

    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      :pop-hide-button="slotType === 2"
      @cancel="cancelConfirm"
      @confirm="handleConfirm"
    >
      <view v-if="slotType === 1">
        <view class="fs-30 c-0 fw-bold">该门店已激活，是否前往登录？</view>
        <view class="c-6 fs-24 mt-20">门店手机号：{{ mobile | hideMobileFilter }}</view>
        <view class="c-6 fs-24">姓名：{{ leader | hideNameFilter }}</view>
      </view>
      <view v-if="slotType === 2">
        <view class="fs-26 c-9 mt-10 mb-40">{{ codeTips }}</view>
        <button class="primary-btn size-small ml-20 mr-20" @tap="handExitMp">确定</button>
      </view>
    </common-popup>

    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetActivationInfo, apiGetStoreByNo } from '@/api/activation'
import { apiValidateCode } from '@/api/common'
// import tips from './comps/tips'
import VerifyCode from '@/components/verify-code'
import VerifyCodeChange from 'packages/components/phone-verify/change.vue'
import CodeTip from 'packages/components/phone-verify/code-tip.vue'
import { hideMobileFilter, hideNameFilter } from '@/filters'
import commonPopupMixin from '@/mixins/common-popup'
import { ssoLoginMixin } from '@/mixins/sso-login'
import phoneVerifyMixin, { yzmMixin, codeTipMixin } from 'packages/mixins/phone-verify'
import { getJsCode } from '@/utils/set-mp'
import { parseUrlQuery } from '@/utils/function'
import { regMobile, regCode } from 'packages/utils/reg'
import { getQuery } from '@/utils'
import { apiGetWxCodeScene } from '@/api/cloud-store'
export default {
  components: {
    VerifyCode,
    VerifyCodeChange,
    CodeTip
  },
  filters: { hideMobileFilter, hideNameFilter },
  mixins: [commonPopupMixin, ssoLoginMixin, phoneVerifyMixin, yzmMixin, codeTipMixin],
  data() {
    return {
      slotType: 0, // 1 已激活 2邀请码已失效
      storeNo: '',
      m: '', //商户编号
      salemanId: 0,
      dealerId: 0,
      loading: false,
      mobile: '',
      leader: '',
      operaType: '',
      showStore: false, //显示门店
      activateType: 0, // 激活方式 1手机号  2门店编号
      activateMode: [], // 门店编号录入方式：1-手写录入,2-扫码录入
      storeList: [],
      info: {},
      from: '',
      forbidTips: '该门店账号被禁用，请联系品牌启用后再进行激活！',
      codeTips: '',
      openid: ''
    }
  },
  computed: {
    isValid() {
      return (
        (this.activateType === 1 && regMobile(this.mobile) && (this.isYzmMode ? regCode(this.yzm) : true)) ||
        (this.activateType === 2 && !!this.storeNo)
      )
    },
    showStoreListBtn() {
      return !(this.from === 'register' && this.activateType === 1)
    }
  },
  async onLoad(options) {
    // m=品牌商&a=业务员id
    // s t 品牌商后台生成的激活太阳码的参数
    if (options.scene) {
      const { s: k, t, a, m, d } = parseUrlQuery(decodeURIComponent(options.scene))
      if (k) {
        const { m: km } = await this.parseScene(k, t)
        this.m = km
      } else {
        this.m = m
        a && (this.salemanId = a)
        d && (this.dealerId = d)
      }
    } else {
      this.salemanId = options.salemanId || 0
      this.m = options.m || ''
      this.from = options.from || ''
      this.dealerId = options.dealerId || 0
      this.mobile = options.mobile || ''
      this.openid = options.openid || ''
    }

    this.getData()

    uni.$on('phone-verify', () => {
      if (this.activateType === 1) {
        this.verifyState = true
        this.autoFocus = true
      }
    })
  },
  onUnload() {
    uni.$off('phone-verify')
  },
  methods: {
    async parseScene(k, t) {
      const { return_code, return_data } = await apiGetWxCodeScene({
        encryptKet: k,
        overflag: t,
        js_code: await getJsCode()
      })
      if (return_code === 0) {
        return getQuery(return_data.scene)
      }
      this.queryError()
    },
    queryError() {
      uni.showModal({
        title: '温馨提示',
        content: '参数异常，请重试或联系邀请方',
        showCancel: false,
        confirmText: '去登录',
        success: ({ confirm }) => {
          confirm && this.handleLogin()
        }
      })
    },
    handleLogin() {
      uni.reLaunch({
        url: '/pages/login/index'
      })
    },
    handleScan() {
      uni.scanCode({
        success: res => {
          let { result } = res
          // 自动过滤首尾无效字符（空格、换行、制表符）
          result = result.trim()
          if (!result) return this.showTips('二维码参数错误，识别不到任何信息')
          if (!/^[A-Za-z0-9_-]+$/.test(result)) {
            return this.showTips('门店编号仅支持英文、数字、英文符号“-” “_”，请核实后重试')
          }
          this.storeNo = result.slice(0, 20)
        },
        fail: err => {
          // 百年糊涂反馈部分机型无法调起
          if (!err.errMsg.includes('cancel')) {
            this.$uploadLog({
              type: 'scancode',
              desc: '门店激活-录入门店编号',
              data: err
            })
          }
        }
      })
    },
    async handleSubmit() {
      if (!this.isValid) return
      if (this.activateType === 2 && this.storeNo && !/^[A-Za-z0-9_-]+$/.test(this.storeNo)) {
        return this.$msg('门店编号只能包含英文、数字、英文符号“-” “_”')
      }
      if (this.activateType === 1) {
        if (this.isYzmMode) {
          const v = await apiValidateCode({
            mobile: this.mobile,
            checkcode: this.yzm
          })
          if (!this.$ck(v)) return
        }
        this.getData()
        return
      }
      if (this.activateType === 2) this.getDataByNo()
    },
    handleNavForm(type = 0, item) {
      // type=1,用门店本身数据
      if (type === 1 && item.status !== 3) {
        if (item.status === 4) this.showTips(this.forbidTips)
        return
      }
      let storeNo = type === 1 ? item.storeno : this.storeNo
      let storeId = type === 1 ? item.storeid : this.ssoStoreId
      this.$navPage(
        `./form?m=${this.m}&storeId=${storeId}&storeNo=${storeNo}&from=${this.from}&mobile=${this.mobile}&type=${this.activateType}&salemanId=${this.salemanId}&dealerId=${this.info.dealerid}&dealerName=${this.info.dealername}&openid=${this.openid}`
      )
    },
    async getData() {
      if (this.loading) return
      this.loading = true

      let param = {
        js_code: await getJsCode(),
        salesmanid: this.salemanId,
        dealerid: this.dealerId, // 兼容从登录进来 无salemanid的情况
        mobile: this.mobile,
        memberlogin: this.m
      }
      let res = await apiGetActivationInfo(param)

      this.loading = false
      if (this.$ck(res, false)) {
        let { storelist, activatetype, activatedatainputway, salesmanstatus, salesmanno, ...info } = res.return_data

        if (salesmanstatus !== null && salesmanstatus !== undefined && salesmanstatus !== 1) {
          this.slotType = 2
          this.codeTips = `该业务员帐号${salesmanstatus === 3 ? '未激活' : '已禁用'}`
          this.showTips(`此邀请码已失效`)
          this.$uploadLog({
            type: 'register',
            desc: '业务员邀请码已失效',
            data: { err: this.codeTips, salesmanno, m: this.m, salesmanstatus }
          })
          return
        }

        this.storeList = storelist || []
        this.activateType = activatetype
        this.activateMode = activatedatainputway || []

        this.info = info
        /*
          1、没有手机号 或者  不是通过手机号激活方式的，不需要走以下步骤
          2、有手机号，没有门店数据，提示没有门店
          3、有门店列表：
          1）没有未激活门店，提示登录
          2）有未激活的门店：
             1.1）有2个或2个以上的，显示门店列表
             1.2）只有一个门店，被禁用则提示，否则直接跳到填写门店资料页面
        */
        if (!this.mobile || this.activateType === 2) return
        if (this.mobile && !this.storeList.length) {
          return this.showTips('此手机号在该品牌下未创建门店账号，请扫描业务员出示的邀请二维码注册门店')
        }
        // 未激活状态： 3未激活正常  4未激活被禁用
        let notActList = this.storeList.filter(item => [3, 4].includes(item.status))
        const notActStoreLen = notActList.length
        if (!notActStoreLen) {
          // 记录免登录token
          const { ssotoken } = res.return_data
          this.ssoToken = ssotoken || ''
          this.ssoStoreId = this.storeList.find(item => item.status === 1)?.storeid || ''

          this.operaType = 'actvicated'
          this.popType = 'confirm'
          this.popTitle = '温馨提示'
          this.popConfirmText = '立即登录'
          this.popCancelText = '我再想想'
          this.popContent = '该手机号下的门店已激活，是否前往登录？'
          this.showPopup = true
          return
        }
        // 有2个及以上的未激活的门店（正常+禁用）, 显示门店列表
        if (notActStoreLen > 1) {
          this.showStore = true
          return
        }
        // 只有一个未激活门店
        this.handleNavForm(1, notActList[0])
      } else if (res.return_code === 600020) {
        // 记录免登录token
        const { ssotoken, storeid } = res.return_data
        this.ssoToken = ssotoken || ''
        this.ssoStoreId = storeid || ''

        this.operaType = 'actvicated'
        this.popType = 'confirm'
        this.popTitle = '温馨提示'
        this.popConfirmText = '立即登录'
        this.popCancelText = '我再想想'
        // 该手机号下的门店已激活（一个手机号只可激活一个门店），是否前往登录？
        this.popContent = res.return_msg || ''
        this.showPopup = true
      } else {
        this.$msg(res.return_msg || '')
        // 增加错误提示日志
        if (res.return_code !== 0) {
          this.$uploadLog({
            type: 'register',
            desc: '门店激活',
            data: res
          })
        }
      }
    },
    async getDataByNo() {
      if (this.loading) return
      this.loading = true
      let param = {
        js_code: await getJsCode(),
        storeno: this.storeNo,
        memberlogin: this.m
      }
      apiGetStoreByNo(param, true)
        .then(res => {
          this.loading = false
          if (res.return_code === 0 && res.return_data) {
            let { id, storeno, mobile, leader, status } = res.return_data
            // 没有门店，则return_data应该返回null。但是java那边处理返回了object，这里判断storeno为null，则表示没有这个门店
            if (storeno === null) return this.showTips(`您输入的门店编号不存在，请检查后重试！`)
            this.storeNo = storeno
            this.mobile = mobile
            this.leader = leader
            if (status !== 3) {
              // 门店状态 0.禁用 1.启用 3.未激活 4.未激活禁用
              if (status === 4) return this.showTips(this.forbidTips)
              this.ssoToken = '' // 重置token防止误用！

              this.slotType = 1
              this.operaType = 'actvicated'
              this.popType = 'confirm'
              this.popTitle = '温馨提示'
              this.popConfirmText = '立即登录'
              this.popCancelText = '我再想想'
              this.popContent = ''
              this.showPopup = true
              return
            }
            this.ssoStoreId = id
            this.handleNavForm()
          } else {
            this.showTips(res.return_code !== 0 ? res.return_msg : '门店编号错误，请重新输入！')

            // 增加错误提示日志
            if (res.return_code !== 0) {
              this.$uploadLog({
                type: 'register',
                desc: '门店激活',
                data: res
              })
            }
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    cancelConfirm() {
      this.slotType = 0
    },
    handExitMp() {
      uni.exitMiniProgram()
    },
    handleConfirm() {
      if (this.operaType === 'actvicated') {
        // 已激活直接免登录进入主页
        this.handleSSOLogin(0)
      }
      this.showPopup = false
      this.slotType = 0
    }
  }
}
</script>

<style lang="scss" scoped>
.form-box {
  background: #fff;
  border-radius: 20rpx;
  padding: 20rpx 0 20rpx 20rpx;
  margin: 20rpx;
  .input {
    line-height: 108rpx;
    text-align: left;
    height: 108rpx;
    color: #666;
    &.right {
      text-align: right;
    }
  }
  .scan-btn {
    @include whl(130rpx, 56rpx);
    color: #fff;
    text-align: center;
    font-size: 26rpx;
    background-color: var(--theme-color, $uni-color-primary);
    border-radius: 20rpx;
  }
  ::v-deep {
    .cell-line.form-css {
      padding-right: 20rpx;
    }
    .cell-line__value {
      margin-left: 0;
    }
  }
}
.disabled {
  background: #ccc;
}

.page-store {
  line-height: 54rpx;
  .store-tips {
    padding: 72rpx 60rpx;
  }
  .store-list {
    margin: 0 32rpx;
    .item {
      padding: 40rpx 0 20rpx;
      @include border-bottom(#e5e5e5);
    }
  }
  .footer {
    position: fixed;
    padding: 30rpx;
    bottom: 0;
    left: 0;
    right: 0;
  }
}
</style>

