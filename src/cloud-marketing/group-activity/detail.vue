<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="free-detail">
      <view class="info">
        <view class="key-item">
          <view class="key">活动ID:</view>
          <view class="key-val">{{ actData.Id }}</view>
        </view>
        <view class="key-item">
          <view class="key">活动名称:</view>
          <view class="key-val">
            {{ actData.Name }}
          </view>
        </view>
        <view class="key-item">
          <view class="key">开始时间:</view>
          <view class="key-val color-red">
            <view>{{ actData.StartTime }}</view>
          </view>
        </view>
        <view class="key-item">
          <view class="key">结束时间:</view>
          <view class="key-val color-red">
            <view>{{ actData.EndTime }}</view>
          </view>
        </view>
        <view class="key-item">
          <view class="key">活动持续时间:</view>
          <view class="key-val color-red">
            <view>{{ actData.PersistTime }}</view>
          </view>
        </view>
        <view class="key-item">
          <view class="key">活动状态:</view>
          <view class="key-val">{{ actData.Status }}</view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">活动商品</view>
        <view class="info-goods-type">拼团类型：{{ actData.SpellType == 1 ? '普通' : '阶梯' }}拼团</view>
        <view v-if="actData.SpellType == 1" class="info-goods-type">参团人数：{{ actData.FirstStair }}人</view>
        <view v-if="actData.SpellType == 2" class="info-goods-type">
          参团人数：第一阶梯：{{ actData.FirstStair }}人
        </view>
        <view v-if="actData.SpellType == 2 && actData.SecondStair" class="info-goods-type">
          <text class="vh">参团人数：</text>
          第二阶梯：{{ actData.SecondStair }}人
        </view>
        <view v-if="actData.SpellType == 2 && actData.ThirdStair" class="info-goods-type">
          <text class="vh">参团人数：</text>
          第三阶梯：{{ actData.ThirdStair }}人
        </view>
        <view v-for="(item, index) in actData.ActivityGoods" :key="index" class="info-goods-box">
          <view class="info-goods-box-left">
            <image :src="item.PicUrl" @error="headPathError" />
          </view>
          <view class="info-goods-box-right">
            <view class="info-title">
              <view class="info-label">商品名称</view>
              {{ item.GoodsName }}
            </view>
            <view class="info-title">
              <view class="info-label">商品单价</view>
              ￥{{ item.Price }}
            </view>
            <view v-if="actData.SpellType == 1" class="info-title">
              <view class="info-label">拼团价</view>
              ￥{{ item.FristStairPrice }}
            </view>
            <view v-if="actData.SpellType == 2 && item.FristStairPrice" class="info-title">
              <view class="info-label">第一阶梯拼团价</view>
              ￥{{ item.FristStairPrice }}
            </view>
            <view v-if="actData.SpellType == 2 && item.SecondStairPrice" class="info-title">
              <view class="info-label">第二阶梯拼团价</view>
              ￥{{ item.SecondStairPrice }}
            </view>
            <view v-if="actData.SpellType == 2 && item.ThirdStairPrice" class="info-title">
              <view class="info-label">第三阶梯拼团价</view>
              ￥{{ item.ThirdStairPrice }}
            </view>
          </view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">优惠规则</view>
        <view class="info-rule-box">
          <view v-if="actData.IsUseCoupon" class="info-rule-row">
            <text class="info-lable">下单可用优惠:</text>
            <text>可用优惠卷</text>
          </view>
          <view class="info-rule-row">
            <text class="info-lable">限购规则:</text>
            <view v-if="actData.IsLimit">
              <text>活动总限购：{{ actData.TotalLimit }}</text>
              <text>每单限购：{{ actData.OrderLimit }}</text>
            </view>
            <text v-else>不限制</text>
          </view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">高级限制</view>
        <view class="info-rule-box">
          <view class="info-rule-row">
            <text class="info-lable">凑团:</text>
            <text v-if="actData.IsSpell">开启</text>
            <text v-else>关闭</text>
          </view>
          <view class="info-rule-row">
            <text class="info-lable">虚拟成团:</text>
            <text v-if="actData.IsSimulate">开启</text>
            <text v-else>关闭</text>
          </view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">活动统计</view>
        <view class="info-rule-box">
          <view class="info-rule-row">
            <text class="info-lable">累计购买人数（人）：</text>
            <text>{{ actData.TotalPeraonCount }}</text>
          </view>
          <view class="info-rule-row">
            <text class="info-lable">累计订单数量（个）：</text>
            <text>{{ actData.TotalOrderCount }}</text>
          </view>
        </view>
      </view>
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
    this.ActivityListDetail(data)
  },

  methods: {
    // 获取活动详情
    ActivityListDetail(data) {
      let form = {
        id: data.Id
      }
      apiCloud({
        url: '/api/v1/SpellGroup/GetActivityDetail',
        method: 'get',
        data: JSON.stringify(form)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.actData = res.return_data
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
  background-color: #f4f4f4;
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
          .info-qi {
            font-size: 22rpx;
            color: #999999;
            font-weight: 500;
          }
          .info-amount {
            font-size: 24rpx;
          }
        }
        .info-title {
          display: flex;
          width: 550rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-size: 26rpx;
          min-height: 45rpx;
        }
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
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
  .detail-button {
    background-color: var(--theme-color, $uni-color-primary);
    width: 90%;
    color: #fff;
    margin: 0 auto;
    position: fixed;
    bottom: 40px;
    left: 0;
    right: 0;
    border-radius: 40rpx;
    text-align: center;
    height: 80rpx;
    line-height: 80rpx;
  }
  .hot-row {
    display: flex;
    align-items: center;
    .product-hot-tag {
      width: 102rpx;
      .product-hot-tag-name {
        font-size: 22rpx;
        flex-wrap: 500;
        background: rgba(255, 76, 64, 0.1);
        border-radius: 3px;
        color: var(--theme-color, $uni-color-primary);
        line-height: 40rpx;
        padding: 0 6rpx;
        margin-right: 10rpx;
        text-align: center;
      }
      .w50 {
        width: 50rpx;
      }
    }
    .w120 {
      width: 120rpx;
    }
    .f-26 {
      font-size: 26rpx;
      line-height: 36rpx;
      font-weight: 500;
    }
    .hot-tips {
      line-height: 30rpx;
      font-size: 22rpx;
      font-weight: 500;
      color: #999999;
    }
    .product-hot-name {
      margin-left: 10rpx;
      width: 550rpx; //自己调整
      /* 不换行 */
      white-space: nowrap;
      /* 不换行 */
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 26rpx;
      line-height: 40rpx;
      word-break: break-all;
    }
    .product-quantity {
      color: #333333;
      font-size: 24rpx;
      font-family: PingFang SC;
      font-weight: 500;
      line-height: 40rpx;
    }
  }
}
</style>
