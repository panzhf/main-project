<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="info">
      <view class="key-item">
        <view class="key">关联购物券:</view>
        <view class="key-val">{{ actData.ShoppingVouchersTitle }}</view>
      </view>
      <view class="key-item">
        <view class="key">面值:</view>
        <view class="key-val">
          {{ actData.ShoppingVouchersDenominations }} 元，
          <text v-if="actData.ShoppingVouchersUsingCondition">满{{ actData.ShoppingVouchersUsingCondition }}可用</text>
          <text v-else>无门槛</text>
        </view>
      </view>
      <view class="key-item">
        <view class="key">活动时间:</view>
        <view class="key-val color-red">
          <view>
            {{ actData.StartTime }}至
            <br />
            {{ actData.EndTime }}
          </view>
        </view>
      </view>
      <view class="key-item">
        <view class="key">发放数量:</view>
        <view class="key-val">{{ actData.LimitGrantNum }} 张</view>
      </view>
      <view class="key-item">
        <view class="key">每人限领:</view>
        <view class="key-val">
          <text v-if="actData.LimitUserNum">{{ actData.LimitUserNum }} 张</text>
          <text v-else>无限制</text>
        </view>
      </view>
      <view class="key-item">
        <view class="key">领券入口:</view>
        <view class="key-val">{{ actData.ShowEntrys }}</view>
      </view>
    </view>
    <view class="detail-button">
      <button class="primary-btn round" hover-class="button-action" @tap="$goBack">返回</button>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      actData: {},
      isLoading: false
    }
  },

  onLoad(data) {
    this.GetStoreLotteryInfo(data)
  },

  methods: {
    GetStoreLotteryInfo(data) {
      apiCloud({
        url: '/api/v1/CollectCouponsAct/GetCouponsActDetail',
        method: 'get',
        data: JSON.stringify(data)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          // 替换
          if (res.return_data.ShowEntrys) {
            res.return_data.ShowEntrys.forEach((item, index) => {
              if (item === 0) {
                res.return_data.ShowEntrys[index] = '商品详情'
              } else if (item === 1) {
                res.return_data.ShowEntrys[index] = '购物车'
              } else if (item === 2) {
                res.return_data.ShowEntrys[index] = '领券中心'
              }
            })
            res.return_data.ShowEntrys = res.return_data.ShowEntrys.join()
          } else {
            res.return_data.ShowEntrys = '无'
          }
          this.actData = res.return_data
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
    .key-item {
      display: flex;
      margin-bottom: 20rpx;
      .key {
        width: 150rpx;
        text-align: right;
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
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
  .detail-button {
    position: fixed;
    width: 100%;
    padding: 0 20rpx;
    bottom: 40px;
    bottom: calc(40rpx + constant(safe-area-inset-bottom));
  }
}
</style>
