<template>
  <view class="container" :style="themeVars">
    <view class="wrapper">
      <tab
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="currentTab"
        :active-bag-color="themeInfo.color"
        @change="handleUpdate"
      ></tab>
      <view style="margin: 30rpx 20rpx">
        <Search placeholder="请输入服务单号" :value="searchText" @handleSearch="handleSearch"></Search>
      </view>
      <view v-for="(item, index) in list" :key="index" class="order-item" @tap="handleOpenDetail(item.OrderNumber)">
        <view class="order-header">
          <view class="order-header__left">
            <view class="order-no">服务单号：{{ item.OrderNumber }}</view>
            <view class="order-btn--copy" @tap.stop="handleCopy(item.OrderNumber)">复制</view>
          </view>
          <view :class="item.OrderStatus != 4 && item.OrderStatus !== 6 ? 'order-status is-active' : 'order-status'">
            <view>{{ item.DisposeStatusMessage }}</view>
          </view>
        </view>
        <view class="order-body">
          <view class="item-content">
            <view class="flex flex-middle">
              <text class="gray6-color">服务类型</text>
              <text class="ml-30">{{ item.ServeTypeName }}</text>
            </view>
            <view class="flex flex-middle mt-30">
              <text class="gray6-color">服务项目</text>
              <text class="ml-30">{{ item.ServeProjectName }}</text>
            </view>
          </view>
        </view>
        <view :class="['order-footer', item.DisposeStatus === 0 || item.DisposeStatus === 1 ? 'order-footer-t' : '']">
          <view class="order-action">
            <view
              v-if="item.DisposeStatus === 0"
              class="order-action__btn is-primary ml"
              @tap.stop="handleSendOrder(item)"
            >
              接单
            </view>
            <view
              v-if="item.DisposeStatus === 1"
              class="order-action__btn is-primary ml"
              @tap.stop="handleNotarizeDispose(item)"
            >
              已处理
            </view>
          </view>
        </view>
      </view>
      <view v-if="defaultCopy" class="copy">没有更多了</view>
      <view v-if="list.length === 0 && isLoading" class="vh-60 flex flex-column flex-middle flex-center">
        <none-data :icon="noneIcon" msg="暂无预约服务订单~" icon-width="256" icon-height="190" />
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
            <input v-model="form.ServePersonnelName" class="waybill-name" type="text" placeholder="请输入联系人姓名" />
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
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>
<script>
import Tab from '@/components/tab/index.vue'
import Search from '@/components/search'
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  components: {
    Tab,
    Search
  },
  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      defaultCopy: false,
      info: {},
      show: false,
      searchText: '',
      activiyTab: ['进行中', '已完成', '已取消'],
      currentTab: 0,
      page: {
        index: 1,
        size: 20,
        total: 0
      },
      list: [],
      form: {
        ServePersonnelMobile: '',
        ServePersonnelName: ''
      }
    }
  },
  onShow() {
    this.getOrderList(1, this.page.size)
  },
  // 上拉加载
  onReachBottom() {
    if (this.page.total > 0 && this.page.total > this.page.index) {
      this.getOrderList(this.page.index + 1, this.page.size)
    } else {
      this.defaultCopy = true
    }
  },
  methods: {
    // tab切换
    handleUpdate() {
      this.getOrderList(1, this.page.size)
    },
    // 搜索的回调
    handleSearch(val) {
      this.searchText = val
      this.getOrderList(1, this.page.size)
    },
    handleOpenDetail(t) {
      // 打开订单详情
      uni.navigateTo({
        url: `./detail?orderNumber=${t}`
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
      this.info = item
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
            this.getOrderList(1, this.page.size)
          }, 2000)
        }
      })
    },
    // 已处理的回调
    handleNotarizeDispose(item) {
      apiCloud({
        url: '/api/v1/ReservationService/NotarizeDispose',
        method: 'post',
        data: JSON.stringify({ OrderNumber: item.OrderNumber })
      }).then(res => {
        if (this.$ck(res)) {
          this.$msg('处理成功', { icon: 'success' })
          setTimeout(() => {
            this.getOrderList(1, this.page.size)
          }, 2000)
        }
      })
    },
    getOrderList(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        Status: this.currentTab,
        PageIndex: pageIndex,
        PageSize: pageSize,
        Keyword: this.searchText
      }
      apiCloud({
        url: '/api/v1/ReservationService/ToLoadOrderList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
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
    .item-content {
      font-size: 26rpx;
    }
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
    }
  }
  .order-footer-t {
    border-top: 1px solid #eee;
  }
}
.copy {
  color: #ccc;
  padding: 10rpx 0;
  text-align: center;
}
.ml {
  margin-left: 20rpx;
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
</style>
