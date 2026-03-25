<template>
  <view class="product flex flex-middle" :style="themeVars">
    <image class="product-size" :src="item.picurl || defaultProductPic" />
    <view class="product-content flex flex-1 flex-column flex-between ml-20">
      <view class="flex flex-between">
        <view class="flex-1">
          <view class="fs-26 fw-bold ellipsis-1">{{ item.productname }}</view>
          <view class="fs-22 c-9 mt-5">编码：{{ item.productno }}</view>
        </view>
        <view class="fs-24 c-3 tx-r" style="width: 80rpx">×{{ item.storagecount }}</view>
      </view>
      <view class="flex flex-between">
        <view v-if="item.storagecount - item.insigncount > 0 && status !== 1" class="primary-color fs-24 fw-bold">
          待签收
          <text class="ml-20">{{ item.storagecount - item.insigncount }}</text>
        </view>
        <view class="flex-1 tx-r">
          <text class="fs-22 c-9 fw-bold" @tap="handleClick(item)">物流明细</text>
          <text class="icon iconfont icon-more c-0 fw-normal" style="font-size: 18rpx"></text>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import { staticURL } from '@/config'
export default {
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    storageNo: {
      type: String,
      default: ''
    },
    status: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      defaultProductPic: staticURL() + 'common/default-pic.png'
    }
  },
  methods: {
    handleClick(item) {
      uni.navigateTo({
        url: `/product/sign/code-list?storageNo=${this.storageNo}&productId=${item.productid}&productFormatId=${item.productformatid}&picUrl=${item.picurl}&productName=${item.productname}&storageCount=${item.storagecount}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.product {
  margin-bottom: 20rpx;
  padding-top: 6rpx;
  &-size {
    width: 120rpx;
    height: 120rpx;
  }
  &-content {
    height: 120rpx;
  }
}
</style>
