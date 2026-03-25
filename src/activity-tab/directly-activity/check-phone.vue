<template>
  <view class="container" :style="themeVars">
    <view class="itemWrapper" style="background: #f7f7f7; line-height: 1.5">
      为了您的账户安全，需要向当前{{ RoleType === '3' ? '门店' : '经销商' }}负责人手机号发送验证码，请注意短信查收。
    </view>
    <view class="itemWrapper">
      <view class="item border-b">
        <view class="loginInput">
          <input
            v-model="showMobile"
            type="number"
            disabled
            placeholder="负责人手机号码"
            placeholder-style="color: #bfbfbf"
          />
          <view :class="['button', 'g-message', canClick ? '' : 'disabled']" @tap.stop="SendPhoneMessage">
            {{ canClick ? '获取验证码' : second + '秒' }}
          </view>
        </view>
      </view>
      <view class="item border-b">
        <view class="loginInput">
          <input v-model="CherkCode" type="number" placeholder="请输入6位验证码" placeholder-style="color: #bfbfbf" />
        </view>
      </view>
      <view class="item check">
        <view :class="['button', 'button--large', CherkCode ? '' : 'disabled']" @tap="CherkPhoneMessage">立即验证</view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import bindPhone from '@/mixins/bind-phone'
export default {
  mixins: [bindPhone],
  data() {
    return {
      RoleType: '', // 角色类型必须为 0 门店 1 分销员 2 直营经销商 3 门店直营分佣钱包
      Headpath: '',
      NickName: '',
      DealerId: '',
      CherkCode: '',
      ClerkRegistration: {},
      second: 60,
      countdownInterval: -1,
      canClick: true
    }
  },

  onLoad(optinos) {
    this.Headpath = optinos.Headpath || ''
    this.NickName = optinos.NickName || ''
    this.MemberLogin = optinos.m || ''
    this.DealerId = optinos.DealerId || ''
    this.Mobile = optinos.mobile || ''
    this.RoleType = optinos.RoleType || ''
    let reg = /^(\d{3})\d*(\d{4})$/
    this.showMobile = this.Mobile.replace(reg, '$1****$2')
  },

  onUnload() {
    // 清除定时器
    clearInterval(this.countdownInterval)
  },

  methods: {
    SendPhoneMessage() {
      if (!this.canClick) return
      if (this.RoleType === '3') {
        let data = {
          Mobile: this.Mobile,
          MemberLogin: this.MemberLogin
        }
        apiCloud({
          url: '/api/v1/Withdrawa/SendPhoneMessage',
          method: 'post',
          data: JSON.stringify(data)
        })
          .then(res => {
            if (res.return_code !== 300012) {
              this.canClick = false
              this.countdown()
            }
            this.$msg(res.return_msg)
          })
          .catch(error => {
            this.$msg(error.return_msg)
          })
      } else {
        let data = {
          Mobile: this.Mobile,
          MemberLogin: this.MemberLogin
        }
        apiCloud({
          url: '/api/v1/DirectlyApi/SendPhoneMessage',
          method: 'post',
          data: JSON.stringify(data)
        })
          .then(res => {
            if (res.return_code !== 300012) {
              this.canClick = false
              this.countdown()
            }
            this.$msg(res.return_msg)
          })
          .catch(error => {
            this.$msg(error.return_msg)
          })
      }
    },
    CherkPhoneMessage() {
      if (!this.CherkCode) return
      if (this.RoleType === '3') {
        this.handleCherkPhone(this.openid, this.Headpath, this.NickName, this.CherkCode, 3)
      } else {
        // 经销商绑定逻辑暂时不改，已迁移到经销助手
        let data = {
          CherkCode: this.CherkCode,
          Mobile: this.Mobile
        }
        apiCloud({
          url: '/api/v1/DirectlyApi/CherkPhoneMessage',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (this.$ck(res)) {
            this.$msg(res.return_msg || '验证成功')
            setTimeout(() => {
              uni.navigateTo({
                url: `/pages/authorization-page/index?m=${this.MemberLogin}&d=${this.DealerId}&Headpath=${this.Headpath}&NickName=${this.NickName}&DirectlyAssetsOpenID=1&RoleType=${this.RoleType}`
              })
            }, 300)
          }
        })
      }
    },
    countdown() {
      let nsecond = 60
      clearInterval(this.countdownInterval)
      this.countdownInterval = setInterval(() => {
        nsecond -= 1
        this.second = nsecond
        if (nsecond < 1) {
          clearInterval(this.countdownInterval)
          // 取消指定的setInterval函数将要执行的代码
          this.second = 60
          this.canClick = true
        }
      }, 1000)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
button {
  background: transparent;
  border-radius: 0;
  box-sizing: content-box;
  text-align: left;
}
.container {
  background-color: #f7f7f7;
  overflow: hidden;
  padding-bottom: 30rpx;
}
.itemWrapper {
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
}
.item {
  line-height: 80rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  position: relative;
}
.loginInput {
  font-size: 30rpx;
  box-sizing: border-box;
  padding: 20rpx 0;
  width: 600rpx;
  input {
    border: none;
    width: 100%;
    height: 90rpx;
  }
  .g-message {
    width: 190rpx;
    position: absolute;
    z-index: 99;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    background-color: transparent;
    color: var(--theme-color, $uni-color-primary);
    border: 1px solid var(--theme-color, $uni-color-primary);
  }
}
.label {
  flex: 1;
  color: #333;
}
.content {
  color: #666;
}
.click {
  color: #579bfb;
}
.border-b {
  border-bottom: 1px solid #eee;
}
.check {
  padding: 50rpx 0 20rpx;
  margin: 0 auto;
  width: 420rpx;
}
.disabled {
  background-color: #ccc;
}
</style>
