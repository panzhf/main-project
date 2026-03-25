<template>
  <view>
    <view v-for="(item, index) in list" :key="index" class="box flex">
      <v-img class="ticket-pic" :src="item.voucherimg" :size="120" />
      <view class="ticket flex-1 flex flex-column flex-between">
        <view class="ellipsis-2">
          {{ item.vouchername }}
        </view>
        <view class="flex c-9">
          <view class="flex-1">卡券ID：{{ item.voucherid }}</view>
          <view>x{{ item.num }}</view>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => []
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {}
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
@import '../styles/ticket.scss';
.box .ticket-pic {
  margin: 20rpx;
}
.val {
  width: 330rpx;
}
</style>

