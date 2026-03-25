/*
页面
1、门店列表
2、我邀请门店的订单
*/
import { apiGetOrderList } from '@/api/order'
const orderListMixin = {
  data() {
    return {
      showDatePicker: false, // 显示时间选择
      keyValue: '', // 关键字
      orderNo: '', // 订单单号
      dateValue: '', // 日期
      popType: 'tip', //弹窗类型
      dateFilter: '', // 时间
      showPopup: false, // true 显示弹窗
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '', // 弹窗确认按钮文案
      popCancelText: '', // 弹窗取消按钮文案
      typeValue: -1, // 订单状态
      orderTypeOPtion: [
        // -1,全部-1， 订单状态；0待审核；1待出货；2出货中；3待签收；4签收中；5订单完成；6订单取消 -2:已转交
        {
          val: -1,
          label: '全部'
        },
        {
          val: 0,
          label: '待审核'
        },
        {
          val: 1,
          label: '待出货'
        },
        {
          val: 2,
          label: '出货中'
        },
        {
          val: 3,
          label: '待签收'
        },
        {
          val: 4,
          label: '签收中'
        },
        {
          val: 5,
          label: '订单完成'
        },
        {
          val: 6,
          label: '已取消'
        }
      ],
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      maxId: 0,
      orderCount: 0, //订单总数
      goodsCount: 0, //商品总数
      form: {
        PageIndex: 1,
        PageSize: 10
      }
    }
  },
  onReachBottom() {
    if (this.maxId > 0) {
      this.getData()
    }
  },

  watch: {
    isParaChange(val) {
      this.handleSearch()
    }
  },
  methods: {
    handleSearch() {
      // 重置
      this.list = []
      this.maxId = 0
      this.hasMore = true
      this.loading = true
      this.getData()
    },

    handleDetail(path) {
      uni.navigateTo({
        url: path
      })
    },
    getData() {
      if (this.busy) return
      this.busy = true
      let data = {
        storeno: this.mainpartNo, //门店编号
        maxid: this.maxId,
        orderstatus: this.typeValue, //全部-1， 订单状态；0待审核；1待出货；2出货中；3待签收；4签收中；5订单完成；6订单取消 -2:已转交
        starttime: this.dateFilter.startTime ? `${this.dateFilter.startTime} 00:00:00` : '', //开始时间
        endtime: this.dateFilter.endTime ? `${this.dateFilter.endTime} 23:59:59` : '', //结束时间
        orderno: this.orderNo, //订单号
        keyword: this.keyValue //关键字查询,门店名称、手机号
      }
      apiGetOrderList(data).then(res => {
        uni.stopPullDownRefresh()
        if (this.$ck(res)) {
          let { ordercount, goodscount, maxid, list } = res.return_data
          this.orderCount = ordercount
          this.goodsCount = goodscount
          if (list) this.list = [...this.list, ...list]
          this.maxId = maxid
          this.busy = false
          this.loading = false
          this.hasMore = this.orderCount > this.list.length
        } else {
          this.busy = false
          this.loading = false
        }
      })
    },
    datePickerComfirm(e) {
      if (!e) return
      this.dateFilter = {
        startTime: e.starttime,
        endTime: e.endtime
      }
      this.handleSearch()
    }
  }
}
export default orderListMixin
