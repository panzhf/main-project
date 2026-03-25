<template>
  <view class="account">
    <view class="header ub-pj flex">
      <view class="left fw-bold fs-32 c-0">绑定微信</view>
      <view v-if="openid" class="right fs-30 c-6">已绑定</view>
      <view v-else class="right fs-30 btn" @tap="handleBind()">立即绑定</view>
    </view>
    <view v-if="openid" class="info-row flex ub-pj">
      <view class="info fs-30 c-3 flex">
        <image class="face avatar-64" :src="avatarUrl || defaultAvatar" mode="aspectFill" lazy-load="false" />
        <text>{{ nickName || '未知' }}</text>
      </view>
      <view class="info-right flex">
        <view v-if="nickName" class="flex flex-middle">
          <view class="fs-30 btn" @tap="handleBindWx()">换绑</view>
          <text class="icon fs-20 iconfont icon-arrow-right"></text>
        </view>
        <templale v-else>
          <view class="fs-30 btn" @tap="userVisible = true">授权头像昵称</view>
        </templale>
      </view>
    </view>
    <view v-if="showTips" class="tips fs-22 mt-20">
      {{
        openid
          ? '此微信用于当前门店账号的开箱扫码等活动参与和门店收入提现， 请谨慎换绑'
          : '此微信用于当前门店账号的开箱扫码等活动参与和门店收入提现'
      }}
    </view>
    <avatar-popup v-model="userVisible" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import AvatarPopup from '@/components/avatar-popup'
import { apiGetStoreNickNamePath, apiBindWxOpenId } from '@/api/common'
import getUserOpenId from '@/mixins/get-user-openid.js'
export default {
  components: {
    AvatarPopup
  },
  mixins: [getUserOpenId],

  data() {
    return {
      userVisible: false,
      nickName: '',
      openid: '',
      avatarUrl: '',
      mobile: '',
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg'
    }
  },
  computed: {
    showTips() {
      const requiredFields = [this.nickName, this.openid, this.avatarUrl]
      const filledFields = requiredFields.filter(Boolean)
      return filledFields.length === 0 || filledFields.length === 3
    }
  },
  created() {
    uni.$on('updateUserAuthInfo', () => {
      this.getData()
    })
    uni.$on('ruleVerifySuccess', () => {
      setTimeout(() => {
        this.handleBind()
      }, 600)
    })
  },
  mounted() {
    this.getData()
  },
  beforeDestroy() {
    uni.$off('updateUserAuthInfo')
    uni.$off('ruleVerifySuccess')
  },
  methods: {
    async handleBindWx() {
      let info = await this.getUserOpenId()
      if (info.userOpenid === info.leaderOpenid) {
        return this.$msg('当前微信与绑定微信一致，不可以换绑')
      }
      uni.navigateTo({
        url: `/shop/mobile/desc?type=2&leaderOldMobile=${this.mobile}`
      })
    },
    getData() {
      apiGetStoreNickNamePath().then(res => {
        if (this.$ck(res)) {
          const { nickname, headpath, openid, mobile } = res.return_data
          this.nickName = nickname
          this.avatarUrl = headpath
          this.openid = openid
          this.mobile = mobile
        }
      })
    },
    async handleBind() {
      let info = await this.getUserOpenId()

      if (info.userOpenid) {
        let res = await apiBindWxOpenId({
          openid: info.userOpenid
        })
        if (this.$ck(res)) {
          uni.reLaunch({ url: `/shop/mobile/result?type=2` })
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.account {
  padding: 40rpx 30rpx;
  background: #fff;
  border-radius: 10rpx;

  .btn {
    color: #0f80ff;
  }

  .info-row {
    margin-top: 30rpx;

    .info {
      align-items: center;
      .face {
        margin-right: 12rpx;
      }
    }

    .info-right {
      align-items: center;
      .icon {
        margin-left: 10rpx;
      }
    }
  }

  .tips {
    background: #fff5f1;
    color: #ff5e33;
    padding: 10rpx;
  }
}
</style>
