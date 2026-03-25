<template>
  <view :style="themeVars">
    <view class="container">
      <!-- tab栏 -->
      <tab
        :active-index.sync="tabIndex"
        :tab="tabs"
        :draw-height="5"
        :draw-width="70"
        :active-bag-color="themeInfo.color"
        @change="onTabChange"
      ></tab>
      <u-icon
        v-if="tabIndex === 1"
        class="iconshuoming"
        name="question-circle"
        :color="themeInfo.color"
        size="30"
        @click="showTips"
      ></u-icon>
      <view v-if="tabIndex === 0" class="news">
        推荐消费者购买产品扫码解锁对应产品属性的红包券，将获得相应奖励哦~奖励解释权归品牌商所有。
      </view>
      <view class="redenvelope-item">
        <view class="input-block mb-10" :class="{ 'mt-10': tabIndex === 1 }">
          <input v-model="oldName" placeholder="活动主题关键词" />
        </view>
        <view class="time-select">
          <picker mode="date" :value="beginTime" :end="startLimit" @change="onTimeChange($event, 'start')">
            <input v-model="beginTime" disabled />
          </picker>
          <text>-</text>
          <picker mode="date" :value="endTime" :start="endLimit" @change="onTimeChange($event, 'end')">
            <input v-model="endTime" disabled />
          </picker>
        </view>
        <view class="picker-select">
          <picker v-if="tabIndex === 0" class="picker" :value="indexType" :range="arrType" @change="handleStatus">
            <view>{{ arrType[indexType] }}</view>
            <text class="iconfont iconjiantou1"></text>
          </picker>
          <picker v-if="tabIndex === 1" class="picker" :value="indexType" :range="rewardArrType" @change="handleStatus">
            <view>{{ rewardArrType[indexType] }}</view>
            <text class="iconfont iconjiantou1"></text>
          </picker>
          <picker :value="indexChannel" :range="arrChannel" @change="handleChannel">
            <view>{{ arrChannel[indexChannel] }}</view>
            <text class="iconfont iconjiantou1"></text>
          </picker>
          <view class="serach-btn" @tap="seachFn">搜索</view>
        </view>
      </view>
      <view class="list-desc">
        <view class="list-desc-item">
          <view>
            {{ tabIndex === 0 ? '发放总张数：' : '赏金次数：' }}
            <text>{{ recordCount }}</text>
          </view>
          <view>
            {{ tabIndex === 0 ? '发放总面值：' : '赏金总金额：' }}
            <text>{{ recordAmount }}元</text>
          </view>
          <view v-if="tabIndex === 1" class="extract" @tap="goToFn">前往提现</view>
        </view>
      </view>
      <view v-if="list.length" class="redenvelope-list">
        <view v-for="(item, index) in list" :key="index" class="list-content">
          <view class="list-content-header">
            <view class="header-left">发放时间：{{ item.addtime }}</view>
            <view class="header-right">
              <template v-if="tabIndex === 0">
                {{ item.status | prizeStatusFilter }}
              </template>
              <template v-else>
                {{ item.sendtype | sendStatusFilter }}
              </template>
            </view>
          </view>
          <view class="list-content-footer">
            <view class="message-title">
              <view v-if="tabIndex === 0">{{ item.amount }}元{{ item.redenvelopername }}</view>
              <view v-if="tabIndex === 0">（{{ item.redenvelopeid }}）</view>
              <view v-if="tabIndex === 1">
                赏金：{{ item.redmoney | filterRmb }}
                <text>
                  {{ item.wxhbtype | hbTypeFilter }}
                </text>
              </view>
            </view>
            <view class="message-desc">
              <template v-if="tabIndex === 0">
                <view>领取人：{{ item.nickname }}</view>
                <view>有效期：{{ item.starttime }} ~ {{ item.endtime }}</view>
              </template>
              <template v-else>
                <view>
                  {{ item.redenvelopeamount | filterRmb }}元{{ item.redenvelopename }}
                  <text>（{{ item.redenvelopeid }}）</text>
                </view>
                <view>解锁码ID：{{ item.unlockcode }}</view>
              </template>
              <view>发放渠道：{{ item.sourcetype | channelFilter }}</view>
            </view>
          </view>
        </view>
      </view>
      <LoadMore v-if="!loading && list.length" :has-more="hasMore" />
      <none-data v-if="showNoneData" :icon="noneIcon" icon-width="256" icon-height="190" />
    </view>
    <tipDialog v-model="showDialog"></tipDialog>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { staticURL } from '@/config'
import { apiGetCouponList, apiGetRewardList } from '@/api/activity'
import Tab from '@/components/tab/index.vue'
import LoadMore from '@/components/load-more/index.vue'
import tipDialog from './comps/tip-dialog'
import { filterRmb, channelFilter, prizeStatusFilter, sendStatusFilter, hbTypeFilter } from '@/filters'
import loadMoreMixin from '@/mixins/load-more-maxid'
export default {
  components: {
    Tab,
    LoadMore,
    tipDialog
  },
  filters: { filterRmb, channelFilter, prizeStatusFilter, sendStatusFilter, hbTypeFilter },
  mixins: [loadMoreMixin],
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      loading: true,
      tabs: ['发券记录', '我的赏金'],
      tabIndex: 0,
      filter: {
        activename: '',
        sourcetype: -1 // 渠道 -1.全部 0.门店码 1.云店
      },
      oldName: '', // 防止输入后上拉加载获取错误值，应在搜索后赋值给activeName
      beginTime: dayjs().subtract(1, 'months').format('YYYY-MM-DD'),
      endTime: dayjs().format('YYYY-MM-DD'),
      status: 0, // 状态
      indexType: 0,
      indexChannel: 0,
      arrType: ['奖励状态', '待奖励', '已奖励', '已失效'],
      rewardArrType: ['奖励状态', '发放中', '发放成功（已到账）', '补发成功', '发放失败', '发放成功（待到账）'], //发放状态 0:全部状态 1:发放中, 2: 发放成功（已到账）, 3: 补发成功 ,4: 发送失败 5：发放成功（待到账）
      arrChannel: ['发放渠道', '门店码', '云店'],
      recordCount: 0, // 总张数
      recordAmount: 0, // 总面额值
      startLimit: '', // 限制开始时间的可选范围，不能超过结束时间
      endLimit: '',
      showDialog: false
    }
  },
  onLoad(options) {
    options.activeIndex && (this.tabIndex = +options.activeIndex)
    this.getData()
  },
  methods: {
    onTabChange() {
      if (this.busy) return
      // 奖励状态不同，需重置
      this.indexType = 0
      this.status = 0
      this.refresh()
    },
    onTimeChange(e, type = 'start') {
      const v = e.detail.value
      if (type === 'start') {
        this.endLimit = v
        this.beginTime = v
      } else {
        this.startLimit = v
        this.endTime = v
      }
    },
    handleStatus(e) {
      const v = e.detail.value
      this.indexType = v
      this.status = +v

      this.refresh()
    },
    handleChannel(e) {
      const v = e.detail.value
      this.indexChannel = v
      this.filter.sourcetype = v - 1
      this.refresh()
    },
    seachFn() {
      this.filter.activename = this.oldName
      this.refresh()
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        const o = {
          0: {
            api: apiGetCouponList,
            params: {
              beginsendtime: this.formatTime(this.beginTime),
              endsendtime: this.formatTime(this.endTime, 'end'),
              status: this.status
            }
          },
          1: {
            api: apiGetRewardList,
            params: {
              begintime: this.formatTime(this.beginTime),
              endtime: this.formatTime(this.endTime, 'end'),
              sendtype: this.status
            }
          }
        }
        const res = await o[this.tabIndex].api({
          ...this.filter,
          ...o[this.tabIndex].params,
          pageindex: nextPage,
          pagesize: this.paging.pageSize
        })
        if (this.$ck(res)) {
          this.dealRes({ res, nextPage, listProp: 'results' })
          const { rewardcount, rewardamount } = res.return_data
          if (nextPage === 1) {
            // 第一页加载才更新统计
            this.recordCount = rewardcount
            this.recordAmount = rewardamount.toFixed(2)
          }
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    refresh() {
      this.resetData()
      this.getData()
    },
    formatTime(time, type = 'start') {
      const m = type === 'start' ? 'YYYY-MM-DD 00:00:00' : 'YYYY-MM-DD 23:59:59'
      if (type === 'start') {
        return time ? dayjs(time).format(m) : dayjs().subtract(1, 'months').format(m)
      }
      return time ? dayjs(time).format(m) : dayjs().format(m)
    },
    showTips() {
      this.showDialog = true
    },
    goToFn() {
      uni.navigateTo({
        url: '/packages/src/personal/change/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding-top: 86rpx;
  ::v-deep {
    .tab-box {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 10;
    }
  }
}
.redenvelope-item {
  padding: 10rpx 32rpx 0;
  .input-block {
    input {
      height: 70rpx;
      padding: 0 30rpx;
      border-radius: 35rpx;
      background: #fff;
      font-size: 26rpx;
    }
  }
  .time-select {
    height: 100rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text {
      color: #999999;
      font-size: 24rpx;
    }
    picker {
      input {
        width: 330rpx;
        height: 70rpx;
        background: #ffffff;
        border-radius: 35rpx;
        font-size: 26rpx;
        padding-left: 30rpx;
        box-sizing: border-box;
      }
    }
  }
  .picker-select {
    display: flex;
    height: 100rpx;
    align-items: center;
    // justify-content: space-between;
    picker {
      position: relative;
      // width: 260rpx;
      height: 70rpx;
      // opacity: 1;
      background: #ffffff;
      border-radius: 35rpx;
      line-height: 70rpx;
      //下面两行是暂时的
      flex: 1;
      margin-right: 20rpx;
      view {
        padding-left: 30rpx;
        box-sizing: border-box;
        font-size: 28rpx;
      }
      .iconfont {
        position: absolute;
        right: 20rpx;
        top: 38rpx;
        transform: translateY(-50%) rotate(90deg);
        font-size: 16rpx;
        color: #000;
        z-index: 1;
      }
    }
    .serach-btn {
      width: 120rpx;
      height: 70rpx;
      font-size: 28rpx;
      background: #fff;
      border-radius: 35rpx;
      text-align: center;
      line-height: 70rpx;
      font-weight: 700;
    }
  }
}
.news {
  display: flex;
  align-items: center;
  color: #ff5e33;
  height: 114rpx;
  font-size: 24rpx;
  line-height: 36rpx;
  padding: 0 32rpx;
  background: #fff4f4;
}
.iconshuoming {
  position: fixed;
  z-index: 12;
  right: 80rpx;
  top: 32rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.redenvelope-list {
  .list-content {
    background: #fff;
    padding: 0 32rpx 10rpx;
    // height: 260rpx;
    margin-bottom: 20rpx;
    .list-content-header {
      display: flex;
      justify-content: space-between;
      height: 85rpx;
      line-height: 85rpx;
      font-size: 26rpx;
      border-bottom: 2rpx solid #eee;
      .header-left {
        color: #666;
      }
    }
    .list-content-footer {
      .message-title {
        display: flex;
        align-items: center;
        height: 76rpx;
        view {
          font-size: 26rpx;
          font-weight: 700;
        }
        .message-title-tips {
          width: 133rpx;
          height: 31rpx;
          margin-top: 5rpx;
          border: 1rpx solid #e7e7ee;
          font-size: 18rpx;
          color: #999;
          border-radius: 15rpx;
          text-align: center;
          line-height: 31rpx;
          font-weight: 500;
        }
        .message-title-tip {
          margin-left: 32rpx;
        }
      }
      .message-desc {
        font-size: 24rpx;
        color: #666;
        view {
          margin-bottom: 10rpx;
        }
        // view:nth-of-type(1) {
        //   margin-bottom: 10rpx;
        // }
      }
    }
  }
}
.list-desc {
  padding: 0 32rpx;
  display: flex;
  align-items: center;
  height: 100rpx;
  font-size: 28rpx;
  .list-desc-item {
    display: flex;
    view {
      margin-right: 30rpx;
      text {
        // color: #ff5e33;
        color: var(--theme-color, $uni-color-primary);
      }
    }
    .extract {
      width: 88rpx;
      height: 24rpx;
      font-size: 22rpx;
      text-decoration: underline;
      text-align: center;
      color: #1166ff;
      line-height: 36rpx;
    }
  }
}
</style>
