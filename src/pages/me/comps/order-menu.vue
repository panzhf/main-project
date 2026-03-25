<template>
  <view class="order-list mt-20 bg-f flex-wrap br-10">
    <template v-if="!loading">
      <navigator
        v-for="(item, index) in orderMenu"
        :key="index"
        class="item flex-1 flex flex-column flex-middle"
        :url="`/packages/src/order/list?type=${item.type}`"
      >
        <view v-if="item.value" class="quantity fs-22 fw-medium">{{ item.value > 99 ? '99+' : item.value }}</view>
        <text class="fs-36 fw-bold iconfont" :class="[item.icon]"></text>
        <view class="mt-10 fs-26 c-3 fw-medium">{{ item.name }}</view>
      </navigator>
    </template>
    <u-loading v-else mode="flower" size="50" class="loading flex flex-middle"></u-loading>
  </view>
</template>

<script>
import { apiGetOrderStatistics } from '@/api/order'
export default {
  data() {
    return {
      loading: true,
      orderMenu: [
        {
          icon: 'iconquanbuicon',
          type: 0,
          name: '全部',
          value: 0
        },
        {
          icon: 'icondaifukuan1',
          type: 2,
          name: '待付款',
          value: 0
        },
        {
          icon: 'icondaifahuo1',
          type: 3,
          name: '待发货',
          value: 0
        },
        {
          icon: 'icondaishouhuo',
          type: 4,
          name: '待收货/待核销',
          value: 0
        }
      ]
    }
  },
  created() {
    // 监听页面显示事件
    uni.$on('pageMeOnShow', () => {
      this.getData()
    })
  },
  mounted() {
    // 组件挂载后自动获取数据
    this.getData()
  },
  beforeDestroy() {
    // 清理事件监听
    uni.$off('pageMeOnShow')
  },
  methods: {
    getData() {
      this.loading = true
      apiGetOrderStatistics().then(res => {
        this.loading = false
        if (this.$ck(res)) {
          this.orderMenu.forEach(item => {
            if (item.type === 2) item.value = res.return_data.waitpaytotal
            if (item.type === 3) item.value = res.return_data.waitdelivertotal
            if (item.type === 4) item.value = res.return_data.waitreceipttotal
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.order-list {
  min-height: 160rpx;
  .loading {
    margin: 0 auto;
  }
  .item {
    padding: 40rpx 0;
    position: relative;
    .quantity {
      position: absolute;
      top: 18rpx;
      right: 34rpx;
      min-width: 40rpx;
      height: 30rpx;
      background: $bg-color;
      border-radius: 15rpx 15rpx 15rpx 0;
      text-align: center;
      color: #ffffff;
      padding: 0 4rpx;
      box-sizing: border-box;
      line-height: 30rpx;
    }
  }
}
</style>
