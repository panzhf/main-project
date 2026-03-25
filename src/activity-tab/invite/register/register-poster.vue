<template>
  <view class="page-invite" :style="{ backgroundImage: `url(${bgURL})` }">
    <title-bar showback="true" title="门店邀请有礼"></title-bar>

    <view class="qrcode-container">
      <view class="name">
        {{ inviteInfo.acttitle }}
      </view>
      <image v-if="qrURL" :src="qrURL" class="qrcode" />
    </view>

    <view class="btn-group flex flex-middle flex-center">
      <image class="btn" :src="icons.save" @tap="saveImg" />
      <button open-type="share" class="share-btn">
        <image class="btn" :src="icons.share" />
      </button>
    </view>
    <canvas canvas-id="myCanvas" style="position: fixed; left: -10000px; width: 750px; height: 1624px"></canvas>
    <canvas canvas-id="myCanvas1" style="position: fixed; left: -10000px; width: 430px; height: 430px"></canvas>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import InviteMixin from './mixins/invite'
import SaveImgMixin from '@/mixins/save-image'
import { apiGetCode } from '@/api/activity'
import TitleBar from '@/components/title-bar/index.vue'
import { staticURL } from '@/config'
export default {
  name: 'Invite',
  components: {
    TitleBar
  },
  mixins: [InviteMixin, SaveImgMixin],
  data() {
    return {
      shareInfo: {
        // 需要后端返回
        sharetitle: '', //分享文案
        shareimg: '' // 分享图标
      },
      icons: {
        save: staticURL() + 'acitivity/btn-save.png',
        share: staticURL() + 'acitivity/btn-share.png'
      },
      m: '', // memberlogin
      id: '' //门店id
    }
  },
  computed: {
    inviteInfo() {
      return this.$store.state.inviteActivityInfo
    },
    bgURL() {
      return this.inviteInfo.actimgpath
    },
    companyName() {
      let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      return storeSettingInfo.memberLoginName
    }
  },
  async onLoad(options) {
    this.m = options.m
    this.id = options.id
    this.$loading.show()
    await this.getQrcode()
    Promise.all([this.getBg(), this.getQR()]).then(() => {
      this.createImg()
    })
  },
  onShareAppMessage() {
    const scene = encodeURIComponent(`id=${this.id}&m=${this.m}`)
    let shareIcon = this.inviteInfo.shareimgpath.replace(/^(http:)?(\/\/)/, 'https:$2')
    return {
      title: `${this.inviteInfo.sharetext}`,
      path: `/activity-tab/invite/register/register-index?scene=${scene}`,
      imageUrl: shareIcon
    }
  },
  methods: {
    getQrcode() {
      return new Promise(resolve => {
        apiGetCode({ page: 'activity-tab/invite/register/register-index' }).then(res => {
          if (this.$ck(res)) {
            this.qrURL = res.return_data.codeurl || ''
          }
          resolve()
        })
      })
    },
    async getQR() {
      // 小程序码logo换成品牌商的
      const localQr = await this.getImgInfo(this.qrURL)
      return new Promise(resolve => {
        const vm = this
        const ctx = uni.createCanvasContext('myCanvas1')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, 430, 430)
        ctx.drawImage(localQr.path, 0, 0, 430, 430)
        ctx.save()
        ctx.draw(false, function () {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              destWidth: 430,
              destHeight: 430,
              canvasId: 'myCanvas1',
              fileType: 'jpg',
              success(res) {
                // 生成的本地图片可以用作分享
                vm.localQrInfo = res.tempFilePath
                resolve()
              }
            })
          }, 200)
        })
      })
    },
    createImg() {
      const vm = this
      const ctx = uni.createCanvasContext('myCanvas')
      ctx.fillStyle = '#000000'
      ctx.save()
      ctx.drawImage(this.localBgInfo, 0, 0, 750, 1624)
      // 邀请文字
      ctx.setFontSize(32)
      ctx.setTextAlign('center')
      ctx.fillText('门店邀请有礼', 400, 88)

      ctx.setFillStyle('#000000')
      ctx.setFontSize(48)
      ctx.setTextAlign('center')
      this.drawText(ctx, this.inviteInfo.acttitle, 380, 880, 487, 48)

      ctx.setFillStyle('#fff')
      ctx.setFontSize(30)
      ctx.setTextAlign('center')
      ctx.fillText('微信长按识别/微信扫一扫注册门店', 400, 1540)

      // 小程序码
      ctx.save()
      ctx.beginPath()
      ctx.arc(390, 1330, 150, 0, 2 * Math.PI)
      ctx.clip()
      ctx.drawImage(this.localQrInfo, 240, 1180, 300, 300)
      ctx.restore()

      // 生成图片
      ctx.draw(false, function () {
        setTimeout(() => {
          uni.canvasToTempFilePath({
            destWidth: 750,
            destHeight: 1624,
            canvasId: 'myCanvas',
            fileType: 'jpg',
            success(res) {
              vm.shareImg = res.tempFilePath
            },
            complete() {
              vm.$loading.hide()
            }
          })
        }, 200)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: page-invite;
.#{$prefix} {
  background-size: 750rpx 1624rpx;
  height: 1624rpx;
  .qrcode-container {
    position: relative;
    .name {
      position: absolute;
      z-index: 1;
      top: 750rpx;
      text-align: center;
      left: 130rpx;
      width: 487rpx;
      height: 128prx;
      font-size: 48rpx;
      font-weight: bold;
      color: #000;
      line-height: 72rpx;
    }
    .qrcode {
      position: absolute;
      z-index: 1;
      top: 1060rpx;
      left: 280rpx;
      border-radius: 50%;
      @include wh(215rpx);
    }
  }
}
.btn-group {
  position: absolute;
  top: 1440rpx;
  left: 0;
  text-align: center;
  z-index: 10;
  width: 100%;
  .btn {
    display: block;
    width: 320rpx;
    height: 110rpx;
  }
  .share-btn {
    background-color: transparent;
  }
}
</style>
