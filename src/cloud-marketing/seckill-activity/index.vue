<template>
  <view class="container" :style="themeVars">
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
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
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
          : ['没有进行中的活动', '没有可启用的活动', '暂无已结束的活动'][this.activiyTabIndex] || '没有相关活动'
      ]
    },
    searchPlaceholder() {
      return '请输入秒杀活动名称'
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
      this.seachData = ''
      this.refresh()
    },
    // 搜索的回调
    handleSearch(e) {
      this.seachData = e || ''
      this.refresh()
    },
    // 获取活动列表
    GetActivityList() {
      if (this.end) return
      this.isLoading = false
      let data = {
        SeckillActivityName: this.seachData || '',
        pageindex: this.pageindex,
        pagesize: 10,
        Status: this.activiyTabIndex
      }
      apiCloud({
        url: '/api/v1/SeckillActivity/SeckillActivityList',
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
.search {
  margin: 30rpx 20rpx;
}
</style>
