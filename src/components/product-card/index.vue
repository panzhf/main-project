<template>
  <view class="wrap" :style="calcThemeVars">
    <view v-if="isGoodsCheckOrder && isShowCheckStatusText" class="product-top">
      <view v-if="product.CheckCode" class="left">
        {{ product.IsFreeGift ? '赠品核销码：' : '商品核销码：' }}
        <text>{{ product.CheckCode }}</text>
      </view>
      <view v-if="isCheckStatus" class="right">
        <view v-if="product.CheckStatus">已核销</view>
        <view v-else-if="!product.CheckStatus" style="color: #ff4b40">未核销</view>
      </view>
    </view>
    <view class="product-card">
      <view class="image-wrap">
        <v-img class="product-card__image flex" :src="product.PicUrl" mode="aspectFit" :size="170" />
        <view v-if="product.IsFreeGift === 1 && isShowGift" class="gift-icon">赠品</view>
        <view v-else-if="product.IsGroupBooking" class="gift-icon">拼团</view>
        <view v-else-if="product.IsSeckill" class="gift-icon">秒杀</view>
        <view v-else-if="product.IsMemberPrice" class="gift-icon">会员专享价</view>
      </view>
      <view v-if="isPositionChange" class="product-card__info">
        <view class="product-card__name ut-s2">{{ product.Name }}</view>
        <!-- 多规格属性值 -->
        <view v-if="product.Types" class="product-more">{{ product.Types }}</view>
        <view :class="['product-card__info__bottom', !isShowCardPrice ? 'flex-end' : '']">
          <view class="product-card__count">x{{ product.BuyCount }}</view>
          <view v-if="isShowCardPrice && isShowPrice" class="product-card__price">￥{{ product.ShowPrice }}</view>
          <view v-else-if="isShowCardPrice && isActualAmount" class="product-card__price">
            ￥{{ product.ActualAmount }}
          </view>
          <view v-else-if="isShowCardPrice" class="product-card__price">￥{{ product.ActualPrice }}</view>
        </view>
      </view>
      <view v-else class="product-card__info">
        <view class="product-card__name ut-s2">{{ product.Name }}</view>
        <!-- 多规格属性值 -->
        <view v-if="product.Types" class="product-more">{{ product.Types }}</view>
        <view :class="['product-card__info__bottom', !isShowCardPrice ? 'flex-end' : '']">
          <view v-if="isShowCardPrice && isShowPrice" class="product-card__price">￥{{ product.ShowPrice }}</view>
          <view v-else-if="isShowCardPrice && isActualAmount" class="product-card__price">
            ￥{{ product.ActualAmount }}
          </view>
          <view v-else-if="isShowCardPrice" class="product-card__price">￥{{ product.ActualPrice }}</view>
          <view class="product-card__count">x{{ product.BuyCount }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { hex2rgb } from 'packages/utils'
export default {
  props: {
    product: {
      type: Object,
      default() {
        return {
          PicUrl: '',
          Name: '',
          ActualPrice: 0,
          BuyCount: 0,
          CheckCode: '',
          IsFreeGift: 0,
          IsGroupBooking: false,
          IsSeckill: false,
          IsMemberPrice: false
        }
      }
    },
    isShowGift: {
      type: Boolean,
      default: true
    },
    isShowCheckStatusText: {
      type: Boolean,
      default: false
    },
    isGoodsCheckOrder: {
      type: Number,
      default: 1
    },
    isCheckStatus: {
      type: Boolean,
      default: false
    },
    isShowCardPrice: {
      type: Boolean,
      default: true
    },
    isShowPrice: {
      type: Boolean,
      default: false
    },
    isActualAmount: {
      type: Boolean,
      default: false
    },
    isPositionChange: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    calcThemeVars() {
      let style = [this.themeVars]
      style.push(`--theme-color-opacity7: ${hex2rgb(this.themeInfo.color, 0.7)}`)
      return style.join(';')
    }
  }
}
</script>

<style lang="scss" scoped>
.product-more {
  flex: 1;
  font-size: 28rpx;
  color: #999999;
}
.image-wrap {
  position: relative;
}
.gift-icon {
  position: absolute;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  left: 0;
  right: 0;
  bottom: 0;
  color: #fff;
  font-size: 22rpx;
  background-color: var(--theme-color-opacity7);
}
.iconfont {
  font-size: 32rpx;
}
.iconziyuan6 {
  color: #ff4847;
}
.iconxuanzhongyuandian {
  color: #999;
}
.product-top {
  padding: 30rpx 20rpx 0rpx;
  color: #999;
  background-color: #fff;
  font-size: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .left {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .checkboxWrapper {
      width: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20rpx 0;
      margin-right: 20rpx;
    }
  }
}
.wrap {
  background-color: #fff;
}
.product-card {
  display: flex;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  background-color: #fff;
  .product-card__image {
    width: 170rpx;
    height: 170rpx;
  }
  .product-card__info {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 20rpx;
    box-sizing: border-box;
    background-color: #fff;
    .product-card__name {
      flex: 1;
      line-height: 30rpx;
      font-size: 30rpx;
      color: #000;
    }
    .product-card__info__bottom {
      display: flex;
      justify-content: space-between;
      .product-card__price {
        font-size: 26rpx;
        color: var(--theme-color, $uni-color-primary);
      }
      .product-card__count {
        font-size: 24rpx;
        color: #333;
      }
    }
  }
}
.product-card + .product-card {
  margin-top: 10rpx;
}
.flex-end {
  justify-content: flex-end !important;
}
</style>
