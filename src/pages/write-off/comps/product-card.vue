<template>
  <view class="wrap" @tap="handleCheck(index)">
    <view v-if="IsGoodsCheckOrder" :class="['product-top', product.CheckStatus || !isShowCheck ? 'padding-set' : '']">
      <view class="left">
        <view v-if="isShowCheck && !product.CheckStatus" class="checkboxWrapper">
          <text :class="['iconfont', product.checked ? 'icon-checked' : 'icon-unchecked']"></text>
        </view>
        {{ product.IsFreeGift ? '赠品核销码：' : '商品核销码：' }}
        <text>{{ product.CheckCode }}</text>
      </view>
      <view v-if="product.CheckStatus" class="right">已核销</view>
      <view v-else class="right" style="color: #ff4b40">未核销</view>
    </view>
    <view class="product-card" :style="{ borderBottom: index === length - 1 ? '0 solid #eee' : '1px solid #eee' }">
      <view class="image-wrap">
        <image class="product-card__image" :src="product.PicUrl || product.Url" mode="aspectFit" />
        <view v-if="product.IsFreeGift === 1 && isShowGift" class="gift-icon">赠品</view>
      </view>
      <view class="product-card__info">
        <view class="product-card__name ut-s2">{{ product.Name || product.GoodsName }}</view>
        <view class="product-card__info__bottom">
          <view class="product-card__price">
            ￥{{ product.ActualPrice >= 0 ? product.ActualPrice : product.Price }}
          </view>
          <view class="product-card__count">x{{ product.BuyCount >= 0 ? product.BuyCount : product.Number }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    product: {
      type: Object,
      default() {
        return {}
      }
    },
    index: {
      type: Number,
      default: -1
    },
    length: {
      type: Number,
      default: 0
    },
    isShowCheck: {
      type: Boolean,
      default: false
    },
    isShowGift: {
      type: Boolean,
      default: true
    },
    // eslint-disable-next-line vue/prop-name-casing
    CheckStatus: {
      type: Number,
      default: 0
    },
    // eslint-disable-next-line vue/prop-name-casing
    IsGoodsCheckOrder: {
      type: Number,
      default: 1
    }
  },
  methods: {
    handleCheck(index) {
      this.$emit('check', index)
    }
  }
}
</script>

<style lang="scss" scoped>
.image-wrap {
  position: relative;
}
.gift-icon {
  position: absolute;
  z-index: 999;
  height: 36rpx;
  line-height: 36rpx;
  text-align: center;
  left: 0;
  right: 0;
  bottom: 0;
  color: #fff;
  font-size: 22rpx;
  background-color: rgba(255, 75, 64, 0.7);
}
.iconfont {
  font-size: 32rpx;
}
.icon-checked {
  color: #ff4847;
}
.product-top {
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
      height: 28rpx;
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
        color: #ff5e33;
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
.padding-set {
  padding: 30rpx 20rpx 0rpx;
}
</style>
