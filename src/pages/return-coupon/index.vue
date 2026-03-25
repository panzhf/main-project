<template>
  <view class="container page-coupon">
    <view class="container-header bg-f" :style="{ height: topHeight }">
      <coupon-head :value="activityTabIndex" :voucher-count="voucherCount" @change="handleTabChange" />
    </view>
    <view :style="{ height: topHeight }"></view>
    <view class="coupon-list">
      <list
        :tab-id="tabId"
        :list="list"
        :source-statistics="sourceStatistics"
        :show-type="showType"
        @drop="handleNav"
      ></list>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="showEmpty" msg="暂无卡券~" icon-width="256" icon-height="190"></none-data>
    <coupon-bottom
      :info="validNumInfo"
      number-color="#0F80FF"
      desc-color="#333333"
      border-color="#AAAAAA"
      bg-color="#F5F5F5"
      :bottom="130"
      @drop="handleNav"
    />
    <view style="height: 130rpx"></view>
    <coupon-btns />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import List from 'packages/components/return-coupon/list.vue'
import CouponHead from 'packages/components/return-coupon/head'
import CouponBottom from 'packages/components/return-coupon/bottom'
import CouponBtns from './comps/coupon-btns'
import LoadMore from '@/components/load-more'
import baseSetMixin from './mixins/base-info'
import overdueMixin from 'packages/mixins/overdue'
import commonMixin from './mixins/common'

export default {
  components: { List, LoadMore, CouponBtns, CouponHead, CouponBottom },
  mixins: [baseSetMixin, overdueMixin, commonMixin],
  data() {
    return {}
  }
}
</script>
<style lang="scss" scoped>
@import './style/common.scss';
</style>
