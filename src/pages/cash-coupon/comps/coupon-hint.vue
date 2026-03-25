<template>
  <view v-if="show" class="popop-container">
    <view class="container br-10">
      <!-- 顶部统计 -->
      <view class="container-top">
        <view v-if="!isResult" class="total">
          <view class="total-item">
            本次使用卡券：
            <text class="num">{{ writeoff.totalNum }}张</text>
          </view>
          <view class="total-item">
            卡券面额合计：
            <text class="num">{{ writeoff.totalMoney }}元</text>
          </view>
        </view>
        <view v-else class="total">
          <view class="total-item">
            本次实际使用卡券：
            <text class="num">{{ result.totalNum }}张</text>
          </view>
          <view class="total-item">
            卡券面额合计：
            <text class="num">{{ result.totalMoney }}元</text>
          </view>
        </view>
      </view>
      <!-- 核销码部分 -->
      <view class="container-bottom">
        <view class="container-ticket">
          <view class="code-wrap" :style="{ background: `url(${codeBorder})`, backgroundSize: '335rpx 335rpx' }">
            <image v-if="status === 3" class="code-img" :src="codePath" />
            <image v-else class="code-img" :src="codePathDefault" />

            <view v-if="isResult" class="code-tips opacity flex flex-center flex-middle flex-comlumn">
              <view>
                <view><text class="icon iconfont icon-success success-color"></text></view>
                <view class="mt-10 fw-bold">核销成功！</view>
              </view>
            </view>
            <view v-else class="code-tips flex flex-center flex-middle flex-comlumn">
              <view v-if="status === 1" class="fs-26 c-0 fw-bold">
                核销码生成中
                <text class="dot">...</text>
              </view>
              <view v-else-if="status === 2 || status === 4" class="primary-color">
                <view><text class="icon iconfont icon-shibaiicon"></text></view>
                <view class="mt-10">{{ status === 2 ? '生成失败!' : '码已失效！' }}</view>
              </view>
            </view>
          </view>
          <!-- 生成成功 -->
          <view v-if="status === 3" class="opera-tips">
            <view>5分钟有效</view>
            <view>使用时请将此码出示给业务员</view>
          </view>
          <!-- 生成失败/ 失效-->
          <view v-if="!isResult && (status === 2 || status === 4)" class="opera-tips" @tap="getData">
            <text class="icon iconfont icon-shuaxin fs-32 c-0 mr-10"></text>
            点击刷新
          </view>
        </view>
      </view>
      <view class="icon iconfont icon-guanbi1" @tap="handleOnShow"></view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiCreateCashCouponCode, apiGetCouponResult } from '@/api/cash-coupon'
export default {
  props: {},
  data() {
    return {
      couponIdsArr: [], //码券id
      show: false,
      isResult: false, //核对成功
      timer: null, // 轮询定时器
      codeBorder: staticURL() + 'common/code-border.jpg',
      codePath: '', //二维码
      codePathDefault: staticURL() + 'common/default-code.png?t=2',
      writeoff: {
        // 要核销的数量与金额
        totalMoney: 0,
        totalNum: 0
      },
      type: '',
      status: 0, // 1加载  2生成失败 3生成成功  4码已失效
      result: {
        //  实际核销的数量与金额
        totalMoney: 0,
        totalNum: 0
      }
    }
  },
  beforeDestroy() {
    this.handleOnShow()
  },
  methods: {
    showToast(type, couponIdsArr, checkedTotalMoney, totalNumber) {
      this.type = type
      this.couponIdsArr = couponIdsArr // ID集合
      this.writeoff.totalNum = totalNumber
      this.writeoff.totalMoney = checkedTotalMoney
      this.show = true
      this.getData()
    },
    async getData() {
      // 加载码
      this.status = 1
      let dataType = this.type === 'expenseAll' ? 1 : 0
      let ids = this.couponIdsArr.join(',')
      let res = await apiCreateCashCouponCode({ voucherids: ids, datatype: dataType })
      if (this.$ck(res, true)) {
        // 码生成成功
        this.status = 3
        this.codePath = res.return_data.img
        this.countdown()
        setTimeout(() => {
          this.onPolling(res.return_data.key)
        }, 2000)
      } else {
        // 码生成失败
        this.status = 2
      }
    },
    countdown() {
      setTimeout(() => {
        // 5分钟后 码失效
        this.status = 4
      }, 5 * 60000)
    },
    // 轮询提领券核销情况
    onPolling(key) {
      clearTimeout(this.timer)
      apiGetCouponResult({ key }).then(res => {
        if (res.return_code === 50002 && this.show) {
          this.timer = setTimeout(() => {
            this.onPolling(key)
          }, 3000)
        } else if (res.return_code === 0) {
          clearTimeout(this.timer)
          this.result = {
            totalMoney: res.return_data.denominations,
            totalNum: res.return_data.number
          }
          this.isResult = true
          this.$emit('update')
          setTimeout(() => {
            this.handleOnShow()
          }, 3000)
        }

        // const systemInfo = wx.getSystemInfoSync()
        // log.info({
        //   type: this.type,
        //   func: 'scancode',
        //   code: res.return_code || 'nocode',
        //   data: JSON.stringify(res || {}),
        //   systemInfo: {
        //     brand: systemInfo.brand,
        //     model: systemInfo.model,
        //     version: systemInfo.version,
        //     system: systemInfo.system,
        //     platform: systemInfo.platform
        //   }
        // })
      })
    },
    handleUpdate() {},
    handleOnShow() {
      this.show = false
      clearTimeout(this.timer)
      this.codePath = ''
      this.isResult = false
      this.couponIdsArr = []
      this.result = {
        totalMoney: 0,
        totalNum: 0
      }
      this.writeoff = {
        totalMoney: 0,
        totalNum: 0
      }
      this.status = 0
      this.$emit('close')
    }
  }
}
</script>

<style lang="scss" scoped>
.popop-container {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9991;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  .container {
    position: absolute;
    animation: tanchuang 0.4s ease-in-out;
    width: 600rpx;
    border-radius: 10rpx;
    background-color: #fff;
    .container-top {
      padding: 50rpx 0 45rpx;
      .total {
        color: #000;
        font-size: 32rpx;
        font-weight: 700;
        line-height: 40rpx;
        text-align: center;
        .total-item {
          margin-bottom: 8rpx;
          .num {
            color: $uni-color-primary;
          }
        }
      }
    }
    .container-bottom {
      box-sizing: border-box;
      overflow: hidden;
      padding-bottom: 50rpx;
    }
    .title {
      font-size: 30rpx;
      font-weight: 700;
      text-align: center;
      margin-top: 40rpx;
    }
    .icon-guanbi1 {
      position: absolute;
      bottom: -85rpx;
      left: 280rpx;
      color: #fff;
      font-size: 55rpx;
    }
    .container-ticket {
      text-align: center;
      .opera-tips {
        margin-top: 34rpx;
        font-size: 28rpx;
        color: #000;
      }
      .code-wrap {
        width: 335rpx;
        height: 335rpx;
        margin: 0 auto;
        position: relative;
        text-align: center;
        .code-img {
          width: 285rpx;
          height: 285rpx;
          margin: 25rpx;
        }
        .code-tips {
          position: absolute;
          left: 25rpx;
          top: 25rpx;
          width: 285rpx;
          height: 285rpx;
          &.opacity {
            background: rgba(255, 255, 255, 0.9);
          }
          .icon-shibaiicon {
            font-size: 56rpx;
          }
          .icon-success {
            font-size: 56rpx;
          }
        }
      }
    }
  }
}
@keyframes tanchuang {
  0% {
    transform: scale(0.5);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}
.canvas-code {
  position: fixed;
  left: -9999px;
  width: 150px;
  height: 150px;
}
</style>
