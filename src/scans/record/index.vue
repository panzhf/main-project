<template>
  <view class="record-wrap" :style="themeVars">
    <view class="record-wrap-header">
      <view class="record-top flex">
        <view class="record-top-left">
          <view class="title">{{ activityInfo.title }}</view>
          <view class="msg mt-20">
            {{ activityInfo.begintime | timeFilter }} 至 {{ activityInfo.endtime | timeFilter }}
          </view>
        </view>
        <view class="explain-icon" mode="widthFix" @click="handleClickRule">
          活动说明
          <view class="iconfont iconbangzhu" />
        </view>
      </view>
      <tab
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="activiyTabIndex"
        :active-bag-color="themeInfo.color"
      ></tab>
    </view>
    <unpack-list v-if="activiyTabIndex === 0" ref="sonList" :activityid="activityid" />
    <award-list v-if="activiyTabIndex === 1" ref="sonList" :activityid="activityid" />
    <return-list v-if="activiyTabIndex === 2" ref="sonList" :activityid="activityid" />
    <explain-info :is-show.sync="isShowFullRule" :rule-info="activityInfo" />
    <view class="bottom-btn">
      <button class="primary-btn round" hover-class="button-action" @click="drowScanMult">立即开箱扫码</button>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import Tab from '@/components/tab/index.vue'
import unpackList from './unpack-list.vue'
import awardList from './award-list.vue'
import returnList from './return-list.vue'
import explainInfo from './comps/explain-info.vue'
import { timeFilter } from '@/filters'
import { setNavigationBarColor } from '@/utils/set-mp'
import { apiGetactivityDetail } from '@/api/scan-code'
export default {
  components: {
    Tab,
    unpackList,
    awardList,
    returnList,
    explainInfo
  },
  filters: {
    timeFilter
  },
  data() {
    return {
      activiyTab: ['开箱记录', '领奖记录', '返利明细'],
      activiyTabIndex: 0,
      isShowFullRule: false,
      activityid: '',
      activityInfo: {}
    }
  },
  onLoad(options) {
    if (options.tab) {
      this.activiyTabIndex = Number(options.tab)
    }
    if (options.activityid) {
      this.activityid = options.activityid
      this.getActivityDetail()
    }
  },
  onReady() {
    setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: this.themeInfo.color
    })
  },
  onReachBottom() {
    if (this.$refs.sonList && this.$refs.sonList.handleReachBottom) {
      // 触发子组件的下拉加载更多
      this.$refs.sonList.handleReachBottom()
    }
  },
  methods: {
    // 获取详情
    getActivityDetail() {
      let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      const { memberLogin } = storeSettingInfo
      apiGetactivityDetail({
        activityid: this.activityid,
        memberlogin: memberLogin
      }).then(res => {
        if (this.$ck(res)) {
          const { title, begintime, endtime, rulecontent } = res.return_data || {}
          this.activityInfo = { title, begintime, endtime, rulecontent }
        }
      })
    },
    drowScanMult() {
      uni.navigateTo({
        url: '/scans/scan/index'
      })
    },
    // 点击活动规则
    handleClickRule() {
      this.isShowFullRule = true
    }
  }
}
</script>
<style lang="scss" scoped>
.record-wrap {
  padding-bottom: 120rpx;
  .record-wrap-header {
    position: fixed;
    width: 100%;
    top: 0;
    left: 0;
    z-index: 100;
    height: 234rpx;
    background: #f5f5f5;
  }
}
.record-top {
  background: var(--theme-color, $uni-color-primary);
  padding: 20rpx 0 30rpx 30rpx;
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
.bottom-btn {
  position: fixed;
  width: 100%;
  bottom: 10rpx;
  padding: 0 20rpx 20rpx;
}
</style>
