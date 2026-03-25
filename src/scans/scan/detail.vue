<template>
  <view class="detail" :style="themeVars">
    <!-- 中奖页面 -->
    <view class="award-wrap tx-c">
      <view v-if="resultCode === 0 && awardResult.length">
        <view class="award-top">
          <image :src="pics.winIcon" mode="widthFix" />
          <view class="title mt-20">恭喜中奖</view>
        </view>
        <view class="prize-awards">
          <view :style="{ backgroundImage: `url(${pics.title} )` }" class="prize-awards__title tx-c c-red">
            恭喜您获得
          </view>
          <scroll-view class="award-info" scroll-y scroll-with-animation>
            <view v-for="(item, index) in awardResult" :key="index" class="award-item">
              <view>{{ item.prize }}</view>
              <view v-if="item.remark" class="c-9 fs-24">（{{ item.remark }}）</view>
            </view>
          </scroll-view>
        </view>
      </view>
      <!-- 错误提示 -->
      <view v-else-if="!isRewardPoll && resultCode !== 0 && resultMsg" class="result-wrap">
        <image class="result-image" :src="resultImg" mode="widthFix" />
        <view class="result-msg">{{ resultMsg }}</view>
        <view v-if="resultData.nickname" class="take-msg">
          <view class="name">扫码人：{{ resultData.nickname }}</view>
          <view class="time">扫码时间：{{ resultData.addtime }}</view>
        </view>
      </view>
      <view class="bottom">
        <view
          v-if="resultData.dxmregisinfo && resultData.dxmregisinfo.regissuccess && resultData.dxmregisinfo.isself"
          class="recommend flex flex-middle mb-30"
        >
          <view v-if="resultData.dxmregisinfo.isfrist" class="flex-1 left">推荐返利信息登记成功！</view>
          <view v-else class="flex-1 left regist-has">
            <view class="fs-28">你已登记过推荐返利信息了！</view>
            <view class="time fs-22">登记时间：{{ resultData.dxmregisinfo.registime }}</view>
          </view>
          <view class="right" @tap="showRecomment = true">
            推荐返利奖规则
            <text class="con iconfont icon-more"></text>
          </view>
        </view>
        <view class="bottom-btn flex flex-middle">
          <button
            v-if="resultData.activityid && !isClerk"
            class="primary-btn inverse round"
            hover-class="button-action"
            @click="dropResult(1)"
          >
            我的奖品
          </button>
          <button class="primary-btn round" hover-class="button-action" @click="drowScanMult">连续扫码</button>
          <button class="primary-btn round" hover-class="button-action" @click="drowScanSingle">单个扫码</button>
        </view>
      </view>
    </view>
    <recommend-info
      v-if="resultData.dxmregisinfo"
      v-model="showRecomment"
      :info="resultData.dxmregisinfo"
      @drop="dropResult(2)"
    />
    <location ref="location" @location="setLocation" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import recommendInfo from './comps/recomment-info.vue'
import { staticURL } from '@/config'
import { apiSalesRewardstatus } from '@/api/scan-code'
import Location from 'packages/components/location/index.vue'
import ScanCode from '@/mixins/scan-code'
import { apiScanSourceCodeWriteOff } from '@/api/pick-coupon'
import overdueMixin from 'packages/mixins/overdue'

export default {
  components: {
    recommendInfo,
    Location
  },
  mixins: [ScanCode, overdueMixin],
  data() {
    return {
      resultMsg: '',
      resultData: {},
      resultCode: 0,
      awardResult: [],
      showRecomment: false,
      state: 1,
      isRewardPoll: false,
      pics: {
        title: staticURL() + 'coupon/title.png?v=1',
        winIcon: staticURL() + 'personal/scuuse.png',
        codeError: staticURL() + 'scan/code-error.png',
        noLeaer: staticURL() + 'scan/no-leader.png',
        shopDisabled: staticURL() + 'scan/shop-disabled.png',
        noWin: staticURL() + 'scan/no-win.png'
      },
      currentScanCode: '',
      locationInfo: {}, // 地理位置
      isClerk: false // 是否店员身份（是，我的奖品按钮不可见）
    }
  },
  computed: {
    resultImg() {
      switch (this.resultCode) {
        case 600007:
          return this.pics.codeError
        case 2:
          return this.pics.noLeaer
        case 3:
          return this.pics.noWin
        default:
          return this.pics.codeError
      }
    }
  },
  onLoad(options) {
    if (options.code) {
      this.handleScanLocation(options.code)
    }
    const storeInfo = JSON.parse(uni.getStorageSync('storeSettingInfo')) || {}
    this.isClerk = storeInfo.roleType === 3
  },

  methods: {
    async handleScanLocation(code) {
      this.currentScanCode = code
      // 获取地理位置
      if (this.locationInfo.lng && this.locationInfo.lat) {
        this.scanSourceCodeWriteOffMoving(code)
      } else {
        // this.$loading.show('获取位置信息中~')
        setTimeout(() => {
          this.$refs.location.setLocation()
        }, 300)
      }
    },
    async scanSourceCodeWriteOffMoving(code) {
      //  智能营销码，动销码核销
      apiScanSourceCodeWriteOff({
        code,
        type: 4,
        // 添加经纬度
        ...this.locationInfo
      }).then(sourceCodeRes => {
        let { return_msg, return_data = {}, return_code } = sourceCodeRes
        this.resultData = return_data
        if (return_code === 0) {
          this.awardResult = []
          let count = 0
          this.isRewardPoll = true
          this.$loading.show()
          this.getRewardInfo(
            {
              code: this.resultData.code,
              activityid: this.resultData.activityid,
              codeid: this.resultData.codeid
            },
            count
          )
        } else {
          this.resultCode = return_code
          this.resultMsg = return_msg
          this.$uploadLog({
            type: 'scanCode',
            desc: '扫码领奖',
            data: sourceCodeRes || {},
            extend: { api: 'writeoff/scansourcecodewriteoff' || '' }
          })
        }
      })
    },
    async setLocation(val) {
      this.locationInfo = {
        lng: val.longitude,
        lat: val.latitude
      }
      this.scanSourceCodeWriteOffMoving(this.currentScanCode)
    },
    async findRewardStatus(data) {
      return new Promise((resolve, reject) => {
        let params = data
        apiSalesRewardstatus(params)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            resolve(error)
          })
      })
    },
    // 根据码的状态 确定是否继续轮询 或者 查询奖品详情
    async getRewardInfo(data, count) {
      let result = await this.findRewardStatus(data)
      // 0 就是中奖 3就是未中奖 null(需要继续查询状态) 202(需要等待另一方扫了码才能中奖)
      if (result.return_code === 0) {
        this.isRewardPoll = false
        this.$loading.hide()
        let rewardresults = result.return_data
        // iswiningcode是否中奖，0不中奖，1中奖
        // 奖项具体展示
        // 0:微信红包,1：红包零钱，2：企业红包/品牌红包，3：购物券，4：积分，5：实物奖品，6：活动参与资格

        if (rewardresults.iswiningcode === 1 && rewardresults.items) {
          this.resultCode = result.return_code
          this.awardResult = rewardresults.items.map(item => {
            return {
              prize: item.title + ([0, 2].includes(item.type) ? '微信红包' : [1].includes(item.type) ? '红包零钱' : ''),
              remark:
                item.type === 0
                  ? '红包已发出，稍后可返回微信领取'
                  : item.type === 2
                  ? '红包已发出，稍后可到“微信钱包”查收'
                  : item.type === 1
                  ? item.remarks?.replace(/个人中心－(我的|红包)零钱/, '红包零钱')
                  : ''
            }
          })
        } else {
          this.resultMsg = '发放失败'
        }
      } else if (result.return_code === 3) {
        this.isRewardPoll = false
        this.$loading.hide()
        this.resultMsg = '您没有获得奖励，请再接再厉！'
        this.resultCode = result.return_code
      } else {
        let timer = setTimeout(() => {
          count++
          // 轮询最多6次，否则视为失败
          if (count < 6) {
            this.getRewardInfo(data, count)
          } else {
            this.isRewardPoll = false
            this.$loading.hide()
            this.resultMsg = '发放失败'
          }
          clearTimeout(timer)
        }, 2 * 1000)
      }
    },
    dropResult(tab) {
      uni.navigateTo({
        url: `/scans/record/index?tab=${tab}&activityid=${this.resultData.activityid}`
      })
    },
    // 单个扫码
    drowScanSingle() {
      this.handleScanCode()
    },
    // 多个扫码
    drowScanMult() {
      if (!this.overdueChecked()) return
      uni.navigateTo({
        url: '/scans/scan/index'
      })
    }
  }
}
</script>
<style>
page {
  background-color: #fff;
}
</style>

<style lang="scss" scoped>
.detail {
  padding: 20rpx;
}
.award-wrap {
  .award-top {
    padding: 70rpx;
    .title {
      font-weight: bold;
      color: #333333;
      font-size: 40rpx;
    }
    image {
      width: 140rpx;
    }
  }
  .prize-awards {
    border: 1px solid #eeeeee;
    border-radius: 10rpx;
    margin: 0 30rpx;
    padding: 0 40rpx 40rpx;
    &__title {
      margin: 0 auto;
      width: 300rpx;
      background-color: #fff;
      color: #333333;
      line-height: 40rpx;
      background-size: 287rpx 40rpx;
      background-repeat: no-repeat;
      background-position: center;
      position: relative;
      top: -20rpx;
      font-size: 32rpx;
    }
    &__item {
      margin: 0 auto 20rpx;
      padding-top: 30rpx;
      width: 610rpx;
      height: 140rpx;
      box-sizing: border-box;
      background-size: 610rpx 140rpx;
    }
    .loading-text {
      line-height: 200rpx;
      color: #999999;
      text-align: center;
      font-size: 28rpx;
    }
    .award-info {
      max-height: calc(100vh - 800rpx);
    }
    .award-item {
      text-align: left;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #333333;
      line-height: 48rpx;
    }
  }
  .result-wrap {
    margin-top: 240rpx;
    .result-image {
      width: 264rpx;
      height: 468rpx;
    }
    .result-msg {
      margin-top: 50rpx;
      font-size: 28rpx;
      font-weight: bold;
      color: #333333;
      line-height: 42rpx;
    }
    .take-msg {
      margin-top: 40rpx;
      font-size: 24rpx;
      font-weight: 500;
      color: #999999;
      line-height: 36rpx;
    }
  }
  .bottom {
    position: absolute;
    bottom: 30rpx;
    left: 0;
    padding: 0 15rpx;
    width: 100%;
    .primary-btn {
      flex: 1;
      margin: 0 5rpx;
    }
  }
  .recommend {
    width: 100%;
    padding: 20rpx;
    background: rgba($color: #ff5e33, $alpha: 0.1);
    .left {
      text-align: left;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #333333;
      line-height: 40rpx;
    }
    .regist-has {
      .time {
        color: #666666;
      }
    }
    .right {
      font-size: 24rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #3385ff;
      line-height: 48rpx;
      .iconfont {
        font-size: 20rpx;
        margin-left: 15rpx;
        line-height: 32rpx;
      }
    }
  }
}
</style>
