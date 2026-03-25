<template>
  <view class="full-container flex flex-middle flex-center flex-column invite" :style="themeVars">
    <view class="invite-tips fs-28 c-3">
      <text
        v-show="inviteObj.inviteTips"
        class="pr-50 pt-20 pb-20"
        @tap="showTips(inviteObj.inviteTips, '确定', '温馨提示')"
      >
        邀请须知
        <text class="icon iconfont icon-tips edit-color ml-20"></text>
      </text>
    </view>
    <view v-if="showTab" class="tab-box flex">
      <view
        v-for="item in tabTitle"
        :key="item.id"
        class="tab-item flex-1"
        :class="tabId === item.id ? 'active' : ''"
        @tap="handleTab(item.id)"
      >
        {{ item.name }}
      </view>
    </view>
    <view class="qrcode-container" :style="{ backgroundImage: `url(${bgURL})` }">
      <view class="header fs-40 text-center mt-50">
        <view class="fs-30 name mt-10">@{{ ellipsis(info.memberloginname || '') }}</view>
        <view class="c-2 fs-30 fw-bold">{{ inviteObj.theme || '' }}</view>
      </view>
      <image v-if="localQrInfo" :src="localQrInfo" class="qrcode" />
      <view v-else class="code-loading">
        <view v-if="busy" class="mt-30">
          二维码正在生成
          <u-loading mode="circle" class="ml-20"></u-loading>
        </view>
        <view v-else>请重试！</view>
      </view>
    </view>
    <view class="mt-20 fs-26 c-6 ml-50 mr-50">
      {{ inviteObj.useTips }}
    </view>
    <view class="btn-group">
      <button class="primary-btn round" :disabled="!localQrInfo" @tap="saveImg">保存到手机</button>
    </view>
    <canvas canvas-id="myCanvas" style="position: fixed; left: -10000px; width: 590px; height: 714px"></canvas>
    <canvas
      v-if="showQrCanvas"
      canvas-id="myCanvas2"
      style="position: fixed; left: -10000px; width: 200px; height: 200px"
    ></canvas>
    <canvas canvas-id="myCanvas1" style="position: fixed; left: -10000px; width: 430px; height: 430px"></canvas>
    <common-popup
      v-model="showPopup"
      :tab-index="popType"
      :title="popTitle"
      :content="popContent"
      :tip="popTips"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetCode } from '@/api/guide'
import SaveImgMixin from '@/mixins/save-image'
import commonPopupMixin from 'packages/mixins/common-popup'
import { staticURL } from '@/config'
import imgMixin from 'packages/mixins/img'
export default {
  name: 'Invite',
  mixins: [SaveImgMixin, commonPopupMixin, imgMixin],
  data() {
    return {
      info: {},
      bgURL: `${staticURL(true)}invite/invite-code-bg.png`,
      qrURL: '',
      localBgInfo: '', // 图片本地信息
      localQrInfo: '',
      role: 0, // 1导购员
      tabId: 0, //0 注册  1激活
      showTab: 0, // 显示切换
      tabTitle: [
        { name: '邀请注册', id: 0 },
        { name: '账号激活', id: 1 }
      ],
      busy: false,
      roleInfo: {
        // 1导购员
        1: [
          {
            theme: '邀请导购员注册',
            inviteTips: '',
            useTips: '使用方式：导购员使用【微信扫一扫】功能扫码注册',
            canvasTheme: '邀请你注册导购员',
            canvasTips: ''
          },
          {
            theme: '邀请导购员激活',
            inviteTips: '',
            useTips: '使用方式：若导购员信息已被门店添加，导购员可使用【微信扫一扫】功能扫码激活导购员账号。',
            canvasTheme: '邀请你激活导购员',
            canvasTips: ''
          }
        ]
      },
      inviteObj: {
        theme: '',
        inviteTips: '',
        useTips: '',
        canvasTheme: '',
        canvasTips: ''
      },
      barTitle: {
        1: '邀请导购员'
      },
      showQrCanvas: false // canvas需要清除原来生成的内容，防止生成空白码
    }
  },
  computed: {},
  onLoad(options) {
    /*  
       role： 角色  1导购员  
       tabid：进来要显示的tab    
       showtab：1 显示tab 0不显示tab
       跳转进来链接 /pagesA/invite/index?role=2&tabId=1&showTab=1
    */
    options.role && (this.role = Number(options.role))
    options.tabId && (this.tabId = Number(options.tabId))
    options.showTab && (this.showTab = Number(options.showTab))
    if (!this.role) {
      this.$msg('参数出错，请重试！')
      setTimeout(() => {
        this.$goBack()
      }, 2000)
      return
    }
    uni.setNavigationBarTitle({
      title: this.barTitle[this.role]
    })
    this.initInfo()
    this.createCode()
  },
  onShareAppMessage() {},
  methods: {
    async createCode() {
      if (this.busy) return
      this.busy = true
      this.inviteObj = this.roleInfo[this.role][this.tabId]
      this.$loading.show()
      try {
        await this.getQrcode()
      } catch (err) {
        this.$msg(err?.raturn_msg || '网络繁忙，请重试！')
        this.hideLoading()
        this.$uploadLog({
          type: 'invite',
          desc: '请求邀请码',
          data: err || {}
        })
      }
      Promise.all([this.getBg(), this.getQR()])
        .then(() => {
          this.createImg()
        })
        .catch(err => {
          this.hideLoading()
          this.$uploadLog({
            type: 'invite',
            desc: '生成邀请码',
            data: err || {}
          })
        })
      this.hideLoading()
    },
    hideLoading() {
      setTimeout(() => {
        this.busy = false
        this.$loading.hide()
      }, 2000)
    },
    async getQrcode() {
      const { memberlogin, storeid } = this.info
      return new Promise((resolve, reject) => {
        switch (this.role) {
          case 1:
            apiGetCode({
              type: 2, //小程序码类型 (1-登录,2-注册/激活)
              scene: `m=${memberlogin}&t=${this.tabId === 0 ? 1 : 2}&st=${storeid}&g=-1`
              /*m 品牌商编号
                t 类型(1注册,2激活)
                g 导购员分组id -1全部身份
                s 业务员id
                st 门店id
              */
            })
              .then(res => {
                if (this.$ck(res)) {
                  this.qrURL = this.formatImg(res.return_data.codeurl || '')
                  resolve()
                } else {
                  reject(res)
                }
              })
              .catch(err => {
                reject(err)
              })
            break
        }
      })
    },
    handleTab(id) {
      if (this.busy) return
      this.tabId = id
      this.qrURL = ''
      this.localQrInfo = ''
      this.createCode()
    },
    async getQR() {
      await this.reDrawQR()
    },
    createImg() {
      const vm = this
      const ctx = uni.createCanvasContext('myCanvas')
      ctx.fillStyle = '#ffffff'
      ctx.save()
      ctx.fillRect(0, 0, 590, 714)
      ctx.drawImage(this.localBgInfo, 0, 0, 590, 714)
      // 邀请文字
      ctx.setFillStyle('#000')
      ctx.setFontSize(30)
      ctx.setTextAlign('center')
      ctx.fillText(this.inviteObj.canvasTheme, 295, 139)

      ctx.setFillStyle('#FF960D')
      ctx.setFontSize(32)
      ctx.setTextAlign('center')
      ctx.fillText(`@${this.ellipsis(this.info.memberloginname)}`, 295, 88)
      // 小程序码
      ctx.drawImage(this.localQrInfo, 113, 226, 362, 362)

      // 提示文字
      ctx.setFontSize(20)
      ctx.setTextAlign('center')
      ctx.setFillStyle('#666')
      ctx.fillText(this.inviteObj.canvasTips, 295, 650)
      // 生成图片
      ctx.draw(false, function () {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            destWidth: 590,
            destHeight: 714,
            canvasId: 'myCanvas',
            fileType: 'jpg',
            success(res) {
              vm.shareImg = res.tempFilePath
              vm.$loading.hide()
            },
            complete() {
              vm.$loading.hide()
            },
            fail(err) {
              console.log(err)
            }
          })
        }, 200)
      })
    },
    initInfo() {
      const {
        memberLogin: memberlogin,
        memberLoginHeadPath: logo,
        storeId: storeid,
        memberLoginName: memberloginname
      } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')

      this.info = { memberlogin, memberloginname, logo, storeid }
      // 防止小图模糊 和 图片格式不规范（http://xxx, //xxx）
      if (this.info.logo) {
        this.info.logo = this.info.logo
          .replace('imageView2/2/w/160', 'imageView2/2/w/320')
          .replace(/^(http:)?(\/\/)/, 'https:$2')
      }
    },
    async getBg() {
      let res = await this.getImgInfo(this.bgURL)
      if (res) {
        this.localBgInfo = res.path
      }
    },
    async reDrawQR(canvasId = 'myCanvas1') {
      const localQr = await this.getImgInfo(this.qrURL)
      // 没有品牌logo
      if (!this.info.logo) {
        this.localQrInfo = localQr.path
        return Promise.resolve()
      }
      // 如果有品牌logo，小程序码logo换成品牌商的
      const localHead = await this.getImgInfo(this.info.logo)
      return new Promise(resolve => {
        const vm = this
        const ctx = uni.createCanvasContext(canvasId)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 430, 430)
        ctx.drawImage(localQr.path, 0, 0, 430, 430)
        // 在原小程序码图片中间叠加一个logo图层
        ctx.save()
        ctx.beginPath()
        ctx.arc(215, 215, 95, 0, 2 * Math.PI)
        ctx.clip()
        ctx.drawImage(localHead.path, 120, 120, 190, 190)
        ctx.restore()

        ctx.draw(false, function () {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              destWidth: 430,
              destHeight: 430,
              canvasId,
              fileType: 'jpg',
              success(res) {
                // 生成的本地图片可以用作分享
                vm.localQrInfo = res.tempFilePath
                console.log('vm.localQrInfo', vm.localQrInfo)
                resolve()
              }
            })
          }, 200)
        })
      })
    },
    ellipsis(s) {
      return !!s && s.length > 10 ? s.slice(0, 10) + '...' : s
    }
  }
}
</script>
<style lang="scss" scoped>
$prefix: invite;
.#{$prefix} {
  background-color: #f8f8f8;
  .tab-box {
    margin-bottom: 50rpx;
    width: 552rpx;
    height: 82rpx;
    line-height: 82rpx;
    background: #ffffff;
    border: 1px solid #e4e8fe;
    border-radius: 10rpx;
    overflow: hidden;
    &.forbid {
      opacity: 0.5;
    }
    .tab-item {
      font-size: 30rpx;
      font-weight: bold;
      text-align: center;
      color: #222;
      &.active {
        background: var(--theme-color, $uni-color-primary);
        color: #fff;
      }
    }
  }
  .invite-tips {
    height: 50rpx;
    width: 100%;
    margin: 30rpx 0;
    text-align: right;
  }
  .qrcode-container {
    position: relative;
    @include wh(590rpx, 674rpx);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    .header {
      color: #000;
      .name {
        color: #ff960d;
      }
    }
    .code-loading {
      text-align: center;
      padding: 100rpx 0 0 0;
      line-height: 200rpx;
      font-size: 28rpx;
      color: #999;
    }
    .qrcode-bar {
      position: absolute;
      top: 225rpx;
      left: 102rpx;
      @include wh(406rpx);
    }
    .qrcode {
      position: absolute;
      top: 243rpx;
      left: 50%;
      transform: translateX(-50%);
      @include wh(330rpx);
    }
  }
  .btn-group {
    margin: 90rpx 0;
    width: 580rpx;
    .wechat-icon {
      font-weight: normal;
      color: #07c15f;
    }
  }
}
</style>
