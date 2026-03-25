<template>
  <view v-if="isLoading" :style="themeVars">
    店铺营收
    <view class="top-bg" :style="bgStyle"></view>
    <view class="itemWrapper top-wrapper">
      <view class="top-content">
        <view class="tips">店铺累计总收入（元）</view>
        <view class="price">￥{{ list.TotalRevenue || 0 }}</view>
      </view>
    </view>
    <!-- 门店营收 -->
    <view class="itemWrapper top-wrapper" @click="handleClick(0)">
      <view class="top-store">
        <view class="store">
          <view class="store-hand">门店营收</view>
          <view class="store-hid">
            累计门店收入：
            <text class="count-price">￥{{ list.StoresIncome || 0 }}</text>
          </view>
        </view>
        <view class="icon iconfont icon-arrow-right"></view>
      </view>
    </view>
    <!-- 直营佣金收入 -->
    <view class="itemWrapper top-wrapper" @click="handleClick(1)">
      <view class="top-store">
        <view class="store">
          <view class="store-hand">直营佣金收入</view>
          <view class="store-hid">
            累计直营佣金收入：
            <text class="count-price">￥{{ list.DirectlyCommissionIncome || 0 }}</text>
          </view>
        </view>
        <view class="icon iconfont icon-arrow-right"></view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      list: {},
      isLoading: false,
      appNo: ''
    }
  },
  computed: {
    ...mapState(['isSpecialMp']),
    bgStyle() {
      let style = []
      // if (this.isSpecialMp) {
      //   style.push(`background-image: linear-gradient(${this.themeInfo.color}, #f7f7f7)`)
      // } else {
      //   style.push(`background-image: linear-gradient(#f7725c, #ffb250, #f7f7f7)`)
      // }
      style.push(`background-image: linear-gradient(${this.themeInfo.color}, #f7f7f7)`)
      return style.join(';')
    }
  },
  onLoad() {
    let appNo = JSON.parse(uni.getStorageSync('storeSettingInfo'))
    this.appNo = appNo.appno
    this.getGetStoreRevenue()
  },
  methods: {
    // 获取门店营收
    getGetStoreRevenue() {
      apiCloud({
        url: '/api/v1/Withdrawa/GetStoreRevenue',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          this.list = res.return_data || {}
          this.isLoading = true
        }
      })
    },
    handleClick(type) {
      let flag = this.appNo.includes('YY002')
      if (!flag) return this.$msg('暂无数据')
      let url = type === 0 ? './store-sales' : './directly-commission'
      uni.navigateTo({
        url
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.itemWrapper {
  position: relative;
  z-index: 99;
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
  box-shadow: 0px 0px 6px 0px rgba(153, 153, 153, 0.24);
}
.count-price {
  color: var(--theme-color, #ff3835);
}
.icon-arrow-right {
  color: #999;
  font-size: 20rpx;
}
.top-bg {
  position: absolute;
  top: -20rpx;
  left: 0;
  width: 750rpx;
  height: 400rpx;
  z-index: 1;
}
.top-wrapper {
  .top-content {
    text-align: center;
    padding: 10rpx 95rpx 30rpx;
    .tips {
      font-size: 26rpx;
      color: #666;
      padding-bottom: 50rpx;
    }
    .price {
      font-size: 60rpx;
      padding-bottom: 40rpx;
      font-weight: bold;
      color: var(--theme-color, #ff5e33);
    }
  }
  .top-store {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .store {
      .store-hand {
        font-size: 30rpx;
        margin-bottom: 23rpx;
        font-weight: 700;
      }
      .store-hid {
        font-size: 24rpx;
        font-weight: 500;
      }
    }
  }
}
</style>
