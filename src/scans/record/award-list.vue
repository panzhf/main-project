<template>
  <view class="container">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight }">
      <view class="warm-tip flex flex-middle">领奖记录非实时显示，将会在扫码一分钟后显示</view>
      <!-- =搜索= -->
      <view class="search-box">
        <view class="flex" style="width: 710rpx">
          <view class="search-date flex flex-1" @tap="showDatePicker = true">
            <view v-if="dateFilter.startTime" class="flex-1 text-left">
              {{ dateFilter.startTime | dateSplit }}-{{ dateFilter.endTime | dateSplit }}
            </view>
            <view v-else class="flex-1"></view>
            <text class="icon iconfont icon-down-arrow fs-20 c-2a ml-10"></text>
          </view>
        </view>
      </view>
      <view class="count-box fs-24 fw-bold ml-30">
        扫码红包共计：
        <u-loading :show="amountLoading" mode="flower" size="24" color="#FF7640"></u-loading>
        <text v-if="!amountLoading">
          <text class="primary-color mr-5">{{ totalAmount }}</text>
          元
        </text>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <!-- 内容 -->
    <Item :list="list" @update="handleSearch"></Item>
    <none-data v-if="list.length === 0 && !loading" msg="暂无记录" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
    <date-picker
      ref="datePicker"
      v-model="showDatePicker"
      :default-date.sync="startDefault"
      class="flex-1"
      @confirm="datePickerComfirm"
    ></date-picker>
  </view>
</template>
<script>
import { dateSplit } from '@/filters'
import Item from './comps/award-item'
import DatePicker from '@/components/search/date-picker'
import { apiGetChannelpinawardrecord, apiGetAwardRecordStat } from '@/api/scan-code'
import LoadMore from '@/components/load-more'
import recordMixin from './mixins/record'
import { getdayScope } from '@/utils/index.js'
export default {
  components: {
    Item,
    LoadMore,
    DatePicker
  },
  filters: { dateSplit },
  mixins: [recordMixin],
  data() {
    return {
      showDatePicker: false, // 显示时间选择
      dateFilter: {
        startTime: getdayScope(-30),
        endTime: getdayScope(0)
      }, // 时间
      totalAmount: 0,
      amountLoading: true,
      list: [],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      totalCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      topHeight: '215rpx'
    }
  },
  computed: {
    isParaChange() {
      return `${this.dateFilter.startTime}${this.dateFilter.endTime}`
    }
  },
  watch: {
    isParaChange(val) {
      // 监听这几个参数，有改变则立即请求数据
      this.handleSearch()
    }
  },
  methods: {
    handleReachBottom() {
      if (this.hasMore) {
        this.getData()
      }
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
      this.totalAmount = 0
      this.form.pageIndex = 0
      this.hasMore = true
      this.loading = true
      this.totalCount = 0
      this.getData(cb)
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
      let p = {
        starttime: this.dateFilter.startTime ? `${this.dateFilter.startTime} 00:00:00` : '', //开始时间
        endtime: this.dateFilter.endTime ? `${this.dateFilter.endTime} 23:59:59` : '', //结束时间
        activityid: this.activityid
      }
      apiGetChannelpinawardrecord({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        ...p
      })
        .then(res => {
          typeof cb === 'function' && cb()
          if (this.$ck(res)) {
            this.form.pageIndex = pageIndex
            let { rowcount, awardprizelist } = res.return_data
            this.totalCount = rowcount
            this.list = [...this.list, ...awardprizelist]
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

      this.amountLoading = true
      apiGetAwardRecordStat(p).then(res => {
        this.amountLoading = false
        if (this.$ck(res)) {
          this.totalAmount = res.return_data?.hbsum || 0
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/index.scss';
</style>
