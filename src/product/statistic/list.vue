<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight }">
      <!-- =搜索= -->
      <view class="search-box">
        <search-input
          v-model="keyValueOri"
          class="flex-1"
          placeholder="商品编号、商品名称"
          @search="handleSearch"
        ></search-input>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <!-- 内容 -->
    <view class="fs-28 fw-bold ml-30 mb-20">
      库存总数：
      <text class="primary-color">{{ stockCount }}</text>
    </view>
    <List :list="list"></List>
    <none-data v-if="list.length === 0 && !loading" msg="暂无统计记录~" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
  </view>
</template>
<script>
import { filterRmb } from '@/filters'
import List from './comps/list'
import SearchInput from '@/components/search/search-input'
import { apiGetStockList } from '@/api/stock'
import LoadMore from '@/components/load-more'
export default {
  components: {
    SearchInput,
    List,
    LoadMore
  },
  filters: { filterRmb },

  data() {
    return {
      keyValueOri: '',
      keyword: '', // 关键字
      list: [],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      stockCount: 0,
      topHeight: '120rpx',
      totalCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  watch: {},
  onLoad() {
    this.getData()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    handleSearch() {
      this.list = []
      this.form.pageIndex = 0
      this.stockCount = 0
      this.totalCount = 0
      this.keyword = this.keyValueOri
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
      apiGetStockList({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        keyword: this.keyword
      }).then(res => {
        uni.stopPullDownRefresh()
        if (this.$ck(res)) {
          this.form.pageIndex = pageIndex
          let { totalcount, list, stockcount } = res.return_data
          this.totalCount = totalcount
          this.stockCount = stockcount
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
  .selector-width {
    width: 250rpx;
    flex-shrink: 0;
  }
}
</style>
