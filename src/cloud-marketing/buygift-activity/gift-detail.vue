<template>
  <view class="customer" :style="themeVars">
    <view style="padding: 30rpx 15rpx">
      <Search
        :drown-flag="true"
        placeholder="输入赠品名称、赠品id"
        :value="searchText"
        :drown-list="drownList"
        @handleSearch="handleSearch"
      ></Search>
    </view>
    <view class="customerNum">
      累计赠品数量：
      <text>{{ SendOffTotalAmount }}个</text>
    </view>
    <List v-if="list.length > 0" :list="list" />
    <view v-if="defaultCopy" class="copy">没有更多了</view>
    <view v-if="list.length === 0 && isLoading" class="vh-70 flex flex-column flex-middle flex-center">
      <none-data style="padding: 0" :icon="noneIcon" msg="暂无赠品~" icon-width="256" icon-height="190" />
    </view>
  </view>
</template>

<script>
import Search from '@/components/search'
import List from './comps/detail-list.vue'
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  components: {
    Search,
    List
  },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      drownList: [
        {
          value: 0,
          label: '状态筛选'
        },
        {
          value: 1,
          label: '已完成'
        },
        {
          value: 2,
          label: '已退回'
        }
      ],
      Status: 0,
      SendOffTotalAmount: 0,
      type: 0, // 索引
      searchText: '', // 搜索
      page: {
        index: 1,
        size: 10
      },
      list: [],
      Total: 0,
      defaultCopy: false
    }
  },

  async onLoad(option) {
    this.Status = Number(option.Status) || 0
  },

  onShow() {
    this.page = {
      index: 1,
      size: 10
    }
    this.list = []
    this.GetStoreSelectGiftPageList(this.page.index, this.page.size)
  },

  // 下拉刷新
  onReachBottom() {
    if (this.Total > 0 && this.Total > this.list.length) {
      this.GetStoreSelectGiftPageList(this.page.index, this.page.size)
    } else {
      this.defaultCopy = true
    }
  },

  methods: {
    // 搜索的回调
    handleSearch(val, index) {
      this.searchText = val
      this.type = index
      this.list = []
      this.Total = 0
      this.page = {
        index: 1,
        size: 10
      }
      this.GetStoreSelectGiftPageList(this.page.index, this.page.size)
    },
    GetStoreSelectGiftPageList(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        ActivityId: 0,
        SendUserStatus: Number(this.type), // 赠送状态 (0-全部 1-已完成 2-已退回)
        Status: this.Status,
        KeyWord: this.searchText,
        PageIndex: pageIndex,
        PageSize: pageSize
      }
      apiCloud({
        url: '/api/v1/FreeGoodsActivities/StoreSelectGiftPageList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          let OrderList = (res.return_data && res.return_data.OrderList) || []
          this.list = [...this.list, ...OrderList]
          this.Total = res.return_data && res.return_data.TotalCount
          this.SendOffTotalAmount =
            res.return_data && res.return_data.SendOffTotalAmount ? res.return_data.SendOffTotalAmount : 0
          this.page.index = this.page.index + 1
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.customer {
  min-height: 100vh;
  background: #f5f5f5;
  .customerNum {
    line-height: 40rpx;
    padding: 0 30rpx;
    margin-bottom: 20rpx;
    color: #000000;
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: 500;
    text {
      color: var(--theme-color, $uni-color-primary);
    }
  }
  .copy {
    color: #ccc;
    padding: 10rpx 0;
    text-align: center;
  }
}
</style>
