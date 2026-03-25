<template>
  <view v-if="isLoading" class="customerDetails" :style="themeVars">
    <view class="bg"></view>
    <view class="main">
      <view class="user">
        <view class="image">
          <image :src="info.HeadPath" />
          <view v-if="info.Type === '分销员' || info.Type === '分销员和客户'" class="distribution">分销员</view>
        </view>
        <view class="name">{{ info.NickName }}</view>
        <view class="address">{{ info.Region }}</view>
        <view v-if="info.GradeInfo.gradenumber != -1" class="member">
          <view :class="['iconfont', 'grade', 'icon-v-' + info.GradeInfo.gradenumber]"></view>
          {{ info.GradeInfo.gradename }}
        </view>
      </view>

      <view class="info">
        <view class="lump">
          <view class="laber">性别：</view>
          <view class="receive">{{ info.Sex == 1 ? '男' : info.Sex == 2 ? '女' : '未知' }}</view>
        </view>
        <view class="lump">
          <view class="laber">手机号：</view>
          <view class="receive">{{ info.Mobile ? info.Mobile : '---' }}</view>
          <view v-if="info.Mobile" class="customerDetails-btn" @tap="copy(info.Mobile)">复制</view>
          <view v-if="info.Mobile" class="customerDetails-btn" @tap="phoneCall(info.Mobile)">拨打</view>
        </view>
        <view class="lump">
          <view class="laber">首次进店：</view>
          <view class="receive">{{ info.AddTime }}</view>
        </view>
      </view>
      <view class="info order">
        <view class="lump">
          <view class="laber">可用优惠券</view>
          <view class="receive">{{ info.UseCouponsCount }}</view>
        </view>
        <view class="lump">
          <view class="laber">订单数量</view>
          <view class="receive">{{ info.OrderCount }}</view>
        </view>
        <view class="lump">
          <view class="laber">已核销订单</view>
          <view class="receive">{{ info.CancelOrderCount }}</view>
        </view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      info: {},
      isLoading: false
    }
  },
  onLoad(options) {
    this.GetMiniUserInfo(options.Id)
  },
  methods: {
    phoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    copy(data) {
      uni.setClipboardData({
        data: data
      })
    },
    GetMiniUserInfo(id) {
      apiCloud({
        url: '/api/v1/MiniUser/GetMiniUserInfo',
        method: 'post',
        data: JSON.stringify({ OpenId: id })
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.info = res.return_data
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.customerDetails {
  height: 100vh;
  background: #f5f5f5;
  .bg {
    width: 100%;
    height: 140rpx;
    background: #ffb634;
  }
  .main {
    margin: -70rpx 30rpx 0;
    .user {
      display: flex;
      align-items: flex-end;
      position: relative;

      .image {
        position: relative;
        padding: 10rpx;
        background: #f5f5f5;
        border-radius: 50%;
        image {
          width: 130rpx;
          height: 130rpx;
          border-radius: 50%;
        }
        .distribution {
          position: absolute;
          bottom: 10rpx;
          left: 32rpx;
          right: 0;
          width: 80rpx;
          height: 30rpx;
          color: #fff;
          background: #ff4c40;
          border-radius: 15px;
          font-size: 22rpx;
          text-align: center;
        }
      }
      .name {
        font-size: 30rpx;
        font-weight: bold;
        color: #000000;
        margin: 0 0 0 19rpx;
      }
      .address {
        flex: 1;
        margin-left: 22rpx;
        font-size: 24rpx;
        font-weight: 500;
        color: #9a9a9a;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
        word-break: break-all;
        overflow: hidden;
      }
      .name,
      .address {
        margin-bottom: 25rpx;
        font-family: PingFang SC;
        line-height: 40rpx;
      }
    }
    .info {
      margin-top: 30rpx;
      padding: 30rpx;
      background: #fff;
      border-radius: 20rpx;

      .lump {
        display: flex;
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #010101;
        line-height: 48rpx;

        .receive {
          margin-right: 19rpx;
        }
        .customerDetails-btn {
          width: 80rpx;
          height: 42rpx;
          line-height: 38rpx;
          text-align: center;
          margin-right: 10rpx;
          color: var(--theme-color, $uni-color-primary);
          background: #ffffff;
          border: 1px solid var(--theme-color, $uni-color-primary);
          border-radius: 21px;
        }
      }
      .lump:nth-child(2) {
        margin: 23rpx 0 21rpx;
      }
    }
    .order {
      .lump {
        justify-content: space-between;
      }
      .receive {
        display: flex;
        .iconjiantou2 {
          display: flex;
          align-items: center;
          line-height: 10rpx;
          margin-left: 19rpx;
          font-size: 10px;
        }
      }
    }
  }
  .member {
    padding: 3rpx 5rpx;
    margin-left: 10rpx;
    position: absolute;
    top: 20rpx;
    left: 150rpx;
    min-width: 120rpx;
    color: #000;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 20rpx;
    font-size: 24rpx;
    padding-left: 48rpx;

    .grade {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      left: 11rpx;
      width: 34rpx;
      height: 34rpx;
      font-size: 18rpx;
      color: #fff;
      background: rgb(246, 198, 102);
      border-radius: 100%;
    }
  }
}
</style>
