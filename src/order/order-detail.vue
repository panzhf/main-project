<template>
  <view class="page-comfirm" :style="themeVars">
    <view class="order-ralation">
      <view class="flex flex-betweem">
        <view class="flex-1">
          订单号：
          {{ orderDetail.orderno || '' }}
        </view>
        <view class="fs-28 tx-r fw-bold primary-color">{{ orderDetail.orderstatus | orderStatusFilter }}</view>
      </view>
      <view class="tx-r">
        <text v-if="orderDetail.istransferupper" class="fs-24">(转交订单)</text>
        <text v-if="orderDetail.issignadvancefinishorder && orderDetail.orderstatus === 4" class="fs-24">
          (已申请提前结单,等待上级审核)
        </text>
      </view>
    </view>
    <view class="common-wrap order-address fs-28 fw-700">
      <view>
        <text class="iconfont icon-dizhi fs-24 c-3 mr-10"></text>
        {{ orderDetail.receivename || '' }}
        <text class="ml-30">{{ orderDetail.mobile || '' }}</text>
      </view>
      <view class="fs-24 c-6 mt-10">{{ orderDetail.receiveaddress || '' }}</view>
    </view>
    <view class="common-wrap order-products">
      <view v-for="(item, index) in list" :key="index" class="product flex flex-middle bd-e">
        <v-img class="product-size" :src="item.picimg || defaultProductPic" :size="120" />
        <view class="product-content flex flex-1 flex-column flex-between ml-20">
          <view class="fs-26 fw-bold ellipsis-1">{{ item.productname }}</view>
          <view class="c-6 fs-24">{{ item.productno }}</view>
          <view class="fs-22 c-9 mt-5 ellipsis-2">{{ item.productformatname }}</view>
          <view class="fs-24 c-3">
            <text v-if="orderDetail.isopenorderprice" class="mr-20">订货价：￥{{ item.orderprice }}</text>
            <text>订单数量：{{ item.ordercount }}</text>
            <text v-if="[3, 4, 5].includes(orderDetail.orderstatus)" class="ml-20">
              实际出货：{{ item.storagecount }}
            </text>
            <text v-if="[4, 5].includes(orderDetail.orderstatus)" class="ml-20">签收数量：{{ item.signincount }}</text>
          </view>
        </view>
      </view>
      <view class="order-total fs-28 fw-bold tx-r">
        订单总数：
        <text class="primary-color mr-20">
          {{ orderDetail.ordertotalcount || 0 }}
        </text>
        <text v-if="[3, 4, 5].includes(orderDetail.orderstatus)">
          出货总数：
          <text class="primary-color mr-20">
            {{ orderDetail.storagetotalcount || 0 }}
          </text>
        </text>
        <text v-if="[4, 5].includes(orderDetail.orderstatus)">
          签收总数：
          <text class="primary-color">
            {{ orderDetail.signintotalcount || 0 }}
          </text>
        </text>
        <text v-if="orderDetail.isopenorderprice" class="ml-20">
          合计：
          <text class="primary-color">￥{{ orderDetail.orderpricesum }}</text>
        </text>
      </view>
    </view>
    <view class="common-wrap order-remark">
      <view class="item bd-c flex">
        <text class="c-6">订单备注</text>
        <text class="ml-30 flex-1 wb-ba">{{ orderDetail.remark || '-' }}</text>
      </view>
      <view class="item">
        <text class="c-6">下单时间</text>
        <text class="ml-30">{{ orderDetail.addtime }}</text>
      </view>
    </view>
    <view v-if="orderDetail.payvoucharurl && storeType === 'myStore'" class="common-wrap order-pay">
      <view class="title">支付凭证</view>
      <view class="tx-c">
        <image class="upload-pic" :src="orderDetail.payvoucharurl" @tap="handlePreview(orderDetail.payvoucharurl)" />
      </view>
    </view>
    <view style="height: 150rpx"></view>
    <view v-if="!loading" class="pop-bottom flex">
      <!-- 订单状态 0待审核；1待出货；2出货中；3待签收；4签收中；5订单完成；6订单取消 -->
      <!-- signinType 1:扫码签收,2:一键签收,3:扫码、一键签收 -->
      <block v-if="storeType === 'myStore'">
        <button
          v-if="orderDetail.orderstatus === 0"
          class="primary-btn round flex-1"
          hover-class="button-action"
          @tap="handleCancelComfirm(orderDetail.orderno)"
        >
          取消订单
        </button>
        <button
          v-if="orderDetail.orderstatus === 4 && !orderDetail.issignadvancefinishorder"
          class="primary-btn round flex-1 inverse"
          hover-class="button-action"
          @tap="handleFinishOrderComfirm(orderDetail.storageno)"
        >
          提前结单
        </button>
        <block v-if="[3, 4].includes(orderDetail.orderstatus)">
          <button
            v-if="signinType !== 1"
            class="primary-btn round flex-1 inverse"
            hover-class="button-action"
            @tap="handleSignOrderComfirm(orderDetail.storageno)"
          >
            一键签收
          </button>
          <button
            v-if="signinType !== 2 && !orderDetail.issignadvancefinishorder"
            class="primary-btn round flex-1"
            hover-class="button-action"
            @tap="handleScanCodeFromOrder(orderNo, orderDetail.storageno, orderDetail.orderstatus)"
          >
            {{ orderDetail.signintotalcount === 0 ? '扫码签收' : '继续签收' }}
          </button>
        </block>
      </block>

      <button
        v-if="orderDetail.orderstatus === 5 && orderDetail.storageno"
        class="primary-btn round flex-1"
        hover-class="button-action"
        @tap="handleNav(`/order/goods-list?storageno=${orderDetail.storageno}`)"
      >
        收货记录
      </button>
    </view>

    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      :placeholder="popPlaceholder"
      :is-textarea="popIsTextarea"
      :max-length="maxLength"
      @confirm="handleConfirm"
    ></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import { orderStatusFilter } from '@/filters'
import { apiOrderDetail } from '@/api/order'
import orderProcessMixin from '@/mixins/order-process'
import commonPopupMixin from '@/mixins/common-popup'
import { staticURL } from '@/config'
import baseSetMixin from '@/mixins/base-set'
import overdueMixin from 'packages/mixins/overdue'
export default {
  name: 'OrderDetail',
  filters: { orderStatusFilter },
  mixins: [commonPopupMixin, orderProcessMixin, baseSetMixin, overdueMixin],
  data() {
    return {
      orderDetail: {},
      list: [],
      orderNo: '',
      defaultProductPic: staticURL() + 'common/default-pic.png',
      storeNo: '',
      loading: true,
      storeType: '' // myStore  invitedStore
    }
  },
  onLoad(options) {
    this.orderNo = options.orderno
    this.storeType = options.storetype
    this.storeNo = options.storeno
    this.getData()
  },
  async onShow() {
    if (this.refleshData) {
      this.refleshData = false
      this.getData()
      uni.$emit('orderListReflesh', true)
    }
  },
  methods: {
    handleNav(url) {
      uni.navigateTo({
        url: url
      })
    },
    onPullDownRefresh() {
      this.$store.dispatch('getFcBasicInfo')
      this.getData()
    },
    getData() {
      apiOrderDetail({ orderno: this.orderNo, storeno: this.storeNo }).then(res => {
        this.loading = false
        uni.stopPullDownRefresh()
        if (this.$ck(res)) {
          this.orderDetail = res.return_data
          this.list = res.return_data.list
        }
      })
    },
    updateData() {
      this.getData()
      this.reflehPrePageData()
    },
    handleBack() {
      uni.navigateBack()
    },
    handlePreview(url) {
      let urls = [url]
      wx.previewImage({
        current: url,
        urls: urls
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.page-comfirm {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
  .order-ralation {
    background: #fff;
    padding: 20rpx 30rpx;
    margin-bottom: 20rpx;
    font-size: 28rpx;
    line-height: 40rpx;
  }
  .common-wrap {
    border-radius: 10rpx;
    background: #ffffff;
    margin: 20rpx;
  }
  .order-address {
    padding: 20rpx;
  }
  .order-products {
    padding: 0 30rpx;
    .product {
      padding: 20rpx 30rpx 20rpx 0;
      &-size {
        width: 120rpx;
        height: 120rpx;
      }
    }
  }
  .order-total {
    padding: 20rpx 0;
  }
  .order-remark {
    padding: 20rpx 30rpx;
    .item {
      padding: 20rpx 0;
    }
  }
  .order-pay {
    background: #fff;
    padding: 20rpx 30rpx;
    .upload-pic {
      margin: 20rpx auto;
      width: 150rpx;
      height: 150rpx;
    }
    .upload-image {
      margin: 20rpx auto;
      width: 150rpx;
      height: 150rpx;
      position: relative;
      border: 1px solid #e5e5e5;
      &::before {
        position: absolute;
        content: '';
        width: 50rpx;
        height: 4rpx;
        left: 50rpx;
        top: 50rpx;
        background: #e5e5e5;
      }
      &::after {
        position: absolute;
        content: '';
        height: 50rpx;
        width: 4rpx;
        left: 70rpx;
        top: 30rpx;
        background: #e5e5e5;
      }
      .upload-text {
        font-size: 24rpx;
        font-weight: 500;
        color: #999999;
        position: absolute;
        bottom: 20rpx;
        left: 0;
        width: 100%;
        font-weight: 700;
        text-align: center;
      }
    }
  }
}
.pop-bottom {
  position: fixed;
  left: 40rpx;
  right: 40rpx;
  bottom: 30rpx;
  .primary-btn {
    &:not(:nth-last-child(1)) {
      margin-right: 20rpx;
    }
  }
}
</style>
