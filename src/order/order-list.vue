<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header" style="">
      <view class="search-box">
        <selector-picker
          v-model="typeValue"
          class="selector-width"
          :value="typeValue"
          :options="orderTypeOPtion"
          range-key="label"
        ></selector-picker>
        <!-- 选择时间 -->
        <view class="flex ml-20" style="width: 440rpx">
          <view class="search-date flex flex-1" @tap="showDatePicker = true">
            <view v-if="dateFilter.startTime" class="flex-1">{{ dateFilter.startTime }}-{{ dateFilter.endTime }}</view>
            <view v-else class="flex-1">请选择下单时间</view>
            <text class="icon iconfont icon-down-arrow fs-20 c-2a ml-10"></text>
          </view>
        </view>
        <date-picker
          v-model="showDatePicker"
          :default-date.sync="startDefault"
          class="flex-1"
          @confirm="datePickerComfirm"
        ></date-picker>
      </view>
      <view class="search-box">
        <search-input
          v-model="orderNo"
          placeholder="请输入订单单号"
          :show-search-btn="false"
          class="mr-20"
          style="width: 256rpx"
          @search="handleSearch"
        ></search-input>
        <search-input
          v-model="keyValue"
          style="width: 460rpx"
          placeholder="收货人名称、手机号 "
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="fw-bold fs-28 pl-20 pt-20 pb-20">
        <text class="mr-20">
          订单总数：
          <text class="primary-color mr-10">{{ orderCount }}</text>
          商品总数：
          <text class="primary-color mr-10">{{ goodsCount }}</text>
        </text>
      </view>
    </view>
    <view style="height: 280rpx"></view>
    <!-- 内容 -->
    <view>
      <Item :list="list" :store-type="storeType" :store-no="mainpartNo" @update="handleSearch"></Item>
    </view>
    <view v-if="list.length === 0 && !loading" style="min-height: 60vh" class="flex flex-middle flex-center">
      <none-data msg="暂无订单~" icon-width="256" icon-height="196" />
    </view>
    <load-more v-if="list.length" :has-more="hasMore" />
  </view>
</template>
<script>
import Item from './comps/item'
import SearchInput from '@/components/search/search-input'
import DatePicker from '@/components/search/date-picker'
import SelectorPicker from '@/components/search/selector-picker'
import LoadMore from '@/components/load-more'
import orderListMixin from './mixins/order-list'
export default {
  components: {
    SearchInput,
    SelectorPicker,
    Item,
    LoadMore,
    DatePicker
  },
  mixins: [orderListMixin],
  data() {
    return {
      storeType: '',
      mainpartNo: ''
    }
  },
  computed: {
    isParaChange() {
      return `${this.typeValue}${this.dateFilter.startTime}${this.dateFilter.endTime}`
    }
  },
  onLoad(options) {
    if (options.storetype === 'invitedStore') {
      //我邀请的门店的订单
      uni.setNavigationBarTitle({
        title: '我邀请门店的订单'
      })
      this.mainpartNo = options.storeno
      this.typeValue = 5
      this.storeType = 'invitedStore'
    } else {
      // 我的订单列表
      uni.setNavigationBarTitle({
        title: '我的订单'
      })
      this.typeValue = -1
      let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      this.mainpartNo = storeSettingInfo.mainpartNo
      this.storeType = 'myStore'
      this.$store.dispatch('getFcBasicInfo')
    }
    this.getData()
  },
  async onShow() {
    uni.$once('orderListReflesh', res => {
      if (res) {
        this.handleSearch()
      }
    })
    if (this.refleshData) {
      this.refleshData = false
      this.handleSearch()
    }
  },
  onPullDownRefresh() {
    if (this.storeType === 'myStore') {
      this.$store.dispatch('getFcBasicInfo')
    }
    this.handleSearch()
  }
}
</script>

<style lang="scss" scoped>
.container-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f5f5f5;
}
.search-box {
  display: flex;
  margin: 20rpx 30rpx 20rpx 30rpx;
  .selector-width {
    width: 240rpx;
  }
  .search-date {
    text-align: center;
    background: #fff;
    padding: 0 32rpx;
    height: 76rpx;
    border-radius: 35rpx;
    line-height: 76rpx;
  }
}
</style>
