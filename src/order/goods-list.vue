<template>
  <view class="container">
    <!-- 顶部 -->
    <view class="container-header" style="">
      <view class="search-box">
        <search-input
          v-model="param.goodsName"
          placeholder="商品名称"
          :show-search-btn="false"
          class="mr-20"
          style="width: 256rpx"
          @search="handleSearch"
        ></search-input>
        <search-input
          v-model="param.codeValue"
          style="width: 460rpx"
          placeholder="物流码"
          @search="handleSearch"
        ></search-input>
      </view>
    </view>
    <view style="height: 120rpx"></view>
    <!-- 内容 -->
    <view>
      <goods-item :list="list"></goods-item>
    </view>
    <view v-if="list.length === 0 && !loading" style="min-height: 60vh" class="flex flex-middle">
      <none-data msg="暂无收货记录" icon-width="256" icon-height="196" />
    </view>
    <load-more v-if="list.length" :has-more="hasMore" />
  </view>
</template>
<script>
import { filterRmb } from '@/filters'
import GoodsItem from './comps/goods-item'
import SearchInput from '@/components/search/search-input'
import { apiGoodsListForOrder } from '@/api/order'
import LoadMore from '@/components/load-more'

export default {
  components: {
    SearchInput,
    GoodsItem,
    LoadMore
  },
  filters: { filterRmb },

  data() {
    return {
      param: {
        goodsName: '',
        codeValue: ''
      },
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      maxId: 0,
      totalCount: 0,
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      storageno: '' // 出货单号
    }
  },
  computed: {},
  watch: {},
  onLoad(options) {
    this.storageno = options.storageno
    this.getData()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    handleSearch() {
      // 重置
      this.list = []
      this.form.pageIndex = 0
      this.hasMore = true
      this.loading = true
      this.getData()
    },
    getData() {
      // 三期才做，到时分页方式改为传pageindex方式
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      let data = {
        storageno: this.storageno, //订单号
        serialnumberinfo: this.param.codeValue, //物流码查询
        productinfo: this.param.goodsName, //商品查询
        pageindex: pageIndex,
        pageSize: this.form.pageSize
      }
      apiGoodsListForOrder(data).then(res => {
        if (this.$ck(res)) {
          this.form.pageIndex = pageIndex
          let { list, count: totalCount } = res.return_data
          if (this.form.pageIndex === 1) {
            this.list = list || []
          } else {
            if (list) this.list = [...this.list, ...list]
          }
          this.busy = false
          this.loading = false
          this.totalCount = totalCount
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
}
</style>
