<template>
  <view>
    <loading use-default />
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      max-size
      @close="navigate(0)"
    />
  </view>
</template>

<script>
import { apiLoginByToken } from '@/api/common'
import { simplePopupMixin } from '@/mixins/common-popup'
import { getJsCode } from '@/utils/set-mp'
import { setToken } from '@/utils/set-storage'
import Loading from 'packages/components/loading/index.vue'
import { getExtConfig } from '@/config'

export default {
  name: 'Transfer',
  components: {
    Loading
  },
  mixins: [simplePopupMixin],
  data() {
    return {
      path: '',
      storeID: ''
    }
  },
  onLoad(options) {
    const { token, url, storeid } = options
    this.$log.info({
      type: 'transfer',
      desc: '中转页-自动登录',
      data: JSON.stringify(options || {})
    })
    if (!token || !url) {
      this.navigate()
      return
    }
    let path = decodeURIComponent(url)
    if (!path.startsWith('/')) {
      path = '/' + path
    }
    // 可能传值为number类型
    storeid && (this.storeID = storeid.toString())
    this.path = path
    this.getInfo(token)
  },
  onUnload() {
    uni.hideLoading()
    uni.removeStorageSync('hiddenLoading')
  },
  onHide() {
    uni.hideLoading()
    uni.removeStorageSync('hiddenLoading')
  },
  methods: {
    async getInfo(ssotoken) {
      uni.setStorageSync('hiddenLoading', true)
      const params = { ssotoken, js_code: await getJsCode() }
      const res = await apiLoginByToken(params)
      this.$log.info({
        api: 'omnipotentRetail/loginbyssotoken',
        type: 'transfer',
        desc: '中转页-自动登录结果',
        data: JSON.stringify({
          params: params,
          res: res
        })
      })
      if (res.return_code !== 0) {
        this.showTips({
          content: res.return_msg
        })
        return
      }
      const config = getExtConfig()
      uni.setStorageSync('directPath', this.path)
      const { token, accountinfo, accountsyslist: list, totalstores = 0 } = res.return_data
      uni.setStorageSync('token', token)
      uni.setStorageSync('accountinfo', JSON.stringify(accountinfo))
      // accountsyslist返回的是当前品牌商下的门店，totalstores是当前手机号下门店数量
      // 首页和个人中心页，使用storeNumber来判断是否显示门店切换
      uni.setStorageSync('storeNumber', config.isSpecial ? list.length : totalstores)
      if (list.length === 1) return setToken(list[0])
      if (!this.storeID) return this.navigate(1)
      const d = list.find(i => i.systemid === this.storeID)
      setToken(d)
    },
    navigate(mode = 0) {
      const o = {
        0: '/pages/login/index',
        1: '/shop/change?from=transfer'
      }

      uni.reLaunch({
        url: o[mode]
      })
    }
  }
}
</script>
