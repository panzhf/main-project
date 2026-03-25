<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <view class="avatar-box">
        <image :src="defaultAvatar" />
      </view>
      <view class="form">
        <view class="form-cell">
          <view class="form-cell__left">昵称:</view>
          <view class="form-cell__right">
            <input v-model="clerk.NickName" type="text" placeholder="请输入分销员昵称" maxlength="20" />
          </view>
        </view>
        <view class="form-cell">
          <view class="form-cell__left">
            <text class="xing">*</text>
            手机号:
          </view>
          <view class="form-cell__right">
            <input v-model="clerk.MobileNumber" type="number" placeholder="请输入分销员手机号码" maxlength="11" />
          </view>
        </view>
      </view>
      <view class="form-button">
        <button class="primary-btn round" hover-class="button-action" @tap="handleSave">保存</button>
      </view>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg',
      clerk: {
        MobileNumber: '',
        NickName: ''
      }
    }
  },
  methods: {
    handleSave() {
      if (this.clerk.MobileNumber.trim() === '') {
        return this.$msg('请输入手机号码')
      }
      if (!/^1(3|4|5|6|7|8|9)\d{9}$/.test(this.clerk.MobileNumber.trim())) {
        return this.$$msg('请输入正确的手机号码')
      }
      apiCloud({
        url: '/api/v1/DistributionUser/ManualAddDistributionUser',
        method: 'post',
        data: JSON.stringify({ NickName: this.clerk.NickName, MobileNumber: this.clerk.MobileNumber })
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('保存成功', { icon: 'success' })
          setTimeout(() => {
            this.$goBack()
          }, 2000)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.form {
  position: relative;
  border-radius: 30rpx 30rpx 0 0;
  text-align: center;
  z-index: 1;
  .form-cell {
    position: relative;
    display: flex;
    padding: 0 30rpx;
    text-align: left;
    & + .form-cell {
      margin-top: 30rpx;
    }
    .form-cell__left {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 120rpx;
      margin-right: 30rpx;
      font-size: 30rpx;
      color: #333;
      font-weight: bold;
      .xing {
        color: red;
      }
    }
    .form-cell__right {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      height: 80rpx;
      padding: 0 20rpx;
      font-size: 30rpx;
      color: #000;
      background-color: #fff;
      border-radius: 40rpx;
      input {
        width: 100%;
        &::placeholder {
          color: #ababab;
        }
      }
      .iconjiantou {
        font-size: 21rpx;
        color: #999;
        transform: rotate(-90deg);
      }
    }
  }
}
.form-button {
  position: fixed;
  padding: 0 20rpx;
  bottom: 40rpx;
  bottom: calc(40rpx + constant(safe-area-inset-bottom));
  width: 100%;
}
.avatar-box {
  padding: 188rpx 0 110rpx;
  image {
    display: block;
    width: 144rpx;
    height: 144rpx;
    margin: 0 auto;
    border-radius: 50%;
  }
}
</style>
