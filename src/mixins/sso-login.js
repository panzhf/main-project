export const ssoLoginMixin = {
  data() {
    return {
      ssoToken: '', // 免登录token
      ssoStoreId: '' // 门店id
    }
  },
  methods: {
    handleSSOLogin(type = 0) {
      if (!this.ssoToken) {
        uni.reLaunch({ url: '/pages/login/index' })
        return
      }
      // 单点登录
      const o = {
        0: '/pages/index/index', // 首页
        1: '/pages/index/index?scan=1' // 首页并触发扫一扫
      }
      if (!(type in o)) return uni.showToast({ title: '请检查跳转参数', icon: 'none' })
      const url = encodeURIComponent(`${o[type]}`)
      uni.reLaunch({
        url: `/pages/transfer/index?token=${this.ssoToken}&url=${url}&storeid=${this.ssoStoreId}`
      })
    }
  }
}
