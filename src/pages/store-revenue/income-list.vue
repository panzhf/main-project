<template>
  <view class="container" :style="themeVars">
    <!-- 时间范围 -->
    <timeRange :is-cloud-shop="true" @timeRange="timeRange"></timeRange>
    <!-- tab -->
    <Tabs :tabs.sync="tabsArr" :value.sync="currentTab" @handleTabChange="handleTabChange"></Tabs>
    <!-- 计算统计 -->
    <view class="statistics">
      <view>
        <text style="padding-right: 40rpx">{{ statisticsLabel }}￥{{ commission || 0 }}</text>
        <text v-if="currentTab === -1">待结算￥{{ UnFinishedCommission || 0 }}</text>
      </view>
      <text class="export" @tap="exportExcel">导出</text>
    </view>
    <!-- 订单列表 -->
    <view class="list">
      <view v-for="(item, index) in list" :key="index">
        <navigator class="itemWrapper" hover-class="none" :url="'./income-detail?recordId=' + item.Id">
          <view class="item">
            <view class="label">
              <view class="fs-28 fw-bold">订单号：{{ item.OrderNumber }}</view>
              <view class="c-6 fs-26">{{ item.PayTime }}</view>
            </view>
            <view class="content">
              <view class="flex flex-middle fs-30 fw-bold">
                ￥{{ item.StoreIncome }}
                <text class="iconfont icon-arrow-right"></text>
              </view>
              <view v-if="item.State === 0" style="color: #ff9933; font-size: 26rpx">待结算</view>
              <view v-else-if="item.State === 1" style="color: #ff4c49; font-size: 26rpx">已退款</view>
              <view v-else-if="item.State === 2" style="color: #2a2a2a; font-size: 26rpx">已结算</view>
            </view>
          </view>
        </navigator>
      </view>
    </view>
    <view v-if="totalCount === 0" class="vh-60 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" msg="暂无相关收入记录~" icon-width="256" icon-height="190" />
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import timeRange from '@/components/time/time-range'
import Tabs from '@/components/tab/tabs.vue'
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
export default {
  components: {
    timeRange,
    Tabs
  },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      currentTab: -1,
      tabsArr: [
        {
          label: '全部',
          value: -1,
          count: 0
        },
        {
          label: '已结算',
          value: 2,
          count: 0
        },
        {
          label: '待结算',
          value: 0,
          count: 0
        },
        {
          label: '已退款',
          value: 1,
          count: 0
        }
      ],
      UnFinishedCommission: 0,
      FinishedCommission: 0,
      RefundCommission: 0,
      list: [],
      pageIndex: 1,
      totalCount: -1,
      loadStamp: 0,
      OrderType: 0 // 查询订单类型（0 门店订单   1 直营订单）
    }
  },

  computed: {
    statisticsLabel() {
      let statisticsLabel = ''
      switch (this.currentTab) {
        case -1:
          statisticsLabel = '已结算'
          break
        case 0:
          statisticsLabel = '待结算'
          break
        case 1:
          statisticsLabel = '已退款'
          break
        case 2:
          statisticsLabel = '已结算'
          break
      }
      return statisticsLabel
    },
    commission() {
      let commission = ''
      switch (this.currentTab) {
        case -1:
          commission = this.FinishedCommission
          break
        case 0:
          commission = this.UnFinishedCommission
          break
        case 1:
          commission = this.RefundCommission
          break
        case 2:
          commission = this.FinishedCommission
          break
      }
      return commission
    }
  },

  onLoad(option) {
    this.OrderType = parseInt(option.OrderType) || 0
    // 待结算状态
    let currentTab = option.currentTab || -1
    this.currentTab = +currentTab
  },

  onReachBottom() {
    this.QueryStoreIncomeRecord()
  },

  methods: {
    // tab栏的回调
    handleTabChange(e) {
      if (+this.currentTab === e) return
      this.currentTab = e
      this.refresh()
    },
    // 导出的回调
    exportExcel() {
      let that = this
      if (that.totalCount === 0) return this.$msg('暂无相关数据')
      uni.showModal({
        content: `确定导出${that.totalCount}条记录吗？`,
        success(res) {
          if (res.confirm) {
            that.$loading.show()
            let data = {
              State: that.currentTab,
              CreateStartTime: that.searchTime[0] || '',
              CreateEndTime: that.searchTime[1] || '',
              OrderType: that.OrderType // 查询订单类型（0 门店订单   1 直营订单）
            }
            apiCloud({
              url: '/api/v1/DataExport/ExportStoreIncomeRecord',
              method: 'get',
              data: JSON.stringify(data)
            }).then(res => {
              that.$loading.hide()
              const orderTxtIdx = res.return_data.indexOf('门店收入明细')
              const filName = orderTxtIdx !== 0 ? res.return_data.slice(orderTxtIdx) : '门店收入明细'
              uni.downloadFile({
                url: res.return_data,
                success(res) {
                  const manage = uni.getFileSystemManager()
                  if (res.statusCode === 200) {
                    manage.saveFile({
                      tempFilePath: res.tempFilePath,
                      filePath: wx.env.USER_DATA_PATH + '/' + filName,
                      success(res) {
                        uni.openDocument({
                          showMenu: true,
                          filePath: wx.env.USER_DATA_PATH + '/' + filName,
                          success(res) {}
                        })
                      },
                      fail() {
                        that.$msg('保存失败')
                      }
                    })
                  } else {
                    that.$msg('网络开小差了')
                  }
                },
                fail() {
                  that.$msg('下载失败')
                }
              })
            })
          }
        }
      })
    },
    QueryStoreIncomeRecord() {
      let now = +new Date()
      if (now - this.loadStamp < 300 || (this.totalCount !== -1 && this.list.length >= this.totalCount)) return
      this.loadStamp = now
      let data = {
        CreateStartTime: this.searchTime[0] || '',
        CreateEndTime: this.searchTime[1] || '',
        // 订单状态 -1-全部 0-待结算 1-已退款 2-已结算
        State: this.currentTab,
        pageIndex: this.pageIndex,
        OrderType: this.OrderType, // 查询订单类型（0 门店订单   1 直营订单）
        pageSize: 15
      }
      apiCloud({
        url: '/api/v1/Withdrawa/QueryStoreIncomeRecord',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.list = this.list.concat(res.return_data.Results)
          this.FinishedCommission = res.return_data.FinishedCommission
          this.UnFinishedCommission = res.return_data.UnFinishedCommission
          this.RefundCommission = res.return_data.RefundCommission
          this.totalCount = res.return_data.TotalCount || 0
          this.pageIndex++
        }
      })
    },
    refresh() {
      this.pageIndex = 1
      this.list = []
      this.totalCount = -1
      this.QueryStoreIncomeRecord()
    },
    // 时间选择器的回调
    timeRange(e) {
      this.searchTime = e
      setTimeout(() => {
        this.refresh()
      }, 300)
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  background-color: #f0f2f5;
}
.search {
  padding: 30rpx 20rpx;
}
.statistics {
  height: 100rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f0f2f5;
  color: var(--theme-color, $uni-color-primary);
  font-size: 26rpx;
  padding: 0 30rpx;
  white-space: nowrap;
  .export {
    padding: 5rpx 20rpx;
    border: 1px solid var(--theme-color, $uni-color-primary);
    border-radius: 40rpx;
    background: #fff;
    font-weight: bold;
  }
}
.list {
  .itemWrapper {
    background: #fff;
    border-radius: 10rpx;
    margin: 10rpx 30rpx 0;
    padding: 30rpx;
  }
  .item {
    line-height: 80rpx;
    font-size: 30rpx;
    display: flex;
    align-items: center;
    .label {
      display: flex;
      flex-direction: column;
      flex: 3;
      color: #333;
    }
    .content {
      display: flex;
      flex: 1;
      align-items: center;
      flex-direction: column;
      .icon-arrow-right {
        font-size: 18rpx;
        margin-left: 5rpx;
      }
    }
  }
  .border-b {
    border-bottom: 1px solid #eee;
  }
}
</style>
