<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <!-- 订单部分 start -->
      <view class="top-text">
        <view class="img">
          <image :src="fail" mode="scaleToFill" class="soldOut" lazy-load="false" />
        </view>
        <view class="tips">核销失败！</view>
        <view class="tips" style="font-size: 28rpx; font-weight: 400">{{ msg }}</view>
      </view>
      <view v-if="CkeckType === 1" style="padding: 40rpx 20rpx; display: flex; justify-content: space-around">
        <view class="button button--round button--large" style="width: 46%" @tap="handleCanel">取消</view>
        <view class="button button--round button--large" style="width: 46%" @tap="handleScanBar">扫一扫</view>
      </view>
      <view v-else style="padding: 40rpx 20rpx; display: flex; justify-content: space-around">
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
import { staticURL } from '@/config'
import ScanSound from '@/mixins/scan-sound'
export default {
  mixins: [ScanSound],
  data() {
    return {
      scene: 0, //场景值
      OrderNumber: '',
      CkeckType: 0, // 0：不需要扫产品条码进行核销， 1：需要扫产品条码进行核销
      type: 0, // 用于判断是否是推荐有礼商品，有推荐有礼则type为1
      msg: '',
      isShowGift: false,
      fail: staticURL() + 'personal/fail.png'
    }
  },
  onLoad(option) {
    const obj = uni.getLaunchOptionsSync()
    this.scene = obj.scene || 0
    this.msg = option.msg || ''
    this.OrderNumber = option.orderNumber || ''
    this.CkeckType = option.CkeckType - 0 || 0
    this.type = parseInt(option.type) || 0
    this.handleSoundResult(false)
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
    // 取消
    handleCanel() {
      uni.redirectTo({
        url: '/cloud-store/order-management/index'
      })
    },
    // 商品条码扫一扫
    handleScanBar() {
      this.checkOrderBarFn()
    },
    handleConfirm() {
      this.checkOrderFn()
    },
    // 扫条形码
    checkOrderBarFn() {
      uni.scanCode({
        success: res => {
          let { result } = res
          // 自动过滤首尾无效字符（空格、换行、制表符）
          result = result.trim()
          if (!result) return this.$msg('扫码失败，请重试')
          this.checkOrderBar(result)
        },
        fail: () => {
          this.$msg('扫码失败，请重试')
        }
      })
    },
    checkOrderBar(data) {
      // 用于判断是否是推荐有礼商品，有推荐有礼则type为1
      if (this.type === 1) {
        let dataT = {
          CheckCodes: data,
          Id: Number(this.OrderNumber)
        }
        apiCloud({
          url: '/api/v1/Recommend/CheckGiftItemByBarCode',
          method: 'post',
          data: JSON.stringify(dataT)
        }).then(res => {
          if (this.$ck(res)) {
            uni.redirectTo({
              url: `./scan-code?orderNumber=${this.OrderNumber}&type=1`
            })
          }
        })
      } else {
        let dataT = {
          CheckCode: data,
          OrderNum: this.OrderNumber
        }
        apiCloud({
          url: '/api/v1/Order/CheckOrderItemByBarCode',
          method: 'post',
          data: JSON.stringify(dataT)
        }).then(res => {
          if (this.$ck(res)) {
            uni.redirectTo({
              url: `./scan-code?orderNumber=${this.OrderNumber}&type=0`
            })
          }
        })
      }
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.top-text {
  background-color: #fff;
  font-size: 24rpx;
  color: var(--theme-color, $uni-color-primary);
  height: 330rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .img {
    width: 74rpx;
    margin-left: -25rpx;
    .soldOut {
      width: 100%;
      height: 74rpx;
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
