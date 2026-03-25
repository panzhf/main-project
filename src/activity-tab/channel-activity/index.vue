<template>
  <view class="detail" :style="themeVars">
    <view class="fixed">
      <view class="detail-top flex">
        <view class="detail-top-left">
          <view class="title">{{ info.title || '' }}</view>
          <view class="msg mt-20">活动时间：{{ info.starttime | formatTime }} 至 {{ info.endtime | formatTime }}</view>
        </view>
        <view class="explain-icon" mode="widthFix" @click="showPopup = true">
          活动说明
          <view class="iconfont iconbangzhu" />
        </view>
      </view>
      <view class="container">
        <view class="search-box">
          <view class="flex" style="width: 710rpx">
            <view class="search-date flex flex-1" @tap="showTimePicker = true">
              <view class="flex-1 text-left">
                <text>
                  {{
                    filter.starttime
                      ? `${filter.starttime.replaceAll('-', '.')} - ${filter.endtime.replaceAll('-', '.')}`
                      : '请选择返利日期'
                  }}
                </text>
              </view>
              <text class="icon iconfont icon-down-arrow fs-20 c-2a ml-10"></text>
            </view>
            <selector-picker
              v-if="triggertype === 2"
              :options="settleStatusOptions"
              v-model="filter.settlestatus"
              range-key="label"
              placeholder="结算状态"
              class="search-status flex ml-20"
              @change="onSettleStatusChange"
            ></selector-picker>
          </view>
        </view>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="list">
      <view v-for="(item, index) in list" :key="index" class="item p-r">
        <view
          v-if="triggertype === 2 && item.settlestatusdesc"
          class="settle-status-tag fw-bold"
          :class="{ 'settle': item.settlestatusdesc === '未结算' }"
        >
          {{ item.settlestatusdesc }}
        </view>
        <view class="row flex">
          <view class="left">触发者：</view>
          <view class="right">{{ item.triggermannickname }}</view>
        </view>
        <view class="row flex mt-20">
          <view class="left">码ID：</view>
          <view class="right">{{ item.code }}（{{ item.serialnumber }}）</view>
        </view>
        <view class="row flex mt-20">
          <view class="left">奖励：</view>
          <view :class="['right']">
            <view v-if="item.hbmoney">
              ￥{{ (item.hbmoney || 0).toFixed(2) }}品牌红包
              <text v-if="item.hbsendresult === -1" :class="['right', item.hbsendresult === -1 ? 'err' : '']">
                （发放失败）
              </text>
              <text
                v-if="[2, 5].includes(item.hbsendresult)"
                :class="['right', [2, 5].includes(item.hbsendresult) ? 'err' : '']"
              >
                （补发成功）
              </text>
            </view>
            <view v-if="item.voucherid">
              {{ item.vouchertitle }}
              <text v-if="item.voucherstatus === 0" :class="['right', item.voucherstatus === 0 ? 'err' : '']">
                （发放失败）
              </text>
            </view>
            <view v-if="item.point">
              {{ item.point }}积分
              <text
                v-if="item.pointsendfailreason === -1"
                :class="['right', item.pointsendfailreason === -1 ? 'err' : '']"
              >
                （发放失败）
              </text>
            </view>
          </view>
        </view>
        <view class="row flex mt-20">
          <view class="left">奖励来源：</view>
          <view class="right">{{ item.awardtype === 1 ? '额外返利' : '关联返利' }}</view>
        </view>
        <view class="row flex mt-20">
          <view class="left">返利时间：</view>
          <view class="right">{{ item.createdtime }}</view>
        </view>
        <view v-if="triggertype === 2" class="row flex mt-20">
          <view class="left">结算时间：</view>
          <view class="right">{{ item.settletime || '-' }}</view>
        </view>
      </view>
      <none-data v-if="list.length === 0 && !loading" icon-width="256" icon-height="190" />
    </view>

    <date-picker v-model="showTimePicker" @confirm="onConfirm"></date-picker>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <common-popup
      v-model="showPopup"
      title="活动说明"
      custom-style="width:650rpx;overflow: visible"
      :pop-hide-button="true"
    >
      <view class="pop-content">
        <scroll-view scroll-y class="text-conrent">
          <u-parse class="rich-text" :html="info.rule" :tag-style="parseStyle"></u-parse>
        </scroll-view>
        <text class="close-icon iconfont icon-guanbi1 clear-time bold" @tap.stop="showPopup = false"></text>
      </view>
    </common-popup>
  </view>
</template>

<script>
import { apiGetActivityAwardlists, apiActivityDetail } from '@/api/activity'
import DatePicker from '@/components/search/date-picker.vue'
import SelectorPicker from '@/components/search/selector-picker.vue'
import LoadMore from '@/components/load-more'
import richTextMixin from 'packages/mixins/rich-text'
import dayjs from 'dayjs'
import { setNavigationBarColor } from '@/utils/set-mp'
import { getdayScope } from '@/utils/index.js'
export default {
  components: {
    DatePicker,
    SelectorPicker,
    LoadMore
  },
  filters: {
    formatTime(v) {
      return dayjs(v).format('YYYY-MM-DD')
    }
  },
  mixins: [richTextMixin],
  data() {
    return {
      showTimePicker: false,
      showPopup: false,
      list: [],
      maxid: 0,
      loading: true,
      hasMore: true, // 还有更多数据标记
      busy: false, // 防重复标记
      filter: {
        starttime: getdayScope(-30), //开始时间
        endtime: getdayScope(0), //结束时间
        settlestatus: -1 //结算状态：-1全部，0未结算，1已结算
      },
      settleStatusOptions: [
        { val: -1, label: '全部' },
        { val: 0, label: '未结算' },
        { val: 1, label: '已结算' }
      ],
      info: {},
      memberLogin: '', // 商户编号
      activityId: '', //活动ID
      detailId: '',
      triggertype: '' // 触发类型
    }
  },
  computed: {
    topHeight() {
      return '260rpx'
    }
  },
  onLoad(options) {
    this.activityId = options.id
    this.detailId = options.actid

    const detail = uni.getStorageSync('channelActivityDetail') || '{}'
    this.info = JSON.parse(detail)
    uni.removeStorageSync('channelActivityDetail')

    let setting = JSON.parse(uni.getStorageSync('storeSettingInfo'))
    this.memberLogin = setting.memberLogin
    this.getInfo()
    this.getData()
  },
  onShow(options) {
    // 设置顶部导航的颜色
    setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: this.themeInfo.color
    })
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    onConfirm(val) {
      this.filter.starttime = val.starttime
      this.filter.endtime = val.endtime
      this.maxid = 0
      this.loading = true
      this.hasMore = true
      this.busy = false
      this.list = []
      this.getData()
    },
    onSettleStatusChange() {
      this.maxid = 0
      this.loading = true
      this.hasMore = true
      this.busy = false
      this.list = []
      this.getData()
    },
    getInfo() {
      apiActivityDetail({
        activityid: this.detailId,
        activitytype: 24
      }).then(res => {
        if (this.$ck(res)) {
          this.info.rule = res.return_data?.actrule
          this.triggertype = res.return_data?.triggertype
        }
      })
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      let res = await apiGetActivityAwardlists({
        lastMaxId: this.maxid,
        starttime: this.filter.starttime,
        endtime: this.filter.endtime,
        settlestatus: this.filter.settlestatus,
        memberlogin: this.memberLogin,
        activityId: this.activityId
      })
      if (this.$ck(res, true)) {
        let data = res.return_data || []
        this.list = [...this.list, ...data]
        this.maxid = res.return_maxid
        // 判断加载完成
        this.hasMore = res.return_maxid !== 0
        this.busy = false
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detail {
  height: 100%;
  background: #f5f5f5;
  // position: fixed;
  .fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    .detail-top {
      // background: #ff7640;
      background: var(--theme-color, $uni-color-primary);
      padding: 20rpx 0 30rpx 30rpx;
      height: 146rpx;
      &-left {
        .title {
          font-size: 30rpx;
          font-weight: bold;
          color: #ffffff;
        }
        .msg {
          font-size: 24rpx;
          font-weight: 500;
          color: #ffffff;
        }
      }
    }
    .explain-icon {
      margin-left: auto;
      height: 48rpx;
      background: rgba($color: #ffffff, $alpha: 0.2);
      border-radius: 24rpx 0rpx 0rpx 24rpx;
      color: #fff;
      font-size: 24rpx;
      display: flex;
      align-items: center;
      padding: 0 20rpx 0 24rpx;
      font-family: PingFang SC;
      .iconfont {
        font-size: 28rpx;
        margin-left: 10rpx;
      }
    }
    .container {
      position: relative;
      background: #f5f5f5;
      .search-box {
        display: flex;
        padding: 20rpx 30rpx;
        .search-date {
          text-align: center;
          background: #fff;
          padding: 0 32rpx;
          height: 76rpx;
          border-radius: 35rpx;
          line-height: 76rpx;
        }
        .search-status {
          ::v-deep .select-box {
            width: 200rpx;
          } 
        }
        .search-input {
          width: 100%;
        }
      }
    }
  }

  .list {
    .item {
      padding: 30rpx;
      margin: 0 20rpx 20rpx;
      border-radius: 10rpx;
      background: #fff;
      line-height: 32rpx;
      .settle-status-tag {
        position: absolute;
        top: 30rpx;
        right: 30rpx;
        color: $uni-text-color;
        font-size: 28rpx;
        &.settle {
          color: $uni-color-primary;
        }
      }
      .left {
        width: 150rpx;
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
      }
      .right {
        flex: 1;
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #000000;
        padding-right: 80rpx;
      }
      .err {
        color: #ff5e33;
      }
    }
  }
}
.pop-content {
  position: relative;
  .text-conrent {
    height: 400rpx;
    word-break: break-all;
  }
  .close-icon {
    position: absolute;
    bottom: -200rpx;
    color: #fff;
    font-size: 72rpx;
    left: 45%;
  }
}
.rich-text {
  text-align: left;
}
</style>
