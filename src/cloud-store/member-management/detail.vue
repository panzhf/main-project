<template>
  <view :style="themeVars">
    <view v-if="isLoading" class="customerDetails">
      <view class="bg"></view>
      <view class="main">
        <view class="user">
          <view class="image">
            <image :src="info.CustomerHeadPath || defaultAvatar" />
            <view v-if="info.OpenId && info.AuditStatus === 1" class="distribution">分销员</view>
          </view>
          <view class="user-info">
            <view class="name-wrap">
              <view class="name">{{ info.NickName || '---' }}</view>
              <view class="address">{{ info.Address }}</view>
            </view>
            <view class="id-wrap">
              <view class="id-name">ID：{{ info.NickId }}</view>
            </view>
          </view>
          <view v-if="info.GradeNumber != -1 && info.GradeName" class="member">
            <view :class="['iconfont', 'grade', 'iconv-' + info.GradeNumber]"></view>
            {{ info.GradeName }}
          </view>
        </view>
        <view class="info">
          <view v-if="info.OpenId" class="lump">
            <view class="laber">性别：</view>
            <view class="receive">{{ info.Sex === 1 ? '男' : info.Sex === 2 ? '女' : '未知' }}</view>
          </view>
          <view class="lump">
            <view class="laber">手机号：</view>
            <view class="receive">{{ info.Mobile ? info.Mobile : '---' }}</view>
            <view v-if="info.Mobile" class="customerDetails-btn" @tap="copy(info.Mobile)">复制</view>
            <view v-if="info.Mobile" class="customerDetails-btn" @tap="phoneCall(info.Mobile)">拨打</view>
          </view>
          <view class="lump">
            <view class="laber">创建时间：</view>
            <view class="receive">{{ info.AddTime }}</view>
          </view>
          <view v-if="info.OpenId && info.AuditStatus === 1" class="lump">
            <view class="laber">加入时间：</view>
            <view class="receive">{{ info.AuditTimeStr }}</view>
          </view>
        </view>

        <view class="info order">
          <view class="lump" @tap="handleGoCustomer(info.OpenId)">
            <view class="laber">累计下级</view>
            <view class="receive">
              {{ info.SubordinateCount }}
              <view class="iconfont icon-arrow-right"></view>
            </view>
          </view>
          <view class="lump">
            <view class="laber">累计收益</view>
            <view class="price">￥ {{ info.SubordinateProfit }}</view>
          </view>
          <view class="lump">
            <view class="laber">累计自购金额</view>
            <view class="price">￥ {{ info.CumulativeMoney }}</view>
          </view>
        </view>

        <view v-if="info.InviterCustomerId" class="info order">
          <view class="lump">
            <view class="laber" style="font-weight: bold">邀请方</view>
          </view>
          <view class="lump">
            <view class="user">
              <view class="invate-image">
                <image :src="info.InviterHeadPath" />
                <view class="distribution">分销员</view>
              </view>
              <view class="info-wrap">
                <view class="name-wrap">
                  <view class="name">{{ info.InviterNickName }}</view>
                  <view class="address">{{ info.InviterAddress }}</view>
                </view>
                <view class="id-wrap">
                  <view class="id-name">ID：{{ info.InviterId }}</view>
                </view>
              </view>
              <view v-if="info.InviterGradeNumber != -1" class="invate-member">
                <view :class="['iconfont', 'grade', 'iconv-' + info.InviterGradeNumber]"></view>
                {{ info.InviterGradeName }}
              </view>
            </view>
          </view>
        </view>
      </view>
      <u-modal
        v-model="show"
        :content="content"
        :show-cancel-button="true"
        confirm-text="同意"
        cancel-text="拒绝"
        @confirm="handleConfirm"
        @cancel="handleCancel"
      ></u-modal>
      <view v-if="info.AuditStatus === 0" class="aduit-wrap">
        <view class="aduit" @tap.stop="show = true">审核</view>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      isLoading: false,
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg',
      info: {},
      show: false,
      content: '是否同意成为分销员'
    }
  },
  onLoad(options) {
    this.GetDistributionUserDetails(options.Id)
  },
  methods: {
    handleGoCustomer(OpenId) {
      if (!OpenId) return
      uni.navigateTo({
        url: `./customer?OpenId=${OpenId}`
      })
    },
    // 同意
    handleConfirm() {
      let data = {
        Id: this.info.Id,
        AuditStatus: 1
      }
      apiCloud({
        url: '/api/v1/DistributionUser/AuditDistributionUser',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('审核成功')
        }
      })
    },
    // 拒绝
    handleCancel() {
      let data = {
        Id: this.info.Id,
        AuditStatus: 2
      }
      apiCloud({
        url: '/api/v1/DistributionUser/AuditDistributionUser',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('已拒绝申请')
        }
      })
    },
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
    GetDistributionUserDetails(id) {
      apiCloud({
        url: '/api/v1/DistributionUser/DistributionUserDetails',
        method: 'post',
        data: JSON.stringify({ DistributionId: Number(id) })
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
.aduit-wrap {
  width: 100%;
  height: 100rpx;
  line-height: 100rpx;
  background-color: #fff;
  position: absolute;
  bottom: 0;
  left: 0;
  .aduit {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 150rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    right: 32rpx;
    font-size: 26rpx;
    color: #fff;
    background-color: #ff5e33;
    border-radius: 30rpx;
  }
}
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
    .info {
      margin-top: 30rpx;
      padding: 20rpx;
      background: #fff;
      border-radius: 20rpx;
      position: relative;
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
        .price {
          margin-right: 19rpx;
          color: var(--theme-color, $uni-color-primary);
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
        .icon-arrow-right {
          display: flex;
          align-items: center;
          line-height: 10rpx;
          margin-left: 19rpx;
          font-size: 10px;
        }
      }
    }
  }
  .user {
    display: flex;
    align-items: flex-end;
    position: relative;
    margin-top: 19rpx;
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
        background: var(--theme-color, $uni-color-primary);
        border-radius: 15px;
        font-size: 22rpx;
        text-align: center;
      }
    }
    .invate-image {
      position: absolute;
      top: -28rpx;
      left: 0rpx;
      image {
        width: 84rpx;
        height: 84rpx;
        border-radius: 50%;
      }
      .distribution {
        position: absolute;
        bottom: 10rpx;
        left: 0rpx;
        right: 0;
        width: 80rpx;
        height: 30rpx;
        line-height: 30rpx;
        color: #fff;
        background: var(--theme-color, $uni-color-primary);
        border-radius: 15px;
        font-size: 22rpx;
        text-align: center;
      }
    }
    .user-info {
      flex: 1;
      margin-left: 10rpx;
    }
    .info-wrap {
      flex: 1;
      margin-left: 108rpx;
      margin-top: 20rpx;
    }
    .name-wrap {
      display: flex;
    }
    .name {
      font-size: 30rpx;
      font-weight: bold;
      color: #000000;
    }
    .id-name {
      color: rgba(153, 153, 153, 1);
    }
    .address {
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
      font-family: PingFang SC;
      line-height: 40rpx;
    }
  }
  .member {
    padding: 3rpx 5rpx;
    margin-left: 10rpx;
    position: absolute;
    top: 28rpx;
    left: 143rpx;
    min-width: 120rpx;
    color: #000;
    border-radius: 20rpx;
    background: rgba(255, 239, 234, 1);
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
  .invate-member {
    white-space: nowrap;
    padding: 3rpx 5rpx;
    margin-left: 10rpx;
    position: absolute;
    top: -35rpx;
    left: 89rpx;
    line-height: 38rpx;
    min-width: 120rpx;
    color: #000;
    background: #ffefea !important;
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
      background: rgb(246, 198, 102) !important;
      border-radius: 100%;
    }
  }
}
</style>
