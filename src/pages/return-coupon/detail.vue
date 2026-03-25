<template>
  <view class="container page-coupon pt-20" :style="themeVars">
    <view v-if="!validDay" class="container-total">
      {{ totalNumTitle }}券数：
      <text class="primary-color fw-bold mr-10">{{ totalCount }}</text>
      张
    </view>
    <view v-if="tabIndex === 0" class="container-total">
      <text v-if="validcount && validDay !== 7" class="mr-40">
        有效期不足30天：
        <text class="primary-color fw-bold mr-10">{{ validcount }}</text>
        张
      </text>
      <text v-if="validlessthensevendaycount && validDay !== 30">
        有效期不足7天：
        <text class="primary-color fw-bold mr-10">{{ validlessthensevendaycount }}</text>
        张
      </text>
    </view>
    <view class="coupon-list mt-20">
      <coupon-item v-for="(item, index) in list" :key="index" :item="item" :tab-index="tabIndex"></coupon-item>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="list.length === 0 && !loading" msg="暂无卡券~"></none-data>
  </view>
</template>

<script>
import { apiGetReturnCouponDetail } from '@/api/return-coupon'
import CouponItem from './comps/coupon-item'
import LoadMore from '@/components/load-more'
// #ifndef MP-RETAIL
import { notThemeMixin } from 'packages/mixins/not-theme.js'
// #endif
export default {
  components: { CouponItem, LoadMore },
  mixins: [
    // #ifndef MP-RETAIL
    notThemeMixin
    // #endif
  ],
  data() {
    return {
      tabIndex: 0,
      id: 0,
      validDay: 0,
      validcount: 0,
      validlessthensevendaycount: 0,
      sourcetype: 0,
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      totalCount: 0,
      form: {
        pageIndex: 0,
        pageSize: 10
      }
    }
  },
  computed: {
    topHeight() {
      return '168rpx'
    },
    totalNumTitle() {
      let title = ''
      switch (this.tabIndex) {
        case 0:
          title = '待返货'
          break
        case 1:
          title = '已返货'
          break
        case 2:
          title = '已过期'
          break
        default:
          break
      }
      return title
    }
  },
  onLoad(options) {
    this.tabIndex = Number(options.tabIndex)
    this.id = Number(options.id)
    this.validDay = Number(options.validDay)
    this.sourcetype = Number(options.sourcetype)
    this.getData()
  },
  onShow() {},
  onPullDownRefresh() {
    this.handleTabChange()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      let res = await apiGetReturnCouponDetail({
        voucherid: this.id || 0,
        status: this.tabIndex + 1,
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        validDay: this.validDay || 0,
        sourcetype: this.sourcetype || 0
      })
      uni.stopPullDownRefresh()
      if (this.$ck(res, true)) {
        this.form.pageIndex = pageIndex
        let { list, totalcount, validcount, validlessthensevendaycount } = res.return_data
        this.totalCount = totalcount
        this.validcount = validcount
        this.validlessthensevendaycount = validlessthensevendaycount
        if (this.form.pageIndex === 1) {
          this.list = list || []
        } else {
          if (list) this.list = [...this.list, ...list]
        }
        this.hasMore = this.totalCount > this.list.length
      }
      this.busy = false
      this.loading = false
    },
    // 一级tab栏的回调
    handleTabChange() {
      this.list = []
      this.form.pageIndex = 0
      this.totalCount = 0
      this.hasMore = true
      this.loading = true
      this.getData()
    }
  }
}
</script>
<style lang="scss" scoped>
.page-coupon {
  .container-header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 99;
    background: #f5f5f5;
  }
  .container-total {
    line-height: 48rpx;
    margin-left: 40rpx;
  }
  .coupon-list {
    padding: 0 30rpx;
  }
  .coupon-bottom {
    width: 100%;
    box-sizing: border-box;
    padding: 0 30rpx;
    height: 108rpx;
    position: fixed;
    left: 0;
    bottom: 20rpx;
    z-index: 2;
    .primary-btn {
      width: 200rpx;
    }
    .select-all {
      line-height: 80rpx;
    }
  }
  .canvas-code {
    position: fixed;
    left: -9999px;
    width: 150px;
    height: 150px;
  }
}
</style>
