<template>
  <view :style="themeVars">
    <GuideForm v-if="step === 1 && showForm" :form-type="0" :loading="busy" :m="m" @submit="handleSubmit" />
    <template v-if="step === 2">
      <view class="success-content bg-f flex flex-column flex-middle">
        <text class="iconfont icon-success"></text>
        <view class="fs-36 fw-bold">保存成功</view>
        <view class="tips fs-28 tx-c">
          温馨提示：手动添加的导购员需邀请导购员激活，激活成功后导购员才可登录金牌导购员小程序，参与品牌活动及奖励的发放
        </view>
        <button class="primary-btn round" hover-class="button-action" @tap="handleGoActivate">邀请导购员激活</button>
        <button class="primary-btn round plain" hover-class="button-action" @tap="handleGoBack">完成</button>
      </view>
    </template>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import privacyMixin from 'packages/mixins/privacy'
import GuideForm from 'packages/components/guide/guide-register.vue'
import { apiAddGuide } from '@/api/guide'
export default {
  name: 'AddStore',
  components: {
    GuideForm
  },
  mixins: [privacyMixin],
  data() {
    return {
      step: 1, // 1注册/修改  2注册保存成功
      showForm: false,
      busy: false
    }
  },
  computed: {
    storeInfo() {
      return JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    },
    m() {
      return this.storeInfo.memberLogin
    },
    storeId() {
      return this.storeInfo.storeId
    },
    invite() {
      const { ismdinvitationdgregister } = this.$store.state.guideManage
      return ismdinvitationdgregister
    }
  },
  async onLoad() {
    this.showForm = true
  },
  methods: {
    async handleSubmit(param) {
      let p = {
        ...param,
        dealerstoreid: this.storeId,
        isreviewstoreid: 0,
        operatetype: 1,
        salesmanid: 0,
        salerimg: param.salerimg.slice(0, 3).join(',')
      }
      if (this.busy) return
      this.busy = true
      const res = await apiAddGuide(p)
      if (this.$ck(res)) {
        this.step = 2
        this.$store.commit('updateRefreshTag', true)
      }
      this.busy = false
    },
    handleGoActivate() {
      const tab = this.invite ? 1 : 0
      uni.redirectTo({
        url: `/pagesA/invite/index?role=1&tabId=1&showTab=${tab}`
      })
    },
    handleGoBack() {
      this.$goBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.form-box {
  padding: 30rpx 0 0 30rpx;
  background: #fff;
  .form-title {
    position: relative;
    margin: 15rpx 0;
    color: #000;
    font-size: 32rpx;
    font-weight: 700;
  }
  .input {
    height: 108rpx;
    text-align: right;
    color: #666;
    line-height: 108rpx;
    &.input-disbaled {
      color: #ccc;
    }
  }
}
.mobile-btn {
  width: 200rpx;
  padding: 12rpx;
  color: #0f80ff;
  border: 1rpx solid #0f80ff;
  border-radius: 28rpx;
  background-color: #fff;
  font-size: 24rpx;
  font-weight: 500;
}
.btn-group {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  height: 140rpx;
  background: #fff;
  .primary-btn {
    margin: 25rpx 85rpx 0;
  }
}
.store-item + .store-item {
  margin-top: 10rpx;
}
.success-content {
  height: 100vh;
  .icon-success {
    font-size: 110rpx;
    color: #58be6b;
    margin-top: 120rpx;
    margin-bottom: 50rpx;
  }
  .tips {
    margin-top: 40rpx;
    width: 630rpx;
    padding: 20rpx;
    background: #f4f4f4;
    color: #ff7640;
    border-radius: 10rpx;
  }
  .primary-btn {
    width: 640rpx;
    margin-top: 100rpx;
    &.plain {
      margin-top: 40rpx;
    }
  }
}
</style>
