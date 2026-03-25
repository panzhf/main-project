import { apiMpInfo } from '@/api/common'
import { msg } from '@/utils'
const gzhMixin = {
  components: {},
  data() {
    return {
      showMoneyDialog: false,
      mpInfo: { isGetData: false },
      showJfPopup: {
        show: false,
        content: ''
      }
    }
  },
  methods: {
    // 换绑
    handleJfConfirm() {
      this.showJfPopup.show = false
      uni.navigateTo({
        url: '/shop/detail'
      })
    },
    //  跳转小程序
    handleJfcancel() {
      this.openMiniProgram()
    },
    async handleShowPiont() {
      if (!this.mpInfo.isGetData) {
        apiMpInfo({ type: 3 })
          .then(res => {
            if (res.return_code === 0) {
              this.mpInfo = {
                ...res.return_data,
                isGetData: true
              }
              this.handleShowQr()
            } else {
              msg(res.return_msg)
            }
          })
          .catch(() => {
            // 接口异常重置
            // msg('网络开小差，请重试！')
          })
      } else {
        this.handleShowQr()
      }
    },

    async handleShowQr() {
      // 如果有小程序，判断帐号
      if (this.mpInfo.ismp) {
        // 不一致，则弹窗提示
        const ruleInfo = await this.getUserOpenId()
        if (ruleInfo.leaderOpenid !== ruleInfo.userOpenid) {
          this.showJfPopup.content = `当前微信与门店账号绑定微信账号不一致，将以当前微信打开小程序。是否继续打开“${this.mpInfo.miniprogramname}”小程序？`
          return (this.showJfPopup.show = true)
        }

        this.openMiniProgram()
      } else {
        this.showMoneyDialog = true
      }
    },
    openMiniProgram() {
      uni.navigateToMiniProgram({
        appId: this.mpInfo.appid,
        path: '/packages/src/integral/me',
        envVersion: 'release',
        success() {
          // 打开成功
        },
        fail() {
          // msg('跳转小程序失败，请检查小程序ID或页面路径是否正确')
        }
      })
    },
    handleCloseQr() {
      this.showMoneyDialog = false
    }
  }
}
export default gzhMixin
