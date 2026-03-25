<template>
  <view class="customer" :style="themeVars">
    <view style="margin: 30rpx 20rpx">
      <Search
        :drown-flag="true"
        placeholder="输入微信昵称、手机号"
        :value="searchText"
        :drown-list="drownList"
        @handleSearch="handleSearch"
      ></Search>
    </view>
    <view class="customerNum">
      共
      <text>{{ Total }}</text>
      个分销员
    </view>
    <List v-if="list.length > 0" :list="list" />
    <view v-if="defaultCopy" class="copy">没有更多了</view>
    <view v-if="list.length === 0 && isLoading" class="vh-60 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" msg="暂无分销员~" icon-width="256" icon-height="190" />
    </view>
    <view class="add-button">
      <button class="primary-btn round" hover-class="button-action" @tap="handleAddSales">添加分销员</button>
    </view>
  </view>
</template>

<script>
import Search from '@/components/search'
import List from './comps/list'
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
          label: '条件筛选'
        },
        {
          value: 1,
          label: '正常'
        },
        {
          value: 2,
          label: '已清退'
        },
        {
          value: 3,
          label: '待审核'
        },
        {
          value: 4,
          label: '未通过'
        }
      ],
      type: -1,
      searchText: '', // 搜索
      page: {
        index: 1,
        size: 10
      },
      list: [],
      Total: 0,
      defaultCopy: false,
      IsManualAdd: 0
    }
  },
  onLoad(option) {
    this.getGetDistributionBase()
  },
  onShow() {
    this.page = {
      index: 1,
      size: 10
    }
    this.list = []
    this.GetDistributionUserList(this.page.index, this.page.size)
  },
  // 上拉刷新
  onReachBottom() {
    if (this.Total > 0 && this.Total > this.list.length) {
      this.GetDistributionUserList(this.page.index, this.page.size)
    } else {
      this.defaultCopy = true
    }
  },
  methods: {
    // 搜索的回调
    handleSearch(val, index) {
      this.searchText = val
      switch (index) {
        case 0:
          this.type = -1
          break
        case 1:
          this.type = 1
          break
        case 2:
          this.type = 3
          break
        case 3:
          this.type = 0
          break
        case 4:
          this.type = 2
          break
      }
      this.list = []
      this.Total = 0
      this.page = {
        index: 1,
        size: 10
      }
      this.GetDistributionUserList(this.page.index, this.page.size)
    },
    handleAddSales() {
      uni.navigateTo({
        url: `./add-sales`
      })
    },
    async getGetDistributionBase() {
      let res = await apiCloud({
        url: '/api/v1/DistributionUser/GetDistributionBase',
        method: 'get',
        data: JSON.stringify({})
      })
      this.IsManualAdd = res.return_data.IsManualAdd
    },
    GetDistributionUserList(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        AuditStatus: this.type,
        KeyWord: this.searchText,
        PageIndex: pageIndex,
        PageSize: pageSize
      }
      apiCloud({
        url: '/api/v1/DistributionUser/DistributionUserList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.list = [...this.list, ...res.return_data.Results]
          this.Total = res.return_data.TotalCount
          this.page.index = this.page.index + 1
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.customer {
  height: 100vh;
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
  .add-button {
    position: fixed;
    bottom: 40rpx;
    bottom: calc(40rpx + constant(safe-area-inset-bottom));
    width: 100%;
    padding: 0 20rpx;
  }
}
</style>
