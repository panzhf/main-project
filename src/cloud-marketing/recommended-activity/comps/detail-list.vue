<template>
  <view class="listWhole" :style="themeVars">
    <view v-for="(item2, index2) in list" :key="index2">
      <view class="list" :style="{ 'border-bottom': index2 === list.length - 1 ? '1px solid #eee' : 'none' }">
        <view :class="['picture', awardType == 1 ? '' : 'is-circle']">
          <image :src="awardType == 1 ? item2.GoodsPic : item2.HeadPath" />
        </view>
        <view class="main">
          <view v-if="awardType == 1">
            <view class="common">
              <view class="commonVal good-name">{{ item2.GoodsName }}</view>
            </view>
            <view class="common">
              <view class="commonVal">赠品ID：</view>
              <view>{{ item2.GoodsId ? item2.GoodsId : '---' }}</view>
            </view>
            <view class="common">
              <view class="commonVal">数量：</view>
              <view>{{ item2.Number }}</view>
            </view>
          </view>
          <view class="common">
            <view class="commonVal">用户ID：</view>
            <view>{{ item2.CustomerId ? item2.CustomerId : '---' }}</view>
          </view>
          <view v-if="awardType == 2">
            <view class="common">
              <view class="commonVal">会员等级：</view>
              <view v-if="item2.GradeNumber > -1" class="member">
                <view :class="['iconfont', 'grade', 'iconv-' + item2.GradeNumber]"></view>
                {{ item2.GradeName }}
              </view>
              <view v-else>-</view>
            </view>
            <view class="common">
              <view class="commonVal">积分：</view>
              <view>{{ item2.Points }}</view>
            </view>
          </view>
          <view class="common">
            <view class="commonVal">状态：</view>
            <view>{{ item2.Status === 0 ? '已完成' : '未完成' }}</view>
          </view>
          <view class="common">
            <view class="commonVal">领取时间：</view>
            <view>{{ item2.CheckTime }}</view>
          </view>
        </view>
      </view>
      <view class="order-wrap">
        <view class="order-detail" @tap="handleDetail(item2.OutTradeNo)">订单详情</view>
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
    },
    awardType: {
      type: Number,
      default: 1 // 1-赠品 2-积分
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
  .list {
    position: relative;
    display: flex;
    padding: 30rpx 20rpx;
    background: #fff;
  }
  .picture {
    position: relative;
    margin-right: 21rpx;
    image {
      width: 120rpx;
      height: 120rpx;
    }
    .distribution {
      position: absolute;
      bottom: 30rpx;
      width: 80rpx;
      height: 30rpx;
      text-align: center;
      color: #fff;
      background: #ff4c40;
      border-radius: 15rpx;
      font-size: 22rpx;
      font-family: PingFang SC;
      font-weight: 500;
    }
  }

  .is-circle {
    image {
      width: 82rpx;
      height: 82rpx;
      border-radius: 50%;
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
        width: 150rpx;
        margin-right: 41rpx;
        color: #666;
      }
      .good-name {
        width: 540rpx !important;
        font-weight: bold;
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
