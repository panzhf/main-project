<template>
  <view class="container" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="content-list">
      <view class="content" @click="handleDeliveryMode(item)">
        <view>
          <text v-if="item.IsDefault" class="primary-color">(默认)</text>
          {{ item.Name }}
        </view>
        <view class="iconfont icon-arrow-right"></view>
      </view>
    </view>
    <view v-if="list.length === 0 && loading" class="vh-80 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" msg="暂无运费~" icon-width="256" icon-height="190" />
    </view>
  </view>
</template>
<script>
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      list: [],
      loading: false,
      noneIcon: staticURL() + 'shop/default-2.png'
    }
  },

  onLoad() {
    this.GetDeliverySetList()
  },
  methods: {
    handleDeliveryMode(item) {
      uni.navigateTo({
        url: `./freight-detail?ID=${item.ID}`
      })
    },
    GetDeliverySetList() {
      apiCloud({
        url: '/api/v1/BaseSet/GetDeliverySetList',
        method: 'post',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          this.list = [...this.list, ...res.return_data]
          this.loading = true
        }
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
  padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
  .content-list {
    padding: 20rpx 20rpx 0;
    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      height: 100rpx;
      padding: 20rpx;
      border-radius: 10rpx;
      .icon-arrow-right {
        font-size: 20rpx;
        color: #999;
      }
    }
  }
}
</style>
