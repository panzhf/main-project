<template>
  <view>
    <StoreForm
      v-if="showForm"
      ref="storeFormRef"
      :skip-mobile="skipMobile"
      :hide-store-no="hideStoreNo"
      :loading="loading"
      :extra-data="extraData"
      :m="m"
      :need-openid="true"
      :info-source="1"
      :openid="openid"
      :register-type="1"
      :related-dealer-id="relatedDealerId"
      btn-text="激 活"
      @submit="handleSubmit"
    />
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @cancel="onCancel"
      @confirm="onConfirm"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetActivationInfo, apiStoreActivate } from '@/api/activation'
import { simplePopupMixin } from 'packages/mixins/common-popup'
import { ssoLoginMixin } from '@/mixins/sso-login'
import phoneVerifyMixin, { yzmMixin, codeTipMixin } from 'packages/mixins/phone-verify'
import { getJsCode } from '@/utils/set-mp'
import StoreForm from 'packages/components/store/store-register'
export default {
  components: {
    StoreForm
  },
  mixins: [simplePopupMixin, ssoLoginMixin, phoneVerifyMixin, yzmMixin, codeTipMixin],
  data() {
    return {
      type: 0, // 1 通过手机号  2通过编号
      from: '', // 从哪个页面进来 login register
      m: '', //商户编号
      dealerId: 0, // 经销商id 渠道关系激活时不能改，扫谁的激活码进来就跟随谁，不能被门店信息覆盖
      dealerName: '', // 经销商名称
      salemanId: 0, // 业务员id
      storeNo: '', //门店编号
      mobile: '', //手机号
      loading: false,
      operaType: '',
      relatedDealerId: 0, // 用来判断获取哪个激活配置信息 0获取店老板自主注册配置信息  >0获取经销商邀请注册配置信息
      showForm: false,
      openid: ''
    }
  },
  computed: {
    hideStoreNo() {
      // 不显示门店编号
      return this.type === 1
    },
    skipMobile() {
      // 从登录页或切换店铺页进入，门店未激活，且激活方式为手机号
      // 无需获取手机号，直接使用传参手机号
      return this.from === 'login' && this.type === 1
    },
    extraData() {
      return {
        dealerid: this.dealerId,
        dealername: this.dealerName,
        storeno: this.storeNo,
        mobile: this.type === 1 ? this.mobile : ''
      }
    }
  },
  async onLoad(options) {
    uni.hideHomeButton()
    this.m = options.m || ''
    this.from = options.from || ''
    this.type = Number(options.type)
    this.storeNo = options.storeNo || ''
    options.storeId && (this.ssoStoreId = options.storeId)
    this.dealerId = Number(options.dealerId || 0)
    this.salemanId = Number(options.salemanId || 0)
    this.dealerName = options.dealerName || ''
    this.relatedDealerId = this.from === 'login' ? 0 : this.dealerId
    this.openid = options.openid || ''
    this.type === 1 && (this.mobile = options.mobile || '')
    if (['login', 'register'].includes(this.from) && this.type === 1) {
      this.getActivateInfo()
    } else {
      this.getSettingData()
    }
  },
  onShow() {
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    getSettingData() {
      this.showForm = true
    },
    async handleSubmit(p) {
      const param = { ...p }
      if (this.loading) return
      this.loading = true
      let lanandlatArr = param.lanandlat.split(',')
      let shopfor = param.shopfor ? param.shopfor.split(',') : []
      delete param.lanandlat
      delete param.shopfor
      apiStoreActivate({
        js_code: await getJsCode(),
        ...param,
        memberlogin: this.m,
        lng: lanandlatArr[1], //经度,必填
        lat: lanandlatArr[0], //纬度,必填
        shopfor,
        storeid: this.ssoStoreId,
        salesmanid: this.salemanId || 0 //渠道关系不能改变，salemanid不用处理
      })
        .then(res => {
          if (res.return_code === 0) {
            const { ssotoken } = res.return_data
            // 需要返回storeid
            uni.reLaunch({
              url: `./result?ssotoken=${ssotoken || ''}&storeid=${this.ssoStoreId || ''}`
            })
          } else if (res.return_code === 600020) {
            const { ssotoken, storeid } = res.return_data || {}
            this.goSsologin(ssotoken, storeid, res.return_msg || '')
          } else {
            this.showTips({ content: res.return_msg })
            this.$log.info({
              func: 'accountActivation',
              data: JSON.stringify(res),
              m: this.m
            })
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    async getActivateInfo() {
      uni.showLoading({
        title: '加载中',
        mask: true
      })
      let param = {
        js_code: await getJsCode(),
        salesmanid: this.salemanId,
        dealerid: this.dealerId, // 兼容从登录进来 无salemanid的情况
        mobile: this.mobile,
        memberlogin: this.m
      }
      let res = await apiGetActivationInfo(param, false)
      if (this.$ck(res, false)) {
        const { dealerid, salemanid, dealername, storelist } = res.return_data
        this.dealerId = dealerid
        this.salemanId = salemanid || 0
        this.dealerName = dealername || ''
        const s = storelist.filter(i => i.storeno === this.storeNo)
        this.ssoStoreId = s[0].storeid
        this.getSettingData()
      } else if (res.return_code === 600020) {
        const { ssotoken, storeid } = res.return_data || {}
        this.goSsologin(ssotoken, storeid, res.return_msg || '')
        uni.hideLoading()
      } else {
        this.$msg(res.return_msg || '')
        uni.hideLoading()
      }
    },
    goSsologin(ssotoken, storeid, msg) {
      // 记录免登录token
      this.ssoToken = ssotoken || ''
      // 免登录的id可能不是当前激活的id，需重写为已激活的id，之后免登录到该门店
      this.ssoStoreId = storeid || ''
      this.operaType = 'actvicated'
      this.popType = 'confirm'
      this.popTitle = '温馨提示'
      this.popConfirmText = '立即登录'
      this.popCancelText = '我再想想'
      this.popContent = msg || ''
      this.showPopup = true
    },
    onConfirm() {
      if (this.operaType === 'actvicated') {
        // 已激活直接免登录进入主页
        this.handleSSOLogin(0)
      }
      this.showPopup = false
    },
    onCancel() {
      if (this.operaType === 'actvicated') {
        this.$goBack()
        this.showPopup = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>

