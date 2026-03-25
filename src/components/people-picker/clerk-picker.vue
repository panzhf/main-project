<template>
  <view class="clerk-picker flex flex-middle" :style="customStyle" @tap.stop="show = true">
    <view v-show="curItem.label" class="flex-1 ellipsis">{{ curItem.label }}</view>
    <text class="iconfont icon-down-arrow fs-20 ml-10"></text>
    <u-select v-model="show" :title="title" :list="list" :default-value="defaultSelect" @confirm="onConfirm"></u-select>
  </view>
</template>

<script>
// <ClerkPicker v-model="openid" :type="-1" custom-style="width: 250rpx;margin-right: 20rpx;" />
import { apiGetclerklist } from '@/api/sales'
export default {
  name: 'ClerkPicker',
  props: {
    type: {
      type: Number,
      validator(v) {
        // -1:全部 0：负责人 2：店员 不传默认查询店员
        return [-1, 0, 2].includes(v)
      },
      default: 2
    },
    customStyle: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    formatOpenid: Boolean // 转化空的openid为-
  },
  data() {
    return {
      show: false,
      list: [],
      curItem: {
        value: '',
        label: '全部'
      },
      defaultSelect: [0]
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    getData() {
      apiGetclerklist({
        pageindex: 1,
        pagesize: 100,
        roletype: this.type
      }).then(res => {
        if (this.$ck(res, true)) {
          let list = res.return_data?.list || []
          list = list.map(item => ({
            value: this.formatOpenid && !item.openid ? '-' : item.openid,
            label: item.leader
          }))
          list.unshift({
            value: '',
            label: '全部'
          })
          this.list = list
        }
      })
    },
    onConfirm(e) {
      const v = e[0]
      this.curItem = v
      let value = v?.value || ''
      const i = this.list.findIndex(item => item.value === value)
      this.defaultSelect = [i]
      this.$emit('input', value)
    }
  }
}
</script>

<style lang="scss" scoped>
$prefix: clerk-picker;
.#{$prefix} {
  text-align: center;
  background: #fff;
  padding: 0 20rpx;
  height: 76rpx;
  border-radius: 35rpx;
  line-height: 76rpx;
}
</style>
