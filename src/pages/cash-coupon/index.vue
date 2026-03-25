<template>
  <view class="container page-coupon" :style="themeVars">
    <view class="container-header" :style="{ height: topHeight }">
      <tab
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="activiyTabIndex"
        :active-bag-color="themeInfo.color"
        @change="handleTabChange"
      ></tab>
      <vidw class="container-total flex-middle">
        <view class="flex-1">
          {{ totalNumTitle }}：
          <text class="primary-color mr-20 fw-bold">{{ totalCount }}张</text>
          合计面额：
          <text class="primary-color fw-bold">{{ sumDenominations }}元</text>
        </view>
        <button
          v-if="activiyTabIndex === 0 && list.length"
          class="primary-btn round inverse ml-30 btn1"
          hover-class="button-action"
          @tap="handleExpenseAll"
        >
          全部核销
        </button>
      </vidw>
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="coupon-list">
      <coupon-list
        v-for="(item, index) in list"
        :key="index"
        :item="item"
        :activiy-tab-index="activiyTabIndex"
        :show-check-flag="showCheckFlag"
        @check="handleCheck"
        @url="handleNav"
      >
        <view v-if="isShowItemChecked" slot="check" class="select">
          <view v-if="item.checked" class="icon select-icon iconfont icon-checked"></view>
          <view v-else class="icon select-icon iconfont icon-unchecked"></view>
        </view>
      </coupon-list>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="list.length === 0 && !loading" msg="暂无卡券~"></none-data>
    <view v-if="activiyTabIndex === 0" style="height: 130rpx"></view>
    <view v-if="activiyTabIndex === 0 && list.length" class="coupon-bottom flex flex-middle">
      <view v-if="showCheckFlag" class="flex-1 flex flex-middle">
        <view class="select-all" @tap="handleCheckAll(checkedAll)">
          <text v-if="checkedAll" class="icon select-icon iconfont icon-checked"></text>
          <text v-else class="icon select-icon iconfont icon-unchecked"></text>
          <text class="ml-10 fw-bold">{{ checkedAll ? '取消' : '全选' }}</text>
        </view>
        <view class="flex-1 primary-color fw-bold ml-10">
          (已经选{{ choosedList.length }}张，共{{ checkedTotalMoney }}元)
        </view>
      </view>

      <button
        v-if="showCheckFlag"
        class="primary-btn size-small round"
        hover-class="button-action"
        @tap="!isExpires ? handleSubmit() : (showOverdueTips = true)"
      >
        确定使用
      </button>
      <view v-else class="flex flex-middle" style="width: 100%">
        <button
          class="primary-btn flex-1 size-small plain round"
          hover-class="button-action"
          @tap="!isExpires ? (showCheckFlag = true) : (showOverdueTips = true)"
        >
          批量选择
        </button>
        <button class="primary-btn flex-1 size-small round ml-20" hover-class="button-action" @tap="handleExpenseAll">
          全部核销
        </button>
      </view>
    </view>

    <coupon-hint ref="couponHint" @update="handleUpdateData" @close="handleClose"></coupon-hint>
    <canvas canvas-id="myCanvas11" class="canvas-code"></canvas>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import { apiGetCashCouponList } from '@/api/cash-coupon'
import Tab from '@/components/tab/index.vue'
import CouponList from './comps/coupon-list'
import CouponHint from './comps/coupon-hint'
import LoadMore from '@/components/load-more'
import overdueMixin from 'packages/mixins/overdue'
export default {
  components: { Tab, CouponList, CouponHint, LoadMore },
  mixins: [overdueMixin],
  data() {
    return {
      activiyTab: ['未使用', '已使用', '已过期'],
      activiyTabIndex: 0,
      list: [],
      showCheckFlag: false,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      totalCount: 0,
      sumDenominations: 0,
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      checkedAll: false,
      choosedList: [],
      checkedTotalMoney: 0
    }
  },
  computed: {
    topHeight() {
      return '180rpx'
    },
    totalNumTitle() {
      let title = ''
      switch (this.activiyTabIndex) {
        case 0:
          title = '未使用'
          break
        case 1:
          title = '已使用'
          break
        case 2:
          title = '已过期'
          break
        default:
          break
      }
      return title
    },
    isShowItemChecked() {
      return this.showCheckFlag && this.activiyTabIndex === 0
    }
  },
  onLoad(options) {
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
      let res = await apiGetCashCouponList({
        type: this.activiyTabIndex,
        pageindex: pageIndex,
        pagesize: this.form.pageSize
      })
      uni.stopPullDownRefresh()
      if (this.$ck(res, true)) {
        this.form.pageIndex = pageIndex
        let { list, totalcount, sumdenominations } = res.return_data
        this.totalCount = totalcount
        this.sumDenominations = sumdenominations
        if (list) {
          list = list.map(item => {
            item.checked = !!this.checkedAll
            return item
          })
        }
        if (this.form.pageIndex === 1) {
          this.list = list || []
        } else {
          if (list) this.list = [...this.list, ...list]
        }
        this.setData()
        this.busy = false
        this.loading = false
        this.hasMore = this.totalCount > this.list.length
      } else {
        this.busy = false
        this.loading = false
      }
    },
    handleExpenseAll() {
      if (!this.overdueChecked()) return
      this.$refs.couponHint.showToast('expenseAll', [], this.sumDenominations, this.totalCount)
    },
    setData() {
      this.choosedList = []
      this.checkedTotalMoney = 0
      this.choosedList = this.list.filter(item => item.checked)
      if (this.list.length) this.checkedAll = this.choosedList.length === this.list.length
      let total = 0
      this.choosedList.forEach(item => {
        total = total + item.denominations
      })
      this.checkedTotalMoney = total.toFixed(2)
    },
    handleSubmit() {
      if (this.choosedList.length === 0) {
        return uni.showToast({
          title: '请选择卡券',
          icon: 'none'
        })
      }
      let couponIdsArr = [] // id集合
      this.choosedList.forEach(item => {
        couponIdsArr.push(item.voucherid)
      })
      this.$refs.couponHint.showToast('batchExpense', couponIdsArr, this.checkedTotalMoney, this.choosedList.length)
    },
    handleCheckAll(status) {
      if (!this.showCheckFlag) this.showCheckFlag = true
      // 全选、取消全选
      this.list = this.list.map(item => {
        item.checked = !status
        return item
      })
      this.setData()
    },
    // 一级tab栏的回调
    handleTabChange() {
      this.list = []
      this.choosedList = []
      this.form.pageIndex = 0
      this.totalCount = 0
      this.sumDenominations = 0
      this.checkedAll = false
      this.hasMore = true
      this.loading = true
      this.checkedTotalMoney = 0
      this.getData()
    },
    handleUpdateData() {
      this.handleTabChange()
    },
    handleCheck(item) {
      // 选择
      for (let i = 0; i < this.list.length; i++) {
        let itemA = this.list[i]
        if (itemA.voucherid === item.voucherid) {
          itemA.checked = !itemA.checked
          break
        }
      }
      item.checked = !item.checked
      this.setData()
    },
    handleNav(e) {
      if (!this.overdueChecked()) return
      uni.navigateTo({
        url: `/pages/cash-coupon/detail?id=${e}`
      })
    },
    handleClose() {}
  }
}
</script>
<style lang="scss" scoped>
.page-coupon {
  .select-icon {
    color: var(--theme-color, $uni-color-primary);
    font-size: 40rpx;
  }
  .container-header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 99;
    background: #f5f5f5;
  }
  .container-total {
    display: flex;
    padding: 20rpx 30rpx;
    .btn1 {
      display: inline-block;
      vertical-align: middle;
      height: 50rpx;
      line-height: 48rpx;
      font-size: 24rpx;
      padding: 0 20rpx;
      border-radius: 30rpx;
    }
  }
  .coupon-list {
    padding: 0 30rpx;
  }
  .coupon-bottom {
    width: 100%;
    box-sizing: border-box;
    padding: 0 30rpx;
    background: #fff;
    height: 108rpx;
    position: fixed;
    left: 0;
    bottom: 0;
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
