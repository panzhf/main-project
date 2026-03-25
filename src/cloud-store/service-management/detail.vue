<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <view v-if="info.OrderDetailMessage.DisposeStatus === 2" class="cart-tips">
        <text class="iconfont icontishiicon"></text>
        <text>请联系顾客进行受理确认，服务订单才完结！</text>
      </view>
      <view class="item-list">
        <view class="flex flex-middle">
          <text class="appointment-title">工单信息详情</text>
        </view>
        <view class="flex flex-middle">
          <text class="gray6-color">服务类型</text>
          <text class="ml-30">{{ info.OrderDetailMessage.ServeTypeName }}</text>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">服务项目</text>
          <text class="ml-30">{{ info.OrderDetailMessage.ServeProjectName }}</text>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">服务单号</text>
          <text class="ml-30">{{ info.OrderNumber }}</text>
          <text class="order-btn--copy ml-10" @tap="handleCopy(info.OrderNumber)">复制</text>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">服务状态</text>
          <text class="ml-30">{{ info.OrderDetailMessage.DisposeStatusMessage }}</text>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">报单时间</text>
          <text class="ml-30">{{ info.CreateTime }}</text>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">预约时间</text>
          <text class="ml-30">{{ info.SubscribeTime }}</text>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">联系人</text>
          <text class="ml-30" style="margin-left: 56rpx">{{ info.OrderDetailMessage.Linkman }}</text>
          <u-icon
            name="phone"
            :color="themeInfo.color"
            size="40"
            style="margin-left: 30rpx"
            @click="phoneCall(info.OrderDetailMessage.LinkMobile)"
          ></u-icon>
        </view>
        <view class="flex flex-middle mt-30">
          <text class="gray6-color">联系地址</text>
          <text class="ml-30">{{ info.OrderDetailMessage.Address }}</text>
        </view>
        <view class="flex flex-middle mt-30">
          <view class="gray6-color" style="flex-shrink: 0">备注信息</view>
          <view class="ml-30 text-wrap">{{ info.OrderDetailMessage.Remark || '' }}</view>
        </view>
      </view>
      <view class="mt-30 item-list">
        <view class="flex flex-middle">
          <text class="appointment-title">服务历程</text>
        </view>
        <view
          v-for="(item, index) in info.CourseList"
          :key="index"
          :class="['appointment-time', index === 0 ? '' : 'mt-30']"
        >
          <view :class="['gray6-color', index === 0 ? 'active-time' : '']">{{ item.OperationMovement }}</view>
          <view class="time">{{ item.AddTime }}</view>
          <view class="progress-wrap">
            <view :class="['circle', index === 0 ? 'active-circle' : '']"></view>
            <view v-if="index !== info.CourseList.length - 1" class="rect"></view>
          </view>
        </view>
      </view>
      <view class="h200"></view>
      <view
        v-if="info.OrderDetailMessage.DisposeStatus === 0 || info.OrderDetailMessage.DisposeStatus === 1"
        class="fixed-footer flex-end"
        style="z-index: 1"
      >
        <view
          v-if="info.OrderDetailMessage.DisposeStatus === 0"
          class="order-action__btn is-primary ml-20 mr-30 max"
          @tap="handleSendOrder(info)"
        >
          接单
        </view>
        <view
          v-if="info.OrderDetailMessage.DisposeStatus === 1"
          class="order-action__btn is-primary ml-20 mr-30 max"
          @tap="handleNotarizeDispose(info)"
        >
          已处理
        </view>
      </view>
      <u-modal
        ref="uModal"
        v-model="show"
        :show-cancel-button="true"
        title="请填写服务人员"
        :title-style="{ fontWeight: '700' }"
        :async-close="true"
        @confirm="handleSure"
      >
        <view class="slot-content">
          <view class="pick-box">
            <view class="waybill">
              <view>
                <text style="color: #ff4b40">*</text>
                <text class="waybill-label">联系人</text>
              </view>
              <input
                v-model="form.ServePersonnelName"
                class="waybill-name"
                type="text"
                placeholder="请输入联系人姓名"
              />
            </view>
            <view class="waybill">
              <view>
                <text style="color: #ff4b40">*</text>
                <text class="waybill-label">联系方式</text>
              </view>
              <input
                v-model="form.ServePersonnelMobile"
                class="waybill-mobile"
                type="text"
                placeholder="请输入联系号码"
              />
            </view>
          </view>
        </view>
      </u-modal>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import SwitchStores from '@/mixins/switch-stores'
export default {
  mixins: [SwitchStores],
  data() {
    return {
      show: false,
      scene: 0, // 场景值
      info: {},
      orderNumber: '',
      form: {
        ServePersonnelMobile: '',
        ServePersonnelName: ''
      }
    }
  },
  async onLoad(option) {
    //console.log(option, '123')
    const obj = uni.getLaunchOptionsSync()
    this.scene = obj.scene || 0
    this.orderNumber = option.orderNumber
    // 获取由消息订阅通知进来取得门店id--注意当门店id与当前登录的不是同一个门店需要自动切换到指定门店
    if (option.storeid) this.handleSwitchStores(option.storeid)
  },
  onShow() {
    this.getData()
  },
  methods: {
    phoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    },
    handleCopy(text) {
      // 复制文本
      uni.setClipboardData({
        data: text
      })
    },
    // 接单
    handleSendOrder(item) {
      this.show = true
    },
    // 接单-确定的回调
    handleSure() {
      this.$refs.uModal.clearLoading()
      if (!this.form.ServePersonnelName) {
        return this.$msg('请输入联系人姓名')
      }
      if (
        !/^1\d{10}$/.test(this.form.ServePersonnelMobile) &&
        !/^([0-9]{3,4}-)?[0-9]{7,8}$/.test(this.form.ServePersonnelMobile)
      ) {
        return this.$msg('请输入正确的的号码')
      }
      let data = JSON.parse(JSON.stringify(this.form))
      let dataT = {
        OrderNumber: this.info.OrderNumber,
        ServePersonnelMobile: data.ServePersonnelMobile,
        ServePersonnelName: data.ServePersonnelName
      }
      apiCloud({
        url: '/api/v1/ReservationService/AceptServeProject',
        method: 'post',
        data: JSON.stringify(dataT)
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('接单成功', { icon: 'success' })
          this.show = false
          this.form = {
            ServePersonnelMobile: '',
            ServePersonnelName: ''
          }
          setTimeout(() => {
            this.getData()
          }, 2000)
        }
      })
    },
    // 已处理的回调
    handleNotarizeDispose(item) {
      apiCloud({
        url: '/api/v1/ReservationService/NotarizeDispose',
        method: 'post',
        data: JSON.stringify({ OrderNumber: this.info.OrderNumber })
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('处理成功', { icon: 'success' })
          setTimeout(() => {
            this.getData()
          }, 2000)
        }
      })
    },
    async getData() {
      try {
        this.$loading.show()
        const res = await apiCloud({
          url: '/api/v1/ReservationService/ServeProjectParticulars',
          method: 'post',
          data: JSON.stringify({ OrderNumber: this.orderNumber, Source: this.scene || 0 })
        })
        if (res.return_code === 0) {
          const returnData = res.return_data
          this.info = returnData || {}
        } else {
          this.$msg(res.return_msg)
          setTimeout(() => {
            this.$goBack()
          }, 2000)
        }
      } catch (err) {
        this.$msg('网络超时，请重试')
        setTimeout(() => {
          this.$goBack()
        }, 2000)
      } finally {
        this.$loading.hide()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f4f4f4;
  .wrapper {
    position: relative;
    padding-bottom: 100rpx;
    z-index: 1;
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 170rpx;
      z-index: -1;
    }
  }
}
.h200 {
  height: 200rpx;
}
.cart-tips {
  background-color: #fff4f4;
  color: #ff4b40;
  padding: 20rpx 20rpx;
  font-size: 24rpx;
  .icontishiicon {
    margin-right: 10rpx;
  }
}
.appointment-title {
  margin-bottom: 20rpx;
  color: #000;
  font-size: 28rpx;
  font-weight: bold;
}
.appointment-time {
  padding: 20rpx 60rpx;
  position: relative;
  .time {
    font-size: 26rpx;
    color: #666;
    margin-top: 10rpx;
  }
  .active-time {
    color: #000;
    font-size: 30rpx;
    font-weight: bold;
  }
  .active-circle {
    background-color: var(--theme-color, $uni-color-primary) !important;
  }
  .progress-wrap {
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    left: 0rpx;
    top: 20rpx;
    .circle {
      width: 25rpx;
      height: 25rpx;
      border-radius: 50%;
      background-color: #e3e3e3;
    }
    .rect {
      width: 10rpx;
      height: 115rpx;
      background-color: #e3e3e3;
    }
  }
}
.order-btn--copy {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 20rpx;
  width: 60rpx;
  height: 34rpx;
  border-radius: 17rpx;
  border: 1rpx solid #ccc;
  font-size: 22rpx;
  color: #666;
}
.order-action__btn {
  padding: 12rpx 20rpx;
  min-width: 120rpx;
  box-sizing: border-box;
  border-radius: 28rpx;
  border: 1rpx solid var(--theme-color, $uni-color-primary);
  font-size: 26rpx;
  text-align: center;
  font-weight: bold;
  color: var(--theme-color, $uni-color-primary);
  &.is-primary {
    background-color: var(--theme-color, $uni-color-primary);
    color: #fff;
  }
}
.pick-box {
  .waybill {
    display: flex;
    align-items: center;
    margin: 30rpx;
    input {
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #999999;
      line-height: 40rpx;
      padding: 10rpx 0 10rpx 10rpx;
      border-radius: 8rpx;
      border: 1px solid #eee;
    }
    .waybill-name {
      margin-left: 52rpx;
    }
    .waybill-mobile {
      margin-left: 20rpx;
    }
  }
}
.text-wrap {
  flex: 1;
  word-break: break-all;
  white-space: wrap;
}
.flex {
  display: flex;
}
.flex-middle {
  align-items: center;
}
.mt-30 {
  margin-top: 30rpx;
}
.ml-30 {
  margin-left: 30rpx;
}
.ml-20 {
  margin-left: 20rpx;
}
.mr-30 {
  margin-right: 30rpx;
}
.gray6-color {
  color: #666;
}
.item-list {
  padding: 30rpx;
  background-color: #ffffff;
  font-size: 26rpx;
  line-height: 1;
}
.item-list .item-input {
  width: 250rpx;
}
.fixed-footer {
  position: fixed;
  z-index: 100;
  bottom: 0;
  left: 0;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  height: 120rpx;
  background: #ffffff;
  padding-bottom: 0;
}
.flex-end {
  -webkit-box-pack: end;
  -webkit-justify-content: flex-end;
  justify-content: flex-end;
}
.icondianhua1 {
  font-size: 40rpx;
}
</style>
