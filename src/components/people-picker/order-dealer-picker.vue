<template>
  <view class="people-picker fs-28" :style="themeVars">
    <u-popup v-model="showPicker" mode="bottom" border-radius="30" @close="$emit('input', false)">
      <view class="title flex-1 tx-c">选择经销商</view>
      <scroll-view class="list" scroll-y="true" scroll-left="120" :show-scrollbar="false" @scrolltolower="scrollBottom">
        <view v-for="(item, index) in list" :key="index" class="flex item flex-middle" @click="handleSelect(item)">
          <view>
            <view class="name ellipsis fs-30 flex-1">{{ item.dealername || '' }}</view>
            <view class="c-9 fs-24 pt-10">{{ item.mobile || '' }}</view>
          </view>
          <view v-if="dealerId == item.dealerid" class="icon iconfont icon-right fs-22 primary-color mr-40 pt-30">
            ✔
          </view>
        </view>
        <none-data v-if="!list.length && !busy" class="noda" :view-height="560" :msg="msg" :icon="nonoDataIcon" />
      </scroll-view>
    </u-popup>
  </view>
</template>

<script>
import { apiGetDealerForOrder } from '@/api/order.js'
import { staticURL } from '@/config'
export default {
  components: {},
  props: {
    value: {
      // true打开弹窗
      type: Boolean,
      default: false
    },
    memberlogin: {
      type: String,
      default: ''
    },
    dealerId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      nonoDataIcon: staticURL() + '/personal/default.png',
      showPicker: this.value,
      list: [], // 列表数据
      busy: true
    }
  },
  computed: {
    msg() {
      return '暂无数据'
    }
  },
  watch: {
    value(val) {
      this.showPicker = val
      if (val && this.list.length === 0) {
        this.getData()
      }
    }
  },
  methods: {
    async getData(type) {
      let res = await apiGetDealerForOrder()
      if (this.$ck(res, true)) {
        this.list = res.return_data.list
        this.busy = false
        if (this.list.length && type === 1) {
          this.$emit('submit', this.list[0])
        }
      } else {
        this.busy = false
      }
    },

    handleSelect(item) {
      this.$emit('submit', item)
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding: 30rpx 20rpx 20rpx;
  font-size: 30rpx;
  font-weight: 700;
}
.list {
  height: 650rpx;
  padding: 0 18rpx;
  margin: 30rpx 0;
  box-sizing: border-box;
  padding-right: 0;
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
    color: transparent;
  }
  .item {
    border-bottom: 1rpx solid #e5e5e5;
    padding-bottom: 30rpx;
    .name {
      color: #000000;
      font-weight: bold;
      margin-top: 30rpx;
      width: 660rpx;
    }
  }
}
.search-box {
  margin-top: 30rpx;
  display: flex;
  padding-right: 30rpx;
  .search-input {
    flex: 1;
  }
}
</style>
