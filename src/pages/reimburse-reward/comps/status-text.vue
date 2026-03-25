<template>
  <view
    :class="[
      page === 1 ? 'fs-25 fw-bold' : '',
      (tabId === 1 && item.status === 3) || (tabId === 14 && item.status === -1) ? 'primary-color' : ''
    ]"
  >
    <text v-if="tabId === 14 && item.prizetype === 14">{{ item.status | fhqStatusFilter }}</text>
    <text v-else-if="tabId === 14">{{ item.status | chbStatusFilter }}</text>

    <text v-else-if="item.prizetype === 1">{{ item.status | rewardStatusFilter }}</text>
    <text v-else>{{ item.status | hbStatusFilter }}</text>
  </view>
</template>

<script>
// 提领券的红包积分状态值不同，兑奖码的状态值与提领券不同
import { rewardStatusFilter, chbStatusFilter, hbStatusFilter, fhqStatusFilter } from '@/filters'
export default {
  name: 'StatusText',
  filters: { rewardStatusFilter, hbStatusFilter, chbStatusFilter, fhqStatusFilter },
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    tabId: {
      type: Number,
      default: 0
    },
    page: {
      type: Number,
      default: 1
    }
  }
}
</script>
