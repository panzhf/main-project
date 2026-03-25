import { apiCloud } from '@/api/cloud-store'
const bindPhone = {
  data() {
    return {
      AccessToken: '',
      openid: '',
      MemberLogin: '',
      Mobile: '',
      showMobile: ''
    }
  },
  onShow() {
    apiCloud({
      url: '/api/v1/Store/GetStoreInfo',
      method: 'get',
      data: JSON.stringify({})
    }).then(res => {
      if (this.$ck(res)) {
        this.MemberLogin = res.return_data.MemberLogin || ''
        this.Mobile = res.return_data.Mobile || ''
        let reg = /^(\d{3})\d*(\d{4})$/
        this.showMobile = this.Mobile.replace(reg, '$1****$2')
        this.toGetuserInfo()
      }
    })
  },
  methods: {
    toGetuserInfo() {
      if (!uni.getStorageSync('userInfo') && !this.AccessToken) {
        uni.navigateTo({
          url: `/pages/authorization-page/index?m=${this.MemberLogin}&getOpenID=1`
        })
      } else {
        let obj = JSON.parse(uni.getStorageSync('userInfo'))
        this.AccessToken = obj.AccessToken
        this.openid = obj.openid
      }
      uni.removeStorageSync('userInfo')
    },
    /**
     * roleType：0-门店；3-门店直营分佣钱包；4-门店渠道推广
     */
    handleCherkPhone(OpenId, Headpath, NickName, CherkCode, RoleType) {
      apiCloud({
        url: '/api/v1/Withdrawa/BindWithdrawaOpenId',
        method: 'post',
        data: JSON.stringify({
          OpenId,
          Headpath,
          NickName,
          CherkCode,
          RoleType
        })
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg(res.return_msg || '绑定成功')
          setTimeout(() => {
            this.$goBack()
          }, 2000)
        }
      })
    }
  }
}
export default bindPhone
