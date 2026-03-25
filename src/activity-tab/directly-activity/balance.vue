<template>
  <view class="container">
    <view class="balance">
      <view class="balance-box" :style="{ 'background-image': `url(${balanceBg})` }">
        <view class="balance-amount">{{ CumulativeIncome | filterRmb }}</view>
        <view class="balance-title">分佣余额（元）</view>
        <view class="withdrawal button button--large" @tap="handleWithdrawal(1)">提现</view>
        <u-icon class="iconshuoming" name="question-circle" color="#fff" size="32" @click="handlePopup"></u-icon>
        <navigator class="withdrawal-list" url="/pages/store-revenue/withdrawal-record?currentTab=0&type=2">
          提现记录
          <text class="iconfont icon-arrow-right fs-20 ml-5"></text>
        </navigator>
      </view>
      <view v-if="!OpenID" class="itemWrapper">
        <view class="item">
          <view class="label">提现账户绑定</view>
          <view class="click" @tap="WXBind(2)">立即绑定</view>
        </view>
        <view class="item-tips">
          <view class="tips">
            <text class="iconfont iconzhuyi"></text>
            绑定微信号用于门店订单款收入提现，请谨慎
          </view>
        </view>
      </view>
      <view v-if="OpenID" class="itemWrapper">
        <view class="item">
          <view class="label">提现账户绑定</view>
          <view class="content">已绑定</view>
        </view>
        <view class="item">
          <view class="label" style="display: flex">
            <image class="face" :src="avatarUrl || defaultAvatar" mode="aspectFill" lazy-load="false" />
            <text>{{ nickName || '' }}</text>
          </view>
          <view class="click" @tap="WXBind(3)">换绑</view>
        </view>
      </view>
      <view v-if="list.length" class="list-box">
        <view class="list-title">- 资金明细 -</view>
        <view v-for="(item, index) in list" :key="index" class="list-item">
          <view class="list-item-header">
            <view class="item-header-left">佣金收益</view>
            <view class="item-header-right">+ ￥{{ item.StoresAmount | filterRmb }}</view>
          </view>
          <view class="list-item-order">
            订单号： {{ item.TradeNo }}
            <text class="copy" @tap="onTapCopy(item.TradeNo)">复制</text>
          </view>
          <view class="list-item-time">{{ item.TradeTime }}</view>
        </view>
      </view>
      <common-popup
        v-model="showPopup"
        :type="popType"
        :title="popTitle"
        :content="popContent"
        :confirm-text="popConfirmText"
        :cancel-text="popCancelText"
        @confirm="handleConfirm"
      ></common-popup>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { filterRmb } from '@/filters'
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
export default {
  filters: { filterRmb },
  data() {
    return {
      avatarUrl: '',
      nickName: '',
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg',
      dialogContentType: -1,
      showClose: false,
      CumulativeIncome: 0,
      OpenID: '',
      balanceBg: staticURL() + 'personal/bg-yellow.png',
      Form: {
        PageIndex: 1,
        PageSize: 10
      },
      list: [],
      total: 0,
      isLoaded: false,
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', // 弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '去设置', // 弹窗确认按钮文案
      popCancelText: '跳过' // 弹窗取消按钮文案
    }
  },

  onLoad() {
    this.getData()
  },

  onShow() {
    this.GetCloudAssetInfo()
  },

  onReachBottom() {
    if (!this.isLoaded) {
      this.PageIndex++
      this.getData()
    }
  },

  methods: {
    handleWithdrawal(type) {
      if (!this.OpenID) {
        this.popType = 'confirm'
        this.popTitle = ''
        this.popContent = '您还未绑定提现账户哦,请先绑定再提现！'
        this.popConfirmText = '去绑定'
        this.popCancelText = '关闭'
        this.dialogContentType = type
        this.showPopup = true
      } else {
        wx.navigateTo({
          url: '/pages/store-revenue/withdrawal?type=2'
        })
      }
    },
    /** 复制 */
    onTapCopy(data) {
      uni.setClipboardData({
        data: data
      })
    },
    handlePopup() {
      this.popType = 'confirm'
      this.dialogContentType = 0
      this.popTitle = '分佣余额'
      this.popContent = '佣金自动提现失败的，对应佣金自动入账至你的账户余额，支持手动提现操作。'
      this.popConfirmText = '我知道了'
      this.popCancelText = '取消'
      this.showPopup = true
      this.dialogContentType = 0
    },
    // 绑定/换绑微信
    WXBind(type) {
      this.popType = 'confirm'
      type === 2 ? (this.popTitle = '绑定微信号') : (this.popTitle = '换绑微信号')
      this.popContent = '是否绑定当前登录的微信号为提现账户?'
      this.popConfirmText = '确定绑定'
      this.popCancelText = '取消'
      this.dialogContentType = type
      this.showPopup = true
    },
    // 获取云店资产
    GetCloudAssetInfo() {
      apiCloud({
        url: '/api/v1/DirectlyAssets/GetCloudAssetInfo',
        method: 'get',
        data: JSON.stringify({ roleType: 3 })
      }).then(res => {
        if (this.$ck(res)) {
          this.OpenID = (res.return_data && res.return_data.OpenID) || ''
          this.CumulativeIncome = (res.return_data && res.return_data.Balance) || 0
          this.avatarUrl = (res.return_data && res.return_data.Headpath) || ''
          this.nickName = (res.return_data && res.return_data.NickName) || ''
        }
      })
    },
    /** 请求数据 */
    getData() {
      apiCloud({
        url: '/api/v1/DirectlyAssets/QueryCloudTradeDetailList',
        method: 'post',
        data: JSON.stringify(this.Form)
      }).then(res => {
        if (res.return_code === 0) {
          this.list = this.list.concat(res.return_data.Results || [])
          this.total = res.return_data.TotalCount
          if (this.total === this.list.length) {
            this.isLoaded = true
          }
        } else {
          this.isLoaded = true
        }
      })
    },
    // 弹窗回调
    handleConfirm() {
      this.showPopup = false
      if (this.dialogContentType === 2 || this.dialogContentType === 3) {
        uni.getUserProfile({
          lang: 'zh_CN',
          desc: '用于完善信息',
          success: res => {
            if (res.userInfo) {
              let Headpath = res.userInfo.avatarUrl || ''
              let NickName = res.userInfo.nickName || ''
              uni.navigateTo({
                url: `./check-phone?Headpath=${Headpath}&NickName=${NickName}&RoleType=3`
              })
            }
          }
        })
      } else if (this.dialogContentType === 1) {
        this.WXBind(2)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/tab.scss';
.container {
  background-color: #f7f7f7;
}
.disabled {
  background-color: #ccc;
  color: #fff;
}
.itemWrapper {
  position: relative;
  z-index: 99;
  background: #fff;
  border-radius: 20rpx;
  margin: 30rpx 0 0;
  padding: 30rpx;
  box-shadow: 0px 0px 6px 0px rgba(153, 153, 153, 0.24);
}
.item {
  line-height: 90rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
}
.item-tips {
  display: flex;
  justify-content: flex-end;
  .tips {
    display: inline-block;
    font-size: 26rpx;
    color: #f26432;
    padding: 5rpx 10rpx;
    text-align: right;
    background-color: #fff5f0;
    .iconzhuyi {
      font-size: 26rpx;
    }
  }
}

.label {
  flex: 1;
  font-size: 30rpx;
  color: #000;
}
.content {
  color: #666;
}
.openid-content {
  color: #aaaaaa;
  font-size: 26rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.click {
  color: #579bfb;
}
.face {
  display: block;
  width: 70rpx;
  height: 70rpx;
  margin-right: 20rpx;
  border-radius: 50%;
}
.balance {
  padding: 30rpx;
  .balance-box {
    width: 690rpx;
    height: 240rpx;
    border-radius: 20rpx;
    background-size: cover;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    .balance-amount {
      font-size: 48rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #ffffff;
      line-height: 40rpx;
    }
    .balance-title {
      margin-top: 20rpx;
      font-size: 24rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #fff4b3;
      line-height: 40rpx;
    }
    .iconshuoming {
      position: absolute;
      right: 60rpx;
      top: 60rpx;
      color: #fff;
    }
    .withdrawal-list {
      position: absolute;
      right: 60rpx;
      top: 199rpx;
      color: #fff;
      font-size: 26rpx;
    }
    .withdrawal {
      width: 30%;
      height: 60rpx;
      margin-top: 20rpx;
      font-size: 28rpx;
    }
  }
  .list-box {
    padding: 0 20rpx;
    margin-top: 30rpx;
    background: #ffffff;
    border-radius: 20rpx;
    .list-title {
      padding-top: 50rpx;
      text-align: center;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #000000;
      line-height: 40rpx;
    }
    .list-item {
      .list-item-header {
        margin-top: 40rpx;
        display: flex;
        justify-content: space-between;
        .item-header-left {
          font-size: 28rpx;
          font-family: PingFang SC;
          font-weight: 500;
          color: #000000;
          line-height: 40rpx;
        }
        .item-header-right {
          font-size: 28rpx;
          font-family: PingFang SC;
          font-weight: bold;
          color: #000000;
          line-height: 40rpx;
        }
      }
      .list-item-order,
      .list-item-time {
        font-size: 24rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #9a9a9a;
        line-height: 32rpx;
      }
      .list-item-order {
        margin-top: 20rpx;
        .copy {
          margin-left: 20rpx;
          padding: 10rpx;
          border-radius: 10rpx;
          border: 1px silid #eee;
        }
      }
      .list-item-time {
        padding-bottom: 40rpx;
        border-bottom: 1rpx solid #eeeeee;
      }
    }
  }
}
.noun-popup__item__title {
  text-align: center;
}
</style>
