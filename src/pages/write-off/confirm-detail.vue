<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <!-- 订单部分 start -->
      <view class="top-text">
        <view class="img">
          <image :src="success" mode="scaleToFill" class="soldOut" lazy-load="false" />
        </view>
        <view class="tips">核销成功啦！</view>
      </view>
      <view class="check-item">
        <view class="check-item__text">
          <span style="width: 10rpx; height: 28rpx; color: #ff5e33; margin-bottom: 20rpx">|</span>
          <span style="margin-left: 10rpx">核销详情</span>
        </view>
        <view class="check-item__header">
          <view>核销人：{{ CheckOrderUserName }}</view>
          <view>核销时间：{{ CheckTime }}</view>
        </view>
        <view class="check-item__body">
          <block v-for="(product, index) in list" :key="index">
            <view style="background-color: #f9f9f9">
              <ProductCard
                :is-goods-check-order.sync="IsGoodsCheckOrder"
                :product="product"
                :index="index"
                class="mt-10"
              ></ProductCard>
            </view>
          </block>
        </view>
        <!-- 订单部分 end -->
      </view>
      <view style="padding: 40rpx 20rpx; display: flex; justify-content: space-around">
        <view class="button button--round button--large" style="width: 46%" @tap="handleGoList">查看核销记录</view>
        <view class="button button--round button--large" style="width: 46%" @tap="handleConfirm">继续核销</view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import ProductCard from './comps/product-card'
import { staticURL } from '@/config'
import ScanSound from '@/mixins/scan-sound'
export default {
  components: {
    ProductCard
  },
  mixins: [ScanSound],
  data() {
    return {
      scene: 0, // 场景值
      IsGoodsCheckOrder: 1, // 是否商品核销码订单(订单商品是否具体单独核销码)0-否1-是
      CheckOrderUserName: '',
      CheckTime: '',
      success: staticURL() + 'personal/scuuse.png',
      CheckCodes: [],
      OrderNumber: '',
      type: 0, // 用于判断是否是推荐有礼商品，有推荐有礼则type为1
      page: {
        index: 1,
        size: 10,
        total: 0
      },
      list: [],
      isLoaded: false
    }
  },
  async onLoad(option) {
    const obj = uni.getLaunchOptionsSync()
    this.scene = obj.scene || 0
    this.OrderNumber = option.orderNumber || ''
    this.type = parseInt(option.type) || 0
    this.handleSoundResult(true)
    if (this.type !== 1) {
      await this.getOrderList()
    } else {
      this.CheckOrderUserName = option.CheckUserName || ''
      this.CheckTime = option.CheckTime || ''
      this.list = JSON.parse(option.List)
    }
  },
  methods: {
    handleGoList() {
      if (this.type === 1) {
        uni.navigateTo({
          url: `/pages/management/verification-mgm?type=4`
        })
      } else {
        uni.navigateTo({
          url: `/pages/management/verification-mgm?type=3`
        })
      }
    },
    handleConfirm() {
      this.checkOrderFn()
    },
    // 扫核销码
    checkOrderFn() {
      uni.scanCode({
        success: res => {
          let { result } = res
          // 自动过滤首尾无效字符（空格、换行、制表符）
          result = result.trim()
          if (!result) return this.$msg('扫码失败，请重试')
          let fdStart2 = result.indexOf('/ordercheck/?orderNumber')
          let data = result.split(',')
          if (fdStart2 > 0) {
            data = result.split('&')
            if (data.length === 0) return this.$msg('扫码失败，请重试')
            data[0] = data[0].split('=')[1]
            data[1] = data[1].split('=')[1]
            data[2] = data[2] && data[2].split('=')[1]
            data[3] = data[3] && data[3].split('=')[1]
          }
          if (data.length === 0) return this.$msg('扫码失败，请重试')
          uni.reLaunch({
            url: `./scan-code?orderNumber=${data[0]}&checkCode=${data[1]}&type=${data[2]}&CheckCodeTimestamp=${
              data[3]
            }&scene=${data[4] || 0}`
          })
        },
        fail: () => {
          this.$msg('扫码失败，请重试')
        }
      })
    },
    getOrderList() {
      return new Promise(resolve => {
        let data = {
          orderNumber: this.OrderNumber, //订单号
          Source: this.scene || 0 // 微信场景值
        }
        apiCloud({
          url: '/api/v1/Order/OrderDetail',
          method: 'get',
          data: JSON.stringify(data)
        }).then(res => {
          resolve()
          if (this.$ck(res)) {
            this.list = res.return_data.OrderItems || []
            this.CheckOrderUserName = res.return_data.CheckOrderUserName || ''
            this.CheckTime = res.return_data.CheckTime || ''
            this.IsGoodsCheckOrder = res.return_data.IsGoodsCheckOrder
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.top-text {
  background-color: #f7f7f7;
  font-size: 24rpx;
  color: var(--theme-color, $uni-color-primary);
  height: 330rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .img {
    width: 136rpx;
    margin-left: -26rpx;
    .soldOut {
      width: 100%;
      height: 100rpx;
    }
  }
  .tips {
    margin-top: 10rpx;
    color: #333;
    font-size: 32rpx;
    font-weight: bold;
  }
}
.check-item {
  margin-top: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  .check-item__text {
    display: flex;
    align-items: center;
    height: 90rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #000;
  }
  .check-item__header {
    padding-bottom: 28rpx;
    border-bottom: 1rpx solid #eee;
    line-height: 1.5;
    font-size: 26rpx;
    color: #333;
  }
  .check-item__body {
    margin-top: 20rpx;
  }
  .check-item__footer {
    margin-top: 30rpx;
    .check-item__total {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      .check-item__count {
        font-size: 24rpx;
        color: #444;
      }
      .check-item__amount {
        display: flex;
        align-items: flex-end;
        margin-left: 30rpx;
        .check-item__amount__label {
          font-size: 24rpx;
          color: #444;
        }
        .check-item__amount__value {
          line-height: 1;
          font-size: 32rpx;
          color: #ff5e33;
        }
      }
    }
    .check-item__check {
      margin-top: 25rpx;
      line-height: 36rpx;
      text-align: right;
      font-size: 24rpx;
      color: #444;
    }
  }
}
.search {
  margin: 30rpx 20rpx;
}
</style>
