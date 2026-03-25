<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight, top: topMargin }">
      <view class="warm-tip flex flex-middle">记录门店商品被消费者扫码的数据，非实时显示</view>
      <!-- =搜索= -->
      <view class="search-box">
        <selector-picker
          v-model="type"
          :value="type"
          class="selector-width"
          :options="statusOption"
          range-key="label"
          style="width: 290rpx; flex-shrink: 0"
        ></selector-picker>
        <view class="flex ml-10 flex-1">
          <view class="search-date flex flex-1" @tap="showDatePicker = true">
            <view v-if="dateFilter.startTime" class="flex-1 text-left fs-26">
              {{ dateFilter.startTime.replaceAll('-', '.') }}-{{ dateFilter.endTime.replaceAll('-', '.') }}
            </view>
            <view v-else class="flex-1">请选择时间</view>
            <text class="icon iconfont icon-down-arrow fs-20 c-2a ml-10"></text>
          </view>
        </view>
      </view>
      <view class="search-box flex">
        <search-input
          v-model="filterOri.productname"
          :max-length="30"
          :show-search-btn="false"
          style="width: 280rpx; flex-shrink: 0"
          placeholder="请输入商品名称"
          @search="handleSearch"
        ></search-input>
        <search-input
          v-model="filterOri.sybatchno"
          :max-length="30"
          class="ml-10"
          placeholder="请输入生产批次"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="record-top flex fw-bold">
        <view>{{ totalTitle }}：</view>
        <view class="highlight">{{ totalCount }}</view>
        <template v-if="type === 1">
          <view class="ml-40">提领券数量：</view>
          <view class="highlight">{{ exchangeVoucherCount }}</view>
        </template>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <!-- 内容 -->
    <Item :list="list" :type="type" @update="handleSearch" @show-more="showMore"></Item>
    <none-data v-if="list.length === 0 && !loading" msg="暂无记录~" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
    <date-picker
      ref="datePicker"
      v-model="showDatePicker"
      :default-date.sync="startDefault"
      class="flex-1"
      @confirm="datePickerComfirm"
    ></date-picker>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import { filterRmb } from '@/filters'
import Item from './comps/item'
import SearchInput from '@/components/search/search-input'
import DatePicker from '@/components/search/date-picker'
import { apiGetConsumerRecord, apiGetAwardRecord, apiGetAwardRecordListReadStatiesDB } from '@/api/consumer'

import SelectorPicker from '@/components/search/selector-picker'
import LoadMore from '@/components/load-more'
import baseSetMixin from '@/mixins/base-set'
import { getdayScope } from '@/utils/index.js'
export default {
  components: {
    SearchInput,
    Item,
    LoadMore,
    DatePicker,
    SelectorPicker
  },
  filters: { filterRmb },
  mixins: [baseSetMixin],
  data() {
    return {
      showDatePicker: false, // 显示时间选择
      type: 0, // 默认为首次扫码记录
      statusOption: [
        {
          val: 0,
          label: '首次扫码记录'
        },
        {
          val: 1,
          label: '领奖记录'
        }
      ],
      dateFilter: {
        startTime: getdayScope(-30),
        endTime: getdayScope(0)
      }, // 时间
      filterOri: {
        productname: '',
        sybatchno: ''
      },
      keywordFilter: {},
      list: [],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      totalCount: 0,
      exchangeVoucherCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    totalTitle() {
      const o = {
        0: '开瓶数量',
        1: '开瓶领奖数量'
      }
      return o[this.type]
    },
    topHeight() {
      return '320rpx'
    },
    isParaChange() {
      return `${this.type}${this.dateFilter.startTime}${this.dateFilter.endTime}`
    }
  },
  watch: {
    isParaChange() {
      setTimeout(() => {
        this.handleSearch()
      }, 200)
    }
  },
  onLoad() {
    this.dateFilter.endTime = getdayScope(0)
    this.dateFilter.startTime = getdayScope(-30)
    this.getData()
  },
  onPullDownRefresh() {
    this.handleSearch(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.handleReachBottom()
  },
  methods: {
    handleReachBottom() {
      if (this.hasMore) {
        this.getData()
      }
    },
    showMore(index) {
      this.list[index].showMore = !this.list[index].showMore
    },
    datePickerComfirm(e) {
      if (!e) return
      this.dateFilter = {
        startTime: e.starttime,
        endTime: e.endtime
      }
    },
    // 搜索按钮的回调
    handleSearch(cb) {
      // 重置
      this.list = []
      this.form.pageIndex = 0
      this.hasMore = true
      this.loading = true
      this.totalCount = 0
      this.keywordFilter = { ...this.filterOri }
      this.type === 1 && this.getStatic()
      this.getData(cb)
    },
    getStatic() {
      let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      const { memberLogin, storeId } = storeSettingInfo
      apiGetAwardRecordListReadStatiesDB({
        fcStoreId: storeId,
        isWinning: 1,
        memberlogin: memberLogin,
        starttime: this.dateFilter.startTime ? `${this.dateFilter.startTime} 00:00:00` : '', //开始时间
        endtime: this.dateFilter.endTime ? `${this.dateFilter.endTime} 23:59:59.999` : '', //结束时间 要带上999毫秒
        awardTypes: [11],
        sourceType: -1,
        CodeType: [0],
        ScanProNameOrProNumber: this.filterOri.productname,
        sybatchno: this.filterOri.sybatchno
      }).then(res => {
        if (this.$ck(res)) {
          const { exchangevouchercount } = res.return_data
          this.exchangeVoucherCount = exchangevouchercount
        }
      })
    },
    handleDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    getData(cb) {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      const requestApi = this.type ? apiGetAwardRecord : apiGetConsumerRecord
      requestApi({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        starttime: this.dateFilter.startTime ? `${this.dateFilter.startTime} 00:00:00` : '', //开始时间
        endtime: this.dateFilter.endTime ? `${this.dateFilter.endTime} 23:59:59.999` : '', //结束时间 要带上999毫秒
        ...this.keywordFilter
      })
        .then(res => {
          typeof cb === 'function' && cb()
          if (this.$ck(res)) {
            this.form.pageIndex = pageIndex
            let { rowcount, result } = res.return_data
            this.totalCount = rowcount
            result = result.map(item => {
              return { ...item, showMore: false }
            })
            this.list = [...this.list, ...result]
            this.hasMore = this.totalCount > this.list.length
          } else {
            this.hasMore = false
          }
          this.busy = false
          this.loading = false
        })
        .catch(() => {
          this.busy = false
          this.loading = false
          typeof cb === 'function' && cb()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
.record-top {
  font-size: 28rpx;
  color: #000000;
  line-height: 36rpx;
  padding: 0 30rpx 20rpx;
}
</style>
