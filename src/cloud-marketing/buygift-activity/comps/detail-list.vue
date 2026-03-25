<template>
  <view class="listWhole" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="list-wrap">
      <view
        v-for="(item2, index2) in item.DataGoodsList"
        :key="index2"
        class="list"
        :style="{ 'border-bottom': index2 === item.DataGoodsList.length - 1 ? '1px solid #eee' : 'none' }"
      >
        <view class="picture">
          <image :src="item2.PicUrl" />
        </view>
        <view class="main">
          <view class="common">
            <view class="commonVal good-name">{{ item2.GoodsName }}</view>
          </view>
          <view class="common">
            <view class="commonVal">产品ID：</view>
            <view>{{ item2.GoodsId ? item2.GoodsId : '---' }}</view>
          </view>
          <view class="common">
            <view class="commonVal">数量：</view>
            <view>{{ item2.Amount }}</view>
          </view>
        </view>
      </view>
      <view class="info" style="padding-top: 20rpx">
        <view class="info-item">用户名：</view>
        <view>{{ item.NickName }}</view>
      </view>
      <view class="info">
        <view class="info-item">用户ID：</view>
        <view>{{ item.BuyerId }}</view>
      </view>
      <view class="info">
        <view class="info-item">状态：</view>
        <view>{{ item.SendUserStatus }}</view>
      </view>
      <view class="info" style="padding-bottom: 20rpx">
        <view class="info-item">交易时间：</view>
        <view>{{ item.TransactionTime }}</view>
      </view>
      <view class="order-wrap">
        <view class="order-detail" @tap="handleDetail(item.OutTradeNo)">订单详情</view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    handleDetail(OutTradeNo) {
      uni.navigateTo({
        url: `/cloud-store/order-management/detail?orderNumber=${OutTradeNo}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.listWhole {
  position: relative;
  .list-wrap {
    margin-bottom: 20rpx;
  }
  .list {
    position: relative;
    display: flex;
    padding: 10rpx 20rpx;
    background: #fff;
  }
  .list:last-of-type {
    border-bottom: 1px solid #eee !important;
  }
  .picture {
    position: relative;
    margin-right: 21rpx;
    image {
      width: 120rpx;
      height: 120rpx;
    }
  }

  .main {
    .common {
      display: flex;
      line-height: 40rpx;
      color: #666;
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      .commonVal {
        width: 120rpx;
        margin-right: 41rpx;
        color: #666;
      }
      .good-name {
        width: 540rpx !important;
        font-size: 26rpx;
        color: #000;
      }
    }
  }
  .info {
    display: flex;
    line-height: 40rpx;
    color: #666;
    padding: 5rpx 20rpx;
    font-size: 26rpx;
    font-family: PingFang SC;
    font-weight: 500;
    background-color: #fff;
    .info-item {
      width: 135rpx;
      margin-right: 41rpx;
      color: #666;
    }
  }
  .order-wrap {
    position: relative;
    height: 97rpx;
    line-height: 97rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
    border-top: 1px solid #eee;
    .order-detail {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 30rpx;
      color: #686868;
      font-size: 26rpx;
      width: 150rpx;
      height: 56rpx;
      line-height: 56rpx;
      text-align: center;
      color: var(--theme-color, $uni-color-primary);
      border: 1px solid var(--theme-color, $uni-color-primary);
      border-radius: 50rpx;
    }
  }
  .member {
    position: relative;
    min-width: 100rpx;
    padding: 3rpx 5rpx;
    margin-left: 10rpx;
    border-radius: 20rpx;
    color: #000;
    background: rgba(255, 75, 64, 0.1);
    font-size: 24rpx;
    padding-left: 48rpx;

    .grade {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 6rpx;
      left: 8rpx;
      width: 34rpx;
      height: 34rpx;
      color: #fff;
      background: rgb(246, 198, 102);
      border-radius: 100%;
      font-size: 18rpx;
    }
  }
}
</style>
