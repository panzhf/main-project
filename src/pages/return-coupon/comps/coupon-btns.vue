<template>
  <view :style="themeVars">
    <view class="coupon-bottom flex flex-middle">
      <!-- <button class="primary-btn round inverse flex-1" @tap="handleBack">返回</button> -->
      <button class="primary-btn round inverse flex-1" @tap="handleContactLeader">联系上级报销</button>
      <button
        :disabled="storageTotalCount === 0"
        class="primary-btn round flex-1 flex center-middle tx-c ml-20"
        style="line-height: 105%"
        @tap="handleShowCode"
      >
        <view class="pt-10">
          <view>出示店铺码</view>
          <view class="fs-22 fw-normal opacity-40">(报销请出示店铺码)</view>
        </view>
      </button>
    </view>
    <Code ref="codeRef"></Code>
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import Code from '@/components/pop/code.vue'
import { mapState } from 'vuex'
import { storeHeadImage } from '@/utils/default-picture'
import overdueMixin from 'packages/mixins/overdue'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: {
    Code
  },
  mixins: [
    overdueMixin,
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return { defaultHeadImg: storeHeadImage, storeId: 0 }
  },
  computed: {
    ...mapState(['storeInfo'])
  },
  methods: {
    handleShowCode() {
      if (!this.overdueChecked()) return
      uni.getStorageSync('storeSettingInfo')
      // 显示门店码
      let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo'))
      const { storeId } = storeSettingInfo
      let codeInfo = {
        headPic: this.storeInfo.shopfor || this.defaultHeadImg,
        name: this.storeInfo.storename,
        code: this.storeInfo.exchangecode,
        storeId: storeId
      }
      this.$refs.codeRef.showDialog(codeInfo)
    },
    handleBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack()
        return
      }
      uni.reLaunch({ url: '/pages/index/index' })
    },
    handleContactLeader() {
      // 联系上级
      uni.navigateTo({
        url: '/pages/return-coupon/contact'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.coupon-bottom {
  width: 100%;
  box-sizing: border-box;
  padding: 10rpx 30rpx 30rpx;
  height: 130rpx;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 2;
  background: #f5f5f5;
  .primary-btn {
    width: 200rpx;
  }
  .select-all {
    line-height: 80rpx;
  }
}
</style>
