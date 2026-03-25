<template>
  <view :style="themeVars">
    <view v-if="type === 'clound'">
      <view v-for="(item, index) in list" :key="index">
        <view v-if="index === 0" class="shop-text">购物券</view>
        <view v-if="index === 1" class="gift-text">赠品</view>
        <view class="item-box">
          <view class="left">
            <image
              :src="index === 0 ? icons.shopping : icons.gift"
              mode="scaleToFill"
              class="soldOut"
              lazy-load="false"
            />
          </view>
          <view class="right">
            <view class="right-row">
              <view class="right-row-left">已核销数量：</view>
              <view class="right-row-right">{{ item.TotalCount }}</view>
            </view>
            <view class="right-row">
              <view class="right-row-left">已报销数量：</view>
              <view class="right-row-right">{{ item.CompletedCount }}</view>
            </view>
            <view class="right-row">
              <view class="right-row-left">未报销数量：</view>
              <view class="right-row-right">{{ item.EnableCount }}</view>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-else>
      <view class="gift-text">{{ type === 'pickup' ? '提领券' : '实物' }}</view>
      <view class="item-box flex-middle item-box-last">
        <view class="left">
          <image
            :src="type === 'pickup' ? icons.pickup : icons.pruduct"
            mode="scaleToFill"
            class="soldOut"
            lazy-load="false"
          />
        </view>

        <view class="right">
          <view class="right-row">
            <view class="right-row-left">已核销数量：</view>
            <view class="right-row-right">{{ info.writeoffcount }}</view>
          </view>
          <view class="right-row">
            <view class="right-row-left">已报销数量：</view>
            <view class="right-row-right">{{ info.adexpensecount }}</view>
          </view>
          <view class="right-row">
            <view class="right-row-left">未报销数量：</view>
            <view class="right-row-right">{{ info.unexpensecount }}</view>
          </view>
        </view>
        <view v-if="type === 'pickup'" class="edit-color" @tap="$navPage('/pages/submit-account/await-expense-list')">
          待报销明细
          <text class="icon iconfont icon-more fs-20 ml-10"></text>
        </view>
      </view>
      <view class="info-tip mb-20">
        <warning-tip>
          {{
            type === 'pickup'
              ? '由于系统功能升级，将原有未报销的提领券转移为返货券，后续报销将通过返货券进行报销，'
              : '由于系统功能升级，将原有未报销的实物转移为返货券，后续报销将通过返货券进行报销，'
          }}
        </warning-tip>
      </view>
    </view>
  </view>
</template>
<script>
/* 未 报销的 */
import { staticURL } from '@/config'
import WarningTip from './warning-tip.vue'
export default {
  components: {
    WarningTip
  },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: 'clound' //购物券、赠品：clound    提领券：pickup   实物：product
    },
    info: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      icons: {
        shopping: staticURL() + 'shop/shoppig.png',
        gift: staticURL() + 'shop/gift.png',
        pruduct: staticURL() + 'shop/pruduct.png',
        pickup: staticURL() + 'shop/pickup-ticket.png'
      }
    }
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.item-box {
  display: flex;
  padding: 20rpx;
  border-bottom: 20rpx solid #f9f9f9;
  background-color: #fff;
  border-radius: 10rpx;

  .left {
    width: 120rpx;
    .soldOut {
      width: 100%;
      height: 120rpx;
    }
  }

  .right {
    flex: 1;
    margin-left: 20rpx;

    .right-name {
      color: #000;
      font-size: 26rpx;
    }

    .right-row {
      font-size: 26rpx;
      display: flex;
      color: #b5b5b5;
      margin: 8rpx 0;

      .right-row-left {
        width: 160rpx;
      }

      .right-row-right {
        color: var(--theme-color, $uni-color-primary);
      }
    }

    .right-operation {
      display: flex;
      font-size: 26rpx;
      justify-content: flex-end;

      .cancel,
      .detail {
        background-color: #fdc522;
        padding: 10rpx 15rpx;
        border-radius: 20rpx;
        color: #fff;
        font-size: 22rpx;
      }

      .detail {
        margin-left: 20rpx;
      }
    }
  }
}
.item-box-last {
  border-bottom: 0;
}
.info-tip {
  padding: 20rpx 20rpx 10rpx 20rpx;
  background-color: #fff;
  width: 100%;
}
.shop-text {
  font-size: 28rpx;
  color: #000;
  font-weight: bold;
  padding: 20rpx 20rpx 10rpx;
  background-color: #fff;
}
.gift-text {
  font-size: 28rpx;
  color: #000;
  font-weight: bold;
  span {
    color: #9a9a9a;
  }
  padding: 20rpx 20rpx 10rpx;
  background-color: #fff;
}
</style>
