<template>
  <view :style="themeVars">
    <view
      v-for="(item, index) in list"
      :key="index"
      class="order-item"
      @tap="handleOpenDetail('/cloud-store/order-management/detail?orderNumber=' + item.OrderNumber)"
    >
      <view class="order-header">
        <view class="order-header__left">
          <view v-if="item.DeliveryMode === 1" class="order-tag">自提</view>
          <view v-if="item.DeliveryMode === 0" class="order-tag">配送</view>
          <view class="order-no">订单号：{{ item.OrderNumber }}</view>
          <view class="order-btn--copy" @tap.stop="handleCopy(item.OrderNumber)">复制</view>
        </view>
      </view>
      <view class="order-body">
        <view v-for="(product, indexT) in item.OrderItems" :key="indexT" style="background-color: #f9f9f9">
          <ProductCard :product="product" class="mt-10"></ProductCard>
        </view>
      </view>
      <view class="order-footer">
        <view class="order-total">
          <view class="order-count">共{{ item.OrderGoodsCount }}件商品</view>
          <view class="order-amount">
            <view class="order-amount__label">实付：</view>
            <view class="order-amount__value">￥{{ item.ActualAmount + item.DeliveryFee }}</view>
          </view>
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import ProductCard from '@/components/product-card'
export default {
  components: {
    ProductCard
  },
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {}
  },
  methods: {
    // 打开订单详情
    handleOpenDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    // 复制文本
    handleCopy(text) {
      uni.setClipboardData({
        data: text
      })
    }
  }
}
</script>
<style lang='scss' scoped>
.order-item {
  margin-top: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 26rpx;
    border-bottom: 1rpx solid #eee;
    .order-header__left {
      display: flex;
      align-items: center;
      .order-tag {
        margin-right: 12rpx;
        padding: 4rpx 10rpx;
        background-color: var(--theme-color, $uni-color-primary);
        border-radius: 10rpx 0 10rpx 0;
        font-size: 20rpx;
        color: #fff;
      }
      .order-no {
        font-size: 24rpx;
        color: #999;
      }
      .order-btn--copy {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 20rpx;
        width: 60rpx;
        height: 34rpx;
        border-radius: 17rpx;
        border: 1rpx solid #ccc;
        font-size: 22rpx;
        color: #666;
      }
    }
  }
  .order-body {
    margin-top: 20rpx;
    .order-product {
      display: flex;
      background-color: #f9f9f9;
      .order-product__image {
        width: 170rpx;
        height: 170rpx;
      }
      .order-product__info {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 16rpx;
        box-sizing: border-box;
        .order-product__name {
          flex: 1;
          line-height: 30rpx;
          font-size: 30rpx;
          color: #000;
        }
        .order-product__info__bottom {
          display: flex;
          justify-content: space-between;
          .order-product__price {
            font-size: 26rpx;
            color: var(--theme-color, $uni-color-primary);
          }
          .order-product__count {
            font-size: 24rpx;
            color: #333;
          }
        }
      }
    }
    .order-product + .order-product {
      margin-top: 10rpx;
    }
  }
  .order-footer {
    margin-top: 30rpx;
    .order-total {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      .order-count {
        font-size: 24rpx;
        color: #444;
      }
      .order-amount {
        display: flex;
        align-items: flex-end;
        margin-left: 30rpx;
        .order-amount__label {
          font-size: 24rpx;
          color: #444;
        }
        .order-amount__value {
          line-height: 1;
          font-size: 32rpx;
          color: var(--theme-color, $uni-color-primary);
        }
      }
    }
    .order-receiver {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      margin-top: 20rpx;
      font-size: 24rpx;
      color: #444;
      .order-receiver__mobile {
        margin-left: 20rpx;
      }
    }
  }
}
</style>
