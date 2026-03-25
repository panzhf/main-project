<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <tab
        :tab="tabData"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="currentTopTab"
        :active-bag-color="themeInfo.color"
        @change="handleUpdate"
      ></tab>
      <view class="tab-container">
        <u-tabs
          :active-color="themeInfo.color"
          :list="tabs"
          font-size="26"
          height="70"
          :current="currentTab"
          :show-bar="false"
          @change="handleTabChange"
        ></u-tabs>
      </view>
      <view style="margin: 30rpx 20rpx">
        <Search placeholder="请输入订单号" :value="searchText" @handleSearch="handleSearch"></Search>
      </view>
      <view
        v-for="(item, index) in list"
        :key="index"
        class="order-item"
        @tap="handleOpenDetail('./detail?orderNumber=' + item.OrderNumber)"
      >
        <view class="order-header">
          <view class="order-header__left">
            <view v-if="item.DeliveryMode === 1" class="order-tag">自提</view>
            <view v-if="item.DeliveryMode === 0" class="order-tag">配送</view>
            <view class="order-no">订单号：{{ item.OrderNumber }}</view>
            <view class="order-btn--copy" @tap.stop="handleCopy(item.OrderNumber)">复制</view>
          </view>
          <view :class="item.OrderStatus !== 4 && item.OrderStatus !== 6 ? 'order-status is-active' : 'order-status'">
            <view>{{ statusFilter(item.OrderStatus, item.DeliveryMode) }}</view>
          </view>
        </view>
        <view class="order-body">
          <view v-for="(product, indexT) in item.OrderItems" :key="indexT" style="background-color: #f9f9f9">
            <ProductCard :product="product" class="mt-10" :is-show-card-price="false"></ProductCard>
          </view>
        </view>
        <view class="order-footer">
          <view class="order-total">
            <view class="order-count">共{{ item.TotalCount }}件商品</view>
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
            <view
              v-if="item.OrderStatus == 2 && (item.SpellStatus == -1 || item.SpellStatus == 1) && currentTopTab == 0"
              class="order-action__btn is-primary ml"
              @tap.stop="handleRefundOrder(item)"
            >
              缺货退款
            </view>
            <view
              v-if="
                item.OrderStatus == 2 &&
                item.DeliveryMode == 0 &&
                (item.SpellStatus == -1 || item.SpellStatus == 1) &&
                currentTopTab == 0
              "
              class="order-action__btn is-primary ml"
              @tap.stop="handleSendOrder(item)"
            >
              标记发货
            </view>
          </view>
        </view>
      </view>
      <view v-if="list.length === 0 && !loading" class="vh-60 flex flex-column flex-middle flex-center">
        <none-data :icon="noneIcon" msg="暂无订单~" icon-width="256" icon-height="190" />
      </view>
    </view>
    <u-modal
      ref="uModalT"
      v-model="showT"
      z-index="9999"
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
      z-index="9999"
      width="650"
      :show-cancel-button="true"
      :async-close="true"
      title="缺货退款"
      :cancel-style="cancelStyle"
      :confirm-style="confirmStyle"
      border-radius="50"
      @confirm="handleRefund"
    >
      <view class="slot-content">
        <view class="pick-box" style="padding: 0 30rpx">
          <view class="tips">确认退款后，款项将返回买家支付账户，请务必确认退款金额</view>
          <view class="pick-row first">处理方式：缺货退款</view>
          <view class="pick-row">
            <text style="width: 134rpx">支付金额：</text>
            <text class="money">
              商品总金额¥{{ itemData.ActualAmount }} - 退差额￥{{ itemData.SpreadIncome }} + 运费￥{{
                itemData.DeliveryFee
              }}
            </text>
          </view>
          <view class="pick-row">
            <text style="width: 134rpx">退款金额：</text>
            <text class="money">
              ¥{{ (itemData.ActualAmount - itemData.SpreadIncome + itemData.DeliveryFee) | filterRmb }}
            </text>
          </view>
          <view class="tips2">订单中涉及到的优惠券、包邮卡将原路退回。</view>
        </view>
      </view>
    </u-modal>
    <u-picker v-model="showTimePicker" mode="time" :params="pickerParams" @confirm="timePickerConfirm" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import Tab from '@/components/tab/index.vue'
import Search from '@/components/search'
import ProductCard from '@/components/product-card'
import { apiCloud } from '@/api/cloud-store'
import { filterRmb } from '@/filters'
import { statusFilter } from '@/mixins/calc-status.js'
import { staticURL } from '@/config'
import orderCommonMixin from './mixins'
export default {
  components: {
    Tab,
    Search,
    ProductCard
  },
  filters: { filterRmb },
  mixins: [statusFilter, orderCommonMixin],
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
      tabData: ['门店订单', '总部直营订单'],
      itemData: {},
      itemDataT: {},
      searchText: '',
      loading: false,
      ExpressGoodsTypeList: [],
      tabs: [
        {
          name: '全部',
          count: 0
        },
        {
          name: '待付款',
          count: 0
        },
        {
          name: '待核销',
          count: 0
        },
        {
          name: '待发货',
          count: 0
        },
        {
          name: '待收货',
          count: 0
        },
        {
          name: '已完成',
          count: 0
        },
        {
          name: '已退款',
          count: 0
        }
      ],
      currentTab: 0,
      currentTabT: 0,
      currentTopTab: 0,
      page: {
        index: 1,
        size: 20,
        total: 0
      },
      list: []
    }
  },
  async onShow() {
    if (this.currentTopTab === 0) {
      await this.getOrderList(this.page.index, this.page.size)
    } else if (this.currentTopTab === 1) {
      await this.getDirectlyOrderList(this.page.index, this.page.size)
    }
    const res = await apiCloud({
      url: '/api/v1/AfterSales/GetStoreOrderCount',
      method: 'get',
      data: JSON.stringify({})
    })
    if (this.$ck(res)) {
      this.tabs.forEach(item => {
        if (item.name === '待发货') {
          item.count = res.return_data.WaitDeliverExpressTotal
        }
        if (item.name === '待收货') {
          item.count = res.return_data.WaitReceiptExpressTotal
        }
        if (item.name === '待核销') {
          item.count = res.return_data.WaitChickTotal
        }
      })
    }
    await this.getExpress()
  },
  onReachBottom() {
    // 上拉加载
    if (this.page.total > 0 && this.page.total > this.page.index && this.currentTopTab === 0) {
      this.getOrderList(this.page.index + 1, this.page.size)
    } else if (this.page.total > 0 && this.page.total > this.page.index && this.currentTopTab === 1) {
      this.getDirectlyOrderList(this.page.index + 1, this.page.size)
    }
  },
  methods: {
    // 顶部tab栏切换
    handleUpdate() {
      this.currentTab = 0
      this.currentTabT = 0
      const obj = {
        name: '待核销',
        count: 0
      }
      this.searchText = ''
      if (this.currentTopTab === 0) {
        this.tabs.splice(2, 0, obj)
        this.getOrderList(1, this.page.size)
      } else if (this.currentTopTab === 1) {
        this.tabs.splice(2, 1)
        this.getDirectlyOrderList(1, this.page.size)
      }
    },
    // 二级tab菜单切换
    handleTabChange(index) {
      this.currentTab = index
      switch (this.tabs[index].name) {
        case '全部':
          this.currentTabT = 0
          break
        case '待付款':
          this.currentTabT = 1
          break
        case '待核销':
          this.currentTabT = 2
          break
        case '待发货':
          this.currentTabT = 8
          break
        case '待收货':
          this.currentTabT = 3
          break
        case '已完成':
          this.currentTabT = 4
          break
        case '已退款':
          this.currentTabT = 6
          break
      }
      if (this.currentTopTab === 0) {
        this.getOrderList(1, this.page.size)
      } else if (this.currentTopTab === 1) {
        this.getDirectlyOrderList(1, this.page.size)
      }
    },
    // 搜索的回调
    handleSearch(val) {
      this.searchText = val
      if (this.currentTopTab === 0) {
        this.getOrderList(1, this.page.size)
      } else if (this.currentTopTab === 1) {
        this.getDirectlyOrderList(1, this.page.size)
      }
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
            Remarks: '',
            EstimatedDeliveryTime: ''
          }
          setTimeout(() => {
            this.getOrderList(1, this.page.size)
          }, 2000)
        }
      })
    },
    // 缺货退款
    handleRefundOrder(item) {
      this.itemData = item
      this.show = true
    },
    // 缺货退款-确认的回调
    handleRefund() {
      this.$refs.uModal.clearLoading()
      let data = {
        OrderNumber: this.itemData.OrderNumber,
        ActualAmount: (this.itemData.ActualAmount + this.itemData.DeliveryFee - this.itemData.SpreadIncome).toFixed(2)
      }
      apiCloud({
        url: '/api/v1/Order/RefundOrder',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('退款成功！', { icon: 'success' })
          this.show = false
          setTimeout(() => {
            this.getOrderList(1, this.page.size)
          }, 2000)
        }
      })
    },
    getExpress() {
      apiCloud({
        url: '/api/v1/AfterSales/GetExpressCompanyList',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          this.ExpressGoodsTypeList = res.return_data
        }
      })
    },
    // 获取门店订单列表
    getOrderList(pageIndex, pageSize) {
      return new Promise((resolve, reject) => {
        this.loading = true
        let data = {
          OrderStatus: this.currentTabT > 0 ? [this.currentTabT] : [],
          PageIndex: pageIndex,
          PageSize: pageSize,
          OrderNumber: this.searchText
        }
        apiCloud({
          url: '/api/v1/Order/OrderList',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          this.loading = false
          if (this.$ck(res)) {
            resolve(res)
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
    },
    // 获取直营订单列表
    getDirectlyOrderList(pageIndex, pageSize) {
      return new Promise((resolve, reject) => {
        this.loading = true
        let data = {
          OrderStatus: this.currentTabT > 0 ? [this.currentTabT] : [],
          PageIndex: pageIndex,
          PageSize: pageSize,
          OrderNumber: this.searchText
        }
        apiCloud({
          url: '/api/v1/Order/DirectlyOrderList',
          method: 'post',
          data: JSON.stringify(data)
        }).then(res => {
          this.loading = false
          if (this.$ck(res)) {
            resolve(res)
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
::v-deep .u-border-top:after {
  border: none;
}
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
  margin: 55rpx 0;
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
      box-sizing: border-box;
      padding: 12px;
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
</style>
