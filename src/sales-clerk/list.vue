<template>
  <view :class="['list', list.length ? '' : 'ov-h']" :style="themeVars">
    <!-- tab栏 -->
    <tab
      v-if="type !== 2"
      :tab="activiyTab"
      :draw-height="5"
      :draw-width="63"
      :active-index.sync="activiyTabIndex"
      :active-bag-color="themeInfo.color"
      class="tab"
      @change="handleChange"
    ></tab>
    <view v-if="list.length" class="content">
      <view v-if="!loading" class="box">
        <view v-show="activiyTabIndex === 0" class="lable-title pb-40">
          店员数量：
          <text class="count">{{ totalcount }}</text>
        </view>
        <view class="list">
          <view v-for="(item, index) in list" :key="index" class="item" @click="handleDetail(item)">
            <view class="left">
              <img :src="item.headpath ? item.headpath : defaultAvatar" alt="" class="img" />
              <view class="info">
                <view class="title">{{ item.leader }}</view>
                <view class="phone">{{ item.mobile }}</view>
              </view>
            </view>
            <view class="right">
              <text v-if="activiyTabIndex === 1 && item.isreview === 2">审核不通过</text>
              <text v-if="activiyTabIndex === 1 && item.isreview === 1">审核通过</text>
              <text v-if="activiyTabIndex === 1 && item.isreview === 0" class="wait">待审核</text>
              <text class="iconfont icon-arrow-right"></text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <none-data v-if="list.length <= 0 && !loading" class="no-data" msg="暂无记录" icon-width="256" icon-height="190" />
    <button class="next-buttom" @click="handleApply">邀请店员注册</button>
  </view>
</template>

<script>
import { apiGetclerklist, apiGetclerkAuditlist } from '@/api/sales.js'
import { staticURL } from '@/config'
import Tab from '@/components/tab/index.vue'
export default {
  components: {
    Tab
  },
  data() {
    return {
      defaultAvatar: staticURL() + 'sales/default-new.png',
      activiyTab: ['店员列表', '审核店员'],
      activiyTabIndex: 0,
      loading: true,
      hasMore: true, // 还有更多数据标记
      busy: false, // 防重复标记
      list: [], // 列表数据
      paging: {
        pageSize: 10,
        PageIndex: 1
      },
      totalcount: 0
    }
  },
  onShow() {
    this.reset()
    this.getData()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  },
  methods: {
    handleDetail(item) {
      let url = ''
      if (this.activiyTabIndex === 0) {
        url = `/sales-clerk/detail?id=${item.id}&type=detail`
      } else {
        if (item.isreview) {
          url = `/sales-clerk/audit-detail?id=${item.id}`
        } else {
          url = `/sales-clerk/detail?id=${item.id}&type=audit`
        }
      }
      uni.navigateTo({
        url
      })
    },
    reset() {
      this.list = [] // 列表数据
      this.paging.PageIndex = 1
      this.loading = true
      this.hasMore = true // 还有更多数据标记
      this.busy = false // 防重复标记
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      let func = {
        0: apiGetclerklist,
        1: apiGetclerkAuditlist
      }
      let functionApi = func[this.activiyTabIndex]

      let res = await functionApi({
        pageindex: this.paging.PageIndex,
        pagesize: this.paging.pageSize
      })
      if (this.$ck(res, true)) {
        this.list = [...this.list, ...res.return_data.list]
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        this.totalcount = res.return_data.totalcount
        this.busy = false
        this.loading = false
      }
    },
    handleChange() {
      this.reset()
      this.getData()
    },
    handleApply() {
      uni.navigateTo({
        url: '/sales-clerk/invite'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.list {
  .tab {
    position: fixed;
    top: 0;
    width: 100%;
    left: 0;
  }
  .content {
    padding: 20rpx;
    margin-bottom: 180rpx;
    margin-bottom: calc(180rpx + constant(safe-area-inset-bottom));
    margin-top: 86rpx;
    .box {
      background-color: #fff;
      padding: 40rpx 22rpx;
      border-radius: 10rpx;
      .lable-title {
        font-size: 28rpx;
        .count {
          font-weight: Bold;
        }
      }
      .list {
        .item {
          display: flex;
          // margin-top: 40rpx;
          padding-bottom: 30rpx;
          border-bottom: 1rpx solid #e5e5e5;
          &:nth-child(n + 2) {
            margin-top: 40rpx;
          }
          &:last-child {
            border: none;
            padding-bottom: 0;
          }

          .left {
            width: 480rpx;
            display: flex;
            .img {
              width: 98rpx;
              height: 98rpx;
              border-radius: 8rpx;
            }
            .info {
              margin-left: 20rpx;
              .title {
                font-size: 30rpx;
                font-weight: bold;
                color: #333333;
                margin-top: 5rpx;
              }
              .phone {
                font-weight: 500;
                color: #666666;
                font-size: 24rpx;
                margin-top: 15rpx;
              }
            }
          }
          .right {
            flex: 1;
            display: flex;
            align-items: center;
            font-size: 28rpx;
            font-weight: 500;
            justify-content: flex-end;
            .icon-arrow-right {
              font-size: 20rpx;
              margin: 0 10rpx;
              color: #000;
            }
          }
          .wait {
            // color: #ff7640ff;
            color: var(--theme-color, $uni-color-primary);
          }
        }
      }
    }
  }
  .next-buttom {
    position: fixed;
    width: 580rpx;
    height: 90rpx;
    // background: #ff7640;
    background: var(--theme-color, $uni-color-primary);
    border-radius: 45rpx;

    font-size: 36rpx;
    line-height: 90rpx;
    font-weight: bold;
    color: #fff;
    left: 50%;
    transform: translate(-50%, -50%);
    bottom: 40rpx;
    bottom: calc(40rpx + constant(safe-area-inset-bottom));
  }
}
.ov-h {
  overflow: hidden;
}
.no-data {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
