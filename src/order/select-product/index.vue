<template>
  <view class="product" :style="themeVars">
    <view class="search flex">
      <view class="block block--select flex flex-middle fs-26 mr-20" @tap="handleShowSelect">
        <text class="flex-1 fw-bold ellipsis-1">{{ classfyName }}</text>
        <text class="picker-icon icon iconfont icon-down-arrow fs-20 c-0 pl-10"></text>
      </view>
      <view class="search-box flex-1">
        <search-input
          v-model="keyValue"
          class="flex-1"
          placeholder="商品编号、商品名称"
          @search="handleSearch"
        ></search-input>
      </view>
    </view>
    <view
      v-for="(item, index) in list"
      :key="index"
      class="product-item flex flex-middle ml-30 mr-30 mb-20 bd-e br-20 bg-white"
    >
      <view class="select flex flex-middle pl-20 pr-20" @tap="handleCheck(item, index)">
        <view class="iconfont fs-40" :class="item.checked ? 'icon-checked' : 'icon-unchecked'"></view>
      </view>
      <v-img class="pic br-10" :src="item.picurl || defaultProductPic" :size="130" />
      <view class="info flex-1 overflow-h ml-20 mr-20">
        <view class="title ellipsis fw-bold">
          {{ item.productname }}
        </view>
        <view class="c-6 fs-24">{{ item.productno }}</view>
        <view class="flex flex-middle">
          <view class="format flex-1 fs-24 ellipsis-2 mr-10">{{ item.productformatname }}</view>
          <view class="number mt-10 fs-30">
            <u-number-box
              v-model="item.value"
              :min="1"
              :max="999999"
              @blur="handleValChange(item)"
              @minus="handleValChange(item)"
              @plus="handleValChange(item)"
            ></u-number-box>
          </view>
        </view>
        <view v-if="showOrderPrice" class="price fs-24">订货价：￥{{ item.storeorderprice }}</view>
      </view>
    </view>
    <view v-if="list.length === 0 && !loading" style="min-height: 60vh" class="flex flex-middle flex-center">
      <none-data msg="暂无商品~" icon-width="256" icon-height="196" />
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />

    <view>
      <view style="height: 125rpx"></view>
      <view class="fixed-bottom flex flex-middle pt-20 pl-30">
        <view class="select flex flex-middle" @tap="handleCheckAll(checkedAll)">
          <text class="iconfont fs-40" :class="checkedAll ? 'icon-checked' : 'icon-unchecked'"></text>
          <text class="ml-10">全选</text>
        </view>
        <view class="flex-1 flex flex-middle flex-around">
          <view class="selected-product fw-medium" @tap="handleShowChoosedList">已选{{ totalCount }}件</view>
          <view v-if="showOrderPrice" class="total">
            <text class="fs-26">合计：</text>
            <text class="fs-30 primary-color fw-bold">￥{{ totalPrice }}</text>
          </view>
        </view>
        <button
          class="primary-btn size-small round mr-30"
          style="width: 200rpx"
          :disabled="totalCount === 0"
          hover-class="button-action"
          @tap="handleComfirm"
        >
          确认
        </button>
      </view>
    </view>

    <classfy-popup
      v-model="showClassfy"
      :super-info="superInfo"
      :sub-info="subInfo"
      @update="handleUpdateClassfyInfo"
    ></classfy-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
import SearchInput from '@/components/search/search-input.vue'
import { apiGetOrderGoods } from '@/api/order'
import LoadMore from '@/components/load-more'
import { formatPrice } from '@/filters'
import { staticURL } from '@/config'
export default {
  components: { SearchInput, LoadMore },
  data() {
    return {
      superInfo: { id: -1 }, // 一级分类
      subInfo: { id: -1 }, // 二级分类
      defaultProductPic: staticURL() + 'common/default-pic.png',
      showClassfy: false,
      list: [],
      customerId: 0,
      storeId: 0,
      keyValue: '',
      params: {
        keyword: '',
        categoryids: ''
      },
      code: '', // 码
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      pageIndex: 0,
      busy: false, // 防重复请求标识
      isbatch: 0, // 1：批量  0：单个
      type: '', // 实物兑换：materialCoupon   提领券：pickupCoupon
      choosedList: [], // 当前页面已选择商品记录
      deletedGoodsList: [] //在已选择列表删除的商品id
    }
  },
  computed: {
    classfyName() {
      let superName = this.superInfo.id !== -1 ? this.superInfo.categoryname : '全部分类'
      let subName = this.subInfo.id !== -1 ? this.subInfo.categoryname : ''
      return superName + subName
    },
    categoryIds() {
      let superId = this.superInfo.id !== -1 ? this.superInfo.id : ''
      let subId = this.subInfo.id !== -1 ? `-${this.subInfo.id}` : ''
      let categoryIds = ''
      if (superId) {
        categoryIds = `${superId}${subId}`
      }
      return categoryIds
    },
    checkedAll() {
      if (this.list.length) {
        let chooseLlist = this.list.filter(item => item.checked)
        return chooseLlist.length === this.list.length
      } else {
        return false
      }
    },
    totalCount() {
      return this.choosedList.reduce((acc, val) => acc + val.value, 0)
    },
    totalPrice() {
      return formatPrice(this.choosedList.reduce((acc, val) => acc + val.storeorderprice * val.value, 0))
    },
    ...mapGetters(['showOrderPrice'])
  },
  watch: {
    categoryIds(v) {
      this.handleSearch()
    }
  },
  onLoad(options) {
    this.$store.dispatch('updateChoosedGoodsList', [])
    this.fetchData()
  },
  async onShow() {
    uni.$once('deletedGoods', res => {
      if (res.length > 0) {
        this.deletedGoodsList = res
        this.handleDealDeletedList()
      }
    })
    uni.$once('refresh-products', () => {
      // 下单页若因订单金额、订购价开关发现变化，需返回到当前页刷新商品
      this.choosedList = []
      this.list = []
      this.$store.dispatch('updateChoosedGoodsList', [])
      this.fetchData()
    })
  },
  methods: {
    handleShowSelect() {
      this.showClassfy = true
    },
    handleComfirm() {
      // 确定
      if (this.choosedList.length === 0) {
        return this.$msg('请至少选择一件商品')
      }
      this.updateStateChooseList()
      const p = this.showOrderPrice ? `?price=${this.totalPrice}` : ''
      uni.navigateTo({
        url: `/order/comfirm${p}`
      })
    },
    handleUpdateClassfyInfo(superInfo, subInfo) {
      this.superInfo = superInfo
      this.subInfo = subInfo
    },
    onReachBottom() {
      if (this.hasMore) {
        this.fetchData()
      }
    },
    // 搜索按钮的回调
    handleSearch() {
      // 重置
      this.list = []
      this.pageIndex = 0
      this.params = {
        keyword: this.keyValue,
        categoryids: this.categoryIds
      }
      this.hasMore = true
      this.fetchData()
    },
    async fetchData() {
      if (this.busy) return
      this.busy = true
      // 获取商品列表
      let pageIndex = this.pageIndex + 1
      let params = {
        keyword: this.params.keyword, //关键字：商品编号、商品名称
        categoryids: this.params.categoryids, //分类筛选 3029-3031
        pagesize: 10,
        pageindex: pageIndex
      }
      let res = await apiGetOrderGoods(params)
      if (this.$ck(res, true)) {
        let { list, count } = res.return_data
        if (list.length) {
          let nextList = list.map(item => {
            let newItem = this.handleSetOriStatus(item)
            return newItem
          })
          this.list = [...this.list, ...nextList]
        }
        this.pageIndex++
        this.busy = false
        this.loading = false
        this.hasMore = this.list.length < count
      } else {
        this.busy = false
        this.loading = false
      }
    },
    handleSetOriStatus(oriItem) {
      // 处理新请求的数据
      let flag = false
      let rightData = {}
      for (let i = 0; i < this.choosedList.length; i++) {
        let item = this.choosedList[i]
        if (oriItem.productno === item.productno) {
          flag = true
          rightData = { ...item, storeorderprice: oriItem.storeorderprice }
          break
        }
      }
      if (!flag) {
        rightData = {
          value: 1,
          checked: false,
          ...oriItem
        }
      }
      return rightData
    },
    handleCheck(item, index) {
      item.checked = !item.checked
      this.list.splice(index, 1, item)
      this.dealWithChooseItem(item)
    },
    handleCheckAll(status) {
      // 全选、取消全选
      this.list = this.list.map(item => {
        item.checked = !status
        this.dealWithChooseItem(item)
        return item
      })
    },
    handleValChange(item) {
      // 数量变化
      this.dealWithChooseItem(item)
    },
    updateStateChooseList() {
      this.$store.dispatch('updateChoosedGoodsList', this.choosedList)
    },
    handleShowChoosedList() {
      this.updateStateChooseList()
      uni.navigateTo({
        url: `/order/select-product/selected-product`
      })
    },
    dealWithChooseItem(item) {
      // 保存到已经选列表
      let flag = false
      for (let i = 0; i < this.choosedList.length; i++) {
        if (item.productno === this.choosedList[i].productno) {
          if (item.checked) {
            this.choosedList.splice(i, 1, item)
          } else {
            this.choosedList.splice(i, 1)
          }
          flag = true
          break
        }
      }
      if (!flag && item.checked) {
        this.choosedList.splice(this.choosedList.length, 1, item)
      }
    },
    handleDealDeletedOriList(item) {
      // 将删除的商品在操作列表设置 checked为false
      for (let i = 0; i < this.list.length; i++) {
        if (item.productno === this.list[i].productno) {
          this.list[i].checked = false
          break
        }
      }
    },
    handleDealDeletedList() {
      // 处理已选页面删除的已选商品
      this.deletedGoodsList.forEach(item => {
        this.handleDealDeletedOriList(item)
        this.dealWithChooseItem(item)
      })
      this.deletedGoodsList = []
    }
  }
}
</script>
<style lang="scss">
.u-numberbox {
  .u-icon-minus,
  .u-icon-plus,
  .u-number-input {
    border: 1px solid #ccc !important;
    background: #fff !important;
    height: 56rpx !important;
    line-height: 56rpx !important;
    box-sizing: border-box;
    color: #222 !important;
    font-size: 32rpx !important;
  }
  .u-number-input {
    margin: 0 -1px !important;
    width: 84rpx !important;
  }
  .u-icon-minus,
  .u-icon-plus {
    width: 56rpx !important;
  }
}
</style>
<style lang="scss" scoped>
.product {
  &-item {
    padding: 30rpx 0;
    .format {
      color: #999;
    }
    .number {
      color: #222;
    }
    .pic {
      @include wh(130rpx);
      background: #f6f6f6;
    }
  }
  .fixed-bottom {
    position: fixed;
    background-color: #fff;
    border-top: 1px solid #eee;
    width: 100%;
    left: 0;
    bottom: 0;
    z-index: 100;
    @include safe-area(20rpx);
    .selected-product {
      color: $uni-color-edit;
    }
  }
}
.select {
  height: 80rpx;
  .icon-checked {
    // color: $uni-color-primary;
    color: var(--theme-color, $uni-color-primary);
  }
  .icon-unchecked {
    color: #ccc;
  }
}
.search {
  padding: 0 30rpx;
  margin: 20rpx auto;

  .block {
    padding: 0 20rpx;
    flex-shrink: 0;
    background: #fff;
    height: 76rpx;
    background: #ffffff;
    border-radius: 35rpx;

    @include box;
    &.block--select {
      width: 210rpx;
    }
    &.block--time {
      padding: 0 10rpx;
    }
    &.block--status {
      flex: 1;
      margin-left: 20rpx;
    }
  }
}
</style>
