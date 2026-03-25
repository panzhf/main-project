<template>
  <view :style="themeVars">
    <view style="min-height: 100vh">
      <template v-if="info.couponcode">
        <view class="detail-header-box">
          <view class="detail-header">
            <view v-if="info.status === 1" class="icon iconfont icon-yishiyong diabled-icon"></view>
            <view v-if="info.status === 2" class="icon iconfont icon-yiguoqi diabled-icon"></view>
            <view class="detail-info flex flex-middle">
              <image class="logo" :src="info.voucherimg" />
              <view>
                <view class="name fs-30 c-3 fw-bold">{{ info.vouchername }}</view>
                <view class="fs-30 c-3 fw-bold">面额：{{ info.denominations }}元</view>
              </view>
            </view>
            <view class="detail-date">有效期：{{ info.starttime }} - {{ info.endtime }}</view>
            <view class="coupon-info">
              <image class="code-img" :src="codePath" />
              <view class="code-content">{{ info.couponcode }}</view>
              <view class="tip c-9 fs-24">使用时请向业务员出示此券</view>
              <view
                v-if="info.setinfo.isselfhelp === 1"
                :class="['button', 'base-btn', 'fs-36', info.status !== 0 ? 'dated-button' : '']"
                @tap="handlePickup"
              >
                自助核销
              </view>
              <view class="circle left-circle" :style="{ background: `${info.setinfo.bgcolor}` }"></view>
              <view class="circle right-circle" :style="{ background: `${info.setinfo.bgcolor}` }"></view>
            </view>
          </view>
        </view>
        <view v-if="info.status === 1" class="detail-footer-box fs-28">
          <view class="item-name">核销业务员：{{ info.salesmanname }}</view>
          <view class="item-time">核销时间：{{ info.usetime }}</view>
        </view>
        <view class="detail-footer-box fs-28">
          <view class="item bd-e">
            <text class="key">使用方式：</text>
            <text class="value">业务员核销</text>
          </view>
          <view class="item bd-e flex-column">
            <text class="key">优惠内容：</text>
            <text class="value mt-10">{{ info.discountcontent || '-' }}</text>
          </view>
          <view class="item bd-e">
            <text class="key">客户电话：</text>
            <text class="value">{{ info.servicetel || '-' }}</text>
          </view>
          <view class="item flex-column">
            <text class="key">使用说明：</text>
            <text class="value mt-10">{{ info.instructions || '-' }}</text>
          </view>
        </view>
      </template>
    </view>
    <canvas canvas-id="myCanvas" class="canvas-code"></canvas>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetCouponDetail, apiGetCouponResult } from '@/api/cash-coupon'
import QRCode from '@/libs/qr-code.js'
export default {
  components: {},
  data() {
    return {
      timer: null,
      codePath: '',
      info: {},
      voucherId: 0,
      // expenseId: 0,
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  async onLoad(option) {
    this.voucherId = option.id
    this.getData()
  },
  onShow() {},
  onUnload() {
    this.clearTimer()
  },
  onHide() {
    this.clearTimer()
  },
  onPullDownRefresh() {
    this.clearTimer()
    this.getData()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      let res = await apiGetCouponDetail({ voucherid: this.voucherId })

      if (this.$ck(res, true)) {
        this.info = res.return_data
        this.busy = false
        this.loading = false
        uni.stopPullDownRefresh()
        new QRCode('myCanvas', {
          text: res.return_data.couponcode,
          width: 150,
          height: 150,
          padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
          correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
          callback: res => {
            this.codePath = res.path
          }
        })
        if (this.info.status === 0) {
          // this.findCouponStatus(this.id)
        }
      }
    },
    async findCouponStatus(id) {
      let res = await apiGetCouponResult({ id })
      if (res.return_code === 0) {
        // 核销成功
        this.$msg(res.return_msg)
        let timer = setTimeout(() => {
          this.getData()
          timer && clearTimeout(timer)
        }, 1500)
        this.clearTimer()
      } else if (res.return_code === 50002) {
        // 未核销
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          this.findCouponStatus(id)
        }, 2000)
      }
    },
    clearTimer() {
      this.timer && clearTimeout(this.timer)
    }
  }
}
</script>

<style lang="scss" scoped>
page {
  background: #f4f4f4;
}
.detail-header-box {
  background: var(--theme-color, $uni-bg-color-primary);
  padding: 40rpx 40rpx 50rpx 40rpx;
  .detail-header {
    position: relative;
    overflow: hidden;
    background: #fff;
    border-radius: 5rpx;
    .diabled-icon {
      position: absolute;
      top: 250rpx;
      right: 70rpx;
      font-size: 150rpx;
      z-index: 1;
      color: var(--theme-color, $uni-color-primary);
    }
    .detail-info {
      padding: 36rpx 30rpx 0;
      .logo {
        width: 120rpx;
        height: 120rpx;
        border-radius: 5rpx;
        margin-right: 25rpx;
      }
      .name {
        margin-bottom: 10rpx;
      }
    }
    .detail-date {
      padding: 24rpx 0;
      font-size: 24rpx;
      color: #999;
      text-align: center;
    }
    .coupon-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      border-top: 1rpx dashed #dedede;
      position: relative;
      .circle {
        width: 40rpx;
        height: 40rpx;
        position: absolute;
        top: 0;
        z-index: 1;
        background: var(--theme-color, $uni-bg-color-primary);
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
      .left-circle {
        left: 0;
      }
      .right-circle {
        right: 0;
        transform: translate(50%, -50%);
      }
      .code-img {
        width: 300rpx;
        height: 300rpx;
        vertical-align: top;
        padding: 40rpx 0 20rpx;
      }
      .code-content {
        font-size: 48rpx;
        color: #333;
        font-weight: 700;
      }
      .tip {
        margin: 0 0 60rpx;
      }
    }
  }
}
.detail-footer-box {
  padding: 0 30rpx 10rpx;
  background: #fff;
  margin: 20rpx 0 0;
  .item-name {
    padding: 28rpx 0 15rpx;
  }
  .item-time {
    padding: 0 0 30rpx;
  }
  .item {
    padding: 30rpx 0;
    display: flex;
    font-size: 28rpx;
    .key {
      display: block;
      width: 140rpx;
      color: #333;
    }
    .value {
      color: #666;
      display: block;
      flex: 1;
    }
  }
  .item:last-child {
    background: none;
  }
}
.canvas-code {
  position: fixed;
  left: -9999px;
  width: 150px;
  height: 150px;
}
</style>
