<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <tab
        :tab="tabData"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="currentTabv"
        :active-bag-color="themeInfo.color"
        @change="handleUpdate"
      ></tab>
      <view v-if="list.length > 0" class="itemWrapper">
        <view v-for="(item, index) in list" :key="index">
          <view class="item" @tap="handleOpenDetail(`./withdrawal-detail?id=${item.ID}&type=${type}`)">
            <view class="label">
              <view style="font-size: 28rpx; color: #000; font-weight: bold">提现</view>
              <view style="color: #aaa; font-size: 26rpx; margin-top: -36rpx">{{ item.LastModified }}</view>
            </view>
            <view class="content">
              <view class="price">
                -￥{{ item.Amount }}
                <text class="iconfont icon-arrow-right"></text>
              </view>
              <view
                v-if="item.AuditStatus === 0"
                class="tips"
                style="color: #ff9933; font-size: 26rpx; margin-top: -36rpx"
              >
                待审核
              </view>
              <view v-else-if="item.AuditStatus === 2" class="tips" style="color: #ff4c49">审核不通过</view>
              <view
                v-else-if="item.AuditStatus === 1 && item.WithdrawalStatus === 0"
                class="tips"
                style="color: #ff9933"
              >
                提现中
              </view>
              <view
                v-else-if="item.AuditStatus === 1 && item.WithdrawalStatus === 1"
                class="tips"
                style="color: #2a2a2a"
              >
                提现成功
              </view>
              <view
                v-else-if="item.AuditStatus === 1 && item.WithdrawalStatus === 2"
                class="tips"
                style="color: #ff4c49"
              >
                提现失败
              </view>
            </view>
          </view>
        </view>
      </view>
      <view v-if="list.length === 0 && isLoading" class="vh-80 flex flex-column flex-middle flex-center">
        <none-data :icon="noneIcon" msg="暂时还没有内容哦~" icon-width="256" icon-height="190" />
      </view>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import Tab from '@/components/tab/index.vue'
import { staticURL } from '@/config'
export default {
  components: {
    Tab
  },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      tabData: ['全部', '提现中', '提现成功', '提现失败'],
      currentTabv: 0,
      page: {
        index: 1,
        size: 20,
        total: 0
      },
      list: [],
      type: 0 // 0-代表从首页门店营收进来   1-代表从活动分类渠道推广进来
    }
  },
  onLoad(options) {
    this.currentTabv = +options.currentTab || 0
    this.type = +options.type || 0
    this.getWithdrawalList(1, this.page.size)
  },
  onReachBottom() {
    // 上拉加载
    if (this.page.total > 0 && this.page.total > this.page.index) {
      this.getWithdrawalList(this.page.index + 1, this.page.size)
    }
  },
  methods: {
    // tab切换
    handleUpdate() {
      this.getWithdrawalList(1, this.page.size)
    },
    handleOpenDetail(t) {
      // 打开详情
      uni.navigateTo({
        url: t
      })
    },
    getWithdrawalList(pageIndex, pageSize) {
      this.isLoading = false
      let currentTab
      switch (this.currentTabv) {
        case 0:
          currentTab = -1
          break
        case 1:
          currentTab = 0
          break
        case 2:
          currentTab = 1
          break
        case 3:
          currentTab = 2
          break
      }
      let data = {
        WithdrawalStatus: currentTab,
        AuditStatus: currentTab === -1 ? -1 : 1,
        PageIndex: pageIndex,
        PageSize: pageSize
      }
      this.type === 1 ? (data.RoleType = 4) : this.type === 2 ? (data.RoleType = 3) : ''
      const urlY = this.type === 1 ? 'ChannelReward' : this.type === 2 ? 'DirectlyAssets' : 'Withdrawa'
      apiCloud({
        url: `/api/v1/${urlY}/QueryWithdrawal`,
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.page.index = pageIndex
          this.page.size = pageSize
          this.page.total = Math.ceil(res.return_data.TotalCount / pageSize)
          if (pageIndex === 1) {
            this.list = res.return_data.Results || []
          } else {
            this.list = this.list.concat(res.return_data.Results || [])
          }
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.itemWrapper {
  background: #fff;
  border-radius: 10rpx;
  margin: 30rpx 30rpx 0;
  padding: 30rpx;
}
.item {
  line-height: 80rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  padding: 15rpx 0;
  .label {
    display: flex;
    justify-content: center;
    flex-direction: column;
    flex: 3;
    color: #333;
  }
  .content {
    display: flex;
    flex: 1;
    align-items: center;
    flex-direction: column;
    text-align: right;
    .price {
      width: 100%;
      font-size: 30rpx;
      color: #000;
      font-weight: bold;
      margin-right: 90rpx;
      position: relative;
    }
    .icon-arrow-right {
      position: absolute;
      top: 50%;
      right: -40rpx;
      transform: translateY(-50%);
      font-size: 18rpx;
    }
    .tips {
      width: 100%;
      font-size: 26rpx;
      margin-top: -36rpx;
      margin-right: 90rpx;
    }
  }
}
.item:not(:last-child) {
  border-bottom: 1px solid #eee;
}
</style>
