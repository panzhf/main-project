<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <!-- tab栏 -->
      <tab
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="currentTab"
        :active-bag-color="themeInfo.color"
        @change="handleUpdate"
      ></tab>
      <!-- 二级tab栏 -->
      <Tabs :tabs.sync="tabs2" :value.sync="currentTab2" @handleTabChange="handleTabChange"></Tabs>
      <view
        v-for="(item, index) in list"
        :key="index"
        class="order-item"
        @tap="handleOpenDetail('./order-detail?afterSalesTradeNo=' + item.AfterSalesTradeNo)"
      >
        <view class="order-header">
          <view class="order-header__left">
            <view v-if="item.DeliveryMode === 1" class="order-tag">自提</view>
            <view v-if="item.DeliveryMode === 0 || item.DeliveryMode === 3" class="order-tag">配送</view>
            <view class="order-no">服务单号：{{ item.AfterSalesTradeNo }}</view>
            <view class="order-btn--copy" @tap.stop="handleCopy(item.AfterSalesTradeNo)">复制</view>
          </view>
          <view :class="[item.Status !== 3 && item.Status !== 4 ? 'order-status is-active' : 'order-status']">
            <view>{{ saleOrderState(item.Status) }}</view>
          </view>
        </view>
        <view class="order-body">
          <view v-for="(product, indexT) in item.OrderItems" :key="indexT" style="background-color: #f9f9f9">
            <ProductCard
              :product="product"
              :is-actual-amount="true"
              :is-position-change="true"
              class="mt-10"
            ></ProductCard>
          </view>
        </view>
        <view class="order-footer">
          <view class="order-total">
            <view class="order-count">共{{ item.OrderItems.length }}件商品</view>
            <view class="order-amount">
              <view class="order-amount__label">实付：</view>
              <view class="order-amount__value">￥{{ (item.ActualAmount + item.DeliveryFee) | filterRmb }}</view>
            </view>
          </view>
          <view class="order-receiver">
            提货人：{{ item.ReceiverName }}
            <view class="order-receiver__mobile">{{ item.ReceiverMobile }}</view>
          </view>
          <view class="order-action">
            <!-- 售后为0未发货退款 并且售后处理状态不为4 已完成 -->
            <view
              v-if="item.ApplyWay == 0 && item.Status != 4 && item.Status != 3 && item.DeliveryMode != 3"
              class="order-action__btn is-primary ml"
              @tap.stop="handleSendOrder(item)"
            >
              标记发货
            </view>
            <!-- 售后为0未发货退款 并且售后处理状态为1 待审核 -->
            <view
              v-if="item.Status == 1 && item.DeliveryMode != 3"
              class="order-action__btn is-primary ml"
              @tap.stop="handleRefundOrder(item)"
            >
              直接退款
            </view>
            <!-- 售后为2退货退款 并且售后处理状态为1 待审核 -->
            <view
              v-if="item.ApplyWay == 2 && item.Status == 1 && item.DeliveryMode != 3"
              class="order-action__btn is-primary ml"
              @tap.stop="handleNeedSales(item)"
            >
              需要退货
            </view>
            <!-- 售后为2退货退款 并且售后处理状态为2 处理中 -->
            <view
              v-if="item.ApplyWay == 2 && item.Status == 2 && item.DeliveryMode != 3"
              class="order-action__btn is-primary ml"
              @tap.stop="handleAffirmSales(item)"
            >
              确认收货并退款
            </view>
          </view>
        </view>
      </view>
      <view v-if="list.length === 0 && !loading" class="vh-80 flex flex-column flex-middle flex-center">
        <none-data :icon="noneIcon" msg="暂无订单~" icon-width="256" icon-height="190" />
      </view>
    </view>
    <u-modal
      ref="uModalT"
      v-model="showT"
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
      width="650"
      :show-cancel-button="true"
      :cancel-style="cancelStyle"
      :confirm-style="confirmStyle"
      border-radius="50"
      :async-close="true"
      title="直接退款"
      @confirm="handleRefund"
    >
      <view class="pick-box" style="padding: 0 30rpx">
        <view class="tips">确认退款后，款项将返回买家支付账户，请务必确认退款金额</view>
        <view class="pick-row first">处理方式：{{ DialogTips }}</view>
        <view class="pick-row">
          <text style="width: 140rpx">支付金额：</text>
          商品总金额¥{{ itemData.ActualAmount }} - 退差额￥{{ itemData.SpreadIncome }} +运费¥{{ itemData.DeliveryFee }}
        </view>
        <view class="pick-row">
          <text style="width: 140rpx">申请金额：</text>
          <text class="money">
            商品总金额 ¥{{ itemData.ActualAmount }}
            <text>-退差额 ￥{{ itemData.SpreadIncome }}</text>
            <text>+运费 ¥{{ itemData.DeliveryFee }}</text>
          </text>
        </view>
        <view v-if="itemData.ApplyWay == 2" class="pick-textarea">
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
import Tab from '@/components/tab/index.vue'
import Tabs from '@/components/tab/tabs.vue'
import ProductCard from '@/components/product-card'
import { apiCloud } from '@/api/cloud-store'
import { statusFilter } from '@/mixins/calc-status.js'
import { staticURL } from '@/config'
import { filterRmb } from '@/filters'
export default {
  components: {
    Tab,
    Tabs,
    ProductCard
  },
  filters: { filterRmb },
  mixins: [statusFilter],
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
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
        backgroundColor: 'var(--theme-color)',
        fontWeight: '700',
        transform: 'scale(1)',
        transition: 'transform .1s',
        borderRadius: '40rpx',
        margin: '30rpx 15rpx 30rpx 0'
      },
      itemDataT: {},
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
      tabData: ['门店售后', '总部直营售后'],
      DialogTips: '仅退款',
      loading: false,
      ExpressGoodsTypeList: [],
      activiyTab: ['门店售后', '总部直营售后'],
      currentTab: 0,
      tabs2: [
        {
          value: -1,
          label: '全部'
        },
        {
          value: 0,
          label: '仅退款'
        },
        {
          value: 2,
          label: '退货退款'
        }
      ],
      currentTab2: -1,
      page: {
        index: 1,
        size: 20,
        total: 0
      },
      list: [],
      form: {
        IsExpress: 0,
        ExpressCompany: '',
        ExpressCode: '',
        ExpressNumber: '',
        Remarks: ''
      },
      show: false,
      itemData: {},
      money: ''
    }
  },
  computed: {
    refundMoney() {
      return `输入退款金额，最多¥${(
        this.itemData.ActualAmount +
        this.itemData.DeliveryFee -
        this.itemData.SpreadIncome
      ).toFixed(2)}元`
    }
  },
  async onShow() {
    await this.getOrderList(1, this.page.size)
    await this.getExpress()
  },
  onReachBottom() {
    // 上拉加载
    if (this.page.total > 0 && this.page.total > this.page.index) {
      this.getOrderList(this.page.index + 1, this.page.size)
    }
  },
  methods: {
    // 顶部tab切换
    handleUpdate() {
      this.currentTab2 = -1
      this.getOrderList(1, this.page.size)
    },
    // 二级tab栏切换
    handleTabChange(e) {
      if (this.currentTab2 === e) return
      this.currentTab2 = e
      this.getOrderList(1, this.page.size)
    },
    handleOpenDetail(t) {
      // 打开订单详情
      uni.navigateTo({
        url: t
      })
    },
    handleCopy(text) {
      // 复制文本
      uni.setClipboardData({
        data: text
      })
    },
    // 物流公司下拉框的回调
    handelGoodsType(e) {
      let index = e.detail.value - 0
      this.form.ExpressCode = this.ExpressGoodsTypeList[index].Code
      this.form.ExpressCompany = this.ExpressGoodsTypeList[index].Name
    },
    // 选择任意单选框时触发的回调
    handRadioGroupChange(e) {
      e === '快递配送' ? (this.form.IsExpress = 0) : (this.form.IsExpress = 1)
    },
    // 标记发货
    handleSendOrder(item) {
      this.itemDataT = item
      this.showT = true
    },
    // 标记发货-确认的回调
    handleDelivery() {
      this.$refs.uModalT.clearLoading()
      if (!this.form.ExpressCompany && this.form.IsExpress === 0) return this.$msg('请输入物流公司名称')
      if (!/^[0-9a-zA-Z]+$/.test(this.form.ExpressNumber) && this.form.IsExpress === 0) {
        return this.$msg('请输入合法的订单号')
      }
      let data = JSON.parse(JSON.stringify(this.form))
      data.OrderTradeNo = this.itemDataT.OrderNumber
      data.TotalWeight = this.itemDataT.TotalWeight
      data.TotalCount = this.itemDataT.TotalCount
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
          this.$msg('操作成功', { icon: 'success' })
          this.showT = false
          this.form = {
            IsExpress: 0,
            ExpressCompany: '',
            ExpressCode: '',
            ExpressNumber: '',
            Remarks: ''
          }
          setTimeout(() => {
            this.getOrderList(1, this.page.size)
          }, 1000)
        }
      })
    },
    /** 确认收货并退款 */
    handleAffirmSales(item) {
      this.itemData = item
      this.DialogTips = '退货退款'
      this.show = true
    },
    /** 直接退款 */
    handleRefundOrder(item) {
      this.itemData = item
      this.DialogTips = '仅退款'
      this.show = true
    },
    // 直接退款-确认的回调
    handleRefund() {
      this.$refs.uModal.clearLoading()
      if (this.DialogTips === '仅退款') {
        if (this.itemData.ApplyWay === 2) {
          let money = Number(this.money)
          if (!money) return this.$msg('请输入退款金额')
          let maxMoney = (this.itemData.ActualAmount + this.itemData.DeliveryFee - this.itemData.SpreadIncome).toFixed(
            2
          )
          if (maxMoney < money) {
            return this.$msg('退款金额不能大于实付金额')
          }
        }
        let data = {
          ActualRefundAmount: this.itemData.ActualAmount,
          OrderTradeNo: this.itemData.OrderNumber
        }
        if (this.itemData.ApplyWay === 2) {
          data.ActualRefundAmount = this.money
        } else {
          data.ActualRefundAmount = (
            this.itemData.ActualAmount +
            this.itemData.DeliveryFee -
            this.itemData.SpreadIncome
          ).toFixed(2)
        }
        apiCloud({
          url: '/api/v1/AfterSales/AuditOrderOnlyRefund',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          if (this.$ck(res)) {
            this.$msg('退款成功，若订单包含已抵扣的购物券将退回原账户！')
            this.show = false
            this.getOrderList(1, this.page.size)
            this.money = ''
          }
        })
      } else {
        let money = Number(this.money)
        if (!money) return this.$msg('请输入退款金额')
        let maxMoney = (this.itemData.ActualAmount + this.itemData.DeliveryFee - this.itemData.SpreadIncome).toFixed(2)
        if (maxMoney < money) {
          return this.$msg('退款金额不能大于实付金额')
        }
        let data = {
          OrderTradeNo: this.itemData.OrderNumber,
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
            this.getOrderList(1, this.page.size)
            this.money = ''
          }
        })
      }
    },
    // 需要退货
    handleNeedSales(item) {
      let data = {
        OrderTradeNo: item.OrderNumber
      }
      apiCloud({
        url: '/api/v1/AfterSales/AuditOrderReturnPackage',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (res.return_code === 0) {
          this.$msg('操作成功')
          this.getOrderList(1, this.page.size)
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
    getOrderList(pageIndex, pageSize) {
      return new Promise((resolve, reject) => {
        this.loading = true
        let data = {
          ApplyWay: this.currentTab2,
          Status: 0,
          OrderType: this.currentTab === 0 ? 1 : 2,
          PageIndex: pageIndex,
          PageSize: pageSize
        }
        apiCloud({
          url: '/api/v1/AfterSales/OrderList',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          this.loading = false
          if (this.$ck(res)) {
            resolve()
            this.page.index = pageIndex
            this.page.size = pageSize
            this.page.total = Math.ceil(res.return_data.TotalCount / pageSize)
            if (pageIndex === 1) {
              this.list = res.return_data.Results || []
            } else {
              this.list = this.list.concat(res.return_data.Results || [])
            }
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-item {
  margin-top: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 26rpx;
    border-bottom: 1rpx solid #eee;
    .order-header__left {
      display: flex;
      align-items: center;
      .order-tag {
        margin-right: 12rpx;
        padding: 4rpx 10rpx;
        background-color: var(--theme-color, $uni-color-primary);
        border-radius: 10rpx 0 10rpx 0;
        font-size: 20rpx;
        color: #fff;
      }
      .order-no {
        font-size: 24rpx;
        color: #999;
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
    }
    .order-status {
      font-weight: bold;
      font-size: 26rpx;
      &.is-active {
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
  .order-body {
    margin-top: 20rpx;
    .order-product {
      display: flex;
      background-color: #f9f9f9;
      .order-product__image {
        width: 170rpx;
        height: 170rpx;
      }
      .order-product__info {
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 16rpx;
        box-sizing: border-box;
        .order-product__name {
          flex: 1;
          line-height: 30rpx;
          font-size: 30rpx;
          color: #000;
        }
        .order-product__info__bottom {
          display: flex;
          justify-content: space-between;
          .order-product__price {
            font-size: 26rpx;
            color: var(--theme-color, $uni-color-primary);
          }
          .order-product__count {
            font-size: 24rpx;
            color: #333;
          }
        }
      }
    }
    .order-product + .order-product {
      margin-top: 10rpx;
    }
  }
  .order-footer {
    margin-top: 30rpx;
    .order-total {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      .order-count {
        font-size: 24rpx;
        color: #444;
      }
      .order-amount {
        display: flex;
        align-items: flex-end;
        margin-left: 30rpx;
        .order-amount__label {
          font-size: 24rpx;
          color: #444;
        }
        .order-amount__value {
          line-height: 1;
          font-size: 32rpx;
          color: var(--theme-color, $uni-color-primary);
        }
      }
    }
    .order-receiver {
      display: flex;
      justify-content: flex-end;
      align-items: flex-end;
      margin-top: 20rpx;
      font-size: 24rpx;
      color: #444;
      .order-receiver__mobile {
        margin-left: 20rpx;
      }
    }
    .order-action {
      display: flex;
      justify-content: flex-end;
      margin-top: 30rpx;
      .order-action__btn {
        padding: 12rpx 24rpx;
        min-width: 150rpx;
        box-sizing: border-box;
        border-radius: 28rpx;
        border: 1rpx solid var(--theme-color, $uni-color-primary);
        font-size: 26rpx;
        font-weight: bold;
        color: var(--theme-color, $uni-color-primary);
        &.is-primary {
          background-color: var(--theme-color, $uni-color-primary);
          color: #fff;
        }
      }
    }
  }
}
.ml {
  margin-left: 20rpx;
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
      width: 100%;
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
      color: var(--theme-color, $uni-color-primary);
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
.tab-sticky {
  border-bottom: 4rpx solid #f7f7f7;
}
.tab-container .tab-item._9d57d6e::after {
  width: 90% !important;
}
.tab-sticky2 {
  position: fixed;
  top: 105rpx;
  left: 0;
  width: 100%;
}
</style>
