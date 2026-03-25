<template>
  <view class="page-invite" :style="{ backgroundImage: `url(${bgURL})` }">
    <view v-if="!loading">
      <title-bar showback="true" :title="actTitle"></title-bar>
      <view class="qrcode-container">
        <view class="name">
          {{ actTitle }}
        </view>
      </view>
      <view v-if="status && storeStatus" class="btn-group">
        <view class="text">注册成功后获得活动参与资格</view>
        <image class="btn" :src="icons.register" @tap="handleRegister" />
      </view>
      <view v-else class="btn-group">
        <view class="text">
          {{ !storeStatus ? '邀请人已被删除或禁用，邀请码已失效' : '当前活动已关闭，无法进行注册，请联系品牌商' }}
        </view>
        <image class="btn" :src="icons.registerDisabled" />
      </view>
    </view>
  </view>
</template>

<script>
import TitleBar from '@/components/title-bar/index.vue'
import { staticURL } from '@/config'
import { apiGetInviteDetail } from '@/api/activity'
import { getJsCode } from '@/utils/set-mp'
export default {
  name: 'Invite',
  components: {
    TitleBar
  },
  data() {
    return {
      bgURL: '', // 活动背景图
      status: 0, // 活动状态 0不开启  1开启
      storeStatus: 0, // 门店状态 1正常 0禁用或删除
      actTitle: '', // 活动标题
      m: '', // memberlogin
      id: 0, // 门店ID
      jsCode: '',
      loading: true,
      icons: {
        register: staticURL() + 'acitivity/btn-invite.png',
        registerDisabled: staticURL() + 'acitivity/btn-invite-disabled.png'
      }
    }
  },
  async onLoad(options) {
    uni.hideHomeButton()
    if (options.scene) {
      let scene = decodeURIComponent(options.scene)
      let temp = scene.split('&')
      for (let i = 0; i < temp.length; i++) {
        let params = temp[i].split('=')
        let key = params[0].toLowerCase()
        let val = params[1]
        if (key === 'id') {
          this.id = val
        } else if (key === 'm') {
          this.m = val
        }
      }
    } else {
      this.id = options.id
      this.m = options.m
    }
    this.jsCode = await getJsCode()
    this.getData()
  },
  onShow() {},
  methods: {
    async getData() {
      let res = await apiGetInviteDetail({ memberlogin: this.m, js_code: this.jsCode, storeid: this.id })
      if (this.$ck(res, true)) {
        let { actimgpath, actstatus, storestatus, acttitle } = res.return_data
        this.bgURL = actimgpath
        this.status = actstatus
        this.storeStatus = storestatus
        this.actTitle = acttitle
        this.loading = false
      } else {
        this.loading = false
      }
    },
    handleRegister() {
      uni.reLaunch({
        // url: `/activity-tab/invite/register/register-store?openid=${this.authInfo.openid}&m=${this.m}&id=${this.id}`
        url: `/pages/register-store/index?m=${this.m}&r=${this.id}&s=8`
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
  position: relative;
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
  }
  .btn-group {
    position: absolute;
    bottom: 120rpx;
    left: 0;
    text-align: center;
    z-index: 10;
    width: 100%;
    .text {
      color: #fff;
      font-size: 30rpx;
      margin-bottom: 40rpx;
    }
    .btn {
      width: 540rpx;
      height: 126rpx;
    }
  }
}
</style>
