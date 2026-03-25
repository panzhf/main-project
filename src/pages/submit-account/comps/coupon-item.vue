<template>
  <view class="sort-content" :style="themeVars">
    <view class="ticket-box">
      <view v-for="(item, index) in list" :key="index">
        <view class="ticket">
          <view class="ticket-item">
            <view class="ticket-item-left">奖品类型:</view>
            <view class="ticket-item-right">{{ item.PrizeType == 0 ? '购物券' : '赠品' }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销单号:</view>
            <view class="ticket-item-right">{{ item.ReimburseNo }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销上级:</view>
            <view class="ticket-item-right">{{ item.ReimburseSuperior }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销时间:</view>
            <view class="ticket-item-right">{{ item.ReimburseAddTime }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">报销数量:</view>
            <view class="ticket-item-right" style="color: #ff5e34">{{ item.ReimburseNumber }}</view>
          </view>
          <view class="ticket-item">
            <view class="ticket-item-left">奖品价值:</view>
            <view class="ticket-item-right">{{ item.PrizeMoney | filterRmb }}</view>
          </view>
          <view class="ticket-item" style="border-bottom: 1px solid #eee">
            <view class="ticket-item-left">报销凭证:</view>
            <view v-if="item.imgArr.length > 0" class="ticket-item-right img-warpper">
              <view v-for="(item2, index2) in item.imgArr" :key="index2">
                <view class="img-wrap">
                  <image class="img" mode="widthFix" :src="item2" @tap="previewImg(item.imgArr, index2)" />
                </view>
              </view>
            </view>
            <view v-else class="ticket-item-right">-</view>
          </view>
          <view class="ticket-bottom">
            <view class="left">
              状态：
              <span style="color: #ff5e34">{{ item.ReimburseStatus }}</span>
            </view>
            <view class="right">
              <text
                class="detail-btn textBtn"
                @tap="
                  handleDetail(
                    '/pages/submit-account/detail?ReimburseNo=' + item.ReimburseNo + '&PrizeType=' + item.PrizeType
                  )
                "
              >
                报销明细
              </text>
              <text
                v-if="item.ReimburseStatus === '待确认'"
                class="confirm-btn textBtn"
                @tap="handleOpen(item.ReimburseNo)"
              >
                确认报销
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
/*  购物券 赠品 */
import { filterRmb } from '@/filters'
export default {
  filters: { filterRmb },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    prizeType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {}
  },
  methods: {
    handleDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    previewImg(item, e) {
      const index = e
      const imgArr = item
      uni.previewImage({
        current: imgArr[index], // 当前图片地址
        urls: imgArr, // 所有要预览的图片的地址集合 数组形式
        success: function (res) {},
        fail: function (res) {},
        complete: function (res) {}
      })
    },
    handleOpen(ReimburseNo) {
      let obj = {
        expenseNo: ReimburseNo,
        id: 0
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
    margin-bottom: 30rpx;
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
          border: 1px solid var(--theme-color, $uni-color-primary);
          border-radius: 50rpx;
        }
        .detail-btn {
          color: var(--theme-color, $uni-color-primary);
        }
        .confirm-btn {
          margin-left: 10px;
          background-color: var(--theme-color, $uni-color-primary);
          color: #fff;
        }
      }
    }
  }
}
</style>
