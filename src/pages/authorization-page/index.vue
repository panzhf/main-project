<template>
  <view class="act-auth">
    <web-view :src="authSrc" @message="SaveRelation"></web-view>
  </view>
</template>
<script>
import { apiCloud } from '@/api/cloud-store'
import { authHost, postUrl, staticDomain } from '@/config'

export default {
  data() {
    return {
      // 获取的手机号码参数
      encryptedData: '',
      yd: '',
      iv: '',
      code: '',
      Headpath: '',
      NickName: '',
      MemberLogin: '',
      DealerId: '',
      // 是否获取微信openid
      getWXOpenID: '',
      getOpenID: '',
      DirectlyAssetsOpenID: '',
      ChannelRewardOpenID: '',
      RoleType: '3', // 角色类型必须为 0 门店 1 分销员 2 直营经销商 3 门店直营分佣钱包 4 门店渠道推广
      authSrc: '',
      host: authHost,
      postUrl: postUrl
    }
  },
  onLoad(option) {
    console.log(staticDomain + '/auth.html')

    // this.authSrc = `${this.host}/AddressJump.aspx?fw=123&scope=snsapi_base&m=${option.m}&PostUrl=${this.postUrl}`
    this.authSrc = `${this.host}/AddressJump.aspx?fw=123&scope=snsapi_base&m=${option.m}&PostUrl=${staticDomain}/auth.html`
    this.encryptedData = decodeURIComponent(option.encryptedData)
    this.iv = decodeURIComponent(option.iv)
    this.Headpath = option.Headpath || ''
    this.NickName = option.NickName || ''
    this.MemberLogin = option.m || ''
    this.DealerId = option.d || ''
    this.yd = option.yd || ''
    this.getWXOpenID = option.getWXOpenID
    this.getOpenID = option.getOpenID
    this.DirectlyAssetsOpenID = option.DirectlyAssetsOpenID || ''
    this.ChannelRewardOpenID = option.ChannelRewardOpenID || ''
    this.RoleType = option.RoleType || ''
    uni.login({
      success: res => {
        this.code = res.code
      }
    })
  },
  methods: {
    /** 授权回调 */
    SaveRelation(res) {
      let data = res.detail.data
      if (!data || !data[0]) return
      let { AccessToken, openid } = data[0]
      // 绑定微信
      if (this.getWXOpenID) {
        if (typeof this.encryptedData === 'undefined' || this.encryptedData === 'undefined') {
          this.encryptedData = ''
        }
        if (typeof this.iv === 'undefined' || this.iv === 'undefined') {
          this.iv = ''
        }
        let data = {
          encryptedData: this.encryptedData || '',
          iv: this.iv || '',
          jsCode: this.code || '',
          AccessToken: AccessToken,
          WXOpenId: openid
        }
        apiCloud({
          url: '/api/v1/DistributionSaleCenter/WXBind',
          method: 'post',
          data: JSON.stringify(data)
        })
          .then(res => {
            this.$store.dispatch('setalreadyWXBindFn', true)
          })
          .catch(res => {
            this.$msg(res.return_msg || '网络开小差了')
          })
      } else if (this.yd) {
        // 云店微信绑定身份
        let data = {
          AccountOpenId: openid
        }
        apiCloud({
          url: '/api/v1/MiniUser/UpdateBindStoreClerk',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (this.$ck(res)) {
            this.$msg(res.return_msg)
            this.$goBack()
          }
        })
      } else if (this.getOpenID) {
        // 门店营收绑定微信ID、云店渠道奖励推广微信绑定
        uni.setStorageSync(
          'userInfo',
          JSON.stringify({
            AccessToken,
            openid
          })
        )
      } else if (this.DirectlyAssetsOpenID) {
        // 经销商提现帐号绑定
        let data = {
          AccessToken,
          OpenId: openid,
          Headpath: this.Headpath,
          NickName: this.NickName,
          MemberLogin: this.MemberLogin,
          DealerId: Number(this.DealerId),
          RoleType: Number(this.RoleType)
        }
        apiCloud({
          url: '/api/v1/DirectlyApi/BindWithdrawaOpenId',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (res.return_code === 0) {
            getApp().globalData.isDealerBinded = true
            this.$msg(res.return_msg || '绑定成功')
          } else {
            getApp().globalData.isDealerBinded = false
            this.$msg(res.return_msg || '绑定失败')
          }
          setTimeout(() => {
            this.$goBack()
          }, 2000)
        })
      } else {
        let data = {
          AccessToken: `${AccessToken}`,
          WXOpenID: `${openid}`
        }
        // 绑定小程序与公众号的关系
        apiCloud({
          url: `/api/v1/Store/SaveRelation`,
          method: 'post',
          data: JSON.stringify(data)
        })
      }
    }
  }
}
</script>
