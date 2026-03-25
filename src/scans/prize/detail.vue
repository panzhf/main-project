<template>
  <view v-if="!loading" class="prizeDetail" :style="themeVars">
    <view class="wrapper">
      <view class="pages-form-list page-icon-tips">
        <view class="prize-item">
          <view class="jiangpin-info item-wrap">
            <view class="shrink-0">奖品</view>
            <view class="flexCon flex-end">
              <view class="jiangpin-name ellipsis-2">{{ info.prizename }}</view>
              <view
                class="thumbnail shrink-0"
                :class="info.prizeimgclass || iconClass(info.prizetype)"
                :style="{ 'background-image': info.prizeimg ? '' : 'url(' + prizesBg + ')' }"
              >
                <v-img v-if="info.prizeimg != ''" :src="info.prizeimg" size="200" class="pic" />
              </view>
            </view>
          </view>
          <view v-if="info.isshowordernum" class="infoLine item-wrap" @tap="handleNavigateOrder">
            <view class="shrink-0">订单号</view>
            <view class="flexCon">
              <view class="dingdan">{{ info.ordernum }}</view>
            </view>
          </view>
          <view v-if="info.isshowordernum" class="infoLine item-wrap" @tap="handleNavigateOrder">
            <view class="shrink-0">订单状态</view>
            <view class="flexCon">
              <view class="dingdan">{{ info.orderstatusstr }}</view>
            </view>
          </view>
          <view class="infoLine item-wrap">
            <view class="shrink-0">来源</view>
            <view class="flexCon">{{ info.typename }}</view>
          </view>
          <view v-if="info.code" class="infoLine item-wrap">
            <view class="shrink-0">{{ options.awardTabType ? '码ID' : '箱码' }}</view>
            <view class="flexCon">{{ info.code }}（{{ info.serialnumber }}）</view>
          </view>
          <view v-if="options.awardTabType === '2'" class="infoLine item-wrap">
            <view class="shrink-0">备注</view>
            <view class="flexCon">{{ info.remark }}</view>
          </view>
          <view class="infoLine item-wrap">
            <view class="shrink-0">中奖时间</view>
            <view class="flexCon">
              <text>{{ info.winningtime }}</text>
            </view>
          </view>
          <view v-if="info.isshowovertime" class="infoLine item-wrap">
            <view class="shrink-0">兑奖有效时间</view>
            <view class="flexCon">
              <text>{{ info.overtime }}</text>
            </view>
          </view>
          <view v-if="info.mdsalername" class="infoLine item-wrap">
            <view class="shrink-0">领奖人</view>
            <view class="flexCon">
              <text>{{ info.mdsalername }}</text>
            </view>
          </view>
          <view v-if="info.status" class="infoLine item-wrap">
            <view class="shrink-0">状态</view>
            <view class="flexCon">
              <text>{{ info.status }}</text>
              <text v-if="info.statustips">{{ info.statustips }}</text>
            </view>
          </view>
        </view>
      </view>
      <template v-if="info.isvirtual === -1">
        <!-- 提领券 -->
        <view v-if="!isClerk && volumetype === 2" class="primary-btn warning round" @tap="useCoupon('2')">
          查看提领券详情
        </view>
      </template>
      <!-- 返货券 -->
      <view
        v-if="!isClerk && volumetype === 14 && (info.volumeissend || (options.awardTabType === '2' && info.issend))"
        class="primary-btn warning round"
        @tap="useCoupon('14')"
      >
        查看卡券
      </view>
      <!-- 实物礼品，营销活动  未领取状态 -->
      <view v-if="!isClerk && info.isshowreceivebtn" class="primary-btn warning round" @tap="handleReceive">
        前往兑换
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiGetPrizeDetail, apiGetsweetprizedetail, apiGetmarketprizedetail } from '@/api/scan-code'

export default {
  data() {
    return {
      id: 0,
      type: 0, // 0:红包；1积分；2：购物券；3：礼品
      volumeId: 0,
      volumetype: 0,
      info: {}, // 商品类型/礼品类型isvirtual 0：实物；1：虚拟票券 2：联盟卡券；3：直充类 10：服务商礼品
      loading: true, // 页面显示loading标识
      busy: false, // 防重复请求标识
      prizesBg: staticURL() + 'prizes/prizes.png',
      options: {},
      isClerk: false // 店员不显示按钮
    }
  },
  onLoad(options) {
    this.options = options
    const storeInfo = JSON.parse(uni.getStorageSync('storeSettingInfo')) || {}
    this.isClerk = storeInfo.roleType === 3
  },
  async onShow() {
    let options = this.options
    this.id = Number(options.id)
    this.type = Number(options.type)
    this.$loading.show()
    try {
      await this.getData()
      this.$loading.hide()
    } catch (error) {
      this.$loading.hide()
    }
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      let api = apiGetPrizeDetail

      let params = { id: this.id, type: this.type }
      if (this.options.awardTabType === '1') {
        //门店助手传过来的值，需要转为会员小程序的。 门店的要转一下。0：红包，1：积分，2购物券，3：礼品
        let type = 0
        api = apiGetsweetprizedetail
        switch (this.type) {
          // 卡券
          case 2:
            type = 1
            break
          // 红包
          case 1:
            type = 0
            break
          default:
            type = this.type
            break
        }
        params.type = type
      } else if (this.options.awardTabType === '2') {
        api = apiGetmarketprizedetail
        params.PrizeType = this.type
        delete params.type
        // 如果是营销奖品tab，添加activitytype参数
        this.options.activitytype && (params.ActivityType = Number(this.options.activitytype))
      }

      let res = await api(params)

      if (this.$ck(res, true)) {
        let info = res.return_data
        if (this.options.awardTabType) {
          info = info?.data || {}
        }
        const { volumeid, volumetype } = info
        this.volumeId = volumeid
        this.volumetype = +volumetype
        if (this.options.user) {
          info.mdsalername = decodeURIComponent(this.options.user)
        }
        this.info = { ...info }
        this.busy = false
        this.loading = false
      }
    },
    iconClass(type) {
      let icon = 'default'
      if (type === 1) icon = 'jifen'
      else if ([2, 3].includes(type)) icon = 'quan'
      else if ([5, 6, 8].includes(type)) icon = 'hongbao'
      return icon
    },
    useCoupon(type) {
      let navigator = {
        page: '',
        query: ''
      }
      switch (type) {
        case '2':
          navigator.page = '/pages/cash-coupon/detail'
          navigator.query = `id=${this.volumeId}`
          break
        case '14':
          navigator.page = '/pages/return-coupon/index'
          break
        default:
          break
      }
      uni.navigateTo({ url: `${navigator.page}?${navigator.query}` })
    },
    handleNavigateOrder() {
      let type = ''
      if (this.info.subcategory === 2) {
        type = 1
      } else if (this.info.subcategory === 6 || this.info.subcategory === 14) {
        type = 2
      } else if (this.info.subcategory === 13) {
        type = 3
      } else if (this.info.subcategory === 19) {
        type = 5
      }
      uni.navigateTo({
        url: `/packages/src/order/detail?id=${this.info.orderid}&type=${type}&subcategory=${this.info.subcategory}`
      })
    },
    receiveCoupon() {
      let card = this.info.carddetail
      if (card.urltype === 1) {
        if (!card.receiveurl) return this.$msg('链接设置错误')
        this.generateQr({ text: card.receiveurl })
      } else {
        this.handleOpenLink({
          Appid: card.appid,
          Link: card.appuseurl
        })
      }
    },
    // 实物礼品，未领取状态
    handleReceive() {
      uni.redirectTo({
        url: `/packages/src/integral/detail?type=${this.info.ordersourcetype}&id=${this.id}&activityprizeid=${this.info.saomaactivityprizeid}&subcategory=${this.info.subcategory}&productid=0&actid=${this.info.activityid}&activitytype=${this.info.activitytype}`
      })
    },
    /** 机会继续参与 */
    handleTake() {
      if (this.info.drawactmpurl) {
        this.handleOpenLink({
          Link: this.info.drawactmpurl
        })
      } else {
        this.generateQr({ text: this.info.drawacturl })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.prizeDetail {
  font-size: 28rpx;
  .pages-form-list {
    .prize-item {
      padding: 0 20rpx;

      background-color: #fff;
      .item-wrap {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: space-between;

        color: #666;

        font-size: 28rpx;
        & + .item-wrap {
          border-top: 1px solid #e7e7e7;
        }
        &.infoLine {
          padding: 30rpx 0;

          line-height: 40rpx;
        }
        .flexCon {
          flex: 1;

          padding-left: 20rpx;

          text-align: right;

          color: #000;

          font-size: 26rpx;
          .dingdan {
            text-decoration: underline;

            color: #dd2726;
          }
        }
      }
      .jiangpin-info {
        .flexCon {
          display: flex;
          align-items: center;
        }
        .thumbnail {
          overflow: hidden;

          width: 90rpx;
          height: 90rpx;
          margin: 20rpx 0 20rpx 20rpx;

          border-radius: 10rpx;
          background-repeat: no-repeat;
          background-position: 0 92rpx;
          background-size: 90rpx !important;
          &.hongbao,
          &.hbvoucher {
            background-position: 0 0;
          }
          &.quan {
            background-position: 0 -88rpx;
          }
          &.jifen {
            background-position: 0 -178rpx;
          }
          &.liuliang {
            background-position: 0 -266rpx;
          }
          &.huafei {
            background-position: 0 -356rpx;
          }
          &.jiang,
          &.jizi,
          &.default {
            background-position: 0 -450rpx;
          }

          .pic {
            width: 90rpx;
            height: 90rpx;

            vertical-align: top;

            border-radius: 12rpx;
          }
        }
        .jiangpin-name {
          font-size: 28rpx;
        }
      }
    }
    .tips-con {
      margin-top: 40rpx;
      padding: 29% 0;
      a.btn-border-orange {
        margin-top: 36rpx;
        padding: 14rpx 36rpx;
      }
    }
  }
  .primary-btn {
    width: 400rpx;
    margin: 90rpx auto 0;
  }
}
.canvas-code {
  position: fixed;
  left: -999px;

  width: 150px;
  height: 150px;
}
</style>
