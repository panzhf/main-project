<template>
  <view class="invite" :style="themeVars">
    <view v-if="!loading">
      <view class="lable">
        审核说明
        <text class="iconfont icon-explain" @click="showPopup = true"></text>
      </view>
      <view class="code-content" :style="{ 'background-image': `url(${codeBg})` }">
        <img class="code" :src="codeImg" alt="" />
      </view>
      <view class="tips">使用方式：店员使用【微信扫一扫】功能扫码注册</view>
      <button class="invite" open-type="share">通过微信邀请</button>
    </view>

    <common-popup v-model="showPopup" type="tip" title="提示" content="店员需审核通过后才可登录"></common-popup>
    <common-popup v-model="Popup" type="tip" title="温馨提示" :content="popContent"></common-popup>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiGetRegisterCode } from '@/api/sales'

export default {
  data() {
    return {
      codeBg: staticURL() + 'sales/code-bg.png',
      showPopup: false,
      shareQuery: '',
      mainpartName: '',
      codeImg: '',
      Popup: false,
      popContent: '', // 弹窗内容
      loading: true
    }
  },
  onLoad() {
    this.getData()
  },

  onShareAppMessage() {
    return {
      title: `${this.mainpartName}邀请您注册为店员`,
      path: `/sales-clerk/register?${this.shareQuery}`,
      imageUrl: this.codeImg
    }
  },
  methods: {
    showTips(content) {
      // 显示提示信息
      this.popContent = content
      this.Popup = true
    },
    async getData() {
      let info = JSON.parse(uni.getStorageSync('storeSettingInfo') || {})
      this.mainpartName = info.mainpartName
      let s = info.storeId
      let m = info.memberLogin
      let shareQuery = `s=${s}&m=${m}`
      this.shareQuery = shareQuery
      let res = await apiGetRegisterCode({
        page: 'sales-clerk/register',
        param: shareQuery
      })
      if (this.$ck(res, false)) {
        this.codeImg = res.return_data.codeurl
        this.loading = false
      } else {
        this.showTips('接口异常，请联系管理员')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.invite {
  overflow: hidden;
  .lable {
    margin-top: 40rpx;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #333333;
    padding-right: 20rpx;
    .icon-explain {
      font-size: 30rpx;
      margin: 0 10rpx;
      color: var(--theme-color, $uni-color-primary);
      width: 50rpx;
      height: 50rpx;
      line-height: 50rpx;
      text-align: center;
    }
  }
  .code-content {
    width: 600rpx;
    height: 566rpx;
    background-size: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    margin-top: 50rpx;
    .code {
      width: 400rpx;
      height: 400rpx;
    }
  }
  .tips {
    margin-top: 40rpx;
    text-align: center;
    font-size: 26rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #666666;
  }
  .invite {
    width: 580rpx;
    height: 90rpx;
    // background: #ff7640;
    background: var(--theme-color, $uni-color-primary);
    border-radius: 45rpx;
    font-size: 36rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #ffffff;
    line-height: 90rpx;
    text-align: center;
    margin: 0 auto;
    margin-top: 108rpx;
  }
}
</style>
<style>
page {
  background-color: #fff;
}
</style>

