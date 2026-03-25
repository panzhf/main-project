<template>
  <view class="writeoff" :style="themeVars">
    <view v-if="!isbatch" class="tx-c p-40">加载中...</view>
    <view v-for="(item, index) in list" :key="item.voucherid" class="writeoff-item flex flex-middle">
      <view class="select" @tap="handleCheck(item, index)">
        <view v-if="item.checked" class="icon iconfont icon-checked fs-40"></view>
        <view v-else class="icon iconfont icon-unchecked fs-40"></view>
      </view>
      <image class="pic" :src="item.voucherimg" />
      <view class="info flex-1">
        <view class="title">{{ item.vouchername }}</view>
        <view class="number">
          <u-number-box
            v-model="item.value"
            :min="1"
            :max="item.count"
            @blur="handleValChange"
            @minus="handleValChange"
            @plus="handleValChange"
          ></u-number-box>
        </view>
      </view>
    </view>
    <view v-if="isbatch && list.length > 0">
      <view style="height: 125rpx"></view>
      <button class="primary-btn round fixed-bottom" hover-class="button-action" @tap="batchWriteoffCoupon">
        确认核销
        <text class="fw-normal fs-40">（</text>
        <text class="fs-40">{{ writeoffNumber }}</text>
        <text class="fw-normal fs-40">）</text>
      </button>
    </view>
    <view v-if="isShowPage && list.length === 0 && isbatch" style="min-height: 100vh" class="flex flex-middle">
      <none-data msg="暂无卡券~" icon-width="256" icon-height="190" />
    </view>
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  apiListUnuseCoupon,
  apiBatchWriteoffCoupon,
  apiSingleWriteoffCoupon,
  apiWriteoffProduct
} from '@/api/pick-coupon'
import overdueMixin from 'packages/mixins/overdue'
export default {
  components: {},
  mixins: [overdueMixin],
  data() {
    return {
      showOverdueTips: false, //过期提示
      list: [],
      writeoffNumber: 0,
      customerId: 0,
      storeId: 0,
      code: '', // 码
      isShowPage: false,
      isbatch: 0, // 1：批量  0：单个
      type: '' // 实物兑换：materialCoupon   提领券：pickupCoupon
    }
  },
  computed: {},
  onLoad(options) {
    this.code = options.code
    this.isbatch = options.isbatch - 0 || 0
    this.type = options.type || 'pickupCoupon'
    if (this.type === 'pickupCoupon') {
      // 提领券核销
      //console.log('this.isbatch', this.isbatch)
      this.isbatch ? this.getList() : this.singleWriteoff()
    } else {
      // 实物兑换码核销
      //console.log('实物兑换码核销')
      this.productWriteoff()
    }
  },
  onShow() {},
  methods: {
    handleCheck(item, index) {
      // 选择
      item.checked = !item.checked
      this.writeoffTotal()
    },
    writeoffTotal() {
      // 计算核销的数量
      this.writeoffNumber = 0
      this.list.forEach(element => {
        if (element.checked) this.writeoffNumber = this.writeoffNumber + element.value
      })
    },
    async getList() {
      // 获取批量核销的列表
      let res = await apiListUnuseCoupon({
        couponcodekey: this.code
      })
      if (this.$ck(res, true)) {
        let { customerid, list } = res.return_data
        this.customerId = customerid
        this.list = list.map(item => {
          item.value = item.count
          item.checked = true
          return item
        })

        this.isShowPage = true
        this.writeoffTotal()
      } else {
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/index/index'
          })
        }, 2000)
      }
    },
    handleValChange() {
      this.writeoffTotal()
    },
    singleWriteoff() {
      // console.log('单个')
      // 提领券单个核销
      apiSingleWriteoffCoupon({
        writeofftype: 0, // 核销类型 0 扫码核销 1手动输入
        expirycode: this.code
      })
        .then(res => {
          this.setResult(res)
        })
        .catch(err => {
          // this.$msg('网络异常，请重试！')
          this.$uploadLog({ type: 'scanCode', data: err || {}, extend: { api: apiSingleWriteoffCoupon || '' } })
        })
    },
    productWriteoff() {
      // 实物单个核销
      apiWriteoffProduct({
        sourcetype: 0, // 核销类型 0 扫码核销 1手动输入
        expirycode: this.code
      })
        .then(res => {
          this.setResult(res)
        })
        .catch(err => {
          // this.$msg('网络异常，请重试！')
          this.$uploadLog({ type: 'scanCode', data: err || {}, extend: { api: apiWriteoffProduct || '' } })
        })
    },

    batchWriteoffCoupon() {
      if (!this.overdueChecked()) return
      // 提领券批量核销
      let coupons = []
      this.list.forEach(element => {
        if (element.checked) {
          let obj = {}
          obj.count = element.value
          obj.voucherid = element.voucherid
          coupons.push(obj)
        }
      })

      if (coupons.length === 0) return this.$msg('请至少选择一个券！')
      apiBatchWriteoffCoupon({
        writeoffsource: 0, // 核销渠道： 0 门店核销  1自助核销
        writeofftype: 0,
        customerid: this.customerId,
        coupons
      })
        .then(res => {
          this.setResult(res)
        })
        .catch(err => {
          // this.$msg('网络异常，请重试！')
          this.$uploadLog({ type: 'scanCode', data: err || {}, extend: { api: apiBatchWriteoffCoupon || '' } })
        })
    },
    setResult(res) {
      if (res.return_code === 600014) {
        return (this.showOverdueTips = true)
      }
      let result = res.return_code === 0 ? 'success' : 'fail'
      res = { ...res, code: this.code }
      this.$store.dispatch('updateWriftoffResult', res)
      this.navUrl(result)
    },
    navUrl(result) {
      uni.reLaunch({
        url: `/pages/write-off/result?type=${this.type}&result=${result}&isbatch=${this.isbatch}`
      })
    }
  }
}
</script>
<style lang="scss">
.u-numberbox {
  .u-icon-minus,
  .u-icon-plus,
  .u-number-input {
    border: 1px solid #ccc !important;
    background: #fff !important;
    height: 56rpx !important;
    line-height: 56rpx !important;
    box-sizing: border-box;
    color: #222 !important;
    font-size: 32rpx !important;
  }
  .u-number-input {
    margin: 0 -1px !important;
    width: 84rpx !important;
  }
  .u-icon-minus,
  .u-icon-plus {
    width: 56rpx !important;
  }
}
</style>
<style lang="scss" scoped>
.writeoff {
  &-item {
    margin: 30rpx;
    height: 190rpx;
    background: #fff;
    border-radius: 20rpx;
    .select {
      padding: 30rpx 20rpx;
      .icon-checked {
        color: var(--theme-color, $uni-color-primary);
      }
      .icon-unchecked {
        color: #ccc;
      }
    }
    .info {
      margin: 0 20rpx;
      .title {
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        text-overflow: ellipsis;
        -webkit-line-clamp: 1;
        word-break: break-all;
      }
      .number {
        margin-top: 35rpx;
        font-size: 30rpx;
        color: #222;
      }
    }
    .pic {
      width: 130rpx;
      height: 130rpx;
      background: #f6f6f6;
      border-radius: 10rpx;
    }
  }
  .primary-btn {
    left: 30rpx;
    right: 30rpx;
  }
}
</style>
