<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="row">
      <view class="row-line">
        <view class="row-left">服务单号</view>
        <view class="row-right">
          {{ info.AfterSaleInfo.TradeNo }}
          <view class="order-btn--copy" @tap.stop="handleCopy(info.AfterSaleInfo.TradeNo)">复制</view>
        </view>
      </view>
      <view class="row-line">
        <view class="row-left">售后状态</view>
        <view v-if="info.Status == 1" class="row-right"><text class="orange">待审核</text></view>
        <view v-if="info.Status == 2" class="row-right"><text class="orange">处理中</text></view>
        <view v-if="info.Status == 3" class="row-right"><text class="orange">已关闭</text></view>
        <view v-if="info.Status == 4" class="row-right"><text class="orange">已完成</text></view>
      </view>
      <view class="row-line">
        <view class="row-left">订单状态</view>
        <view class="row-right">
          <text class="orange">{{ statusFilter(info.OrderStatus, 0) }}</text>
        </view>
      </view>
    </view>
    <view class="row">
      <view class="row-title">售后申请详情</view>
      <view class="row-line">
        <view class="row-left">处理方式</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 1" class="row-right">退款/换货 待处理</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 2" class="row-right">退款/换货 待买家发货</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 3" class="row-right">退款/换货 待商家收货</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 4" class="row-right">商家已换货</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 5" class="row-right">退款/换货成功</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 6" class="row-right">申请关闭</view>
        <view v-if="info.AfterSaleInfo.ProcessStatus == 7" class="row-right">无需寄回商品 直接换货</view>
      </view>
      <view class="row-line">
        <view class="row-left">申请原因</view>
        <view class="row-right">{{ info.AfterSaleInfo.ApplyReason }}</view>
      </view>
      <view class="row-line">
        <view class="row-left">申请金额</view>
        <view class="row-right">
          <text class="orange">
            商品总金额：￥{{ BuyerRefundAmount | filterRmb }} - 退差额：￥{{ info.SpreadIncome | filterRmb }} +
            运费：￥{{ info.DeliveryFee | filterRmb }}
          </text>
        </view>
      </view>
      <view class="row-line">
        <view class="row-left">退款金额</view>
        <view class="row-right">
          <text class="orange">￥{{ info.ActualRefundAmount | filterRmb }}</text>
        </view>
      </view>
      <view class="row-line">
        <view class="row-left">买家信息</view>
        <view class="row-right">{{ info.Buyer.Name }}</view>
      </view>
      <view class="row-line">
        <view class="row-left">手机号码</view>
        <view class="row-right">{{ info.ReceiverMobile }}</view>
      </view>
      <view class="row-line">
        <view class="row-left">备注信息</view>
        <view class="row-right">{{ info.AfterSaleInfo.Remarks }}</view>
      </view>
      <view class="row-line">
        <view class="row-left">上传凭证</view>
        <view class="row-right">
          <image
            v-for="(item, index) in info.AfterSaleInfo.BuyerVoucherUrls"
            :key="index"
            class="row-right-img"
            :src="item"
            mode="scaleToFill"
            lazy-load="false"
            @tap.stop="handlepreview(index)"
          />
        </view>
      </view>
    </view>
    <view class="row">
      <view class="row-line">
        <view class="row-left">订单编号</view>
        <view class="row-right">
          {{ info.OrderNumber }}
          <view class="order-btn--copy" @tap.stop="handleCopy(info.OrderNumber)">复制</view>
        </view>
      </view>
      <view v-for="(product, index) in info.OrderItems" :key="index">
        <ProductCard :product="product" :is-actual-amount="true" :is-position-change="true" class="mt-20"></ProductCard>
      </view>
    </view>
    <view class="row mb-400">
      <view class="row-title">操作记录</view>
      <view class="row-table">
        <view class="row-th">
          <text class="th">操作时间</text>
          <text class="th">操作人</text>
          <text class="th">操作动作</text>
        </view>
        <view v-for="(item, index) in info.AfterSaleHistory" :key="index" class="row-td">
          <text class="td">{{ item.CreateTime }}</text>
          <text class="td">{{ item.OperatorName }}</text>
          <text class="td">{{ item.ActionName }}</text>
        </view>
      </view>
    </view>
    <view class="h200"></view>
    <view class="order-fixed">
      <!-- 售后为0未发货退款 并且售后处理状态不为4 已完成 -->
      <view
        v-if="info.AfterSaleInfo.ApplyWay == 0 && info.Status != 4 && info.Status != 3 && info.DeliveryMode != 3"
        class="order-fixed__btn"
        @tap="showT = true"
      >
        标记发货
      </view>
      <!-- 售后为0未发货退款 并且售后处理状态为1 待审核 -->
      <view
        v-if="info.Status == 1 && info.DeliveryMode != 3"
        class="order-fixed__btn order-fixed__btn--primary"
        @tap.stop="handleRefundOrder"
      >
        直接退款
      </view>
      <!-- 售后为2退货退款 并且售后处理状态为1 待审核 -->
      <view
        v-if="info.AfterSaleInfo.ApplyWay == 2 && info.Status == 1 && info.DeliveryMode != 3"
        class="order-fixed__btn order-fixed__btn--primary"
        @tap.stop="handleNeedSales"
      >
        需要退货
      </view>
      <!-- 售后为2退货退款 并且售后处理状态为2 处理中 -->
      <view
        v-if="info.AfterSaleInfo.ApplyWay == 2 && info.Status == 2 && info.DeliveryMode != 3"
        class="order-fixed__btn order-fixed__btn--primary p-20"
        @tap.stop="handleAffirmSales"
      >
        确认收货并退款
      </view>
    </view>
    <u-modal
      ref="uModalT"
      v-model="showT"
      z-index="9999"
      width="700"
      :show-cancel-button="true"
      :async-close="true"
      :cancel-style="cancelStyle"
      :confirm-style="confirmStyle"
      border-radius="50"
      title="标记发货"
      @confirm="handleDelivery"
    >
      <view class="pick-box" style="margin: 30rpx">
        <view class="sureDeliveryItem">
          <view class="sureDeliveryLabel">发货方式：</view>
          <view class="deliveryType">
            <u-radio-group v-model="radioValue" @change="handRadioGroupChange">
              <u-radio v-for="(item, index) in radioList" :key="index" :name="item.name" :disabled="item.disabled">
                {{ item.name }}
              </u-radio>
            </u-radio-group>
          </view>
        </view>
        <view v-if="form.IsExpress === 0" class="express-box" style="align-items: flex-start">
          <view class="express">
            <picker mode="selector" range-key="Name" :range="ExpressGoodsTypeList" @change="handelGoodsType">
              <view class="pickerSelect">
                <view class="picker-express-Text">
                  {{ form.ExpressCompany ? form.ExpressCompany : '请选择物流公司' }}
                </view>
                <view class="iconfont icon-arrow-right"></view>
              </view>
            </picker>
          </view>
        </view>
        <view v-if="form.IsExpress === 0" class="waybill" style="align-items: flex-start">
          <input v-model="form.ExpressNumber" type="text" placeholder="请输入运单号" data-field="ExpressName" />
        </view>
        <view class="remark-box">
          <view class="remark-box-label" style="font-size: 28rpx">备注：</view>
          <textarea v-model="form.Remarks" class="remark-textarea" placeholder="选填，您可在此添加发货备注，限60字" />
        </view>
      </view>
    </u-modal>

    <u-modal
      ref="uModal"
      v-model="show"
      z-index="9999"
      width="650"
      :show-cancel-button="true"
      :async-close="true"
      :cancel-style="cancelStyle"
      :confirm-style="confirmStyle"
      border-radius="50"
      title="直接退款"
      @confirm="handleRefund"
    >
      <view class="pick-box" style="padding: 0 30rpx">
        <view class="tips">确认退款后，款项将返回买家支付账户，请务必确认退款金额</view>
        <view class="pick-row first">处理方式：{{ DialogTips }}</view>
        <view class="pick-row">
          <text style="width: 150rpx">支付金额：</text>
          <text class="money">
            商品总金额¥{{ info.ActualAmount | filterRmb }} - 退差额￥{{ info.SpreadIncome | filterRmb }} +运费¥{{
              info.DeliveryFee | filterRmb
            }}
          </text>
        </view>
        <view class="pick-row">
          <text style="width: 150rpx">申请金额：</text>
          <text class="money">
            商品总金额¥{{ BuyerRefundAmount | filterRmb }}
            <text>-退差额￥{{ info.SpreadIncome | filterRmb }}</text>
            <text>+运费¥{{ info.DeliveryFee | filterRmb }}</text>
          </text>
        </view>
        <view v-if="info.AfterSaleInfo.ApplyWay == 2" class="pick-textarea">
          <input v-model="money" type="digit" class="money-textarea" :placeholder="refundMoney" />
        </view>
        <view class="tips2">订单中涉及到的优惠券、包邮卡将原路退回。</view>
      </view>
    </u-modal>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import ProductCard from '@/components/product-card'
import { filterRmb } from '@/filters'
import { statusFilter } from '@/mixins/calc-status.js'
import SwitchStores from '@/mixins/switch-stores'
export default {
  components: {
    ProductCard
  },
  filters: { filterRmb },
  mixins: [statusFilter, SwitchStores],
  data() {
    return {
      cancelStyle: {
        height: '90rpx',
        textAlign: 'center',
        fontSize: '32rpx',
        lineHeight: '90rpx',
        backgroundColor: '#fff',
        fontWeight: '500',
        transform: 'scale(1)',
        transition: 'transform .1s',
        border: '1px solid #aaa',
        borderRadius: '40rpx',
        margin: '30rpx 24rpx 30rpx 15rpx'
      },
      confirmStyle: {
        height: '90rpx',
        textAlign: 'center',
        color: '#fff',
        fontSize: '32rpx',
        lineHeight: '90rpx',
        backgroundColor: '#FF7640',
        fontWeight: '700',
        transform: 'scale(1)',
        transition: 'transform .1s',
        borderRadius: '40rpx',
        margin: '30rpx 15rpx 30rpx 0'
      },
      isLoading: false,
      BuyerRefundAmount: 0,
      showT: false,
      radioValue: '快递配送',
      radioList: [
        {
          name: '快递配送',
          disabled: false
        },
        {
          name: '送货上门,无需物流',
          disabled: false
        }
      ],
      scene: 0, // 场景值
      orderNumber: '', // 兼容旧的接口查询
      afterSalesTradeNo: '', // 用新的接口查询
      DialogTips: '',
      ExpressGoodsTypeList: [],
      form: {
        IsExpress: 0,
        ExpressCompany: '',
        ExpressCode: '',
        ExpressNumber: '',
        Remarks: '',
        money: ''
      },
      info: {},
      show: false
    }
  },
  computed: {
    refundMoney() {
      return `输入退款金额，最多¥${(this.info.ActualAmount + this.info.DeliveryFee - this.info.SpreadIncome).toFixed(
        2
      )}元`
    }
  },
  async onLoad(option) {
    //console.log(option, '123')
    const obj = uni.getLaunchOptionsSync()
    this.scene = obj.scene || 0
    this.orderNumber = option.orderNumber || ''
    this.afterSalesTradeNo = option.afterSalesTradeNo || ''
    // 获取由消息订阅通知进来取得门店id--注意当门店id与当前登录的不是同一个门店需要自动切换到指定门店
    if (option.storeid) this.handleSwitchStores(option.storeid)
    this.getData()
    this.getExpress()
  },
  methods: {
    // 选择任意单选框时触发的回调
    handRadioGroupChange(e) {
      e === '快递配送' ? (this.form.IsExpress = 0) : (this.form.IsExpress = 1)
    },
    // 物流公司下拉框的回调
    handelGoodsType(e) {
      let index = e.detail.value - 0
      this.form.ExpressCode = this.ExpressGoodsTypeList[index].Code
      this.form.ExpressCompany = this.ExpressGoodsTypeList[index].Name
    },
    // 标记发货-确认的回调
    handleDelivery() {
      this.$refs.uModalT.clearLoading()
      if (!this.form.ExpressCompany && this.form.IsExpress === 0) return this.$msg('请输入物流公司名称')
      if (!/^[0-9a-zA-Z]+$/.test(this.form.ExpressNumber) && this.form.IsExpress === 0) {
        return this.$msg('请输入合法的订单号')
      }
      let data = JSON.parse(JSON.stringify(this.form))
      data.OrderTradeNo = this.info.OrderNumber
      data.TotalWeight = this.info.TotalWeight
      data.TotalCount = this.info.TotalCount
      data.IsAfterSaleType = 1
      data.OrderItemIDs = [1]
      if (data.IsExpress === 1) {
        data.ExpressCompany = 0
        data.ExpressCode = 0
      }
      apiCloud({
        url: '/api/v1/AfterSales/SellerConfirmSendPackage',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('操作成功', { icon: 'success' })
          this.showT = false
          this.getData()
          this.form = {
            IsExpress: 0,
            ExpressCompany: '',
            ExpressCode: '',
            ExpressNumber: '',
            Remarks: ''
          }
        }
      })
    },
    /** 确认收货并退款 */
    handleAffirmSales() {
      this.DialogTips = '退货退款'
      this.show = true
    },
    /** 直接退款 */
    handleRefundOrder() {
      this.DialogTips = '仅退款'
      this.show = true
    },
    // 直接退款-确认的回调
    handleRefund() {
      this.$refs.uModal.clearLoading()
      if (this.DialogTips === '仅退款') {
        if (this.info.AfterSaleInfo.ApplyWay === 2) {
          let money = Number(this.money)
          if (!money) return this.$msg('请输入退款金额')
          let maxMoney = (this.info.ActualAmount + this.info.DeliveryFee - this.info.SpreadIncome).toFixed(2)
          if (maxMoney < money) {
            return this.$msg('退款金额不能大于实付金额')
          }
        }
        let data = {
          OrderTradeNo: this.info.OrderNumber
        }
        if (this.info.AfterSaleInfo.ApplyWay === 2) {
          data.ActualRefundAmount = this.money
        } else {
          data.ActualRefundAmount = (this.info.ActualAmount + this.info.DeliveryFee - this.info.SpreadIncome).toFixed(2)
        }
        apiCloud({
          url: '/api/v1/AfterSales/AuditOrderOnlyRefund',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (this.$ck(res)) {
            this.$msg('退款成功，若订单包含已抵扣的购物券将退回原账户！')
            this.show = false
            this.getData()
            this.money = ''
          }
        })
      } else {
        let money = Number(this.money)
        if (!money) return this.$msg('请输入退款金额')
        let maxMoney = (this.info.ActualAmount + this.info.DeliveryFee - this.info.SpreadIncome).toFixed(2)
        if (maxMoney < money) {
          return this.$msg('退款金额不能大于实付金额')
        }
        let data = {
          OrderTradeNo: this.info.OrderNumber,
          ActualRefundAmount: this.money
        }
        apiCloud({
          url: '/api/v1/AfterSales/SellerConfirmReturnPackage',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (this.$ck(res)) {
            this.$msg('操作成功')
            this.show = false
            this.getData()
            this.money = ''
          }
        })
      }
    },
    // 需要退货
    handleNeedSales() {
      let data = {
        OrderTradeNo: this.info.OrderNumber
      }
      apiCloud({
        url: '/api/v1/AfterSales/AuditOrderReturnPackage',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (res.return_code === 0) {
          this.$msg('操作成功')
          this.getData()
        } else if (res.return_code === 100000) {
          this.$msg(res.return_msg)
          setTimeout(() => {
            uni.navigateTo({
              url: '/cloudShop/pages/saleAAA/ressList'
            })
          }, 1000)
        } else {
          this.$msg(res.return_msg)
        }
      })
    },
    handleCopy(text) {
      // 复制文本
      uni.setClipboardData({
        data: text
      })
    },
    handlepreview(e) {
      let index = e
      let that = this
      uni.previewImage({
        current: that.info.AfterSaleInfo.BuyerVoucherUrls[index], // 当前显示图片的http链接
        urls: that.info.AfterSaleInfo.BuyerVoucherUrls // 需要预览的图片http链接列表
      })
    },
    async getData() {
      try {
        this.$loading.show()
        let res = {}
        if (this.afterSalesTradeNo) {
          let data = {
            afterSaleTradeNo: this.afterSalesTradeNo,
            Source: this.scene || 0
          }
          res = await apiCloud({
            url: '/api/v1/AfterSales/GetAfterSaleDetail',
            method: 'get',
            data: JSON.stringify(data)
          })
        } else {
          let data = {
            orderNumber: this.orderNumber,
            Source: this.scene || 0
          }
          res = await apiCloud({
            url: '/api/v1/AfterSales/GetOrderDetail',
            method: 'get',
            data: JSON.stringify(data)
          })
        }

        if (res.return_code === 0) {
          const returnData = res.return_data
          if (returnData.AfterSaleInfo.BuyerVoucherUrls) {
            let data = returnData.AfterSaleInfo.BuyerVoucherUrls.map(item => {
              return 'http://' + item
            })
            returnData.AfterSaleInfo.BuyerVoucherUrls = data
          }
          this.info = returnData
          this.BuyerRefundAmount = returnData.ActualAmount || 0
        } else {
          this.$msg(res.return_msg)
          setTimeout(() => {
            this.$goBack()
          }, 1200)
        }
      } catch (err) {
        this.$msg('网络超时，请重试')
        setTimeout(() => {
          this.$goBack()
        }, 1200)
      } finally {
        this.isLoading = true
        this.$loading.hide()
      }
    },
    getExpress() {
      apiCloud({
        url: '/api/v1/AfterSales/GetExpressCompanyList',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        if (res.return_code === 0) {
          this.ExpressGoodsTypeList = res.return_data
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f7f7f7;
  .row {
    background-color: #fff;
    padding: 30rpx;
    margin-top: 30rpx;
    .row-title {
      margin-bottom: 20rpx;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #000000;
      line-height: 36rpx;
    }
    .row-line {
      display: flex;
      .row-left {
        width: 112rpx;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
        line-height: 50rpx;
      }
      .row-right {
        flex: 1;
        margin-left: 30rpx;
        display: flex;
        flex-wrap: wrap;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 50rpx;
        .orange {
          color: #ff4b40;
        }
        .row-right-img {
          margin-top: 20rpx;
          width: 100rpx;
          height: 100rpx;
          margin-right: 20rpx;
        }
      }
    }
    .row-table {
      .row-th {
        display: flex;
        .th {
          font-size: 26rpx;
          font-family: PingFang SC;
          font-weight: 500;
          color: #666666;
          line-height: 50rpx;
          &:nth-child(1) {
            flex: 3;
          }
          &:nth-child(2) {
            flex: 2;
          }
          &:nth-child(3) {
            flex: 2;
          }
        }
      }
      .row-td {
        display: flex;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 40rpx;
        .td {
          &:nth-child(1) {
            flex: 3;
          }
          &:nth-child(2) {
            flex: 2;
          }
          &:nth-child(3) {
            flex: 2;
          }
        }
      }
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
.order-fixed {
  position: fixed;
  left: 0;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding-left: 30rpx;
  padding-right: 30rpx;
  width: 100%;
  height: 120rpx;
  box-sizing: border-box;
  background-color: #fff;
  z-index: 1;
  .order-fixed__btn {
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 180rpx;
    height: 80rpx;
    box-sizing: border-box;
    border-radius: 40rpx;
    border: 1rpx solid #ccc;
    font-size: 28rpx;
    color: #333;
    &.order-fixed__btn--primary {
      border: 1rpx solid #ff4b40;
      background-color: #ff4b40;
      color: #fff;
    }
  }
  .order-fixed__btn + .order-fixed__btn {
    margin-left: 30rpx;
  }
}
.pick-box {
  .pick-textarea {
    display: flex;
  }
  .pick-title {
    text-align: left;
    font-size: 30rpx;
    font-family: PingFang SC;
    font-weight: bold;
    color: #000000;
    line-height: 40rpx;
    margin-bottom: 45rpx;
  }
  .express-box {
    width: 100%;
    .express {
      width: 100%;
      .pickerSelect {
        display: flex;
        .picker-express-Text {
          padding-left: 145rpx;
          font-size: 26rpx;
          font-family: PingFang SC;
          font-weight: 500;
          color: #000000;
          line-height: 40rpx;
        }
        .icon-arrow-right {
          transform: rotate(90deg);
          font-size: 22rpx;
        }
      }
    }
  }
  .waybill {
    padding-left: 149rpx;
    margin-top: 30rpx;
    text-align: left;
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
  }
  .remark-box {
    display: flex;
    margin-top: 50rpx;
    .remark-box-label {
      width: 130rpx;
      font-weight: bold;
    }
    .remark-textarea {
      height: 160rpx;
      background: #f5f5f5;
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      line-height: 40rpx;
      width: 460rpx;
    }
  }
  .sureDeliveryItem {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    text-align: left;
    &:not(:nth-last-child(1)) {
      padding-bottom: 20rpx;
    }
    .sureDeliveryLabel {
      font-size: 26rpx;
      font-weight: bold;
    }
  }
  .tips {
    font-size: 22rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #ff5e33;
    line-height: 32rpx;
    background: #fff7f5;
    padding: 22rpx 18rpx;
  }
  .first {
    margin-top: 40rpx;
  }
  .pick-row {
    display: flex;
    font-size: 26rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 40rpx;
    margin-top: 24rpx;
    .money {
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #ff5e33;
      line-height: 40rpx;
    }
  }
  .money-textarea {
    width: 100%;
    margin-top: 30rpx;
    height: 106rpx;
    background: #f5f5f5;
    padding: 20rpx;
  }
  .tips2 {
    font-size: 22rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #999999;
    line-height: 40rpx;
    margin-top: 20rpx;
  }
}
radio-group {
  label {
    flex: 1;
    font-size: 26rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 40rpx;
  }
  radio {
    transform: scale(0.7);
  }
  .radio-name {
    font-size: 30rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 40rpx;
  }
}
.mb-400 {
  margin-bottom: 200rpx;
}
.p-20 {
  padding: 0 20rpx;
}
.h200 {
  height: 200rpx;
}
</style>
