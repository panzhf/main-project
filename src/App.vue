<script>
import { reportLog } from 'packages/utils/report'
let isLaunched = true // 防止启动时上报两次

export default {
  async onLaunch(options) {
    await this.$store.dispatch('initSpecialMp')
    // 获取当前页面路径，如果是指定的页面则不调用主题配置
    const currentPage = getCurrentPages()[0]
    const skipThemePages = ['pages/register-store/index']
    if (currentPage && !skipThemePages.includes(currentPage.route)) {
      this.$store.dispatch('fetchGlobalTheme')
    }
    // #ifdef MP
    if (isLaunched) {
      await reportLog(options)
      isLaunched = false
    }
    this.checkNetwork()
    this.checkUpdate()
    // #endif
  },
  onShow(options) {
    // #ifdef MP
    if (!isLaunched) {
      reportLog(options)
    }
    // #endif
  },
  globalData: {
    isDealerBinded: false
  },
  onPageNotFound(options) {
    if (options.notFound) {
      let url = ''
      if (options.path === 'pages/entry/home/index') {
        url = `/pages/index/index?`
      } else if (options.path === 'cloudShop/pages/order/detail') {
        url = `/cloud-store/order-management/detail?`
      } else if (options.path === 'cloudShop/pages/saleA/detail') {
        url = `/cloud-store/sale-management/order-detail?`
      } else if (options.path === 'cloudShop/pages/appointment/detail') {
        url = `/cloud-store/service-management/detail?`
      } else if (options.path === 'pages/detail/login/index') {
        url = `/pages/login/index?`
      } else if (options.path === 'cloudShop/pages/revenue/WithdrawalDetail') {
        url = `/pages/store-revenue/withdrawal-detail?`
      } else if (options.path === 'cloudShop/pages/memberProduct/dealerBind') {
        url = `/activity-tab/directly-activity/dealer-bind?`
      }
      Object.keys(options.query).map(key => {
        url += key + '=' + options.query[key] + '&'
      })
      // 此处生成的 url 末尾多一个 & , .substring 截取一下
      url = url.substring(0, url.length - 1)
      uni.reLaunch({
        url
      })
    }
  },
  methods: {
    checkUpdate() {
      if (uni.canIUse('getUpdateManager')) {
        const updateManager = uni.getUpdateManager()
        updateManager.onCheckForUpdate(function (res) {
          // 请求完新版本信息的回调
          if (res.hasUpdate) {
            updateManager.onUpdateReady(function () {
              // 强制小程序重启并使用新版本
              updateManager.applyUpdate()
            })
            updateManager.onUpdateFailed(function () {
              // 新的版本下载失败
              uni.showModal({
                title: '已经有新版本了~',
                content: '新版本已经上线啦~ 请您删除当前小程序，重新搜索打开~'
              })
            })
          }
        })
      } else {
        // 如果希望用户在最新版本的客户端上体验您的小程序
        uni.showModal({
          title: '提示',
          content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
        })
      }
    },
    checkNetwork() {
      uni.onNetworkStatusChange(res => {
        if (!res.isConnected) {
          uni.showToast({
            title: '请检查你的网络',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
@import 'uview-ui-v1/index.scss';
/*每个页面公共css */
@import '~@/styles/common.scss';

@import '~@/packages/src/styles/icon.css';
@import '~@/packages/src/styles/mdfont.css';
// 权重问题，优先以主体小程序的样式为准
@import '~@/styles/iconfont.css';
.announce-notice {
  .uni-noticebar {
    padding: 0 !important;
    margin-bottom: 0 !important;
    font-size: 13px;
  }
}
</style>
