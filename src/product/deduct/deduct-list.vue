<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight }">
      <!-- =搜索= -->
      <view class="search-box">
        <selector-picker
          v-model="statusValue"
          class="selector-width"
          :options="statusOption"
          range-key="label"
        ></selector-picker>
        <search-input
          v-model="orderNoOri"
          class="ml-20 flex-1"
          placeholder="扣减单号"
          :show-search-btn="false"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="search-box">
        <search-input
          v-model="keywordOri"
          class="flex-1"
          placeholder="商品编号、商品名称"
          @search="handleSearch"
        ></search-input>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="ml-30 mb-20">
      扣减总数
      <text class="primary-color ml-20">{{ deductTotalCount }}</text>
    </view>
    <!-- 内容 -->
    <List :list="list" @update="handleSearch"></List>
    <none-data v-if="list.length === 0 && !loading" msg="暂无记录~" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
  </view>
</template>
<script>
import { filterRmb } from '@/filters'
import List from './comps/list'
import SearchInput from '@/components/search/search-input'
import SelectorPicker from '@/components/search/selector-picker'
import LoadMore from '@/components/load-more'
import { apiGetDeduceList } from '@/api/stock.js'

export default {
  components: {
    SearchInput,
    SelectorPicker,
    List,
    LoadMore
  },
  filters: { filterRmb },

  data() {
    return {
      customStyle: {
        width: '120rpx',
        height: '70rpx',
        fontSize: '30rpx'
      },
      keyValue: '', // 关键字
      keywordOri: '',
      orderNo: '',
      orderNoOri: '',
      statusValue: -1, // 报销状态 初始为待审核
      statusOption: [
        //  "status": -1-全部，0-待审核，1-审核通过，2-审核不通过
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
          label: '审核通过'
        },
        {
          val: 2,
          label: '审核不通过'
        }
      ],

      list: [],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      deductTotalCount: 0,
      totalCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    topHeight() {
      return '230rpx'
    }
  },
  watch: {
    statusValue() {
      this.handleSearch()
    }
  },
  onLoad() {
    this.getData()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    // 搜索按钮的回调
    handleSearch() {
      this.list = []
      this.form.pageIndex = 0
      this.orderNo = this.orderNoOri
      this.keyValue = this.keywordOri
      this.totalCount = 0
      this.deductTotalCount = 0
      this.hasMore = true
      this.loading = true
      this.getData()
    },
    handleDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    onPullDownRefresh() {
      this.handleSearch()
    },
    getData() {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      apiGetDeduceList({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        status: this.statusValue,
        keyword: this.keyValue,
        orderno: this.orderNo
      }).then(res => {
        uni.stopPullDownRefresh()
        if (this.$ck(res)) {
          this.form.pageIndex = pageIndex
          let { count: totalCount, list, deducttotalcount } = res.return_data
          this.totalCount = totalCount
          this.deductTotalCount = deducttotalcount
          if (this.form.pageIndex === 1) {
            this.list = list
          } else {
            if (list) this.list = [...this.list, ...list]
          }
          this.busy = false
          this.loading = false
          this.hasMore = this.totalCount > this.list.length
        } else {
          this.busy = false
          this.loading = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f5f5f5;
}
.search-box {
  display: flex;
  margin: 20rpx 30rpx 20rpx 30rpx;
  .order-ralation {
    width: 250rpx;
    text-align: center;
    background: #fff;
    padding: 0 0 0 32rpx;
    height: 76rpx;
    border-radius: 35rpx;
    line-height: 76rpx;
  }
  .selector-width {
    width: 280rpx;
    flex-shrink: 0;
  }
  .search-date {
    text-align: center;
    background: #fff;
    padding: 0 32rpx;
    height: 76rpx;
    border-radius: 35rpx;
    line-height: 76rpx;
  }
}
</style>
