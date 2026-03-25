<template>
  <view class="container">
    <view class="distribution">
      <view class="weui-cells weui-cells_after-title">
        <view class="list">
          <view v-if="DeliveryDetail.IsUseDefault" class="use-default">
            <view class="title">默认运费(非指定地区的默认运费)</view>
            <view class="free-list">
              <view class="free-item">
                <view class="free-title">首重(kg)</view>
                <view class="free-content">{{ DeliveryDetail.FirstWeight }}</view>
              </view>
              <view class="free-item">
                <view class="free-title">首运费(元)</view>
                <view class="free-content">￥ {{ DeliveryDetail.FirstFreight | filterRmb }}</view>
              </view>
              <view class="free-item">
                <view class="free-title">续重(kg)</view>
                <view class="free-content">{{ DeliveryDetail.ContinuedWeight }}</view>
              </view>
              <view class="free-item">
                <view class="free-title">运费(元)</view>
                <view class="free-content">￥ {{ DeliveryDetail.ContinuedFreight | filterRmb }}</view>
              </view>
            </view>
          </view>
          <view v-for="(item, index) in DeliveryDetail.DeliveryRegionFees" :key="index" class="area-list">
            <view class="area-title">可配送区域</view>
            <view class="area-content">
              {{ item.DeliveryRegionsStr }}
            </view>
            <view class="free-list">
              <view class="free-item">
                <view class="free-title">首重(kg)</view>
                <view class="free-content">{{ item.FirstWeight }}</view>
              </view>
              <view class="free-item">
                <view class="free-title">首运费(元)</view>
                <view class="free-content">￥ {{ item.FirstFreight | filterRmb }}</view>
              </view>
              <view class="free-item">
                <view class="free-title">续重(kg)</view>
                <view class="free-content">{{ item.ContinuedWeight }}</view>
              </view>
              <view class="free-item">
                <view class="free-title">运费(元)</view>
                <view class="free-content">￥ {{ item.ContinuedFreight | filterRmb }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import { filterRmb } from '@/filters'
export default {
  filters: { filterRmb },
  data() {
    return {
      ID: 0,
      DeliveryDetail: {}
    }
  },

  onLoad(options) {
    this.ID = options.ID || 0
    this.GetDeliverySetDetail()
  },

  methods: {
    GetDeliverySetDetail() {
      apiCloud({
        url: '/api/v1/BaseSet/GetDeliverySetDetail',
        method: 'post',
        data: JSON.stringify({ ID: Number(this.ID) })
      }).then(res => {
        if (this.$ck(res)) {
          this.DeliveryDetail = res.return_data || {}
          uni.setNavigationBarTitle({
            title: this.DeliveryDetail.Name
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  position: relative;
  background-color: #f7f7f7;
  .distribution {
    .list {
      padding: 20rpx 20rpx;
      .item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx;
        background-color: #fff;
        margin-top: 20rpx;
      }
      .use-default {
        padding: 20rpx;
        background-color: #fff;
        margin-top: 20rpx;
        .title {
          font-size: 30rpx;
          font-weight: bold;
        }
      }
      .free-list {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20rpx;
        .free-item {
          text-align: center;
          .free-title {
            font-size: 30rpx;
            font-weight: bold;
          }
          .free-content {
            margin-top: 10rpx;
          }
        }
      }
      .area-list {
        padding: 20rpx;
        background-color: #fff;
        margin-top: 20rpx;
        .area-title {
          font-size: 30rpx;
          font-weight: 600;
        }
        .area-content {
          padding: 20rpx 0;
          line-height: 1.5;
          border-bottom: 1px solid #eee;
        }
      }
    }
  }
}
</style>
