<template>
  <view v-if="isShow" class="container">
    <view class="mask" @click="handlecloseDialog"></view>
    <view class="content">
      <!-- <image class="avatar" :src="codeInfo.headPic" mode="scaleToFill" /> -->
      <text class="username tx-c">店铺码</text>
      <view class="code-box" :style="{ 'background-image': `url(${codeBg})` }">
        <image class="qrcode" :src="codeInfo.code ? codeInfo.code : defaultCode" mode="scaleToFill" />
      </view>
      <view class="desc">
        <view>1.支持消费者扫店铺码自助核销</view>
        <view>2.支持业务员扫店铺码给门店报销</view>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {},
  data() {
    return {
      codeInfo: {
        headPic: '',
        name: '',
        code: '',
        storeId: ''
      },
      codeBg: staticURL() + 'sales/code-bg.png',
      isShow: false
    }
  },
  methods: {
    showDialog(data) {
      this.codeInfo = data
      this.isShow = true
    },
    handlecloseDialog() {
      this.isShow = false
    }
  }
}
</script>

<style lang="scss" scoped>
.code-box {
  width: 500rpx;
  height: 500rpx;
  background-size: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.container {
  position: fixed;
  z-index: 999;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  .mask {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.7);
  }
  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    width: 580rpx;
    height: 680rpx;
    padding-bottom: 56rpx;
    border-radius: 20rpx;
    background-color: #fff;
    .avatar {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 121rpx;
      height: 121rpx;
      border: 9rpx solid #fff;
      border-radius: 50%;
      background-color: #fff;
    }
    .username {
      width: 420rpx;
      margin-top: 50rpx;
      font-size: 30rpx;
      font-weight: bold;
    }
    .qrcode {
      width: 400rpx;
      height: 400rpx;
    }
    .desc {
      font-size: 24rpx;
      color: #666;
    }
  }
}
</style>
