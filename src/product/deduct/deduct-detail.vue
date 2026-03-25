<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight }">
      <view class="pl-30 pr-30 pt-20 fs-24">
        <text class="primary-color">*</text>
        库存扣减的历史操作记录，可通过商品、物流码进行筛选
      </view>
      <!-- =搜索= -->
      <view class="search-box">
        <search-input
          v-model="keywordOri"
          class="flex-1"
          placeholder="商品编号、商品名称"
          :show-search-btn="false"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="search-box">
        <search-input
          v-model="codeKeywordOri"
          class="flex-1"
          placeholder="物流码"
          @search="handleSearch"
        ></search-input>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="ml-30 mb-20 mr-20 mt-10" style="word-break: break-all">
      审核备注：
      <text class="primary-color">
        {{ auditRemark }}
      </text>
    </view>
    <!-- 内容 -->
    <Item :list="list" @update="handleSearch"></Item>
    <none-data v-if="list.length === 0 && !loading" msg="暂无记录~" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
  </view>
</template>
<script>
import Item from './comps/item'
import SearchInput from '@/components/search/search-input'
import LoadMore from '@/components/load-more'
import { apiGetDeduceDetail } from '@/api/stock.js'
export default {
  components: {
    SearchInput,
    Item,
    LoadMore
  },

  data() {
    return {
      codeKeywordOri: '',
      codeKeyword: '',
      keyword: '', // 关键字
      keywordOri: '',
      orderNo: '',
      addTime: '',
      list: [],
      auditRemark: '',
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      totalCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    topHeight() {
      return '250rpx'
    }
  },
  watch: {
    statusValue() {
      this.handleSearch()
    }
  },
  onLoad(options) {
    this.orderNo = options.orderNo || ''
    this.addTime = options.addTime || ''
    this.auditRemark = options.auditremark || ''
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
      this.codeKeyword = this.codeKeywordOri
      this.keyword = this.keywordOri
      this.totalCount = 0
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
      apiGetDeduceDetail({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        keyword: this.keyword,
        codekeyword: this.codeKeyword,
        orderno: this.orderNo
      }).then(res => {
        uni.stopPullDownRefresh()
        if (this.$ck(res)) {
          this.form.pageIndex = pageIndex
          let { totalcount, list } = res.return_data
          this.totalCount = totalcount
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
