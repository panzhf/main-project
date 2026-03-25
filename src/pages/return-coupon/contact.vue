<template>
  <view class="container page-contact">
    <view class="container-header flex flex-column" :style="{ height: topHeight }">
      <view v-if="lastExpenseUser" class="last-sale bg-white flex-1 flex flex-column">
        <view class="title fs-28 c-3 flex-1">最近一次报销人</view>
        <person-item :item="lastExpenseUser" bg-color="#f4f4f4" />
      </view>
      <tab
        v-if="!isDirectStore"
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="64"
        :active-index.sync="activiyTabIndex"
        :active-bag-color="themeInfo.color"
        inactive-color="#666"
        @change="handleTabChange"
      />
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="sale-list">
      <view v-for="(item, index) in list" :key="index" class="item">
        <person-item :item="item" />
      </view>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="list.length === 0 && !loading" msg="暂无数据~" icon-width="256" icon-height="190"></none-data>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetStoreRelationSalesmans, apiGetdealerinfos, apiGetStoreLastExpenseUser } from '@/api/store'
import PersonItem from './comps/person-item'
import Tab from '@/components/tab/index.vue'
import LoadMore from '@/components/load-more'

export default {
  components: { PersonItem, Tab, LoadMore },
  mixins: [],
  data() {
    return {
      activiyTabIndex: 0,
      list: [],
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      lastExpenseUser: null // 上次报销人
    }
  },
  computed: {
    topHeight() {
      // 顶部高度，顶部固定，不会被遮挡
      let height = this.lastExpenseUser ? 316 : 86
      if (this.isDirectStore) {
        // 直营门店不显示tab，没有经销商一栏
        height -= 86
      }
      return `${height}rpx`
    },
    // 是否是直营门店
    isDirectStore() {
      const { dealerid } = this.$store.state.storeInfo
      return dealerid === 0
    },
    activiyTab() {
      return this.isDirectStore ? ['业务员'] : ['业务员', '经销商']
    }
  },
  onLoad() {
    this.getStoreLastExpenseUser()
    this.getData()
  },
  onShow() {},
  onPullDownRefresh() {
    // 下拉刷新
    this.handleTabChange()
  },
  methods: {
    // 获取上次报销人
    getStoreLastExpenseUser() {
      apiGetStoreLastExpenseUser().then(res => {
        if (this.$ck(res, true)) {
          const data = res.return_data
          if (data && (data.salesmanid || data.dealerid)) {
            this.lastExpenseUser = {
              showname: `${data.expenseusername}  ${data.dealerid ? data.dealername : '总部'}`,
              mobile: data.expenseusermobile || '',
              headpath: data.expenseuserheadpath,
              salesmanid: data.salesmanid
            }
          }
        }
      })
    },
    // 一级tab栏的回调
    handleTabChange() {
      this.list = []
      this.loading = true
      this.getData()
    },
    async getData() {
      // activityTabIndex 0 业务员 1 经销商
      if (this.busy) return
      this.busy = true
      let api = this.activiyTabIndex === 0 ? apiGetStoreRelationSalesmans : apiGetdealerinfos
      let res = await api()
      uni.stopPullDownRefresh()
      if (this.$ck(res, true)) {
        if (this.activiyTabIndex === 0) {
          // 业务员
          const { storesalesmans, storedealersalesmans } = res.return_data
          // 直营门店显示关联的厂家业务员，有关联的经销商业务员则显示关联的关联的经销商业务员，否则显示经销商下所有业务员
          let data = storesalesmans || storedealersalesmans
          this.list = data
            ? data.map(item => {
                item.showname = `${item.salesmanname}  ${item.dealerid ? item.dealername : '总部'}`
                item.salesmanid = item.id || 0
                return item
              })
            : []
        } else {
          // 经销商, 显示门店的经销商信息
          let data = res.return_data
          this.list = data
            ? data.map(item => {
                item.showname = `${item.leader}  ${item.dealername}`
                return item
              })
            : []
        }
      }
      this.hasMore = false
      this.busy = false
      this.loading = false
    }
  }
}
</script>
<style lang="scss" scoped>
.page-contact {
  min-height: 100vh;
  background-color: #f4f4f4;
  .container-header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 99;
    .last-sale {
      padding: 20rpx;
      ::v-deep .person-box {
        padding: 26rpx 30rpx 24rpx !important;
        overflow: hidden;
      }
    }
    ::v-deep .tab-box {
      .tab-item {
        border-bottom: 0;
      }
    }
  }
  .sale-list {
    padding: 24rpx 20rpx 0;
    .item {
      margin-bottom: 24rpx;
    }
  }
}
</style>
