<template>
  <view class="writeoff-result" :class="{ 'bg-f': result === 'fail' }" :style="themeVars">
    <!-- 核销失败 -->
    <view v-if="result === 'fail'" class="result">
      <image :src="fail" mode="scaleToFill" class="result-fail" lazy-load="false" />
      <view class="tips c-3">核销失败</view>
      <view class="fail fs-28 c-3 pt-30">{{ res.return_msg || '' }}</view>
      <view v-if="showWriteoffInfo" class="had-writeoff c-9">
        <view v-if="writeoffResult.writeoffuser || writeoffResult.writeoffname" class="flex">
          <view class="label shrink-0">核销人：</view>
          {{ writeoffResult.writeoffuser || writeoffResult.writeoffname }}
        </view>
        <view v-if="writeoffResult.writeoffstore" class="flex mt-10">
          <view class="label shrink-0">核销门店：</view>
          {{ writeoffResult.writeoffstore }}
        </view>
        <view v-if="writeoffResult.writeoffdate" class="flex mt-10">
          <view class="label shrink-0">核销时间：</view>
          {{ writeoffResult.writeoffdate }}
        </view>
      </view>
    </view>
    <!-- 核销成功 -->
    <view v-if="result === 'success'">
      <!-- 有部分核销失败的 -->
      <view v-if="isbatch && writeoffResult.failcount !== 0" class="result-total">
        <view>
          本次核销成功卡券：
          <text class="primary-color">{{ writeoffResult.successcount }}张</text>
        </view>
        <view>
          核销失败卡券：
          <text class="primary-color">{{ writeoffResult.failcount }}张</text>
        </view>
      </view>

      <!-- 核销失败的数量为0 (全部核销成功)-->
      <view v-else class="result">
        <image :src="success" mode="scaleToFill" class="result-sucess" lazy-load="false" />
        <view class="tips success-color">核销成功</view>
        <!-- 本月核销进度提示 -->
        <view v-if="totalwriteoffcount > 0" class="monthly-progress mt-20">
          <view class="progress-text">
            <text>您</text>
            <text>{{ periodstr }}</text>
            <text>已成功核销</text>
            <text class="highlight">{{ totalwriteoffcount }}次</text>
            <template v-if="remainingwriteofftimes">
              <text>，再核销</text>
              <text class="highlight">{{ remainingwriteofftimes }}次</text>
              <text>就可获得</text>
            </template>
          </view>
          <view v-if="nextawards.length > 0 && remainingwriteofftimes" class="awards-list">
            <text v-for="(award, index) in nextawards" :key="index" class="award-item">
              【
              <template v-if="award.prizetype === 1">{{ award.points }}{{ award.prizename }}</template>
              <template v-else-if="award.prizetype === 10">
                {{
                  award.minamount === award.maxamount
                    ? award.maxamount
                    : award.minamount + '-' + award.maxamount + '元'
                }}元{{ award.prizename }}
              </template>
              <template v-else-if="award.prizetype === 14 && award.couponcount > 0">
                {{ award.prizename }}x{{ award.couponcount }}
              </template>
              <template v-else>{{ award.prizename }}</template>
              】
            </text>
          </view>
        </view>
      </view>

      <!-- 核销奖项 返货券-->
      <view v-if="normalRewards.length > 0 || extraRewards.length > 0" class="bg-f pb-30">
        <view class="prize-awards">
          <view :style="{ backgroundImage: `url(${awardPic.title} )` }" class="prize-awards__title tx-c fw-bold c-red">
            恭喜您获得
          </view>

          <!-- 主要奖励，目前只有返货券 -->
          <view v-if="normalRewards.length > 0">
            <block v-for="(item, index) in normalRewards" :key="'normal-' + index">
              <view
                v-if="item.type === 'jf'"
                :style="{ backgroundImage: `url(${awardPic.jf} )` }"
                class="prize-awards__item c-f tx-c c-red point"
              >
                <view>
                  <text class="fs-56 fw-bold">{{ item.amount }}</text>
                  <text class="fs-26">（积分）</text>
                </view>
                <view>{{ item.amount }}积分已到账</view>
              </view>
              <view
                v-else-if="item.type === 'hb'"
                :style="{ backgroundImage: `url(${awardPic.hb} )` }"
                class="prize-awards__item c-f tx-c"
              >
                <text class="fs-36">￥</text>
                <text class="fs-56 fw-bold">{{ item.amount }}</text>
                <text class="fs-26">（{{ item.prizetype | rewardTypesFilter }}）</text>
              </view>
              <view
                v-else-if="item.type === 'gw'"
                :style="{ backgroundImage: `url(${awardPic.gw} )` }"
                class="prize-awards__item plan-b c-f tx-c"
              >
                <image :src="item.prizeimage" mode="scaleToFill" class="card-img" />
                <view class="right">
                  <view class="fs-28 title tx-l">
                    {{ item.prizename }}
                  </view>
                  <view class="num">x{{ item.amount }}</view>
                </view>
              </view>
            </block>
          </view>

          <!-- 核销奖励 -->
          <view v-if="extraRewards.length > 0">
            <view class="reward-section-title">核销奖励</view>
            <block v-for="(item, index) in extraRewards" :key="'extra-' + index">
              <view
                v-if="item.type === 'jf'"
                :style="{ backgroundImage: `url(${awardPic.jf} )` }"
                class="prize-awards__item c-f tx-c c-red point"
              >
                <view>
                  <text class="fs-56 fw-bold">{{ item.amount }}</text>
                  <text class="fs-26">（积分）</text>
                </view>
                <view>{{ item.amount }}积分已到账</view>
              </view>
              <view
                v-else-if="item.type === 'hb'"
                :style="{ backgroundImage: `url(${awardPic.hb} )` }"
                class="prize-awards__item c-f tx-c"
              >
                <text class="fs-36">￥</text>
                <text class="fs-56 fw-bold">{{ item.amount }}</text>
                <text class="fs-26">（{{ item.prizetype | rewardTypesFilter }}）</text>
              </view>
              <view
                v-else-if="item.type === 'gw'"
                :style="{ backgroundImage: `url(${awardPic.gw} )` }"
                class="prize-awards__item plan-b c-f tx-c"
              >
                <image :src="item.prizeimage" mode="scaleToFill" class="card-img" />
                <view class="right">
                  <view class="fs-28 title tx-l">
                    {{ item.prizename }}
                  </view>
                  <view class="num">x{{ item.amount }}</view>
                </view>
              </view>
            </block>
          </view>
        </view>
      </view>

      <view class="list-title">核销详情</view>
      <view class="list-writer">
        <view class="flex flex-middle mb-20 pb-20 bd-e">
          <image class="avatar-48 mr-20" :src="brandInfo.logo" mode="scaleToFill" />
          <view class="ellipsis-1 flex-1 fs-28">{{ brandInfo.name }}</view>
        </view>
        <view>核销人：{{ writeoffResult.writeoffname }}</view>
        <view v-if="type === 'materialCoupon'">核销码：{{ writeoffResult.expirycode }}</view>
        <view v-if="writeoffResult.writeoffstore">核销门店：{{ writeoffResult.writeoffstore }}</view>
        <view>核销时间：{{ writeoffResult.writeoffdate }}</view>
      </view>
      <!-- 提领券 批量核销的显示 -->
      <view v-if="isbatch" class="list-content">
        <view v-if="writeoffResult.successcount" class="list-total">
          核销成功卡券：
          <text class="primary-color">{{ writeoffResult.successcount }}张</text>
        </view>
        <view v-for="(item, index) in writeoffResult.couponssuccess" :key="index" class="list-item flex">
          <image class="item-pic" :src="item.voucherimg" />
          <view class="item-info flex-1 flex flex-column flex-between">
            <view class="title ellipsis-2">
              {{ item.vouchername }}
            </view>
            <view class="fs-24 c-9">核销数量 x{{ item.count }}</view>
          </view>
        </view>
        <view v-if="writeoffResult.failcount" class="list-total">
          核销失败卡券：
          <text class="primary-color">{{ writeoffResult.failcount }}张</text>
        </view>
        <view v-for="(item, index) in writeoffResult.couponsfail" :key="index" class="list-item flex">
          <image class="item-pic" :src="item.voucherimg" />
          <view class="item-info flex-1 flex flex-column flex-between">
            <view class="title ellipsis-2">
              {{ item.vouchername }}
            </view>
            <view>
              <view class="fs-24 c-9">核销数量 x{{ item.count }}</view>
              <view class="fs-22 primary-color">{{ item.failmsg }}</view>
            </view>
          </view>
        </view>
      </view>
      <!-- 非批量核销的显示  实物&提领券单张-->
      <view v-if="!isbatch && type !== 'returnCoupon'" class="list-content">
        <view class="list-item flex">
          <image
            class="item-pic"
            :src="type === 'materialCoupon' ? writeoffResult.productimg : writeoffResult.voucherimg"
          />
          <view class="item-info flex-1 flex flex-column flex-between">
            <view class="title ellipsis-2">
              {{ type === 'materialCoupon' ? writeoffResult.productname : writeoffResult.vouchername }}
            </view>
            <view class="fs-24 c-9">核销数量 x {{ type === 'returnCoupon' ? writeoffResult.vouchercount : 1 }}</view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="result === 'success'" style="height: 150rpx"></view>
    <view class="btn-group flex p-f">
      <button class="primary-btn flex-1 inverse round" hover-class="button-action" @tap="handleWriteoffList">
        查看核销记录
      </button>
      <button class="primary-btn flex-1 round ml-20 shrink-0" hover-class="button-action" @tap="handleContinue">
        {{ btnText }}
      </button>
    </view>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import { staticURL } from '@/config'
import ScanCode from '@/mixins/scan-code'
import SwitchBrand from '@/mixins/switch-brand'
import ScanSound from '@/mixins/scan-sound'
import { rewardTypesFilter } from '@/filters'
import overdueMixin from 'packages/mixins/overdue'
import { storeHeadImage } from '@/utils/default-picture'
export default {
  filters: { rewardTypesFilter },
  mixins: [ScanCode, ScanSound, SwitchBrand, overdueMixin],
  data() {
    return {
      defaultHeadImg: storeHeadImage, // 缺省图片
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '', // 弹窗确认按钮文案
      popCancelText: '', // 弹窗取消按钮文案
      success: staticURL() + 'personal/scuuse.png',
      awardPic: {
        title: staticURL() + 'coupon/title.png?v=1',
        hb: staticURL() + 'coupon/hb.png',
        jf: staticURL() + 'coupon/jf.png',
        gw: staticURL() + 'coupon/gw.png'
      },
      result: '', // 核销结果  成功：success  失败：fail
      writeoffResult: {}, //核销结果数据
      rewardList: [], // 核销获得的奖励数据
      res: {},
      fail: staticURL() + 'personal/fail.png',
      isbatch: 0, // 1 批量 0单行
      type: '', // 码类型 实物兑换：materialCoupon   提领券：pickupCoupon 返货券：returnCoupon
      // 本月核销进度相关数据
      periodstr: '', // 本月时间段描述
      totalwriteoffcount: 0, // 本月已核销次数
      remainingwriteofftimes: 0, // 剩余核销次数
      nextawards: [] // 下次可获得的奖励
    }
  },
  computed: {
    brandInfo() {
      const brand = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      return { logo: brand.memberLoginHeadPath || this.defaultHeadImg, name: brand.memberLoginName }
    },
    // 主要奖励（isextendaward === 0）
    normalRewards() {
      return this.rewardList.filter(item => item.isextendaward === 0)
    },
    // 额外奖励（isextendaward === 1）
    extraRewards() {
      return this.rewardList.filter(item => item.isextendaward === 1)
    },
    showWriteoffInfo() {
      return (
        (this.type === 'pickupCoupon' && this.res.return_code === 20005) ||
        this.res?.return_msg?.includes('此码已核销过了') ||
        this.res?.return_msg?.includes('订单已核销') ||
        this.res?.return_msg?.includes('此码已被核销过了，换一个试试吧') ||
        this.res?.return_msg?.includes('此码已核销过了，换一个试试吧')
      ) 
    },
    isNYuanPlain() {
      // N元换购明文兑奖核销
      return this.type === 'returnCoupon' && this.res.return_code === 0
    },
    btnText() {
      return this.isNYuanPlain ? '连续核销' : '继续核销'
    }
  },
  onLoad(options) {
    this.isbatch = options.isbatch - 0
    this.type = options.type
    this.isFromIndex = false
    this.result = options.result
    let state = this.result === 'success'
    let { return_data, ...res } = this.$store.state.writeoffResult || {}
    this.res = res || {}
    let {
      awardrecord,
      rewardlist,
      periodstr,
      totalwriteoffcount,
      remainingwriteofftimes,
      nextawards,
      ...writeoffResult
    } = return_data || {}
    this.writeoffResult = writeoffResult || {}
    let rewardList = rewardlist || awardrecord || []

    // 解析本月核销进度数据
    this.periodstr = periodstr
    this.totalwriteoffcount = totalwriteoffcount || 0
    this.remainingwriteofftimes = remainingwriteofftimes || 0
    this.nextawards = nextawards || []

    this.rewardList = rewardList.map(item => ({
      type: [1].includes(item.prizetype)
        ? 'jf'
        : [2, 3, 4, 10].includes(item.prizetype)
        ? 'hb'
        : [14].includes(item.prizetype)
        ? 'gw'
        : '',
      amount: [1].includes(item.prizetype) && this.type === 'returnCoupon' ? item.points : item.amount,
      prizetype: item.prizetype,
      prizename: item.prizename,
      prizeimage: item.prizeimage,
      isextendaward: item.isextendaward
    }))

    // this.extraRewards = this.rewardList.filter(item => item.isextendaward === 1)
    // this.normalRewards = this.rewardList.filter(item => item.isextendaward === 0)
    // if (this.type === 'returnCoupon' && !this.isbatch) {
    //   // 显示返货券
    //   this.normalRewards = [
    //     {
    //       type: 'gw',
    //       amount: writeoffResult.vouchercount,
    //       prizename: writeoffResult.vouchername,
    //       prizeimage: writeoffResult.voucherimg
    //     }
    //   ]
    //   this.extraRewards = this.rewardList.filter(item => item.isextendaward === 1)
    // } else {
    //   this.normalRewards = this.rewardList.filter(item => item.isextendaward === 0)
    // }
    this.handleSoundResult &&this.handleSoundResult(state, 1)

    if (this.res.return_code !== 0 && !this.res?.return_msg?.includes('此码已核销过了')) {
      this.$uploadLog({ type: 'scanCode', desc: this.type, data: this.res })
    }
  },
  onShow() {},
  methods: {
    handleContinue() {
      if (!this.overdueChecked()) return
      if (this.isNYuanPlain) {
        return uni.redirectTo({
          url: '/pagesA/scan/index'
        })
      }
      this.handleScanCode()
    },
    showTips(content, btnText = '确定') {
      // 显示提示信息
      this.popType = 'tip'
      this.popTitle = '温馨提示'
      this.popContent = content
      this.popConfirmText = btnText
      this.showPopup = true
    },
    handleWriteoffList() {
      /*
      type:
      5：提领券核销
      6：实物核销
      7：返货券
      */
      let type
      if (this.type === 'pickupCoupon') {
        type = 5
      } else if (this.type === 'returnCoupon') {
        type = 7
      } else if (this.rewardList.length) {
        // 实物扫码，有奖励 是兑奖码核销
        type = 7
      } else {
        type = 6
      }
      uni.reLaunch({
        url: `/pages/management/verification-mgm?type=${type}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.writeoff-result {
  min-height: 100%;
  .result-sucess {
    width: 136rpx;
    height: 100rpx;
    margin: 0 auto;
  }
  .result-fail {
    width: 74rpx;
    height: 74rpx;
    margin: 0 auto;
  }
  .result-total {
    font-size: 32rpx;
    font-weight: 700;
    text-align: center;
    line-height: 60rpx;
    background: #fff;
    padding: 90rpx 0;
  }
  .had-writeoff {
    margin: 40rpx 40rpx;
    padding: 24rpx 30rpx;
    background: #f5f5f5;
    border-radius: 12rpx;
    text-align: left;
    font-size: 28rpx;
    line-height: 40rpx;
    color: #666;
    .label {
      width: 140rpx;
    }
  }
  .list-title {
    color: #333;
    font-size: 32rpx;
    margin: 40rpx 0 20rpx 30rpx;
    font-weight: 700;
    position: relative;
    text-indent: 16rpx;
    &::before {
      width: 7rpx;
      height: 28rpx;
      background: var(--theme-color, $uni-color-primary);
      border-radius: 4rpx;
      content: '';
      position: absolute;
      left: 0rpx;
      top: 10rpx;
    }
  }
  .list-writer {
    background: #fff;
    padding: 16rpx 30rpx 20rpx 30rpx;
    color: #333;
    font-size: 26rpx;
    line-height: 36rpx;
  }
  .list-content {
    background: #fff;
    padding: 0 30rpx;
    .list-total {
      @include border-top(#e5e5e5);
      font-size: 24rpx;
      padding: 30rpx 0 0 0;
      font-weight: 700;
    }
    .list-item {
      padding: 20rpx 0 30rpx;
      .item-pic {
        width: 120rpx;
        height: 120rpx;
      }
      .item-info {
        margin-left: 20rpx;
        .title {
          font-size: 26rpx;
          font-weight: 700;
        }
        .text {
          font-size: 24rpx;
          color: #333;
        }
      }
    }
  }
  .result {
    background: #fff;
    padding: 80rpx 0 76rpx;
    text-align: center;
    .fail {
      margin: 0 50rpx;
    }
    .tips {
      padding-top: 40rpx;
      font-size: 32rpx;
      font-weight: bold;
    }
  }
  .btn-group {
    width: 100%;
    bottom: 0;
    left: 0;
    box-sizing: border-box;
    padding: 40rpx 30rpx;
  }
  .prize-awards {
    border: 1px solid #ffebe6;
    border-radius: 10rpx;
    margin: 0 30rpx;
    padding: 0 40rpx 40rpx;
    .reward-section-title {
      font-size: 28rpx;
      color: #333;
      font-weight: bold;
      text-align: center;
      padding: 20rpx 0 10rpx 0;
    }
    &__title {
      margin: 0 auto;
      width: 300rpx;
      background-color: #fff;
      line-height: 40rpx;
      background-size: 287rpx 40rpx;
      background-repeat: no-repeat;
      background-position: center;
      position: relative;
      top: -20rpx;
    }
    &__item {
      margin: 0 auto 20rpx;
      padding-top: 30rpx;
      width: 610rpx;
      height: 140rpx;
      box-sizing: border-box;
      background-size: 610rpx 140rpx;
      &:last-child {
        margin-bottom: 0;
      }
      &.point {
        padding-top: 10rpx;
      }
    }
    .plan-b {
      display: flex;
      padding: 25rpx 30rpx;

      .card-img {
        width: 90rpx;
        height: 90rpx;
      }
      .right {
        flex: 1;
        margin-left: 18rpx;
        .title {
          width: 425rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #000;
          font-weight: 700;
        }
        .num {
          text-align: left;
          color: #999999;
          margin-top: 8rpx;
        }
      }
    }
    .c-red {
      color: #ff5e33;
    }
  }
  .monthly-progress {
    text-align: center;
    .progress-text {
      font-size: 28rpx;
      line-height: 40rpx;
      color: #333;
      .highlight {
        color: var(--theme-color, $uni-color-primary);
        font-weight: bold;
      }
    }
    .awards-list {
      font-size: 28rpx;
      line-height: 40rpx;
      .award-item {
        color: var(--theme-color, $uni-color-primary);
        font-weight: bold;
        margin: 0 8rpx;
      }
    }
  }
}
</style>
