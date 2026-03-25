<template>
  <view class="container" :class="{ 'is-page': isPage }" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight }">
      <view class="warm-tip flex flex-middle">开箱记录非实时显示，将会在扫码开箱一分钟后显示</view>
      <!-- =搜索= -->
      <view class="search-box flex flex-middle">
        <ClerkPicker
          v-model="openid"
          :type="-1"
          format-openid
          custom-style="width: 280rpx;margin-right: 20rpx;"
          title="请选择扫码人"
        />
        <view class="search-date flex flex-midle flex-1" @tap="showDatePicker = true">
          <view v-if="dateFilter.startTime" class="flex-1 text-left">
            {{ dateFilter.startTime | dateSplit }}-{{ dateFilter.endTime | dateSplit }}
          </view>
          <view v-else class="flex-1">请选择时间</view>
          <text class="iconfont icon-down-arrow fs-20 ml-10"></text>
        </view>
      </view>
      <view class="search-box">
        <search-input
          v-model="keyValueOri"
          :max-length="30"
          class="search-input"
          placeholder="请输入商品名称"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="count-box fs-24 fw-bold ml-30">
        开箱数量：
        <text class="primary-color">{{ totalCount }}</text>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <!-- 内容 -->
    <Item :list="list" @update="handleSearch" @show-more="showMore"></Item>
    <none-data v-if="list.length === 0 && !loading" msg="暂无记录" icon-width="256" icon-height="190" />
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
import { apiGetChannelpinunpackingrecord } from '@/api/scan-code'
import Item from './comps/unpack-item'
import SearchInput from '@/components/search/search-input'
import DatePicker from '@/components/search/date-picker'
import ClerkPicker from '@/components/people-picker/clerk-picker.vue'
import LoadMore from '@/components/load-more'
import { dateSplit } from '@/filters'
import recordMixin from './mixins/record'
import { getdayScope } from '@/utils/index.js'
import dayjs from 'dayjs'
export default {
  components: {
    SearchInput,
    Item,
    LoadMore,
    DatePicker,
    ClerkPicker
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
      keyValue: '', // 关键字
      keyValueOri: '',
      openid: '',
      list: [],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      totalCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      topHeight: '315rpx',
      isPage: false
    }
  },
  computed: {
    isParaChange() {
      return `${this.openid}-${this.dateFilter.startTime}${this.dateFilter.endTime}`
    }
  },
  watch: {
    isParaChange(val) {
      // 监听这几个参数，有改变则立即请求数据
      this.handleSearch()
    }
  },
  onLoad(val) {
    if (val.seachTimeType) {
      this.isPage = true
      // 从首页数据概览进入：1.今日 2.本月 3.累计
      if (Number(val.seachTimeType) === 3) {
        this.dateFilter.endTime = ''
        this.dateFilter.startTime = ''
      } else {
        let seachTypeOption = {
          1: getdayScope(0),
          2: dayjs().format('YYYY-MM-01')
        }
        this.dateFilter.startTime = seachTypeOption[val.seachTimeType]
        this.dateFilter.endTime = getdayScope(0)
      }
    }
    this.getData()
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
      this.keyValue = this.keyValueOri
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
      apiGetChannelpinunpackingrecord({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        starttime: this.dateFilter.startTime ? `${this.dateFilter.startTime} 00:00:00` : '', //开始时间
        endtime: this.dateFilter.endTime ? `${this.dateFilter.endTime} 23:59:59` : '', //结束时间
        proname: this.keyValue,
        activityid: this.activityid,
        searchopenid: this.openid
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
  font-weight: 500;
  color: #000000;
  line-height: 36rpx;
  padding: 0 30rpx 20rpx;
}
</style>
