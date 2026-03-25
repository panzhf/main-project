<template>
  <view class="sort-content" :style="themeVars">
    <view class="ticket-box">
      <!-- id: 1,
              status: -1, //签收状态 -1全部，0-待签收，1-已签收，2-签收中，3-待确认
              orderno: '', //订单号
              storageno: '', //出货单号
              storageouttime: '', //出货时间
              dealerno: '', //出货经销商编号
              dealername: '', //出货经销商名称
              storagetotalcount: 1, //出货总数
              insigncount: 1 //签收总数 -->
      <view v-for="(item, index) in list" :key="index" class="ticket">
        <view class="flex flex-middle" @tap="handleDetail(item)">
          <view class="flex-1">
            <view class="ticket-item">
              <view class="ticket-key">订单号</view>
              <view class="ticket-val">
                {{ item.orderno || '无' }}
                <text v-if="item.orderno" class="common-tag">订单</text>
              </view>
            </view>
            <view class="ticket-item">
              <view class="ticket-key">出货单号</view>
              <view class="ticket-val">
                {{ item.storageno }}
                <text v-if="item.insigntype === 2 || item.insigntype === 3" class="common-tag">快签</text>
              </view>
            </view>
            <view class="ticket-item">
              <view class="ticket-key">出货时间</view>
              <view class="ticket-val">{{ item.storageouttime }}</view>
            </view>
            <view class="ticket-item">
              <view class="ticket-key">经销商</view>
              <view class="ticket-val ellipsis-2">{{ item.dealername }}</view>
            </view>
            <view class="ticket-item">
              出货数量：
              <text class="mr-30">{{ item.storagecount }}</text>
              签收数量：
              <text>{{ item.insigncount }}</text>
            </view>
          </view>
          <text class="icon iconfont icon-more fs-26 c-3"></text>
        </view>
        <view class="ticket-bottom bd-t-e">
          <view class="left">
            状态：
            <span :class="item.status !== 1 ? 'primary-color' : ''">{{ item.status | orderSignStatusFilter }}</span>
          </view>
          <view v-if="item.status === 0 || item.status === 2" class="right">
            <!-- "status":签收状态  0-待签收，1-已签收，2-签收中，3-待确认 -->
            <text
              v-if="item.insigntype === 2"
              class="textBtn"
              @tap.stop="handleJumpScanCode(item.orderno, item.storageno, item.insigntype, item.status)"
            >
              继续签收
            </text>
            <block v-else>
              <text
                v-if="item.insigncount !== 0"
                class="textBtn mr-20"
                @tap.stop="handleFinishOrderComfirm(item.storageno)"
              >
                提前结单
              </text>
              <text v-if="signinType !== 1" class="textBtn" @tap.stop="handleSignOrderComfirm(item.storageno)">
                一键签收
              </text>
              <text
                v-if="signinType !== 2"
                class="textBtn"
                @tap.stop="handleJumpScanCode(item.orderno, item.storageno, item.insigntype, item.status)"
              >
                {{ item.insigncount === 0 ? '扫码签收' : '继续签收' }}
              </text>
            </block>
          </view>
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
import { orderSignStatusFilter } from '@/filters'
import orderPocessMixin from '@/mixins/order-process'
import commonPopupMixin from '@/mixins/common-popup'
import overdueMixin from 'packages/mixins/overdue'

export default {
  filters: { orderSignStatusFilter },
  mixins: [orderPocessMixin, commonPopupMixin, overdueMixin],
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    },
    signinType: {
      type: Number,
      default: 0
    }
  },

  data() {
    return {}
  },
  methods: {
    handleDetail(item) {
      uni.navigateTo({
        url: `/product/sign/sign-detail?storageNo=${item.storageno}&orderNo=${item.orderno}&insignType=${item.insigntype}`
      })
    },
    updateData() {
      this.$emit('update')
      this.reflehPrePageData()
    }
  }
}
</script>
<style lang="scss" scoped>
@import '@/styles/tag.scss';
.ticket-box {
  border-radius: 20rpx;
  .ticket {
    margin-bottom: 30rpx;
    background-color: #fff;
    padding: 10rpx 40rpx;
    font-size: 28rpx;
    .ticket-item {
      display: flex;
      margin: 5rpx 0;
      padding: 10rpx 0;
      .ticket-key {
        flex: 2;
        text-align: left;
        color: #666666;
      }
      .ticket-val {
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
