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
      <Search placeholder="请输入派券活动名称" :value="seachData" @handleSearch="handleSearch"></Search>
    </view>
    <view class="stamps">
      <view class="stamps-button" @tap="handleDetail">
        领券明细
        <text class="iconfont icon-arrow-right"></text>
      </view>
    </view>
    <List :list="list"></List>
    <view v-if="list.length === 0 && isLoading" class="vh-60 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" :msg="defaultText" icon-width="256" icon-height="190" />
    </view>
  </view>
</template>

<script>
import Tab from '@/components/tab/index.vue'
import Search from '@/components/search'
import List from './comps/list.vue'
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  components: {
    Tab,
    Search,
    List
  },

  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      state: 0,
      activiyTab: ['当前活动', '历史活动'],
      reachBottomStamp: 0,
      pageindex: 1,
      list: [],
      end: 0,
      seachData: '',
      sortField: 0, // 排序字段 0：开始时间，1：参与人数，1：获奖人数
      sortDirection: 0 // 排序方向 0：倒序，1：升序
    }
  },

  computed: {
    defaultText() {
      return [
        this.seachData
          ? '没有找到相关的活动'
          : ['没有进行中的活动', '没有可启用的活动', '暂无已结束的活动'][this.state] || '没有相关活动'
      ]
    }
  },

  onLoad(option) {
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
    // tab栏切换的回调
    handleUpdate() {
      this.seachData = ''
      this.refresh()
    },
    // 搜索栏的回调
    handleSearch(data) {
      this.seachData = data || ''
      this.refresh()
    },
    /** 领取明细 */
    handleDetail() {
      uni.navigateTo({
        url: `./detail`
      })
    },
    // 获取活动列表
    GetActivityList() {
      if (this.end) return
      this.isLoading = false
      let data = {
        WordKey: this.seachData || '',
        pageindex: this.pageindex,
        pagesize: 10,
        State: this.state, // 状态:-1:所有(进行中+可开启)，0：进行中，1：可开启，2：已结束历史活动
        sortField: this.sortField, // 排序字段 0：开始时间，1：参与人数，1：获奖人数
        sortDirection: this.sortDirection // 排序方向 0：倒序，1：升序
      }
      apiCloud({
        url: '/api/v1/CollectCouponsAct/QueryCouponsAct',
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
.stamps {
  display: flex;
  justify-content: flex-end;
  font-size: 24rpx;
  font-weight: 500;
  color: rgba(51, 133, 255, 1);
  line-height: 40rpx;
  padding: 0 30rpx;
  // background-color: #f4f4f4;
  margin-bottom: 20rpx;
  .icon-arrow-right {
    font-size: 20rpx;
    padding-left: 5rpx;
  }
}
.search {
  margin: 30rpx 20rpx 20rpx 20rpx;
}
</style>
