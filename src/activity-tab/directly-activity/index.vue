<template>
  <view class="container" :style="themeVars">
    <!-- tab栏 -->
    <tab
      :tab="activiyTab"
      :draw-height="5"
      :draw-width="70"
      :active-index.sync="state"
      :active-bag-color="themeInfo.color"
      @change="handleUpdate"
    ></tab>
    <view class="search">
      <Search :placeholder="searchPlaceholder" :value="seachData" @handleSearch="handleSearch"></Search>
    </view>
    <view class="info-goods-momeny">
      <text>
        推广分佣余额：
        <text class="info-price">¥ {{ CumulativeIncome | filterRmb }}</text>
      </text>
      <view style="padding: 0 20rpx" @tap="handleGoBalance"><text class="iconfont icon-arrow-right"></text></view>
    </view>
    <list :list="list"></list>
    <view v-if="list.length === 0 && isLoading" class="vh-60 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" :msg="defaultText" icon-width="256" icon-height="190" />
    </view>
  </view>
</template>

<script>
import Tab from '@/components/tab/index.vue'
import Search from '@/components/search'
import list from './comps/list'
import { filterRmb } from '@/filters'
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
export default {
  components: {
    Tab,
    Search,
    list
  },
  filters: { filterRmb },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      CumulativeIncome: '',
      state: 0,
      activiyTab: ['当前活动', '历史活动'],
      reachBottomStamp: 0,
      pageindex: 1,
      list: [],
      end: 0,
      seachData: ''
    }
  },

  computed: {
    defaultText() {
      return [
        this.seachData
          ? '没有找到相关的活动'
          : ['没有进行中的活动', '没有可启用的活动', '暂无已结束的活动'][this.state] || '没有相关活动'
      ]
    },
    searchPlaceholder() {
      return '请输入直营活动名称'
    }
  },

  async onLoad(option) {
    await this.GetActivityList()
    await this.handleGetCloudAssetInfo()
  },

  onPullDownRefresh() {
    this.refresh()
  },

  onReachBottom() {
    // 节流
    var reachBottomStamp = +new Date()
    if (reachBottomStamp - this.reachBottomStamp < 300) return
    this.reachBottomStamp = reachBottomStamp
    this.GetActivityList()
  },

  methods: {
    // tab栏的回调
    handleUpdate() {
      this.refresh()
    },
    // 搜索的回调
    handleSearch(data) {
      this.seachData = data || ''
      this.refresh()
    },
    handleGoBalance() {
      uni.navigateTo({
        url: './balance'
      })
    },
    // 获取活动列表
    GetActivityList() {
      if (this.end) return
      return new Promise((resolve, reject) => {
        this.isLoading = false
        let data = {
          Name: this.seachData || '',
          pageindex: this.pageindex,
          pagesize: 10,
          Status: this.state // 状态: 0：可开启，1：已结束历史活动
        }
        apiCloud({
          url: '/api/v1/Directly/ObtainDirectPopularizeActivitiesList',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          uni.stopPullDownRefresh()
          this.isLoading = true
          if (this.$ck(res)) {
            resolve()
            let returnData = res.return_data.Results || []
            let queryData = { ...data }
            if (queryData.pageindex === 1) {
              this.list = returnData
            } else {
              this.list = this.list.concat(returnData)
            }
            if (!returnData.length) {
              this.end = 1
            } else {
              this.pageindex = queryData.pageindex + 1
            }
          }
        })
      })
    },
    // 获取推广分佣余额
    handleGetCloudAssetInfo() {
      apiCloud({
        url: '/api/v1/DirectlyAssets/GetCloudAssetInfo',
        method: 'get',
        data: JSON.stringify({ roleType: 3 })
      }).then(res => {
        if (this.$ck(res)) {
          this.CumulativeIncome = res.return_data.Balance || 0
        }
      })
    },
    refresh() {
      this.end = 0
      this.pageindex = 1
      this.GetActivityList()
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f7f7f7;
  .icon-arrow-right {
    color: #1266ff;
    font-size: 20rpx;
  }
  .info-goods-momeny {
    font-size: 30rpx;
    padding: 20rpx 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .info-price {
      color: var(--theme-color, $uni-color-primary);
      font-size: 30rpx;
    }
  }
  .search {
    margin: 30rpx 20rpx;
  }
}
</style>
