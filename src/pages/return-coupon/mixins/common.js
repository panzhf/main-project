import { apiGetReturnCouponList, apiGetSubsidygoodsvoucherliststatistics } from '@/api/return-coupon'
import returnConponMixin from 'packages/components/return-coupon/mixins/common'
const commonMixin = {
  mixins: [returnConponMixin],
  data() {
    return {
      list: [],
      hasMore: true,
      loading: true,
      busy: false,
      totalCount: 0,
      form: {
        pageIndex: 0,
        pageSize: 10
      }
    }
  },
  computed: {
    topHeight() {
      return '326rpx'
    }
  },

  onReachBottom() {
    if (this.hasMore && this.showType === 1) {
      this.getData()
    }
  },
  methods: {
    initData() {
      this.getVoucherData()
      this.fetchStoreBaseInfo && this.fetchStoreBaseInfo()
    },
    async getVoucherStatistics() {
      let res = await apiGetSubsidygoodsvoucherliststatistics({
        status: this.tabId
      })
      this.handleVoucherStatistics(res)
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      let pageSize = this.form.pageSize
      let res = await apiGetReturnCouponList({
        status: this.tabId,
        pageindex: pageIndex,
        pagesize: pageSize
      })
      uni.stopPullDownRefresh()
      if (this.$ck && this.$ck(res, true)) {
        const { list, totalcount, vouchercount } = res.return_data
        this.form.pageIndex = pageIndex
        this.totalCount = totalcount
        this.voucherCount = vouchercount
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
    resetData() {
      this.list = []
      this.form.pageIndex = 0
      this.totalCount = 0
      this.hasMore = true
      this.loading = true
    },
    handleNav(item) {
      if (this.overdueChecked && !this.overdueChecked()) return
      const otherParams = this.getOtherParams(item)
      uni.navigateTo({
        url: `/pages/return-coupon/detail?id=${item.voucherid}&tabIndex=${this.activityTabIndex}&${otherParams}`
      })
    }
  }
}
export default commonMixin
