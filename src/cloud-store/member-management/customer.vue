<template>
  <view v-if="isLoading" class="customer" :style="themeVars">
    <view style="margin: 30rpx 20rpx">
      <Search
        :drown-flag="!OpenId ? true : false"
        placeholder="输入微信昵称、手机号"
        :value="searchText"
        :drown-list="drownList"
        @handleSearch="handleSearch"
      ></Search>
    </view>
    <view class="customerNum">
      共
      <text>{{ Total }}</text>
      个客户
      <view class="fk">
        访客：
        <text>{{ visitor }}</text>
        人
      </view>
    </view>
    <List v-if="list.length > 0" :list="list" />
    <view v-if="defaultCopy" class="copy">没有更多了</view>
    <none-data v-if="list.length <= 0" msg="暂无客户" icon-width="256" icon-height="190" />
  </view>
</template>
<script>
import Search from '@/components/search'
import List from './comps/customer-list'
import { apiCloud } from '@/api/cloud-store'
// import { distribution } from './base64.js'
export default {
  components: {
    Search,
    List
  },
  data() {
    return {
      isLoading: false,
      drownList: [
        {
          value: 0,
          label: '条件筛选'
        },
        {
          value: 1,
          label: '购买客户'
        },
        {
          value: 2,
          label: '未购买客户'
        },
        {
          value: 3,
          label: '分销员'
        }
      ],
      visitor: 0,
      OpenId: '',
      // distribution,
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

  onLoad(option) {
    this.OpenId = option.OpenId || ''
  },

  async onShow() {
    this.page = {
      index: 1,
      size: 10
    }
    this.list = []
    if (!this.OpenId) {
      await this.GetMiniUserList(this.page.index, this.page.size)
    } else {
      this.GetDistributionUserSubordinates(this.page.index, this.page.size)
    }
    apiCloud({
      url: '/api/v1/MiniUser/GetVisitors',
      method: 'get',
      data: JSON.stringify({})
    }).then(res => {
      this.visitor = res.return_data
    })
  },

  // 下拉刷新
  onReachBottom() {
    if (this.Total > 0 && this.Total > this.list.length) {
      this.GetMiniUserList(this.page.index, this.page.size)
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
      if (this.OpenId) {
        this.GetDistributionUserSubordinates(this.page.index, this.page.size)
      } else {
        this.GetMiniUserList(this.page.index, this.page.size)
      }
    },
    GetMiniUserList(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        ScreeningType: this.type.toString(),
        KeyWord: this.searchText,
        PageIndex: pageIndex,
        PageSize: pageSize
      }
      apiCloud({
        url: '/api/v1/MiniUser/GetMiniUserList',
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
    },

    // 查询下级客户
    GetDistributionUserSubordinates(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        Openid: this.OpenId,
        KeyWord: this.searchText,
        PageIndex: pageIndex,
        PageSize: pageSize
      }
      apiCloud({
        url: '/api/v1/DistributionUser/DistributionUserSubordinates',
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
.fk {
  margin-left: 10rpx;
  display: inline-block;
}
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
}
</style>
