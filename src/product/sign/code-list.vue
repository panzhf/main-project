<template>
  <view class="sign" style="min-height: 100vh">
    <view class="search">
      <search-input
        v-model="keywordOri"
        max-length="100"
        class="search-input"
        placeholder="请输入物流码"
        @search="handleChange"
      ></search-input>
    </view>
    <view class="product flex flex-middle">
      <image class="product-size" :src="picUrl || defaultProductPic" />
      <view class="product-content flex flex-1 flex-column flex-between ml-20">
        <view class="fs-26 fw-bold ellipsis-1">{{ productName }}</view>
      </view>
    </view>
    <view class="infos">
      <view v-if="list.length" class="infos-title infos-row">
        <view class="line1">物流码明细</view>
        <view class="line2">商品数量</view>
        <view class="line3">签收数量</view>
      </view>
      <view v-for="(item, index) in list" :key="index" class="infos-content infos-row bd-e">
        <view class="line1">{{ item.serialnumber }}</view>
        <view class="line2">{{ item.storagecount }}</view>
        <view class="line3">
          {{ item.signcount }}
        </view>
      </view>
      <none-data v-if="list.length === 0 && !loading" msg="暂无物流码明细~" icon-width="256" icon-height="190" />
      <load-more v-if="list.length" :has-more="hasMore" />
    </view>
  </view>
</template>
<script>
import SearchInput from '@/components/search/search-input.vue'
import { apiGetCodeList } from '@/api/sign'
import { staticURL } from '@/config'
import LoadMore from '@/components/load-more'
export default {
  name: '',
  components: {
    SearchInput,
    LoadMore
  },
  data() {
    return {
      defaultProductPic: staticURL() + 'common/default-pic.png',
      signInfo: {},
      keyword: '', // 关键字
      keywordOri: '',
      storageNo: '',
      productId: 0,
      productFormatId: 0,
      paging: {
        pageIndex: 0,
        pageSize: 20
      },
      picUrl: '',
      productName: '',
      storageCount: '',
      totalCount: 0,
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  onLoad(options) {
    this.storageNo = options.storageNo
    this.productId = options.productId
    this.productFormatId = options.productFormatId
    this.picUrl = options.picUrl
    this.productName = options.productName
    this.storageCount = options.storageCount
    this.getData()
  },
  onShow() {},
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    handleChange() {
      this.list = []
      this.hasMore = true
      this.busy = false
      this.loading = true
      this.totalCount = 0
      this.keyword = this.keywordOri
      this.paging = {
        pageIndex: 0,
        pageSize: 20
      }
      this.getData()
    },
    onPullDownRefresh() {
      this.handleChange()
    },
    getData() {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.paging.pageIndex + 1
      apiGetCodeList({
        productid: this.productId,
        productformatid: this.productFormatId,
        storageno: this.storageNo,
        keyword: this.keyword,
        pagesize: this.paging.pageSize,
        pageindex: pageIndex
      })
        .then(res => {
          uni.stopPullDownRefresh()
          if (this.$ck(res)) {
            this.paging.pageIndex = pageIndex
            let { list, totalcount } = res.return_data
            this.list = [...this.list, ...list]
            this.totalCount = totalcount
            this.hasMore = this.totalCount > this.list.length
          }
          this.busy = false
          this.loading = false
        })
        .catch(() => {
          this.busy = false
          this.loading = false
          this.hasMore = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.sign {
  background: #f4f4f4;
  color: #000;
  .product {
    margin: 20rpx;
    padding: 30rpx;
    background: #fff;
    border-radius: 10rpx;
    &-size {
      width: 120rpx;
      height: 120rpx;
    }
    &-content {
      height: 120rpx;
    }
  }
  .infos {
    margin: 20rpx;
    background: #fff;
    border-radius: 10rpx;
    padding: 0 20rpx;
    &-row {
      padding: 20rpx 30rpx;
      line-height: 40rpx;
      display: flex;
      .line1 {
        flex: 2;
        word-break: break-all;
      }
      .line2 {
        flex: 1;
        text-align: center;
      }
      .line3 {
        flex: 1;
        text-align: center;
      }
    }
    &-title {
      font-weight: 700;
      font-size: 32rpx;
    }
    &-content {
      font-size: 30rpx;
    }
  }
}
.search {
  padding: 40rpx 30rpx 0;
  display: flex;
  margin: 0 auto;
  ::v-deep .search-input {
    margin: 0 !important;
  }
  .search-input {
    flex: 1;
  }
}
</style>
