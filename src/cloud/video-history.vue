<template>
  <view v-if="!loading" class="share-history" :style="themeVars">
    <template v-if="list.length">
      <view class="history-tips">复制完链接，需要在微信视频号侧添加才能发布哦！</view>
      <block v-for="(item, index) in list" :key="index">
        <view class="history-item" @click="handleDetail(item)">
          <view class="left">
            <image style="width: 120rpx; height: 120rpx" :src="item.CoverImageUrl" />
          </view>
          <view class="content">
            <view class="content-left">
              <view class="content-left-title">
                {{ item.Title }}
              </view>
              <viewiv class="content-left-time">
                {{ item.AddTime }}
              </viewiv>
            </view>
            <view class="content-right">
              <view v-if="item.CreateStatus == 2" class="button" @click="handleCopyLink(item)">复制链接</view>
              <view v-if="item.CreateStatus == 1" class="loading">生成中</view>
              <view v-if="item.CreateStatus == 3" class="err">生成失败</view>
            </view>
          </view>
        </view>
      </block>
    </template>
    <none-data v-else msg="暂无数据" icon-width="256" icon-height="190" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
// import { noOrder } from '@/static/base64/sales'
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      // noOrder,
      list: [],
      value: 0,
      paging: {
        PageIndex: 1,
        PageSize: 10
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  async onLoad() {
    await this.getData()
    this.loading = false
  },
  async onPullDownRefresh() {
    this.list = []
    this.paging.PageIndex = 1
    this.hasMore = true
    this.busy = false
    this.getData()
    uni.stopPullDownRefresh()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  },
  methods: {
    async getData() {
      if (this.busy || !this.hasMore) return
      this.busy = true
      try {
        let res = await apiCloud({
          url: '/api/v1/WXInfo/PageList',
          method: 'post',
          data: JSON.stringify({ ...this.paging })
        })
        this.busy = false
        if (this.$ck(res, true)) {
          this.list = [...this.list, ...res.return_data.Results]
          this.hasMore = res.return_data.TotalCount > this.list.length
        }
      } catch (err) {
        this.busy = false
      }
    },
    handleCopyLink(item) {
      uni.setClipboardData({
        data: item.ExtendLinkUrl,
        success: res => {
          uni.showToast({
            icon: 'none',
            title: '复制成功，请在视频号扩展链接上使用'
          })
        }
      })
    },
    handleDetail(item) {
      uni.navigateTo({
        url: '/' + item.MiniPath
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.share-history {
  .history-tips {
    height: 60rpx;
    line-height: 60rpx;
    background: #fff0eb;
    font-size: 22rpx;
    font-weight: 500;
    color: #ff4b40;
    padding-left: 30rpx;
  }
  .history-item {
    margin-top: 20rpx;
    display: flex;
    background-color: #fff;
    padding: 30rpx;
    .left {
      width: 120rpx;
      height: 120rpx;
    }
    .content {
      display: flex;
      margin-left: 20rpx;
      flex: 1;
      .content-left {
        .content-left-title {
          width: 390rpx;
          font-size: 28rpx;
          font-weight: 500;
          text-overflow: -o-ellipsis-lastline;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          min-height: 76rpx;
        }
        .content-left-time {
          font-weight: 500;
          color: #999999;
          font-size: 24rpx;
        }
      }
      .content-right {
        display: flex;
        flex: 1;
        justify-content: center;
        align-items: center;
        .button {
          background: var(--theme-color, $uni-color-primary);
          border-radius: 28rpx;
          font-size: 26rpx;
          font-weight: 700;
          padding: 10rpx 18rpx;
          color: #ffffff;
        }
        .loading {
          font-size: 22rpx;
          font-weight: 700;
          color: var(--theme-color, $uni-color-primary);
        }
        .err {
          font-size: 22rpx;
          font-weight: 700;
          color: #bcbcbc;
        }
      }
    }
  }
}
</style>
