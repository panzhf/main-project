<template>
  <view class="container" :style="themeVars">
    <view class="container-header" :style="{ height: headerHeight }">
      <!-- tab栏 -->
      <tab
        :tab="activiyTabList"
        :draw-height="5"
        :draw-width="60"
        :active-index.sync="activiyTabIndex"
        :active-bag-color="themeInfo.color"
        @change="handleChange"
      ></tab>
      <!-- 订单部分 start -->
      <Tabs v-if="tabId === 1" :tabs.sync="tabs" :value.sync="activeTab" @handleTabChange="handleTabChange"></Tabs>
      <!--0 订单 -->
      <view v-else>
        <view class="search-box">
          <selector-picker
            v-if="[0, 4].includes(tabId)"
            v-model="writeoffTypeValue"
            class="selector-width mr-20"
            :options="writeoffTypeOption"
            range-key="label"
          ></selector-picker>
          <SelectorDate ref="selectorDateRef" v-model="dateValue" class="flex-1"></SelectorDate>
        </view>
        <view class="search-box">
          <selector-picker
            v-if="[0, 4].includes(tabId)"
            v-model="searchTypeValue"
            class="selector-width mr-20"
            :options="searchTypeOption"
            range-key="label"
            @change="seachData = ''"
          ></selector-picker>
          <search-input
            v-model="seachData"
            class="flex-1"
            :placeholder="searchPlaceholder"
            @search="handleSearch"
          ></search-input>
        </view>
      </view>
      <view v-if="tabId !== 1" class="flex total-number fs-28">
        <view class="flex-1 fw-bold">
          核销总数：
          <text class="primary-color mr-40">{{ tabId === 0 && pickupType === 2 ? ticketCount : totalCount }}</text>
        </view>
        <view v-if="tabId === 0" class="edit-color" @tap="handleLookType">
          <text
            class="iconfont fs-24 mr-10"
            :class="pickupType === 1 ? 'icon-anquanchakanicon' : 'icon-andanchakanicon'"
          ></text>
          {{ pickupType === 1 ? '按券查看' : '按记录查看' }}
        </view>
      </view>
    </view>
    <view :style="{ height: headerHeight }"></view>

    <view v-if="tabId === 1">
      <view v-for="(item, index) in list" :key="index">
        <view class="check-item">
          <view class="check-item__header">
            <view>订单号：{{ item.OrderNumber }}</view>
            <view @tap="handleCopy(item.OrderNumber)">
              <text class="order-btn--copy" style="margin-left: 20rpx">复制</text>
            </view>
          </view>
          <view class="check-item__body">
            <view v-for="(product, indexT) in item.OrderItems" :key="indexT">
              <view style="background-color: #f9f9f9">
                <ProductCard
                  :product="product"
                  :is-goods-check-order="item.IsGoodsCheckOrder"
                  :is-show-check-status-text="true"
                  :is-show-card-price="false"
                  class="mt-10"
                ></ProductCard>
              </view>
            </view>
          </view>
          <view class="check-item__footer">
            <view class="check-item__total">
              <view class="check-item__count">共{{ item.TotalCount }}件商品</view>
              <view class="check-item__amount">
                <view class="check-item__amount__label">实付：</view>
                <view class="check-item__amount__value">￥{{ item.ActualAmount + item.DeliveryFee }}</view>
              </view>
            </view>
            <view v-if="activeTab === 1" class="check-item__check">
              <view>核销人：{{ item.CheckOrderUserName }}</view>
              <view>{{ item.CompletedTime }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <!-- 订单部分 end -->
    <view v-else class="ticket-box">
      <block v-if="tabId === 0">
        <InfoItem v-if="pickupType === 1" :list="ticketList" type="pickup"></InfoItem>
        <pickItem v-else :list="ticketList"></pickItem>
      </block>
      <InfoItem v-else-if="tabId === 4" :list="returnList" type="returnCoupon"></InfoItem>
      <InfoItem v-else-if="tabId === 3" :list="ticketList" type="productGift"></InfoItem>
      <FreeGiftItem v-else :list="list"></FreeGiftItem>
    </view>
    <none-data v-if="showNoneData" msg="暂无记录~" icon-width="256" icon-height="190" />
    <load-more v-if="listsLenght && isnotLoading" :has-more="hasMore" />
    <view v-if="tabId === 4" style="height: 200rpx"></view>
    <btn-scan
      v-if="tabId === 4"
      scan-text="连续核销"
      custom-style="bottom: 8%;"
      @tap="!isExpires ? $navPage('/pagesA/scan/index') : (showOverdueTips = true)"
    ></btn-scan>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import { apiCloud } from '@/api/cloud-store'
import Tab from '@/components/tab/index.vue'
import Tabs from '@/components/tab/tabs.vue'
import ProductCard from '@/components/product-card'
import SearchInput from '@/components/search/search-input'
import SelectorPicker from '@/components/search/selector-picker'
import SelectorDate from '@/components/search/selector-date'
import FreeGiftItem from './comps/free-gift-item'
import InfoItem from './comps/info-item'
import pickItem from './comps/pick-item'
import { apiGiftList, apiPickupList, apiPickupListByCoupon } from '@/api/pick-coupon'
import { apiRenturnCouponWriteOff } from '@/api/return-coupon'
import LoadMore from '@/components/load-more'
import AssetsInfo from '@/mixins/assets-info'
import refreshPageMixin from '@/mixins/refresh-page'
import { getdayScope } from '@/utils/index.js'
import overdueMixin from 'packages/mixins/overdue'
import dayjs from 'dayjs'

export default {
  components: {
    Tab,
    Tabs,
    ProductCard,
    SearchInput,
    SelectorPicker,
    SelectorDate,
    FreeGiftItem,
    InfoItem,
    LoadMore,
    pickItem
  },
  mixins: [AssetsInfo, refreshPageMixin, overdueMixin],
  data() {
    return {
      isnotLoading: true,
      hasMore: true,
      activiyTabList: [
        { name: '提领券', id: 0 },
        { name: '兑奖码', id: 4 },
        { name: '订单', id: 1 },
        { name: '赠品', id: 2 },
        { name: '实物', id: 3 }
      ],
      activiyTabIndex: 0,
      tabId: 0,
      pickupType: 1, // 提领券列表: 1按记录查看 2按券查看
      dateValue: '', // 时间
      writeoffTypeValue: -1, // 提领券核销方式
      searchTypeValue: 0, // -1 旧 -券码 1-券名称 2-核销人 3-核销人手机号
      seachData: '', // 关键字搜索
      totalCount: 0,
      ticketCount: 0,
      tabs: [
        {
          label: '待核销',
          value: 2,
          count: 0
        },
        {
          label: '已核销',
          value: 1,
          count: 0
        }
      ],
      activeTab: 2,
      page: {
        index: 1,
        size: 10,
        total: 0
      },
      returnList: [],
      list: [], // 赠品 订单核销列表数据
      ticketList: [], // 提领券 实物核销数据
      maxId: 0 // 最大id 提领券和实物用到，不用分页查询，pageindex固定为1
    }
  },
  computed: {
    writeoffTypeOption() {
      let options = [
        {
          val: -1,
          label: '核销方式'
        },
        {
          val: 0,
          label: '门店核销'
        }
      ]
      return this.tabId === 0
        ? [
            ...options,
            {
              val: 1,
              label: '自助核销'
            }
          ]
        : options
    },
    searchTypeOption() {
      let options = [
        {
          val: 0,
          label: '券码'
        },
        {
          val: 1,
          label: '券名称'
        },
        {
          val: 2,
          label: '核销人'
        },
        {
          val: 3,
          label: '核销人手机'
        }
      ]
      return options
    },
    showNoneData() {
      return (
        (([0, 3].includes(this.tabId) && this.ticketList.length === 0) ||
          ((this.tabId === 1 || this.tabId === 2) && this.list.length === 0) ||
          (this.tabId === 4 && this.returnList.length === 0)) &&
        this.isnotLoading
      )
    },
    listsLenght() {
      return (
        ([0, 3].includes(this.tabId) && this.ticketList.length !== 0) ||
        ((this.tabId === 1 || this.tabId === 2) && this.list.length !== 0) ||
        (this.tabId === 4 && this.returnList.length !== 0)
      )
    },
    searchPlaceholder() {
      let str =
        this.tabId === 0
          ? '请输入'
          : this.tabId === 2
          ? '请输入赠品名称'
          : this.tabId === 3
          ? '请输入实物兑奖码、实物名称'
          : this.tabId === 4
          ? '请输入'
          : ''
      return str
    },
    OrderStatus() {
      let arr = this.activeTab === 2 ? [2] : this.activeTab === 1 ? [4] : []
      return arr
    },
    startTime() {
      if (!this.dateValue) return ''
      let dateArr = this.dateValue.split(',')
      return dateArr[0]
    },
    endTime() {
      if (!this.dateValue) return ''
      let dateArr = this.dateValue.split(',')
      return dateArr[1]
    },
    headerHeight() {
      let h = ''
      if (this.tabId !== 1) h = '380rpx'
      if (this.tabId === 1) h = '190rpx'
      return h
    },
    paramChange() {
      return `${this.writeoffTypeValue}${this.dateValue}`
    }
  },
  watch: {
    paramChange(val) {
      this.handleSearch()
    }
  },
  async onLoad(option) {
    // 从首页带过来时间查询
    if (option.seachTimeType && this.tabId !== 1 && this.$refs.selectorDateRef) {
      if (Number(option.seachTimeType) !== 3) {
        let seachTypeOption = {
          1: getdayScope(0),
          2: dayjs().format('YYYY-MM-01')
        }
        this.$refs.selectorDateRef.handleTime({
          endtime: getdayScope(0),
          starttime: seachTypeOption[option.seachTimeType]
        })
      }
    }
    // 其他跳转
    /* option.type
    3：订单核销
    4：赠品
    5：提领券核销
    6：实物核销
    */
    let type = option.type ? option.type : this.returnCouponFirst ? '7' : ''
    if (type === '3') {
      /* 0订单 */
      this.list = []
      // 重置
      this.page = {
        index: 1,
        size: 10,
        total: 0
      }
      this.tabId = 1
      this.activeTab = 1
      await this.getOrderList(1, this.page.size)
      await this.handleVerification()
      // 如果是核销结果过来,推荐有礼
    } else if (type === '4') {
      /* 2 赠品 */
      this.list = []
      // 重置
      this.page = {
        index: 1,
        size: 10,
        total: 0
      }
      this.tabId = 2
      this.activeTab = 1
      await this.getFreeList(1, this.page.size)
    } else if (type === '5') {
      /* 5 提领券 */
      this.ticketList = []
      this.getPickupData()
    } else if (type === '6') {
      /* 6 实物 */
      this.ticketList = []
      this.tabId = 3
      this.activeTab = 1
      await this.getGiftList(1, this.page.size)
    } else if (type === '7') {
      /* 7 返货券 */
      this.tabId = 4
      this.activeTab = 1
      this.returnList = []
      await this.getRenturnCouponList(1, this.page.size)
    } else {
      this.ticketList = []
      /* 5 提领券 */
      this.getPickupData()
    }
    this.changeTab(this.tabId)
  },
  onReachBottom() {
    // 上拉加载
    switch (this.tabId) {
      case 0:
        // 提领券
        if (this.pickupType === 1) {
          // 按单查看
          this.maxId > 0 && this.getPickupTicketList(1, this.page.size)
        } else if (this.page.total > 0 && this.page.total > this.page.index) {
          // 按券查看
          this.getPickupTicketListByCoupon(this.page.index + 1, this.page.size)
        }
        break
      case 1:
        // 订单
        if (this.page.total > 0 && this.page.total > this.page.index) {
          this.getOrderList(this.page.index + 1, this.page.size)
        }
        break
      case 2:
        // 赠品
        if (this.page.total > 0 && this.page.total > this.page.index) {
          this.getFreeList(this.page.index + 1, this.page.size)
        }
        break
      case 3:
        // 实物
        if (this.maxId > 0) {
          this.getGiftList(1, this.page.size)
        }
        break
      case 4:
        // 返货券
        if (this.page.total > 0 && this.page.total > this.page.index) {
          this.getRenturnCouponList(this.page.index + 1, this.page.size)
        }
        break
      default:
        break
    }
  },
  methods: {
    handleLookType() {
      // 切换查看方式
      this.pickupType = this.pickupType === 1 ? 2 : 1
      this.resetData()
      this.handleSearch()
    },
    refreshPage() {
      this.handleSearch()
      this.$store.commit('updateRefreshTag', false)
    },
    changeTab(tabId) {
      this.activiyTabIndex = this.activiyTabList.findIndex(item => {
        return item.id === tabId
      })
    },
    // tab栏的回调
    handleChange(e) {
      this.tabId = e.id
      this.changeTab(this.tabId)
      this.resetData()
      if (this.tabId !== 1 && this.$refs.selectorDateRef) {
        this.$refs.selectorDateRef.clearDate()
      }
      this.handleSearch()
    },
    async getPickupData() {
      // 提领券
      this.ticketList = []
      this.tabId = 0
      this.activeTab = 1
      this.getPickupTicketList(1, this.page.size)
    },
    resetData() {
      this.list = []
      this.ticketList = []
      this.returnList = []
      this.seachData = ''
      this.searchTypeValue = 0
      this.writeoffTypeValue = -1
      this.totalCount = 0
      this.ticketCount = 0
      this.maxId = 0
      this.hasMore = true
      // 重置
      this.page = {
        index: 1,
        size: 10,
        total: 0
      }
    },
    // 搜索框的回调
    handleSearch() {
      setTimeout(() => {
        this.maxId = 0
        this.list = []
        this.ticketList = []
        this.returnList = []
        if (this.tabId === 0) {
          // 提领券
          this.pickupType === 1 && this.getPickupTicketList(1, 10)
          this.pickupType === 2 && this.getPickupTicketListByCoupon(1, 10)
        } else if (this.tabId === 1) {
          // 订单
          this.getOrderList(1, 10)
          this.handleVerification()
        } else if (this.tabId === 2) {
          // 赠品
          this.getFreeList(1, 10)
        } else if (this.tabId === 3) {
          // 实物
          this.getGiftList(1, 10)
        } else if (this.tabId === 4) {
          // 返货券
          this.getRenturnCouponList(1, 10)
        }
      }, 200)
    },
    // tab栏2的回调
    handleTabChange(e) {
      if (this.activeTab === e) return
      this.activeTab = e
      this.list = []
      this.getOrderList(1, this.page.size)
    },
    handleCopy(text) {
      uni.setClipboardData({
        data: text
      })
    },
    /*订单*/
    getOrderList(pageIndex, pageSize) {
      return new Promise((resolve, reject) => {
        if (!this.isnotLoading) return
        this.isnotLoading = false
        let data = {
          CheckStatus: this.activeTab,
          OrderStatus: this.OrderStatus,
          PageIndex: pageIndex,
          PageSize: pageSize
        }
        apiCloud({
          url: '/api/v1/Order/QueryOrderCheckPageList',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          this.isnotLoading = true
          if (this.$ck(res)) {
            resolve(res)
            this.page.index = pageIndex
            this.page.size = pageSize
            this.page.total = Math.ceil(res.return_data.TotalCount / pageSize)
            if (pageIndex === 1) {
              this.list = res.return_data.Results || []
            } else {
              this.list = this.list.concat(res.return_data.Results || [])
            }
            this.hasMore = res.return_data.TotalCount > this.list.length
          }
        })
      })
    },
    /** 提领券 按单 */
    getPickupTicketList(pageIndex, pageSize) {
      if (!this.isnotLoading) return
      this.isnotLoading = false
      apiPickupList({
        starttime: this.startTime, //开始时间
        endtime: this.endTime, //结束时间
        keyword: this.seachData,
        keywordType: this.searchTypeValue,
        pageindex: 1,
        pagesize: pageSize,
        writeoffsource: this.writeoffTypeValue,
        maxid: this.maxId //最大ID
      }).then(res => {
        this.isnotLoading = true
        if (this.$ck(res)) {
          let { totalcount, maxid, list } = res.return_data
          this.totalCount = totalcount
          this.maxId = maxid
          this.ticketList = [...this.ticketList, ...list]
          this.hasMore = !!maxid
        }
      })
    },
    /**提领券 按券查看 */
    getPickupTicketListByCoupon(pageIndex, pageSize) {
      if (!this.isnotLoading) return
      this.isnotLoading = false
      apiPickupListByCoupon({
        starttime: this.startTime, //开始时间
        endtime: this.endTime, //结束时间
        keyword: this.seachData,
        keywordType: this.searchTypeValue,
        pageindex: pageIndex,
        pagesize: pageSize,
        writeoffsource: this.writeoffTypeValue
      }).then(res => {
        this.isnotLoading = true
        if (this.$ck(res)) {
          this.page.index = pageIndex
          let { totalcount, list, sum } = res.return_data
          this.totalCount = totalcount
          this.ticketCount = sum
          this.page.total = Math.ceil(totalcount / pageSize)
          this.ticketList = [...this.ticketList, ...list]
          this.hasMore = this.totalCount > this.ticketList.length
        }
      })
    },

    /** 实物列表 */
    getGiftList(pageIndex, pageSize) {
      if (!this.isnotLoading) return
      this.isnotLoading = false
      apiGiftList({
        starttime: this.startTime, //开始时间
        endtime: this.endTime, //结束时间
        keyword: this.seachData,
        pageindex: 1,
        pagesize: pageSize,
        maxid: this.maxId //最大ID
      }).then(res => {
        this.isnotLoading = true
        if (this.$ck(res)) {
          let { totalcount, maxid, list } = res.return_data
          this.totalCount = totalcount
          this.maxId = maxid
          this.ticketList = [...this.ticketList, ...list]
          this.hasMore = this.totalCount > this.ticketList.length
        }
      })
    },
    /** 返货券 */
    getRenturnCouponList(pageIndex, pageSize) {
      if (!this.isnotLoading) return
      this.isnotLoading = false
      apiRenturnCouponWriteOff({
        starttime: this.startTime, //开始时间
        endtime: this.endTime, //结束时间
        keyword: this.seachData,
        keywordType: this.searchTypeValue,
        pageindex: pageIndex,
        pagesize: pageSize,
        writeofftype: this.writeoffTypeValue,
        maxid: this.maxId //最大ID
      }).then(res => {
        this.isnotLoading = true
        if (this.$ck(res)) {
          this.page.index = pageIndex
          let { totalcount, list } = res.return_data
          this.totalCount = totalcount
          this.page.total = Math.ceil(totalcount / pageSize)
          if (this.page.index === 1) {
            this.returnList = list
          } else {
            this.returnList = [...this.returnList, ...list]
          }
          this.hasMore = this.totalCount > this.returnList.length
        }
      })
    },

    /** 赠品列表 */
    getFreeList(pageIndex, pageSize) {
      if (!this.isnotLoading) return
      this.isnotLoading = false
      let data = {
        pageIndex,
        pageSize,
        WordKey: this.seachData,
        CheckStartTime: this.startTime,
        CheckEndTime: this.endTime
      }
      apiCloud({
        url: '/api/v1/Recommend/FreebieVerificationList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        this.isnotLoading = true
        if (this.$ck(res)) {
          this.page.index = pageIndex
          this.page.size = pageSize
          this.page.total = Math.ceil(res.return_data.TotalCount / pageSize)
          this.totalCount = res.return_data.TotalCount
          //console.log('res.return_data.Results', res.return_data.Results)
          if (pageIndex === 1) {
            this.list = res.return_data.Results || []
          } else {
            this.list = this.list.concat(res.return_data.Results || [])
          }
          this.hasMore = this.totalCount > this.list.length
        }
      })
    },
    // 获取核销以及待核销数量
    handleVerification() {
      apiCloud({
        url: '/api/v1/Order/CheckOrderStatistics',
        method: 'post',
        data: JSON.stringify({ CheckStatus: 1, OrderStatus: 4 })
      }).then(res => {
        if (res.return_code === 0) {
          const constObj = res.return_data || {}
          this.tabs[1].count = constObj.OrderCount
        }
      })
      apiCloud({
        url: '/api/v1/Order/CheckOrderStatistics',
        method: 'post',
        data: JSON.stringify({ CheckStatus: 2, OrderStatus: 2 })
      }).then(res => {
        if (res.return_code === 0) {
          const constObj = res.return_data || {}
          this.tabs[0].count = constObj.OrderCount
        }
      })
    }
  },
  events: {}
}
</script>
<style lang="scss" scoped>
.search-box {
  display: flex;
  margin: 20rpx 30rpx;
}
.ml20 {
  margin-left: 40rpx;
}
.container-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f5f5f5;
}
.check-item {
  margin-bottom: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  .check-item__header {
    display: flex;
    padding-bottom: 28rpx;
    border-bottom: 1rpx solid #eee;
    font-size: 24rpx;
    color: #999;
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
  .order-btn--copy {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 20rpx;
    width: 60rpx;
    height: 34rpx;
    border-radius: 17rpx;
    border: 1rpx solid #ccc;
    font-size: 22rpx;
    color: #666;
  }
}
.search {
  margin: 30rpx 20rpx;
}
.ticket-box {
  padding: 0 20rpx;
  border-radius: 20rpx;
  .ticket {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 10rpx;
    .ticket-item {
      display: flex;
      font-size: 24rpx;
      margin: 10rpx 0;
      .ticket-item-left {
        flex: 1;
        text-align: right;
      }
      .ticket-item-right {
        padding-left: 50rpx;
        flex: 5;
      }
    }
  }
}
.total-number {
  padding: 20rpx 30rpx 20rpx 20rpx;
}
</style>
