<template>
  <view class="ticket-box">
    <view v-for="item in list" :key="item.orderno" class="ticket">
      <view
        class="flex flex-between flex-middle"
        @tap="handleNav(`/order/order-detail?orderno=${item.orderno}&storetype=${storeType}&storeno=${storeNo}`)"
      >
        <view class="flex-1">
          <view class="ticket-item">
            <view class="ticket-item-left">订单号</view>
            <view class="ticket-item-right">{{ item.orderno }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">收货人</view>
            <view class="ticket-item-right">{{ item.receivename }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">手机号</view>
            <view class="ticket-item-right">{{ item.mobile }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">下单时间</view>
            <view class="ticket-item-right">{{ item.addtime }}</view>
          </view>
        </view>
        <text class="iconfont icon-arrow-right fs-22"></text>
      </view>
      <view class="ticket-bottom bd-t-e">
        <view class="left">
          状态：
          <text class="primary-color">{{ item.orderstatus | orderStatusFilter }}</text>
          <text v-if="item.orderstatus === 4 && item.issignadvancefinishorder" class="fs-24">
            (已申请提前结单,等待上级审核)
          </text>
          <text v-if="item.istransferupper" class="fs-24">(转交订单)</text>
        </view>
        <view class="right">
          <!-- 订单状态 0待审核；1待出货；2出货中；3待签收；4签收中；5订单完成；6订单取消 -->
          <!-- 下级的订单只能操作 -->
          <!-- signinType 1:扫码签收,2:一键签收,3:扫码、一键签收 -->
          <block v-if="storeType === 'myStore'">
            <text v-if="item.orderstatus === 0" class="textBtn" @tap="handleCancelComfirm(item.orderno)">取消订单</text>
            <text
              v-if="item.orderstatus === 4 && !item.issignadvancefinishorder"
              class="textBtn ml-20"
              @tap.stop="handleFinishOrderComfirm(item.storageno)"
            >
              提前结单
            </text>
            <text
              v-if="[3, 4].includes(item.orderstatus) && signinType !== 1"
              class="textBtn ml-20"
              @tap.stop="handleSignOrderComfirm(item.storageno)"
            >
              一键签收
            </text>
            <block v-if="signinType !== 2">
              <text
                v-if="item.orderstatus === 4 && !item.issignadvancefinishorder"
                class="textBtn"
                @tap.stop="handleScanCodeFromOrder(item.orderno, item.storageno, item.orderstatus)"
              >
                继续签收
              </text>
              <text
                v-if="item.orderstatus === 3"
                class="textBtn"
                @tap.stop="handleScanCodeFromOrder(item.orderno, item.storageno, item.orderstatus)"
              >
                扫码签收
              </text>
            </block>
          </block>
          <text
            v-if="item.orderstatus === 5 && item.storageno"
            class="textBtn"
            @tap.stop="handleNav(`/order/goods-list?storageno=${item.storageno}&storetype=${storeType}`)"
          >
            收货记录
          </text>
        </view>
      </view>
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
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import { orderStatusFilter } from '@/filters'
import commonPopupMixin from '@/mixins/common-popup'
import orderPocessMixin from '@/mixins/order-process'
import baseSetMixin from '@/mixins/base-set'
import overdueMixin from 'packages/mixins/overdue'
export default {
  filters: { orderStatusFilter },
  mixins: [commonPopupMixin, orderPocessMixin, baseSetMixin, overdueMixin], //弹窗
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    storeType: {
      type: String,
      default: 'myStore' // 我的门店：storeType  邀请的门店：invitedStore
    },
    storeNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      cancelItem: {}
    }
  },
  methods: {
    handleNav(url) {
      uni.navigateTo({
        url: url
      })
    },
    updateData() {
      setTimeout(() => {
        this.$emit('update')
      }, 500)
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket-box {
  margin-bottom: 20rpx;
  .ticket {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 20rpx 30rpx 10rpx;
    font-size: 28rpx;
    .ticket-item {
      display: flex;
      padding: 10rpx 0;
      .ticket-item-left {
        flex: 2;
        text-align: left;
        color: #666666;
      }
      .ticket-item-right {
        flex: 7;
        color: #000000;
      }
      .img-warpper {
        display: flex;
        flex-wrap: wrap;

        .img-wrap {
          width: 120rpx;
          margin: 10rpx;
          .img {
            width: 100%;
            display: block;
          }
        }
      }
    }

    .ticket-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20rpx 0;
      .right {
        display: flex;
        .textBtn {
          padding: 10rpx 15rpx;
          // border: 1px solid #ff5e34;
          border: 1px solid var(--theme-color, $uni-color-primary);
          border-radius: 50rpx;
          // color: #ff5e34;
          color: var(--theme-color, $uni-color-primary);
          &:last-child {
            margin-left: 20rpx;
            padding: 10rpx 15rpx;
            // background-color: #ff5e34;
            background-color: var(--theme-color, $uni-color-primary);
            border-radius: 50rpx;
            color: #fff;
          }
        }
      }
    }
  }
}
</style>
