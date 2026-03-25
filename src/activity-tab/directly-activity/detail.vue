<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="info">
      <view class="key-item">
        <view class="key">活动ID:</view>
        <view class="key-val">{{ actData.Details.DirectlyActivity.Id }}</view>
      </view>
      <view class="key-item">
        <view class="key">活动名称:</view>
        <view class="key-val">
          {{ actData.Details.DirectlyActivity.Name }}
        </view>
      </view>
      <view class="key-item">
        <view class="key">开始时间:</view>
        <view class="key-val">
          <view>{{ actData.Details.DirectlyActivity.StartTime }}</view>
        </view>
      </view>
      <view v-if="actData.Details.DirectlyActivity.EndTime" class="key-item">
        <view class="key">结束时间:</view>
        <view class="key-val">
          <view>{{ actData.Details.DirectlyActivity.EndTime }}</view>
        </view>
      </view>
      <view class="key-item">
        <view class="key">活动持续时间:</view>
        <view class="key-val">
          <view>{{ actData.Details.DirectlyActivity.ContinueTime }}</view>
        </view>
      </view>
      <view class="key-item">
        <view class="key">活动状态:</view>
        <view class="key-val">{{ actData.Details.DirectlyActivity.ActivityStatus }}</view>
      </view>
    </view>
    <view class="commission-wrap">
      商品佣金=（商品实际成交额 - 微信结算手续费）x 商品佣金比例，即若订单使用了优惠券，商品付款金额以折后价为准。
    </view>
    <view class="info">
      <view class="info-goods-title">活动商品</view>
      <view v-for="(item, index) in list" :key="index">
        <view class="info-goods-box">
          <view class="info-goods-box-left">
            <image :src="item.PicUrl" />
          </view>
          <view class="info-goods-box-right">
            <view class="info-title">{{ item.GoodsName }}</view>
            <view class="info-config">
              <view v-if="item.MaxPrice > item.Price && item.IsFormat === 1" class="info-price">
                ￥{{ item.Price | filterRmb }}~￥{{ item.MaxPrice | filterRmb }}
              </view>
              <view v-else class="info-price">￥ {{ item.Price | filterRmb }}</view>
            </view>
          </view>
        </view>
        <view class="info-goods-momeny">
          推广佣金比例
          <text>{{ calcNumber(item.CRebateStore, 100, 'multi') }}%</text>
          ，预计收益
          <text v-if="item.MaxCRebateDealerAmount > item.CRebateStoreAmount" class="info-price">
            ¥{{ item.CRebateStoreAmount | filterRmb }}~¥{{ item.MaxCRebateDealerAmount | filterRmb }}
          </text>
          <text v-else-if="item.MaxCRebateStoreAmount > item.CRebateStoreAmount" class="info-price">
            ¥{{ item.CRebateStoreAmount | filterRmb }}~¥{{ item.MaxCRebateStoreAmount | filterRmb }}
          </text>
          <text v-else-if="item.MaxCRebateDirectlyPromoteAmount > item.CRebateStoreAmount" class="info-price">
            ¥{{ item.CRebateStoreAmount | filterRmb }}~¥{{ item.MaxCRebateDirectlyPromoteAmount | filterRmb }}
          </text>
          <text v-else-if="item.MaxCRebateIndirectPromoteAmount > item.CRebateStoreAmount" class="info-price">
            ¥{{ item.CRebateStoreAmount | filterRmb }}~¥{{ item.MaxCRebateIndirectPromoteAmount | filterRmb }}
          </text>
          <text v-else class="info-price">¥{{ item.CRebateStoreAmount | filterRmb }}</text>
        </view>
      </view>
    </view>
    <view class="info">
      <view class="info-goods-title">活动统计</view>
      <view class="info-rule-box">
        <view class="info-rule-row">
          累计购买人数（人）:
          <text>{{ actData.Number }}</text>
        </view>
        <view class="info-rule-row">
          累计订单数量（个）:
          <text>{{ actData.OrderCount }}</text>
        </view>
        <view class="info-rule-row">
          累计推广分佣收益（元）:
          <text class="info-price">￥{{ actData.TotalCommission | filterRmb }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { filterRmb } from '@/filters'
import { calcNumberT } from '@/mixins/calcNumber'
import { apiCloud } from '@/api/cloud-store'
export default {
  filters: { filterRmb },
  mixins: [calcNumberT],
  data() {
    return {
      actData: {},
      list: [],
      isLoading: false
    }
  },
  onLoad(data) {
    this.GetStoreLotteryInfo(data)
  },

  methods: {
    // 获取详情
    GetStoreLotteryInfo(data) {
      let form = {
        id: data.Id
      }
      apiCloud({
        url: '/api/v1/Directly/ObtainDirectPopularizeActivities',
        method: 'post',
        data: JSON.stringify(form)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.actData = res.return_data
          let ActivityStatus = ''
          switch (this.actData.Details.DirectlyActivity.ActivityStatus) {
            case -1:
              ActivityStatus = '已删除'
              break
            case 0:
              ActivityStatus = '已禁用'
              break
            case 1:
              ActivityStatus = '未开始'
              break
            case 2:
              ActivityStatus = '进行中'
              break
            case 3:
              ActivityStatus = '已结束'
              break
          }
          this.actData.Details.DirectlyActivity.ActivityStatus = ActivityStatus
          this.list = this.actData.Details.DirectlyActivityGoods
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f7f7f7;
  .info {
    background-color: #fff;
    padding: 30rpx 30rpx;
    margin-bottom: 30rpx;
    .info-rule-box {
      margin-top: 38rpx;
      .info-rule-row {
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
        line-height: 56rpx;
        .info-lable {
          margin-right: 20rpx;
          text {
            color: #000000;
          }
        }
        .info-price {
          color: var(--theme-color, $uni-color-primary);
          font-size: 26rpx;
        }
      }
    }
    .info-goods-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #000000;
      line-height: 40rpx;
    }
    .info-goods-box {
      margin-top: 20rpx;
      display: flex;
      .info-goods-box-left {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
        image {
          width: 100%;
          height: 100%;
        }
      }
      .info-goods-box-right {
        .info-config {
          display: flex;
          justify-content: space-between;
          margin-top: 20rpx;
          .info-price {
            color: var(--theme-color, $uni-color-primary);
            font-size: 26rpx;
          }
          .info-amount {
            font-size: 24rpx;
          }
        }
        .info-title {
          width: 550rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-size: 26rpx;
          min-height: 70rpx;
        }
      }
    }
    .info-goods-momeny {
      font-size: 26rpx;
      padding: 5rpx 0;
      margin: 20rpx 0;
      background-color: #fff4f4;
      color: var(--theme-color, $uni-color-primary);
      .info-price {
        color: var(--theme-color, $uni-color-primary);
        font-size: 26rpx;
      }
    }
    .key-item {
      display: flex;
      margin-bottom: 20rpx;
      .key {
        width: 177rpx;
        text-align: left;
        font-size: 28rpx;
        color: #333333;
      }
      .key-val {
        flex: 1;
        padding-left: 24rpx;
        color: #666666;
        font-size: 28rpx;
      }
      .color-red {
        color: red;
      }
    }
  }
  .commission-wrap {
    font-size: 24rpx;
    padding: 20rpx 15rpx;
    background-color: #fff4f4;
    color: #ff4b40;
    line-height: 1.5;
  }
}
</style>
