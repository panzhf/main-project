<template>
  <view class="sort-content" :style="themeVars">
    <view class="ticket-box">
      <view v-for="(item, index) in list" :key="index">
        <view v-if="showByNo" class="ticket">
          <view class="ticket-item">
            <view class="ticket-item-left">奖品类型:</view>
            <view class="ticket-item-right">
              {{ prizeType === 2 ? '提领券' : prizeType === 4 ? '返货券' : '实物' }}
            </view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销单号:</view>
            <view class="ticket-item-right">{{ item.expenseno }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销上级:</view>
            <view class="ticket-item-right">{{ item.expenseuser }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销时间:</view>
            <view class="ticket-item-right">{{ item.addtime }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销数量:</view>
            <view class="ticket-item-right" :style="{ color: themeInfo.color }">{{ item.expensecount }}</view>
          </view>
          <view class="ticket-bottom bd-t-e">
            <view class="left">
              状态：
              <span :style="{ color: themeInfo.color }">{{ item.status | statusFilter }}</span>
            </view>
            <view class="right">
              <text class="detail-btn textBtn" @tap="handleDetail(item)">报销明细</text>
              <text v-if="!item.status" class="confirm-btn textBtn" @tap="handleOpen(item)">确认报销</text>
            </view>
          </view>
          <view v-if="String(item.expenseno).includes('ZB')" class="mt-20">
            <warning-tip v-if="prizeType === 2">
              此报销单是由于系统功能升级，将原有的提领券转移为返货券而产生的记录，后续报销将通过返货券进行报销，
            </warning-tip>
            <warning-tip v-if="prizeType === 3">
              此报销单是由于系统功能升级，将原有的实物转移为返货券而产生的记录，后续报销将通过返货券进行报销，
            </warning-tip>
          </view>
        </view>
        <view v-else class="ticket-b">
          <view class="ticket-item flex flex-1">
            <v-img class="img shrink-0" :src="item.expenseassetimage" size="200" />
            <view class="flex-1 ml-20">
              <view class="fs-30 ellipsis-1 fw-bold">{{ item.expenseassetname }}</view>
              <view class="fs-26 c-9 mt-10 flex right j-c-s-b">
                <view>卡券ID：{{ item.assetid }}</view>
                <view>x {{ item.expensecount }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
/* 提领券 */
import WarningTip from './warning-tip.vue'
export default {
  components: {
    WarningTip
  },
  filters: {
    statusFilter(v) {
      const o = {
        0: '待确认',
        1: '已确认',
        4: '处理中',
        5: '处理失败'
      }
      return o[v]
    }
  },
  props: {
    showByNo: Boolean, // 按单确认、按券确认
    list: {
      type: Array,
      default: () => []
    },
    prizeType: {
      type: Number,
      default: 2 // 2 提领券 3 实物 4返货券
    }
  },
  data() {
    return {}
  },
  methods: {
    handleDetail(item) {
      uni.navigateTo({
        url: '/pages/submit-account/detail?ReimburseNo=' + '&id=' + item.id + '&PrizeType=' + this.prizeType
      })
    },
    handleOpen(item) {
      let obj = {
        expenseNo: item.expenseno,
        id: item.id
      }
      this.$emit('comfirm', obj)
    }
  }
}
</script>
<style lang="scss" scoped>
.ticket-box {
  border-radius: 20rpx;

  .ticket {
    margin-bottom: 20rpx;
    background-color: #fff;
    padding: 10rpx 40rpx;
    font-size: 28rpx;

    .ticket-item {
      display: flex;
      margin: 5rpx 0;
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
        }
        .detail-btn {
          // color: #ff5e34;
          color: var(--theme-color, $uni-color-primary);
        }
        .confirm-btn {
          margin-left: 10px;
          // background-color: #ff5e34;
          background-color: var(--theme-color, $uni-color-primary);
          color: #fff;
        }
      }
    }
  }
  .ticket-b {
    background: #fff;
    padding: 30rpx;
    &:nth-child(n + 1) {
      margin-top: 30rpx;
    }
    .ticket-item {
      .img-warpper {
        display: flex;
        flex-wrap: wrap;
        margin-bottom: 20rpx;
      }
      .img {
        @include wh(120rpx);
        border-radius: 8rpx;
        overflow: hidden;
      }
      .right {
        color: #999;
        font-size: 24rpx;
        margin-top: 42rpx;
      }
      .j-c-s-b {
        justify-content: space-between;
      }
    }
  }
}
</style>
