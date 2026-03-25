<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view class="wrapper">
      <view class="order-status">
        <view>
          <view>{{ statusFilter(info.OrderStatus, info.DeliveryMode) }}</view>
          <view v-if="info.OrderStatus == 5" class="order-tips">您已取消交易，还可以再逛逛哦</view>
          <view v-if="info.OrderStatus == 2 && (info.DeliveryMode == 0 || info.DeliveryMode == 3)" class="order-tips">
            稍等片刻，商家正在备货中...
          </view>
          <view v-if="info.OrderStatus == 3 && (info.DeliveryMode == 0 || info.DeliveryMode == 3)" class="order-tips">
            您的宝贝已发出，请注意联系客户查收哦〜
          </view>
          <view v-if="info.OrderStatus == 4 && (info.DeliveryMode == 0 || info.DeliveryMode == 3)" class="order-tips">
            本次交易已完成，欢迎下次光顾〜
          </view>
        </view>
      </view>
      <!-- 商家配送、快递配送订单 start -->
      <view v-if="info.DeliveryMode == 0 || info.DeliveryMode == 3">
        <view class="distribution-content">
          <view class="distribution-row">
            <text class="iconfont icondizhi"></text>
            <text class="distribution-name">{{ info.Receiver.Name }} {{ info.Receiver.Mobile }}</text>
          </view>
          <view class="city-detail">
            <text v-if="info.Receiver.ProvinceName !== null">{{ info.Receiver.ProvinceName }}</text>
            <text v-if="info.Receiver.CityName !== null">{{ info.Receiver.CityName }}</text>
            <text v-if="info.Receiver.TownName !== null">{{ info.Receiver.TownName }}</text>
            <text v-if="info.Receiver.Address !== null">{{ info.Receiver.Address }}</text>
          </view>
        </view>
      </view>
      <view
        v-if="(info.DeliveryMode == 0 || info.DeliveryMode == 3) && (info.OrderStatus == 3 || info.OrderStatus == 4)"
        class="mb-30"
      >
        <!-- 快递显示 start -->
        <view v-for="(item, index) in info.ExpressList" :key="index">
          <view class="express-info">
            <!-- 没有快递单号，是商家配送 -->
            <view v-if="!item.ExpressNumber" class="express-row flex flex-middle">
              <text class="iconfont icon-peisongguanliicon"></text>
              <text v-if="info.OrderStatus == 3" class="express-name">
                预计送达时间：{{ info.EstimatedDeliveryTime || '无' }}
              </text>

              <view v-if="info.OrderStatus == 4" class="flex flex-1 ub-pj flex-middle">
                <text class="express-name">商品已送达</text>
                <view v-if="info.DeliveryPics.length" class="photo-btn" @tap="handlePreview()">查看送达照片</view>
              </view>
            </view>
            <view v-else style="display: flex" class="express-row">
              <text class="iconfont iconwuliuguanli"></text>
              <text class="express-name">{{ item.ExpressCompany }} {{ item.ExpressNumber }}</text>
              <view class="order-btn--copy" @tap.stop="handleCopy(item.ExpressNumber)">复制</view>
            </view>
            <view class="express-time">
              {{ item.DeliveryTime || '' }}
            </view>
          </view>
        </view>
      </view>
      <!-- 配送订单 end -->
      <view class="order-product">
        <view class="order-product__store">
          <view class="iconfont iconfangwendianpu"></view>
          {{ info.StoreName }}
        </view>
        <view v-for="(product, indexT) in info.OrderItems" :key="indexT">
          <ProductCard :product="product" :is-show-price="true" class="mt-20"></ProductCard>
        </view>
      </view>
      <view class="order-panel">
        <view class="order__item">
          <view class="order__label">配送方式</view>
          <view v-if="info.DeliveryMode == 0" class="order__value">商家配送</view>
          <view v-if="info.DeliveryMode == 1" class="order__value">到店自提/免运费</view>
          <view v-if="info.DeliveryMode == 2" class="order__value">在线交易</view>
          <view v-if="info.DeliveryMode == 3" class="order__value">快递配送</view>
        </view>
      </view>
      <view class="order-panel">
        <view class="order__item">
          <view class="order__label">商品总额</view>
          <view class="order__value order__value--error">￥{{ info.NewTotalGoodsPrice | filterRmb }}</view>
        </view>
        <view v-if="info.MinusMoney" class="order__item">
          <view class="order__label">满额减金额</view>
          <view class="order__value order__value--error">-￥{{ info.MinusMoney | filterRmb }}</view>
        </view>
        <view v-if="info.DiscountAmount" class="order__item">
          <view class="order__label">优惠券</view>
          <view class="order__value order__value--error">-￥{{ info.DiscountAmount | filterRmb }}</view>
        </view>
        <view class="order__item">
          <view class="order__label">运费</view>
          <view class="order__value order__value--error">
            <text v-if="info.FreeShippingDiscountAmount" class="c-9">
              （满额包邮：-￥{{ info.FreeShippingDiscountAmount | filterRmb }}）
            </text>
            ￥{{ info.DeliveryFee | filterRmb }}
          </view>
        </view>
        <view class="order-amount">
          <view>合计实付：</view>
          <view class="order-amount__value">￥{{ (info.ActualAmount + info.DeliveryFee) | filterRmb }}</view>
        </view>
        <view v-if="info.SpreadIncome" class="order-amount" style="border: none">
          <view>退差额：</view>
          <view class="order-amount__value">-￥{{ info.SpreadIncome | filterRmb }}</view>
        </view>
      </view>
      <view class="order-panel">
        <view class="order__item">
          <view class="order__label">微信号</view>
          <view class="order__value">{{ info.WebChatNumber || '无' }}</view>
        </view>
        <view class="order__item">
          <view class="order__label">订单备注</view>
          <view class="order__value">{{ info.BuyerRemarks || '无' }}</view>
        </view>
      </view>
      <view class="order-panel">
        <view class="order__item is-start">
          <view class="order__label">订单编号</view>
          <view class="order__value">
            {{ info.OrderNumber }}
            <view class="order-btn--copy" @tap.stop="handleCopy(info.OrderNumber)">复制</view>
          </view>
        </view>
        <view class="order__item is-start">
          <view class="order__label">创建时间</view>
          <view class="order__value">{{ info.CreateOrderTime || '-' }}</view>
        </view>
        <view v-if="info.OrderStatus > 1 && info.OrderStatus !== 5" class="order__item is-start">
          <view class="order__label">付款时间</view>
          <view class="order__value">{{ info.PayOrderTime || '-' }}</view>
        </view>
        <view v-if="info.OrderStatus >= 3 && info.OrderStatus !== 5" class="order__item is-start">
          <view class="order__label">{{ info.DeliveryMode == 0 || info.DeliveryMode == 3 ? '发货' : '核销' }}时间</view>
          <view v-if="info.DeliveryMode == 0 || info.DeliveryMode == 3" class="order__value">
            {{ info.SendPackageTime || '-' }}
          </view>
          <view v-else class="order__value">{{ info.IsCheck ? info.CheckTime : '' }}</view>
        </view>
        <view v-if="info.OrderStatus == 4" class="order__item is-start">
          <view class="order__label">完成时间</view>
          <view class="order__value">{{ info.CompletedTime || '-' }}</view>
        </view>
        <view v-if="info.OrderStatus == 5" class="order__item is-start">
          <view class="order__label">取消时间</view>
          <view class="order__value">{{ info.CancelOrderTime || '-' }}</view>
        </view>
      </view>
      <view
        v-if="info.OrderStatus == 2 && info.DeliveryMode == 1 && (info.SpellStatus == -1 || info.SpellStatus == 1)"
        class="order-fixed"
      >
        <view v-if="BaseInfo.IsHandleCheck" class="order-fixed__btn" @tap="handleCheckOrder">核销发货</view>
        <view class="order-fixed__btn order-fixed__btn--primary" @tap="show = true">缺货退款</view>
      </view>
      <view
        v-if="info.OrderStatus == 2 && info.DeliveryMode == 0 && (info.SpellStatus == -1 || info.SpellStatus == 1)"
        class="order-fixed"
      >
        <view class="order-fixed__btn" @tap="showT = true">标记发货</view>
        <view class="order-fixed__btn order-fixed__btn--primary" @tap="show = true">缺货退款</view>
      </view>
      <view v-if="canConfirmDelivery" class="order-fixed">
        <view class="order-fixed__btn order-fixed__btn--primary" @tap="photoPopup.visible = true">确认送达</view>
      </view>
    </view>
    <u-modal
      ref="uModalT"
      v-model="showT"
      width="700"
      :show-cancel-button="true"
      :cancel-style="cancelStyle"
      :confirm-style="confirmStyle"
      :async-close="true"
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
        <view v-if="form.IsExpress === 1" class="express-box" style="align-items: flex-start">
          <view class="express">
            <view @click="showTimePicker = true">
              <view class="pickerSelect">
                <view class="picker-express-Text">
                  {{ form.EstimatedDeliveryTime ? form.EstimatedDeliveryTime : '请选择预计送达时间' }}
                </view>
                <view class="iconfont icon-arrow-right"></view>
              </view>
            </view>
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
      width="650"
      :show-cancel-button="true"
      :async-close="true"
      :cancel-style="cancelStyle"
      :confirm-style="confirmStyle"
      border-radius="50"
      title="缺货退款"
      @confirm="handleRefund"
    >
      <view class="slot-content">
        <view class="pick-box" style="padding: 0 30rpx">
          <view class="tips">确认退款后，款项将返回买家支付账户，请务必确认退款金额</view>
          <view class="pick-row first">处理方式：缺货退款</view>
          <view class="pick-row">
            <text style="width: 134rpx">支付金额：</text>
            <text class="money" style="flex: 1">
              商品总金额¥{{ info.ActualAmount }} - 退差额￥{{ info.SpreadIncome }} + 运费￥{{ info.DeliveryFee }}
            </text>
          </view>
          <view class="pick-row">
            <text style="width: 134rpx">退款金额：</text>
            <text class="money" style="flex: 1">
              ¥{{ (info.ActualAmount - info.SpreadIncome + info.DeliveryFee) | filterRmb }}
            </text>
          </view>
          <view class="tips2">订单中涉及到的优惠券、包邮卡将原路退回。</view>
        </view>
      </view>
    </u-modal>
    <u-picker v-model="showTimePicker" mode="time" :params="pickerParams" @confirm="timePickerConfirm" />
    <common-popup
      v-model="photoPopup.visible"
      type="confirm"
      title="上传送达凭证"
      class="table-popup"
      @confirm="handlePopupConfirm"
    >
      <view class="table-info">
        <upload
          v-model="photoPopup.fileList"
          item-style="width:120rpx;height:120rpx;border-radius: 10rpx;"
          :max-length="3"
          :multiple="true"
        />
        <view class="upload-tips">上传凭证，最多三张(可选)</view>
      </view>
    </common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import ProductCard from '@/components/product-card'
import { apiCloud } from '@/api/cloud-store'
import { filterRmb } from '@/filters'
import { statusFilter } from '@/mixins/calc-status.js'
import orderCommonMixin from './mixins'
import Upload from 'packages/components/upload/upload'
import { previewImage } from 'packages/utils'

export default {
  components: {
    ProductCard,
    Upload
  },
  filters: { filterRmb },
  mixins: [statusFilter, orderCommonMixin],
  data() {
    return {
      // 允许onShow调用
      allowOnShow: true,
      photoPopup: {
        visible: false,
        fileList: []
      },
      isLoading: false,
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
      show: false,
      showT: false,
      scene: 0, // 场景值
      BaseInfo: {},
      CkeckType: 0, // 0：不需要扫产品条码进行核销， 1：需要扫产品条码进行核销
      IsGoodsCheckOrder: 1, // 是否商品核销码订单(订单商品是否具体单独核销码)0-否1-是
      ExpressGoodsTypeList: [],
      info: {
        NewTotalGoodsPrice: 0,
        OrderStatus: 0,
        ReceiverName: '',
        ReceiverMobile: '',
        CheckCode: '',
        StoreName: '',
        OrderItems: [],
        DeliveryMode: 0,
        ActualAmount: 0,
        DeliveryFee: '',
        FreeShippingDiscountAmount: 0,
        WebChatNumber: '',
        BuyerRemarks: '',
        OrderNumber: '',
        CurrentTime: '',
        CreateOrderTime: '',
        PayOrderTime: '',
        CheckTime: '',
        CompletedTime: '',
        CancelOrderTime: '',
        TotalCount: '',
        TotalWeight: '',
        Receiver: {},
        ExpressList: [],
        SubCategory: 0,
        EstimatedDeliveryTime: '', // 预计送达时间
        DeliveryPics: []
      },
      orderNumber: ''
    }
  },
  computed: {
    canConfirmDelivery() {
      return (
        // 待收货，商家配送，送货上门
        this.info.OrderStatus === 3 &&
        this.info.DeliveryMode === 0 &&
        this.info.ExpressList &&
        !this.info.ExpressList[0].ExpressNumber
      )
    }
  },
  onLoad(option) {
    const obj = uni.getLaunchOptionsSync()
    this.scene = obj.scene || 0
    this.orderNumber = option.orderNumber
  },
  onShow() {
    if (!this.photoPopup.visible) {
      this.getData()
      this.getExpress()
    }
  },
  methods: {
    handlePreview() {
      if (!this.info.DeliveryPics.length) {
        return this.msg('暂无送达照片')
      }
      previewImage({ current: this.info.DeliveryPics[0], urls: this.info.DeliveryPics })
    },
    handlePopupConfirm() {
      if (this.photoPopup.fileList.length === 0) {
        return this.$msg('请上传凭证')
      }
      this.photoPopup.visible = false
      const data = {
        OrderNo: this.orderNumber,
        DeliveryPics: this.photoPopup.fileList
      }
      apiCloud({
        url: '/api/v1/Order/UploadDeliveryPic',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('上传成功', { icon: 'success' })
          setTimeout(() => {
            this.getData()
          }, 800)
        }
      })
    },
    // 复制
    handleCopy(text) {
      uni.setClipboardData({
        data: text
      })
    },
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
    // 核销发货
    async handleCheckOrder() {
      if (this.IsGoodsCheckOrder) {
        // 是否需要扫产品条码进行核销
        let codeRes = await apiCloud({
          url: '/api/v1/BaseSet/GetGeneralInfo',
          method: 'get',
          data: JSON.stringify({})
        })
        this.CkeckType = codeRes.return_data.CkeckType || 0
        uni.navigateTo({
          url: `/pages/write-off/scan-code?orderNumber=${this.info.OrderNumber}&CkeckType=${this.CkeckType}`
        })
      } else {
        let data = {
          CheckCode: this.info.CheckCode, // 核销码
          OrderNumber: this.info.OrderNumber // 订单号
        }
        apiCloud({
          // 进行核销
          url: '/api/v1/Order/CheckOrder',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (this.$ck(res)) {
            this.$msg('核销成功', { icon: 'success' })
            setTimeout(() => {
              this.getData()
            }, 800)
          }
        })
      }
    },
    // 缺货退款-确认的回调
    handleRefund() {
      this.$refs.uModal.clearLoading()
      let data = {
        OrderNumber: this.info.OrderNumber,
        ActualAmount: (this.info.ActualAmount + this.info.DeliveryFee - this.info.SpreadIncome).toFixed(2)
      }
      apiCloud({
        url: '/api/v1/Order/RefundOrder',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.show = false
          this.$msg('退款成功', { icon: 'success' })
          setTimeout(() => {
            this.getData()
          }, 2000)
        }
      })
    },
    // 标记发货-确认的回调
    handleDelivery() {
      this.$refs.uModalT.clearLoading()
      if (!/^[0-9a-zA-Z]+$/.test(this.form.ExpressNumber) && this.form.IsExpress === 0) {
        return this.$msg('请输入合法的订单号')
      }
      let data = JSON.parse(JSON.stringify(this.form))
      data.OrderTradeNo = this.orderNumber
      data.TotalWeight = this.info.TotalWeight
      data.TotalCount = this.info.TotalCount
      data.IsAfterSaleType = 0
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
          this.showT = false
          this.$msg('操作成功', { icon: 'success' })
          this.form = {
            IsExpress: 0,
            ExpressCompany: '',
            ExpressCode: '',
            ExpressNumber: '',
            Remarks: '',
            EstimatedDeliveryTime: ''
          }
          setTimeout(() => {
            this.getData()
          }, 1000)
        }
      })
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
    },
    async getData() {
      try {
        this.isLoading = false
        this.$loading.show()
        const res = await apiCloud({
          url: '/api/v1/Order/OrderDetail',
          method: 'get',
          data: JSON.stringify({ orderNumber: this.orderNumber, Source: this.scene || 0 })
        })
        if (res.return_code === 0) {
          const returnData = res.return_data
          this.info.NewTotalGoodsPrice = returnData.NewTotalGoodsPrice || 0
          this.info.OrderStatus = returnData.OrderStatus || 0
          this.info.ReceiverName = returnData.ReceiverName || ''
          this.info.Receiver = returnData.Receiver
          this.info.ReceiverMobile = returnData.ReceiverMobile || ''
          this.info.CheckCode = returnData.CheckCode || ''
          this.info.StoreName = returnData.StoreName || ''
          this.info.OrderItems = returnData.OrderItems || []
          this.info.DeliveryMode = returnData.DeliveryMode || 0
          this.info.ActualAmount = returnData.ActualAmount || 0
          this.info.DeliveryFee = returnData.DeliveryFee || 0
          this.info.FreeShippingDiscountAmount = returnData.FreeShippingDiscountAmount || 0
          this.info.WebChatNumber = returnData.WebChatNumber || ''
          this.info.BuyerRemarks = returnData.BuyerRemarks || ''
          this.info.OrderNumber = returnData.OrderNumber || ''
          this.info.CreateOrderTime = returnData.CreateOrderTime || ''
          this.info.CurrentTime = returnData.CurrentTime || ''
          this.info.PayOrderTime = returnData.PayOrderTime || ''
          this.info.CheckTime = returnData.CheckTime || ''
          this.info.CompletedTime = returnData.CompletedTime || ''
          this.info.CancelOrderTime = returnData.CancelOrderTime || ''
          this.info.DiscountAmount = returnData.DiscountAmount || 0
          this.info.MinusMoney = returnData.MinusMoney || 0
          this.IsGoodsCheckOrder = returnData.IsGoodsCheckOrder || 1
          this.info.TotalCount = returnData.TotalCount
          this.info.IsCheck = returnData.IsCheck
          this.info.TotalWeight = returnData.TotalWeight
          this.info.ExpressList = returnData.ExpressList
          this.info.SendPackageTime = returnData.SendPackageTime
          this.info.SpellStatus = returnData.SpellStatus
          this.info.SpreadIncome = returnData.SpreadIncome
          this.info.SubCategory = returnData.SubCategory // 订单分类
          this.info.EstimatedDeliveryTime = returnData.EstimatedDeliveryTime
          this.info.DeliveryPics = returnData.DeliveryPics || []
          if (this.info.OrderStatus !== 1 && this.info.OrderStatus !== 5) {
            let BaseInfo = await apiCloud({
              url: '/api/v1/BaseSet/GetGeneralInfo',
              method: 'get',
              data: JSON.stringify({})
            })
            this.BaseInfo = BaseInfo.return_data
          }
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
        this.$loading.hide()
        this.isLoading = true
      }
    }
  }
}
</script>

<style lang="scss">
.u-model__footer.data-v-713d0fd3 {
  padding: 30rpx 20rpx 30rpx !important;
}
</style>
<style lang="scss" scoped>
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
.container {
  background-color: #f7f7f7;
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
      background-color: var(--theme-color, $uni-color-primary);
      z-index: -1;
    }
  }
}
.order-panel {
  margin-top: 30rpx;
  padding: 15rpx 30rpx;
  background-color: #fff;
  .order__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 15rpx;
    padding-bottom: 15rpx;
    &.is-start {
      justify-content: flex-start;
    }
    .order__label {
      font-size: 26rpx;
      color: #666;
    }
    .order__value {
      display: flex;
      margin-left: 30rpx;
      font-size: 26rpx;
      color: #000;
      &.order__value--error {
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
}
.order-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  font-size: 32rpx;
  color: #fff;
}
.order-product {
  padding: 30rpx;
  background-color: #fff;
  .order-product__store {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;
    font-size: 26rpx;
    color: #333;
    .iconfangwendianpu {
      margin-right: 20rpx;
      font-size: 23rpx;
    }
  }
}
.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  margin-top: 15rpx;
  margin-bottom: 15rpx;
  padding-top: 30rpx;
  border-top: 1rpx solid #eee;
  font-size: 24rpx;
  .order-amount__value {
    line-height: 1;
    font-size: 32rpx;
    color: var(--theme-color, $uni-color-primary);
  }
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
      border: 1rpx solid var(--theme-color, $uni-color-primary);
      background-color: var(--theme-color, $uni-color-primary);
      color: #fff;
    }
  }
  .order-fixed__btn + .order-fixed__btn {
    margin-left: 30rpx;
  }
}
.distribution-content {
  position: relative;
  z-index: 100;
  background: #fff;
  border-radius: 10rpx;
  padding: 20rpx 19rpx;
  .distribution-row {
    .icondizhi {
      margin-right: 16rpx;
    }
    .distribution-name {
      font-size: 30rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #000000;
      line-height: 40rpx;
    }
  }
  .city-detail {
    margin-top: 19rpx;
    font-size: 26rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #666666;
    line-height: 40rpx;
    padding-left: 40rpx;
    width: 618rpx;
  }
}
.express-info {
  background-color: #fff;
  padding: 30rpx;
  margin-top: 30rpx;
  .express-row {
    .iconfont {
      font-size: 26rpx;
      margin-right: 10rpx;
    }
    .express-name {
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: bold;
      color: #000000;
      line-height: 40rpx;
    }
    .photo-btn {
      border: 2rpx solid #ff5e33;
      color: #ff5e33;
      font-size: 24rpx;
      padding: 12rpx;
      border-radius: 30rpx;
    }
  }
  .express-time {
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #999999;
    line-height: 40rpx;
    padding-left: 38rpx;
  }
}
.order-tips {
  font-size: 26rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #ffffff;
  line-height: 40rpx;
}
.pick-box {
  margin: 55rpx 0;
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
          font-size: 22rpx;
          transform: rotate(90deg);
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
      border: 1px solid #eee;
      border-radius: 8rpx;
    }
  }
  .remark-box {
    display: flex;
    margin-top: 50rpx;
    .remark-box-label {
      width: 200rpx;
      font-weight: bold;
    }
    .remark-textarea {
      box-sizing: border-box;
      padding: 12px;
      height: 160rpx;
      background: #f5f5f5;
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      line-height: 40rpx;
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
.upload-tips {
  font-size: 22rpx;
  color: #aaa;
  margin-bottom: -30rpx;
  margin-top: 30rpx;
}
</style>
