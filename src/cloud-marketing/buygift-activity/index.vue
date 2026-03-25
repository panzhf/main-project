<template>
  <view class="container">
    <!-- tab栏 -->
    <tab
      :tab="activiyTab"
      :draw-height="5"
      :draw-width="70"
      :active-index.sync="activiyTabIndex"
      :active-bag-color="themeInfo.color"
      @change="handleUpdate"
    ></tab>
    <view class="search">
      <Search :placeholder.sync="searchPlaceholder" :value.sync="seachData" @handleSearch="handleSearch"></Search>
    </view>
    <view class="hot-detai" @tap="handleGiftDetail">
      赠品明细
      <text class="iconfont icon-arrow-right"></text>
    </view>
    <list :list="list" :status="Status"></list>
    <view v-if="list.length === 0 && isLoading" class="vh-60 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" :msg="defaultText" icon-width="256" icon-height="190" />
    </view>
  </view>
</template>
<script>
import Tab from '@/components/tab/index.vue'
import Search from '@/components/search'
import list from './comps/list'
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  components: {
    Tab,
    Search,
    list
  },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      state: [0, 1],
      Status: 0,
      SortKey2: 1,
      activiyTab: ['当前活动', '历史活动'],
      activiyTabIndex: 0,
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
      return '请输入买赠活动名称'
    }
  },

  onLoad() {
    this.GetActivityList()
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
      if (this.activiyTabIndex === 0) {
        this.state = [0, 1]
        this.SortKey2 = 1
        this.Status = 0 // 是否历史活动(0-否 1-是)
      } else if (this.activiyTabIndex === 1) {
        this.state = [2]
        this.SortKey2 = 2
        this.Status = 1
      }
      this.seachData = ''
      this.refresh()
    },
    // 搜索的回调
    handleSearch(e) {
      this.seachData = e || ''
      this.refresh()
    },
    handleGiftDetail() {
      uni.navigateTo({
        url: `./gift-detail?Status=${this.Status}`
      })
    },
    // 获取活动列表
    GetActivityList() {
      if (this.end) return
      this.isLoading = false
      let data = {
        ActivityName: this.seachData || '',
        pageindex: this.pageindex,
        pagesize: 10,
        Status: this.state, // 状态:-1:所有(进行中+可开启)，0：进行中，1：可开启，2：已结束历史活动
        IsDisable: 2, // 是否禁用0-全部1-是2-否
        SortKey: 2, // 0-不排序1-加入时间2-状态
        SortKey2: this.SortKey2
      }
      apiCloud({
        url: '/api/v1/FreeGoodsActivities/pagelist',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        uni.stopPullDownRefresh()
        this.isLoading = true
        if (this.$ck(res)) {
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
  background-color: #f4f4f4;
}
.hot-detai {
  text-align: right;
  padding: 20rpx;
  font-size: 28rpx;
  color: #1266ff;
  .icon-arrow-right {
    font-size: 20rpx;
    padding-left: 5rpx;
  }
}
.search {
  margin: 30rpx 20rpx 0 20rpx;
}
</style>
