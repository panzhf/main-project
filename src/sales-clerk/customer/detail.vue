<template>
  <view v-if="!loading" class="customerDetails" :style="themeVars">
    <view class="bg"></view>
    <view class="main">
      <view class="user">
        <view class="image">
          <v-img :src="info.HeadPath || defaultPhoto" :size="130" :is-circle="true" class="img1 flex" />
          <view v-if="info.Type === '分销员' || info.Type === '分销员和客户'" class="distribution">分销员</view>
        </view>
        <view class="right">
          <view v-if="info.GradeInfo.gradenumber != -1" class="member">
            <view :class="['iconfont', 'grade', 'icon-v-' + info.GradeInfo.gradenumber]"></view>
            {{ info.GradeInfo.gradename }}
          </view>
          <view class="name mt-20">{{ info.NickName || '未知' }}</view>
          <view v-if="info.Region && ![',', ',,,'].includes(info.Region)" class="address">{{ info.Region }}</view>
        </view>

        <view
          class="iconfont icon-explain fw-normal tx-r flex flex-column flex-middle fs-28 primary-color ml-20"
          @tap="showExplain = true"
        ></view>
      </view>

      <view class="info">
        <view class="head fs-30 fw-bold c-0">基础资料</view>
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
          <view class="receive">{{ info.AddTime || '---' }}</view>
        </view>
        <view class="lump">
          <view class="laber">入会时间：</view>
          <view class="receive">{{ info.ActivateCardTime || '---' }}</view>
        </view>
      </view>

      <view class="info order">
        <view class="head fs-30 fw-bold c-0">资产信息</view>
        <view class="lump">
          <view class="laber">可用积分</view>
          <view class="receive">{{ assets.point }}</view>
        </view>
        <view class="lump">
          <view class="laber">可用卡券</view>
          <view class="receive">
            {{ assets.usecouponscount + assets.exchangevouchercount + assets.deliverycardcount }}
          </view>
        </view>
      </view>

      <view class="info order">
        <view class="head fs-30 fw-bold c-0">行为交易</view>
        <view class="lump">
          <view class="laber">订单数量</view>
          <view class="receive">{{ info.OrderCount }}</view>
        </view>
        <view class="lump">
          <view class="laber">已核销订单</view>
          <view class="receive">{{ info.CancelOrderCount }}</view>
        </view>
        <view class="lump">
          <view class="laber">累计扫码次数</view>
          <view class="receive">{{ scanCount.total }}</view>
        </view>
        <view class="lump">
          <view class="laber">累计扫码个数</view>
          <view class="receive">{{ scanCount.count }}</view>
        </view>
      </view>
    </view>
    <u-popup v-model="showExplain" mode="center" width="600rpx" height="auto" border-radius="20" closeable="true">
      <Tips :type="5"></Tips>
    </u-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import Tips from '@/components/tips/asset-tips.vue'
import { staticURL } from '@/config'
export default {
  components: {
    Tips
  },
  data() {
    return {
      img: '',
      info: {},
      assets: {},
      scanCount: {
        total: 0, // 扫码次数
        count: 0 // 扫码个数
      },
      loading: true,
      showExplain: false,
      defaultPhoto: staticURL() + 'common/photo.png?v1'
    }
  },
  async onLoad(options) {
    this.loading = true
    const id = options.id
    try {
      const [infoRes, assetsRes, scanCountRes] = await Promise.all([
        this.GetMiniUserInfo(id),
        this.GetMiniUserAssets(id),
        this.GetMiniUserScanCount(id)
      ])
      if (infoRes) this.info = infoRes
      if (assetsRes) this.assets = assetsRes
      if (scanCountRes) {
        this.scanCount = {
          total: scanCountRes.totalscancodecnt || 0,
          count: scanCountRes.totalqr_cnt || 0
        }
      }
    } finally {
      this.loading = false
    }
  },
  methods: {
    async GetMiniUserInfo(id) {
      let res = await apiCloud({
        url: '/api/v1/MiniUser/GetMiniUserInfo',
        method: 'post',
        data: JSON.stringify({ OpenId: id })
      })
      if (this.$ck(res)) {
        return res.return_data
      }
      return null
    },
    // 获取用户资产信息
    async GetMiniUserAssets(id) {
      let res = await apiCloud({
        url: '/api/v1/MiniUser/AssetInfo',
        method: 'get',
        data: JSON.stringify({ OpenId: id })
      })
      if (this.$ck(res)) {
        return this.$toLowerKey(res.return_data, true)
      }
      return null
    },
    // 获取客户扫码统计
    async GetMiniUserScanCount(id) {
      let res = await apiCloud({
        url: '/api/v1/MiniUser/ScanStatistics',
        method: 'get',
        data: JSON.stringify({ OpenId: id })
      })
      if (this.$ck(res)) {
        return this.$toLowerKey(res.return_data, true)
      }
      return null
    },
    phoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    copy(data) {
      uni.setClipboardData({
        data: data,
        success: res => {
          uni.getClipboardData({
            success(res) {
              // //console.log('复制内容：\n', res.data)
            }
          })
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
      .right {
        margin-left: 30rpx;
      }
      .icon-explain {
        position: absolute;
        right: 48rpx;
        top: 180rpx;
        width: 50rpx;
        height: 50rpx;
        font-size: 36rpx;
        padding: 40rpx;
        margin: -40rpx;
        justify-content: center;
      }
      .image {
        position: relative;
        padding: 10rpx;
        border-radius: 50%;
        width: 130rpx;
        height: 130rpx;
        image,
        .img1 {
          width: 130rpx;
          height: 130rpx;
          border-radius: 50%;
        }
        .distribution {
          position: absolute;
          bottom: -10rpx;
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
        margin: 10 0 0 19rpx;
      }
      .address {
        flex: 1;
        font-size: 24rpx;
        font-weight: 500;
        color: #9a9a9a;
      }
      .name,
      .address {
        font-family: PingFang SC;
        line-height: 40rpx;
      }
    }
    .info {
      margin-top: 30rpx;
      padding: 30rpx;
      background: #fff;
      border-radius: 20rpx;
      .head {
        position: relative;
        &::after {
          content: '';
          position: absolute;
          // background: #ff7640;
          background: var(--theme-color, $uni-color-primary);
          width: 60rpx;
          height: 8rpx;
          opacity: 0.5;
          border-radius: 4rpx;
          left: 0rpx;
          top: 30rpx;
        }
      }

      .lump {
        display: flex;
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #010101;
        line-height: 48rpx;
        margin-top: 20rpx;
        .receive {
          margin-right: 19rpx;
        }
        .customerDetails-btn {
          width: 80rpx;
          height: 42rpx;
          line-height: 38rpx;
          text-align: center;
          margin-right: 10rpx;
          color: #2878ff;
          background: #ffffff;
          border: 1px solid #2878ff;
          border-radius: 21px;
          font-weight: 400;
        }
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
    margin: 20rpx 0 0 0rpx;
    color: #000;
    border-radius: 20rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 20rpx;
    font-size: 24rpx;
    display: inline-flex;

    .grade {
      display: flex;
      align-items: center;
      justify-content: center;
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
