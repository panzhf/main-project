<template>
  <view class="container" :style="themeVars">
    <view style="margin: 30rpx 20rpx">
      <Search
        :drown-flag="true"
        placeholder="请输入订单号"
        :value="seachData"
        :drown-list="drownList"
        @handleSearch="handleSearch"
      ></Search>
    </view>
    <view class="list">
      <view class="num">
        <view class="num-left">
          已领券数量：
          <text>{{ num.TotalCount }}</text>
          张
        </view>
        <view class="num-right">
          已下单数量：
          <text>{{ num.OrderNum }}</text>
          张
        </view>
      </view>
      <view></view>
    </view>
    <view>
      <view class="activity-box">
        <view v-for="(item, index) in list" :key="index">
          <detailList :clerk="item" />
        </view>
      </view>
    </view>
    <view v-if="list.length === 0 && isLoading" class="vh-70 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" msg="没有相关明细" icon-width="256" icon-height="190" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import Search from '@/components/search'
import detailList from './comps/detail-list.vue'
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  components: {
    Search,
    detailList
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
          label: '已使用'
        },
        {
          value: 2,
          label: '未使用'
        }
      ],
      type: -1, // 索引
      seachData: '',
      Id: '',
      list: [],
      page: {
        index: 1,
        size: 10,
        total: 0
      },
      num: {
        OrderNum: 0,
        TotalCount: 0
      }
    }
  },

  async onLoad(data) {
    if (data.Id) {
      this.Id = data.Id
    }
    this.GetStoreLotteryInfo(this.page.index, this.page.size)
  },

  onReachBottom() {
    // 节流
    var reachBottomStamp = +new Date()
    if (reachBottomStamp - this.reachBottomStamp < 300) return
    this.reachBottomStamp = reachBottomStamp
    if (this.page.total > 0 && this.page.total > this.page.index) {
      this.GetStoreLotteryInfo(this.page.index + 1, this.page.size)
    }
  },

  methods: {
    // 搜索栏的回调
    handleSearch(val, index) {
      this.seachData = val
      switch (index) {
        case 0:
          this.type = -1
          break
        case 1:
          this.type = 2
          break
        case 2:
          this.type = 1
          break
      }
      this.refresh()
    },
    /** 获取领取明细 */
    GetStoreLotteryInfo(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        Status: this.type,
        actId: Number(this.Id),
        NickName: this.seachData || '',
        pageindex: pageIndex,
        pagesize: pageSize
      }
      apiCloud({
        url: '/api/v1/CollectCouponsAct/QueryVolume',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        uni.stopPullDownRefresh()
        this.isLoading = true
        if (this.$ck(res)) {
          this.page.index = pageIndex
          this.page.size = pageSize
          this.page.total = Math.ceil(res.return_data.TotalCount / pageSize)
          if (pageIndex === 1) {
            this.list = res.return_data.list || []
          } else {
            this.list = this.list.concat(res.return_data.list || [])
          }
          this.num.TotalCount = res.return_data.TotalCount
          this.num.OrderNum = res.return_data.OrderNum
        }
      })
    },
    /** 重置 */
    refresh() {
      this.pageindex = 1
      this.GetStoreLotteryInfo(this.pageindex, this.page.size)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f4f4f4;
  .list {
    background-color: #fff;
    .num {
      padding: 30rpx;
      font-size: 28rpx;
      border-bottom: 1px solid #eee;
      position: relative;
      display: flex;
      justify-content: space-between;
      text {
        color: var(--theme-color, $uni-color-primary);
      }
      .add {
        background-color: #fff;
        line-height: initial;
        position: absolute;
        display: inline-block;
        color: #3385ff;
        right: 0;
        top: 0;
        font-size: 30rpx;
        padding: 30rpx 30rpx 30rpx 0;
        .icontianjiadianyuan {
          color: #3385ff;
          font-size: 30rpx;
        }
      }
    }
  }
  .activity-box {
    background-color: #f6f6f6;
    padding: 0 20rpx;
  }
}
</style>
