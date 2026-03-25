<template>
  <view v-if="isLoading" class="container" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="content-list">
      <view v-if="item.show" class="content" @click="handleDeliveryMode(index)">
        <view>{{ item.name }}</view>
        <view :class="['iconfont', item.checked ? 'icon-success' : 'icon-unchecked']"></view>
      </view>
    </view>
    <button class="primary-btn round mr-20 ml-20 mt-60" hover-class="button-action" @tap="submit">确定</button>
  </view>
</template>
<script>
import { apiCloud } from '@/api/cloud-store'
export default {
  data() {
    return {
      isLoading: false,
      MemberDeliveryMode: '',
      DeliveryMode: '',
      DeliveryModeArr: [],
      list: [
        { value: '1', name: '到店自提', checked: false, show: false },
        { value: '2', name: '商家配送', checked: false, show: false }
      ]
    }
  },

  async onLoad() {
    const res = await apiCloud({
      url: '/api/v1/Store/GetStoreInfo',
      method: 'get',
      data: JSON.stringify({})
    })
    const res1 = await apiCloud({
      url: '/api/v1/BaseSet/GetGeneralSet',
      method: 'get',
      data: JSON.stringify({})
    })
    this.MemberDeliveryMode = res1.return_data || ''
    this.DeliveryMode = res.return_data.DeliveryMode || ''
    if (this.MemberDeliveryMode.includes(1)) {
      this.list[0].show = true
    }
    if (this.MemberDeliveryMode.includes(2)) {
      this.list[1].show = true
    }
    if (this.DeliveryMode.includes(1)) {
      this.list[0].checked = true
    }
    if (this.DeliveryMode.includes(2)) {
      this.list[1].checked = true
    }
    this.isLoading = true
  },

  methods: {
    handleDeliveryMode(index) {
      this.list[index].checked = !this.list[index].checked
    },
    submit() {
      this.DeliveryModeArr = []
      this.list.forEach(item => {
        if (item.checked) {
          this.DeliveryModeArr.push(item.value)
        }
      })
      this.DeliveryMode = this.DeliveryModeArr.join(',')
      if (!this.DeliveryMode) {
        return this.$msg('请选择配送模式')
      }
      this.SetStore()
    },

    SetStore() {
      apiCloud({
        url: '/api/v1/Store/SetStoreDeliveryMode',
        method: 'post',
        data: JSON.stringify({ DeliveryMode: this.DeliveryMode })
      }).then(res => {
        if (this.$ck(res)) {
          // 这里写提交
          this.$msg('设置成功', { icon: 'success' })
          setTimeout(() => {
            uni.navigateBack({
              delta: 1
            })
          }, 1000)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  .content-list {
    padding: 20rpx 20rpx 0 20rpx;
    .content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      height: 100rpx;
      padding: 20rpx;
      border-radius: 10rpx;
      .icon-success {
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
}
</style>
