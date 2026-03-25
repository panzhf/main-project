<template>
  <view>
    <common-popup
      v-model="showPopup"
      type="confirm"
      title="通知"
      :pop-hide-button="true"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      class="popup-not"
      custom-style="width: 650rpx;overflow: visible"
    >
      <view class="content">
        <scroll-view scroll-y="true" :style="{ height: viewHeight }">
          <view>尊敬的客户：{{ info.Name }}</view>
          <view class="mt-10">您好！</view>
          <view class="mt-10">
            非常感谢您一直以来对我们系统的支持和信任。由于微信支付的规则调整，导致您从贵司云店店铺账户提现超额，多提现了
            <text class="fw-bold">{{ info.Price }}</text>
            元。系统查验后，我们第一时间做了修复，并确保不再出现类似的事件
          </view>
          <view class="mt-10">
            对于此次事件给您带来的不便，我们深表歉意，同时，为了保障了您继续使用系统的权益，
            我们向您正式发送通知，附上您的账户提现明细，并请求您的配合，请在接到本通知 7 日内将超额提现的
            <tex class="fw-bold">{{ info.Price }}</tex>
            元退到指定账户。
          </view>
          <view>再次感谢您的耐心和支持。</view>
          <view class="mt-20">（退款方式：前往云店小程序“{{ info.Name }}”完成下单购买即可）</view>
          <view class="tr mt-20">腾讯科技(深圳)有限公司</view>
          <view class="tr">广州米多网络科技有限公司</view>
          <view class="tr">优尚上品（广州）科技有限公司</view>
          <view class="tr">2023 年 05 月 12 日</view>
        </scroll-view>

        <view class="footer flex ub-pc mt-20">
          <button class="primary-btn plain size-small mr-20" @tap="handleDetail">查看账单明细</button>
          <button class="primary-btn size-small" @tap="handleShop">去下单退款</button>
        </view>
        <view class="pop-close icon iconfont icon-guanbi1" @tap="showPopup = false"></view>
      </view>
    </common-popup>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { apiCloud } from '@/api/cloud-store'
import navigateToMP from '@/utils/navigate-mp'
export default {
  data() {
    return {
      showPopup: false,
      popConfirmText: '去退款',
      popCancelText: '查看账单明细',
      info: { Name: '', Price: 0, FileLink: '', MiniPath: '' }
    }
  },
  computed: {
    viewHeight() {
      let { screenHeight } = uni.getSystemInfoSync()
      return screenHeight < 812 ? '700rpx' : '880rpx'
    }
  },
  mounted() {
    const info = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    // 门店负责人才弹
    if (info.roleType === 2) {
      const lastPopupDate = uni.getStorageSync('lastPopupDate')
      if (lastPopupDate) {
        const savedDate = dayjs(lastPopupDate)
        const today = dayjs()
        if (!savedDate.isSame(today, 'day')) {
          this.getData()
        }
      } else {
        this.getData()
      }
    }
  },
  methods: {
    async getData() {
      let res = await apiCloud({
        url: '/api/v1/store/getnotice',
        method: 'post',
        data: JSON.stringify({})
      })
      if (this.$ck(res, true)) {
        if (res.return_data) {
          this.info = res.return_data
          const today = dayjs()
          const lastPopupDate = today.format('YYYY-MM-DD')
          uni.setStorageSync('lastPopupDate', lastPopupDate)
          this.showPopup = true
        }
      }
    },
    handleShop() {
      navigateToMP({ appId: 'wxbefdd3bfc7bae5b7', path: this.info.MiniPath })
    },
    handleDetail() {
      const fileExtName = '.pdf'
      const randfile = dayjs().valueOf() + fileExtName
      // 使用微信路径
      const newPath = `${wx.env.USER_DATA_PATH}/${randfile}`
      uni.downloadFile({
        url: this.info.FileLink,
        filePath: newPath,
        success: () => {
          uni.openDocument({ filePath: newPath, showMenu: true, fileType: 'pdf', success: function (res) {} })
        },
        fail: function (res) {
          uni.hideLoading()
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.content {
  text-align: left;
  position: relative;
  ::v-deep .common-popup {
    overflow: none;
  }
  .pop-close {
    position: absolute;
    bottom: -130rpx;
    color: #fff;
    left: 50%;
    transform: translate(-50%, 0);
    font-size: 60rpx;
  }
  .footer {
    &:not(.check) {
      .primary-btn {
        width: 286rpx;
      }
    }
    &.confirm,
    &.prompt {
      display: flex;
      justify-content: space-between;
      .primary-btn {
        flex: 1;
      }
    }
  }
}
.tr {
  text-align: right;
}
</style>
