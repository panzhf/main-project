<template>
  <view v-if="showData" class="container" :style="themeVars">
    <view class="wrapper">
      <view v-if="list.length > 0 || giftInfo">
        <!-- 赠品  购物券 -->
        <view v-if="PrizeType === 0 || PrizeType === 1" class="ticket-header">
          报销单：
          <text>{{ list[0].ReimburseNo }}</text>
          <text class="ml-20">
            总报销数量：
            <text class="primary-color">{{ TotalCount }}</text>
          </text>
        </view>
        <view v-if="PrizeType === 0 || PrizeType === 1" class="sort-content">
          <view class="ticket-box">
            <view v-for="(item, index) in list" :key="index">
              <view class="ticket bd-e">
                <view class="ticket-item">
                  <view class="ticket-item-left">{{ PrizeType === 0 ? '购物券名称：' : '赠品名称：' }}</view>
                  <view class="ticket-item-right">{{ item.PrizeId }}-{{ item.PrizeName }}</view>
                </view>
                <view class="ticket-item">
                  <view class="ticket-item-left">面值：</view>
                  <view class="ticket-item-right">{{ item.PrizeMoney | filterRmb }}</view>
                </view>
                <view class="ticket-item">
                  <view class="ticket-item-left">报销数量：</view>
                  <view class="ticket-item-right primary-color">{{ item.ReimburseNumber }}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
        <!-- 提领券 实物 -->
        <view v-if="[2, 3, 4].includes(PrizeType)" class="ticket-header">
          报销单：
          <text>{{ ReimburseNo }}</text>
          <text class="ml-20">
            总报销数量：
            <text class="primary-color">{{ TotalCount }}</text>
          </text>
        </view>
        <view class="sort-content">
          <view v-if="[2, 4].includes(PrizeType)" class="ticket-box">
            <view v-for="(item, index) in list" :key="index">
              <view class="ticket bd-e">
                <view class="ticket-item">
                  <view class="ticket-item-left">{{ PrizeType === 2 ? '提领券' : '返货券' }}信息：</view>
                  <view class="ticket-item-right">{{ item.voucherid }}-{{ item.vouchername }}</view>
                </view>
                <view v-if="PrizeType === 4" class="ticket-item">
                  <view class="ticket-item-left">来源类型：</view>
                  <view class="ticket-item-right primary-color">{{ item.sourcedescription || '' }}</view>
                </view>
                <view class="ticket-item">
                  <view class="ticket-item-left">报销数量：</view>
                  <view class="ticket-item-right primary-color">{{ item.expensecount }}</view>
                </view>
              </view>
            </view>
          </view>
          <view v-if="PrizeType === 3" class="ticket-box">
            <view v-for="(item, index) in giftInfo.reimburselist" :key="index" class="ticket flex product">
              <view>
                <image class="ticket-pic" :src="item.productimg" />
              </view>
              <view class="flex-1 flex flex-between flex-column">
                <view class="ticket-item product">
                  <view class="ticket-item-left">实物信息：</view>
                  <view class="ticket-item-right">{{ item.productname }}</view>
                </view>
                <view class="ticket-item product">
                  <view class="ticket-item-left">报销数量：</view>
                  <view class="ticket-item-right primary-color">{{ item.expensecount }}</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!--无数据 -->
      <none-data v-else msg="暂无报销~" icon-width="256" icon-height="190" />
    </view>
  </view>
</template>

<script>
import { filterRmb } from '@/filters'
import { apiCloud } from '@/api/cloud-store'
import { apiExpenseDetail, apiGiftDetail } from '@/api/pick-coupon'

export default {
  filters: { filterRmb },
  data() {
    return {
      showData: false,
      PrizeType: '', // 0购物券  1赠品 2提领券 3实物 4 返货券
      TotalCount: 0,
      list: [], // 购物券、赠品、提领券列表
      ReimburseNo: '', // 单号
      id: 0, // id
      giftInfo: {} // 实物数据
    }
  },

  onLoad(options) {
    this.ReimburseNo = options.ReimburseNo || ''
    this.PrizeType = options.PrizeType - 0
    this.id = options.id - 0 || 0
    if (this.PrizeType === 0 || this.PrizeType === 1) {
      // 赠品与购物券需要调接口
      this.getData()
    } else if (this.PrizeType === 2 || this.PrizeType === 4) {
      // 提领券 详情
      this.getPickupDetail()
    } else if (this.PrizeType === 3) {
      // 实物 详情
      this.getGiftDetail()
    }
  },
  methods: {
    getGiftDetail() {
      // 实物
      apiGiftDetail({
        id: this.id
      }).then(res => {
        this.showData = true
        if (this.$ck(res)) {
          let { expensecount, expenseno } = res.return_data
          this.TotalCount = expensecount
          this.ReimburseNo = expenseno
          this.giftInfo = res.return_data
        }
      })
    },
    getPickupDetail() {
      // 提领券
      apiExpenseDetail({
        expenseid: this.id,
        type: this.PrizeType === 4 ? 14 : 1
      }).then(res => {
        this.showData = true
        if (this.$ck(res)) {
          let { expensecount, expenseno, couponlist } = res.return_data
          this.ReimburseNo = expenseno
          this.list = couponlist
          this.TotalCount = expensecount
          //console.log('this.list', this.list)
        }
      })
    },
    getData() {
      // 赠品 购物券
      apiCloud({
        url: '/api/v1/Reimburse/MyReimburseDetailList',
        method: 'get',
        data: JSON.stringify({ ReimburseNo: this.ReimburseNo })
      }).then(res => {
        this.showData = true
        if (this.$ck(res)) {
          let result = res.return_data.Results || []
          this.list = result
          this.TotalCount = res.return_data.TotalCount
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-box {
  border-radius: 20rpx;
  .ticket {
    background-color: #fff;
    padding: 10rpx 40rpx;
    font-size: 28rpx;
    &.product {
      padding: 20rpx 40rpx;
    }
    .ticket-pic {
      width: 120rpx;
      height: 120rpx;
      margin: 0 30rpx 0 0;
      background: #f6f6f6;
    }
    .ticket-item {
      display: flex;
      margin: 5rpx 0;
      padding: 10rpx 0;
      &.product {
        padding: 0;
      }
      .ticket-item-left {
        width: 180rpx;
        text-align: left;
        color: #666666;
      }
      .ticket-item-right {
        flex: 1;
        color: #000000;
      }
    }
  }
}
.ticket-header {
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
