<template>
  <view class="sign" :style="themeVars">
    <view class="sign-order">
      <text>出货单号：{{ storageNo || '' }}</text>
      <!-- info.status 接口缺少返回签收状态 -->
      <!-- "status":签收状态  0-待签收，1-已签收，2-签收中，3-待确认 -->
      <view v-if="info.status !== -1" class="status-tag" :class="info.status === 1 ? 'signed' : 'unSigned'">
        {{ info.status | signDetailStatusFilter }}
      </view>
      <text v-if="info.insigntype === 2 || info.insigntype === 3" class="common-tag">快签</text>
    </view>

    <view class="sign-main">
      <view class="sign-main__title">出货明细</view>
      <view class="row">
        <view class="key">操作人：</view>
        <view class="val flex-1">{{ info.accountname || '' }}</view>
      </view>
      <view class="row">
        <view class="key">出货时间：</view>
        <view class="val flex-1">{{ info.stoageouttime || '' }}</view>
      </view>
      <view class="row">
        <view class="key">合计种类：</view>
        <view class="val flex-1">{{ info.kindcount || '' }} 种</view>
      </view>
      <view class="row">
        <view class="key">合计数量：</view>
        <view class="val flex-1">
          <text class="mr-20">{{ info.storageoutcount }}</text>
          (
          <text class="fw-bold">
            已签收
            <text>{{ info.insigncount }}</text>
            <text v-if="info.stayinsigncount > 0 && info.status !== 1" class="ml-20 primary-color">
              待签收
              <text>{{ info.stayinsigncount }}</text>
            </text>
          </text>
          )
        </view>
      </view>
    </view>

    <view class="sign-main">
      <view class="sign-main__title">收货信息</view>
      <view class="row">
        <view class="key">收货人：</view>
        <view class="val flex-1">{{ info.consigneename || '' }}</view>
      </view>
      <view class="row">
        <view class="key">负责人：</view>
        <view class="val flex-1">
          {{ info.leader || '' }}
          <text v-if="info.mobileno" class="ml-20">{{ info.mobileno | hideMobileFilter }}</text>
        </view>
      </view>
      <view class="row">
        <view class="key">收货地址：</view>
        <view class="val flex-1">{{ info.consigneenameaddress }}</view>
      </view>
    </view>

    <view class="sign-main">
      <view class="sign-main__title">商品签收信息</view>
      <product-info
        v-for="(item, index) in info.list"
        :key="index"
        :storage-no="storageNo"
        :item="item"
        :status="info.status"
      ></product-info>
    </view>

    <view style="height: 250rpx"></view>
    <!-- info.status 接口缺少返回签收状态 -->
    <view v-if="info.status === 0 || info.status === 2" class="btn-group flex">
      <block v-if="info.insigntype === 2">
        <button class="primary-btn round flex-1" @tap="handleCompleteComfirm(storageNo)">完成签收</button>
        <button
          class="primary-btn round flex-1"
          @tap="handleJumpScanCode(info.orderno, storageNo, info.insigntype, info.status)"
        >
          继续签收
        </button>
      </block>

      <block v-else>
        <!--
        1、签收数量为0：扫码签收  一键签收
        2、签收数量不为0：提前结单  继续签收（扫码签收）
        3、全部已签收：不显示按钮
      -->
        <!-- signinType 1:扫码签收,2:一键签收,3:扫码、一键签收 -->
        <!-- "status":签收状态  0-待签收，1-已签收，2-签收中，3-待确认 -->

        <button
          v-if="info.insigncount !== 0"
          class="primary-btn round flex-1"
          @tap="handleFinishOrderComfirm(storageNo)"
        >
          提前结单
        </button>
        <button v-if="signinType !== 1" class="primary-btn round flex-1" @tap="handleSignOrderComfirm(storageNo)">
          一键签收
        </button>
        <button
          v-if="signinType !== 2"
          class="primary-btn round flex-1"
          @tap.stop="handleJumpScanCode(orderNo, storageNo, insignType, info.status)"
        >
          {{ info.insigncount === 0 ? '扫码签收' : '继续签收' }}
        </button>
      </block>
    </view>
    <view v-else-if="info.status === 1 || info.status === 3" class="btn-group flex">
      <button v-if="info.insigncount !== 0" class="primary-btn round flex-1" @tap="handleBack">返回列表</button>
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
import ProductInfo from './comps/product-info'
import commonPopupMixin from '@/mixins/common-popup'
import { signDetailStatusFilter, hideMobileFilter } from '@/filters'
import { apiGetGignDetail } from '@/api/sign'
import baseSetMixin from '@/mixins/base-set'
import orderPocessMixin from '@/mixins/order-process'
import overdueMixin from 'packages/mixins/overdue'

export default {
  name: '',
  components: { ProductInfo },
  filters: { signDetailStatusFilter, hideMobileFilter },
  mixins: [commonPopupMixin, baseSetMixin, orderPocessMixin, overdueMixin],
  data() {
    return {
      storageNo: '',
      orderNo: '',
      insignType: -1,
      info: { status: -1 }
    }
  },

  onLoad(options) {
    this.storageNo = options.storageNo
    this.orderNo = options.orderNo
    this.insignType = Number(options.insignType)
    this.getData()
  },
  async onShow() {
    if (this.refleshData) {
      this.refleshData = false
      this.getData()
      uni.$emit('signListReflesh', true)
    }
  },
  onPullDownRefresh() {
    this.$store.dispatch('getFcBasicInfo')
    this.getData()
  },
  methods: {
    getData() {
      if (this.busy) return
      this.busy = true
      apiGetGignDetail({
        storageno: this.storageNo
      })
        .then(res => {
          uni.stopPullDownRefresh()
          if (this.$ck(res)) {
            this.info = res.return_data
          }
          this.busy = false
          this.loading = false
        })
        .catch(() => {
          this.busy = false
          this.loading = false
        })
    },
    updateData() {
      this.getData()
      this.reflehPrePageData()
    },
    handleBack() {
      uni.navigateBack({
        delta: 1
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tag.scss';
.sign {
  background-color: #f8f8f8;
  color: #000;
  &-order {
    background: #fff;
    padding: 30rpx;
    line-height: 40rpx;
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
    .status-tag {
      margin-left: 10rpx;
      position: relative;
      display: inline-block;
      padding: 6rpx 8rpx;
      border-radius: 5rpx;
      line-height: 26rpx;
      white-space: nowrap;
      height: 40rpx;
      font-size: 24rpx;
      font-weight: 700;
      color: #fff;
      &.signed {
        // background: $uni-text-color-primary;
        background: var(--theme-color, $uni-color-primary);
        &::after {
          // border-right: 16rpx solid $uni-text-color-primary;
          border-right: 16rpx solid var(--theme-color, $uni-color-primary);
        }
      }
      &.unSigned {
        background: #ff6f52;
        &::after {
          border-right: 16rpx solid #ff6f52;
        }
      }
      &::after {
        content: '';
        left: -10rpx;
        top: 12rpx;
        position: absolute;
        display: inline-block;
        width: 0;
        height: 0;
        border-top: 8rpx solid transparent;
        border-bottom: 8rpx solid transparent;
      }
    }
  }
  &-main {
    margin-bottom: 20rpx;
    background-color: #fff;
    padding: 30rpx;
    &__title {
      font-weight: bold;
      margin-bottom: 20rpx;
    }
    .row {
      color: #666;
      display: flex;
      padding: 8rpx 0;
      .key {
        font-size: 28rpx;
        color: #666666;
        width: 140rpx;
      }
      .val {
        flex: 1;
        font-size: 28rpx;
        font-weight: 500;
        color: #000000;
      }
    }
  }

  .btn-group {
    position: fixed;
    left: 40rpx;
    right: 40rpx;
    bottom: 30rpx;
    .primary-btn + .primary-btn {
      margin-left: 20rpx;
    }
    .primary-btn:not(:last-child) {
      border: 1px solid $uni-color-primary;
      background-color: #fff;
      color: $uni-color-primary;
      font-weight: 700;
    }
  }
}
</style>
