<template>
  <view class="container">
    <view class="wrapper">
      <view v-if="m && !isDealerBinded" class="main">
        <view class="tips" style="font-size: 34rpx; font-weight: bold; color: #474747; text-align: center">
          是否绑定当前登录的微信号为提现账户？
        </view>
        <view class="invite" style="color: #bbbbbb; font-size: 26rpx; margin-top: 15rpx; text-align: center">
          （绑定后，提现金额将直接发到该微信零钱账户）
        </view>
        <view
          v-if="canIUseGetUserProfile"
          class="button button--large button--shadow register-button"
          @tap="getUserProfile"
        >
          确认绑定
        </view>
        <view v-else class="button button--large button--shadow register-button">
          确认绑定
          <button class="auth-button" bindgetuserinfo="handleBind" open-type="getUserInfo"></button>
        </view>
      </view>
      <view v-else-if="isDealerBinded" class="main">
        <text class="iconfont icontixianchenggongicon"></text>
        <view
          class="tips"
          style="font-size: 44rpx; font-weight: bold; color: #474747; text-align: center; margin-top: 40rpx"
        >
          绑定成功
        </view>
      </view>
      <view v-else-if="!isDealerBinded" class="main">
        <text class="iconfont iconzhuyiicon"></text>
        <view
          class="tips"
          style="font-size: 44rpx; font-weight: bold; color: #474747; text-align: center; margin-top: 40rpx"
        >
          绑定失败
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import userInfoMixin from '@/mixins/userInfo-mixin'
import { parseUrlSearch } from '@/utils/set-mp.js'
export default {
  mixins: [userInfoMixin],
  data() {
    return {
      DealerId: '',
      m: '',
      mobile: '',
      isDealerBinded: false
    }
  },
  onLoad(options) {
    if (!options.scene) return
    uni.hideHomeButton()
    const query = parseUrlSearch(decodeURIComponent(options.scene))
    this.DealerId = Number(query.d)
    this.m = query.m
    this.mobile = parseInt(query.p, 32)
  },

  async onShow() {
    this.isDealerBinded = getApp().globalData.isDealerBinded
  },

  methods: {
    getUserProfile() {
      uni.getUserProfile({
        lang: 'zh_CN',
        desc: '用于完善信息',
        success: res => {
          if (res.userInfo) {
            this.doBind(res.userInfo)
          }
        }
      })
    },
    handleBind(e) {
      if (e.detail.userInfo && Object.keys(e.detail.userInfo).length > 0) {
        this.doBind(e.detail.userInfo)
      }
    },
    doBind(u) {
      let Headpath = u.avatarUrl || ''
      let NickName = u.nickName || ''
      uni.navigateTo({
        url: `./check-phone?Headpath=${Headpath}&NickName=${NickName}&m=${this.m}&DealerId=${this.DealerId}&mobile=${this.mobile}&RoleType=2`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.container {
  background-color: #fff;
}
.main {
  padding-top: 220rpx;
  width: 100%;
  text-align: center;
  .name,
  .tips {
    font-weight: bold;
    font-size: 30rpx;
    color: #000;
  }
  .invite {
    margin-top: 35rpx;
    font-size: 28rpx;
  }
  .button.register-button {
    position: relative;
    margin-top: 115rpx;
    margin-left: auto;
    margin-right: auto;
    width: 600rpx;
    height: 90rpx;
  }
  .auth-button {
    position: absolute;
    margin: 0;
    padding: 0;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    opacity: 0;
  }
}
.icontixianchenggongicon {
  color: #02c567;
  font-size: 50rpx;
}
.iconzhuyiicon {
  font-size: 50rpx;
  color: #ff5e33;
}
.wrapper-redBull {
  color: #fcecc1 !important;
  .main-redBull {
    padding-top: 75rpx;
    width: 100%;
    text-align: center;
    .avatar {
      margin-bottom: 40rpx;
      width: 140rpx;
      height: 140rpx;
      border-radius: 50%;
      border: 1rpx solid #ddd;
    }
    .name,
    .tips {
      font-weight: bold;
      font-size: 28rpx;
    }
    .invite {
      font-weight: bold;
      margin-top: 35rpx;
      font-size: 28rpx;
    }
    .register-button {
      position: relative;
      margin-top: 80rpx;
      margin-left: auto;
      margin-right: auto;
      width: 640rpx;
      height: 70rpx;
      line-height: 70rpx;
      color: #d60000;
      font-weight: bold;
    }
    .auth-button {
      position: absolute;
      margin: 0;
      padding: 0;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      opacity: 0;
    }
    .invite-wrap {
      padding-top: 70rpx;
      .invite-title {
        font-weight: bold;
        font-size: 34rpx;
      }
      .invite-text-centent {
        font-size: 28rpx;
        text-align: left;
        padding-top: 14rpx;
        margin-left: 84rpx;
        .invite-text {
          margin: 10rpx 0;
          text {
            margin-right: 20rpx;
          }
        }
      }
    }
    .product {
      width: 65%;
      margin: 50rpx auto 0;
      image {
        width: 100%;
        display: block;
      }
    }
  }
}
</style>
