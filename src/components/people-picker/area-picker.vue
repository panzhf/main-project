<template>
  <view class="people-picker fs-28" :style="themeVars">
    <u-popup v-model="showPicker" mode="bottom" border-radius="30" @close="$emit('input', false)">
      <view class="title tx-c">选择店铺面积</view>
      <scroll-view class="list" scroll-y="true" scroll-left="120" :show-scrollbar="false" @scrolltolower="scrollBottom">
        <view
          v-for="(item, index) in list"
          :key="index"
          class="item flex flex-middle pt-30 pb-30"
          @click="handleSelect(item)"
        >
          <view class="flex-1 overflow-h">
            <view class="name fs-30 fw-bold">{{ item.name }}</view>
          </view>
          <view v-if="sizeId == item.id" class="fs-28 primary-color mr-20">✔</view>
        </view>
        <none-data v-if="!list.length && !busy" :view-height="560" :icon="nonoDataIcon" />
      </scroll-view>
    </u-popup>
  </view>
</template>

<script>
import { apiGetShopSizes } from '@/api/common'
import { staticURL } from '@/config'
import { getJsCode } from '@/utils/set-mp'
export default {
  components: {},
  props: {
    value: Boolean,
    memberlogin: {
      type: String,
      default: ''
    },
    sizeId: {
      type: Number,
      default: -1
    }
  },
  data() {
    return {
      nonoDataIcon: staticURL() + '/personal/default.png',
      showPicker: this.value,
      list: [], // 列表数据
      busy: false // 防重复标记
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
    scrollBottom() {
      if (this.hasMore) {
        this.paging.PageIndex++
        this.getData()
      }
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      let res = await apiGetShopSizes(
        {
          memberlogin: this.memberlogin, //品牌商账号
          js_code: await getJsCode()
        },
        false
      )
      if (this.$ck(res, true)) {
        this.list = res.return_data
        this.busy = false
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
    // padding-bottom: 30rpx;
    .name {
      color: #000;
      // font-weight: bold;
      // margin-top: 30rpx;
      // width: 660rpx;
    }
  }
}
// .search-box {
//   margin-top: 30rpx;
//   display: flex;
//   padding-right: 30rpx;
//   .search-input {
//     flex: 1;
//   }
// }
</style>
