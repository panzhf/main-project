<template>
  <view>
    <view v-if="pageLoaded" class="page-invite" :style="{ backgroundImage: `url(${info.activityimg})` }">
      <view class="invite">
        <title-bar showback="true" :bg-pic="info.activityimg" :title="info.activityname" textcolor="#fff"></title-bar>
        <view class="explain c-0 fs-28 fw-bold" @tap="handleShowExplain">
          活动说明
          <text class="iconfont icon-explain fw-normal ml-10 mr-20"></text>
        </view>
        <view v-if="info.starttime" class="time fw-bold c-f">{{ formatActTime(info) }}</view>
        <view class="award">
          核销成功可获得返货券，当前可兑换返货券
          <text class="num">{{ totalCount }}</text>
          张
        </view>
        <image class="scan-pic shrink-0" :src="pics.scan" mode="scaleToFill" @tap="handleScanCode('convert')" />
      </view>

      <box
        v-if="showRewardSection"
        :top-image="boxTopImage"
        :top-height="boxTopHeight"
      >
        <view slot="title">
          <view>核销奖励</view>
          <view v-if="rewardTimeText" class="reward-time-text">奖励时间：{{ rewardTimeText }}</view>
        </view>
        <template v-if="awardRecord.length">
          <view slot="content" class="extra-award">
            <view class="mb-20">
              门店负责人、店员每核销成功
              <text>{{ info.writeoffnum }}</text>
              次，获得
            </view>
            <block v-for="(item, index) in awardRecord" :key="index">
              <view class="item">
                <image class="award-pic" :src="item.src" />
                <text class="error-color">{{ item.text }}</text>
              </view>
            </block>
          </view>
        </template>
        <view v-if="groupedCumulativeAwards.length" slot="content" class="extra-award">
          <block v-for="(group, groupIndex) in groupedCumulativeAwards" :key="groupIndex">
            <view class="group-title" :class="{ 'has-border': groupIndex > 0 }">
              门店负责人、店员{{ group.periodstr }}累计核销成功满
              <text>{{ group.everywintimes }}</text>
              次，获得
            </view>
            <block v-for="(item, index) in group.awards" :key="groupIndex + '_' + index">
              <view class="award-item">
                <image class="award-pic" :src="item.src" />
                <text class="error-color">{{ item.text }}</text>
              </view>
            </block>
          </block>
        </view>
      </box>

      <box>
        <view slot="title" class="flex flex-between">
          <view class="flex-1">核销记录</view>
          <view class="fs-24 flex flex-middle" @tap="handleNav">
            更多
            <text class="iconfont icon-arrow-right fs-20"></text>
          </view>
        </view>
        <view slot="content" class="extra-award">
          <view v-for="(item, index) in list" :key="index" class="item">
            <view class="ellipsis-1">
              <text class="mr-10">{{ item.writeoffname }}</text>
              <text class="mr-10">{{ item.writeofftime }}</text>
              <text>核销了</text>
              <text>{{ [2, 3].includes(item.writeoffcodetype) ? item.goodsname : item.vouchername }}</text>
            </view>
          </view>
          <view v-if="list.length === 0" class="tx-c">暂无核销记录</view>
        </view>
      </box>
    </view>

    <ExplainInfo v-model="showExplain" :rule-info="info" />
    <common-popup v-model="showPopup" type="tip" title="温馨提示" :content="popContent"></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { getUrlQuery, isInfiniteTime } from '@/utils/index'
import TitleBar from '@/components/title-bar/index.vue'
import box from './comps/box.vue'
import ExplainInfo from './comps/explain-info.vue'
import commonPopupMixin from '@/mixins/common-popup'
import ScanCode from '@/mixins/scan-code'
import { apiGetConvertDetail, apiRenturnCouponWriteOff } from '@/api/return-coupon'
import overdueMixin from 'packages/mixins/overdue'
import SwitchBrand from '@/mixins/switch-brand'
export default {
  components: {
    TitleBar,
    box,
    ExplainInfo
  },
  mixins: [commonPopupMixin, ScanCode, overdueMixin, SwitchBrand], //弹窗
  data() {
    return {
      id: 0,
      info: { activityimg: '' },
      awardRecord: [], // 每次核销奖励 ruletype === 3
      cumulativeAwardRecord: [], // 累计核销奖励 ruletype === 6
      groupedCumulativeAwards: [], // 按次数分组的累计核销奖励
      storeSettingInfo: {}, // 活动详情
      showExplain: false,
      pics: {
        scan: staticURL() + 'convert/scan.png', // 背景图
        redpacket: staticURL() + 'convert/hb.png',
        point: staticURL() + 'convert/jf.png',
        card: staticURL() + 'convert/kq.png'
      },
      totalCount: 0,
      list: [], // 门店列表
      page: {
        pageIndex: 0,
        pageSize: 10
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      // topStyle: '',
      pageLoaded: false,
      isRewardExpired: false
    }
  },
  computed: {
    showRewardSection() {
      const hasRewards = this.awardRecord.length || this.groupedCumulativeAwards.length
      if (!hasRewards) return false
      return !this.isRewardExpired
    },
    rewardTimeText() {
      const { extraprizestarttime, extraprizeendtime } = this.info || {}
      if (extraprizestarttime && extraprizeendtime) {
        return `${extraprizestarttime} 至 ${extraprizeendtime}`
      }
      return ''
    },
    boxTopImage() {
      if (!this.rewardTimeText) return ''
      return staticURL() + 'convert/box-top-big.png'
    },
    boxTopHeight() {
      return this.rewardTimeText ? '140rpx' : ''
    }
  },
  async onLoad(options) {
    if (!options.id && !options.scene) return this.$msg('链接格式不正确')
    const query = options.scene ? getUrlQuery(decodeURIComponent(options.scene)) : options
    await this.verifyMemberLogin(query.m, 2)
    this.id = Number(query.id)

    this.getActInfo()
    // let res = wx.getSystemInfoSync()
    // if (res.screenHeight === 812 || res.screenHeight === 896) {
    //   this.topStyle = 'height: 58rpx;bottom: 1048rpx;line-height:58rpx'
    // }
  },
  onShow() {},
  methods: {
    checkRewardExpired(endTimeValue) {
      if (!endTimeValue) return false
      const endTime = new Date(endTimeValue)
      if (!endTime) return false
      return endTime.getTime() < Date.now()
    },
    formatActTime(info) {
      const { starttime, endtime } = info
      return isInfiniteTime(starttime, endtime) ? '长期有效' : `${starttime} - ${endtime}`
    },
    // 按核销次数分组累计奖励
    groupAwardsByTimes(awards) {
      const groups = {}
      awards.forEach(item => {
        const key = `${item.everywintimes}_${item.periodstr || '每个自然月'}`
        if (!groups[key]) {
          groups[key] = {
            everywintimes: item.everywintimes,
            periodstr: item.periodstr || '每个自然月',
            awards: []
          }
        }
        groups[key].awards.push(item)
      })
      return Object.values(groups)
    },
    handleNav() {
      uni.navigateTo({
        url: `/pages/management/verification-mgm?type=7`
      })
    },
    showTips(content) {
      this.popContent = content
      this.showPopup = true
    },
    async getActInfo() {
      let res = await apiGetConvertDetail({ activityid: this.id })
      if (this.$ck(res, true)) {
        this.pageLoaded = true
        let { awardrecord, ...info } = res.return_data
        this.info = info
        this.isRewardExpired = this.checkRewardExpired(info.extraprizeendtime)

        // 清空奖励数组
        this.awardRecord = []
        this.cumulativeAwardRecord = []
        this.groupedCumulativeAwards = []

        awardrecord.forEach(item => {
          if ([1, 10, 14].includes(item.prizetype)) {
            // 处理奖励文本和图片
            if (item.prizetype === 10) {
              let min = item.minamount ? item.minamount + '元 ~ ' : ''
              item.text = `品牌红包${min}${item.amount}元`
              item.src = this.pics.redpacket
            }
            if (item.prizetype === 1) {
              item.text = `${item.points}积分`
              item.src = this.pics.point
            }
            if (item.prizetype === 14) {
              item.text = `${item.prizename}*${item.amount}`
              item.src = this.pics.card
            }

            // 根据 ruletype 分类
            if (item.ruletype === 3) {
              // 每次核销奖励
              this.awardRecord.push(item)
            } else if (item.ruletype === 6) {
              // 累计核销奖励
              this.cumulativeAwardRecord.push(item)
            }
          }
        })

        // 按 everywintimes 分组累计核销奖励
        this.groupedCumulativeAwards = this.groupAwardsByTimes(this.cumulativeAwardRecord)
        this.getStoreList()
      } else {
        setTimeout(() => {
          const pages = getCurrentPages()
          if (pages.length > 1) {
            uni.navigateBack()
          } else {
            uni.reLaunch({
              url: '/pages/index/index'
            })
          }
        }, 2000)
      }
    },
    async getStoreList() {
      if (this.busy || !this.hasMore) return
      let pageIndex = this.page.pageIndex + 1
      this.busy = true
      let res = await apiRenturnCouponWriteOff({
        activityid: this.id,
        activitytype: 25,
        keyword: '',
        starttime: '',
        endttime: '',
        writeofftype: 0,
        pageindex: pageIndex,
        pagesize: 3
      })
      if (this.$ck(res, true)) {
        // 暂时只需获取前3条
        this.page.pageIndex++
        this.list = (res.return_data.list || []).slice(0, 3)
        this.totalCount = res.return_data.totalcount
        this.busy = false
        this.loading = false
      } else {
        this.busy = false
        this.loading = false
      }
    },
    handleShowExplain() {
      this.showExplain = true
    },
    handleJump(item) {
      uni.navigateTo({
        url: `/order/order-list?storeno=${item.storeno}&storetype=invitedStore`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-invite {
  background-repeat: no-repeat;
  background-size: 100% auto;
  background-color: #ffcb9b;
  padding-bottom: 50rpx;
  min-height: 100vh;
}
.award-pic {
  width: 60rpx;
  height: 60rpx;
  vertical-align: middle;
}

.invite {
  padding-bottom: 34rpx;
  color: #2a2a2a;
  height: 1360rpx;
  position: relative;
  .time {
    position: absolute;
    width: 100%;
    left: 0;
    top: 515rpx;
    text-align: center;
  }
  .award {
    position: absolute;
    width: 100%;
    text-align: center;
    bottom: 204rpx;
    left: 0;
    font-weight: bold;
    color: #3a2515;
    .num {
      color: #ff5235;
      margin: 0 6rpx;
    }
  }
  .explain {
    width: 200rpx;
    height: 64rpx;
    position: absolute;
    right: 0;
    margin-top: 20rpx;
    text-align: right;
    line-height: 64rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 32rpx 0 0 32rpx;
  }
  .scan-pic {
    width: 598rpx;
    height: 175rpx;
    position: absolute;
    bottom: 30rpx;
    left: 50%;
    transform: translate(-50%, 0);
  }
}
.reward-time-text {
  font-size: 24rpx;
  color: #ffffff;
  opacity: 0.7; 
  margin-top: -5rpx;
  line-height: 26rpx;
}
.extra-award {
  .item {
    padding: 10px 0;
    &:not(:last-child) {
      @include border-bottom(#e5e5e5);
    }
  }
  .group-title {
    margin-bottom: 20rpx;
    padding-top: 20rpx;
    &.has-border {
      @include border-top(#e5e5e5);
    }
  }
  .award-item {
    padding: 10px 0;
  }
}
</style>
