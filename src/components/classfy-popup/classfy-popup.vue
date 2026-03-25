<template>
  <u-popup v-model="showPopup" width="750rpx" mode="left" @close="$emit('input', false)">
    <view class="common-popup" :style="themeVars">
      <view class="classfy flex-1" style="position: relative">
        <scroll-view style="height: 25vh" scroll-y="true" :show-scrollbar="false">
          <view
            v-for="(item, index) in list"
            :key="index"
            :class="choosedSuperInfo.id === item.id ? 'on' : ''"
            class="classfy-one"
            @tap="handleSelect(item)"
          >
            {{ item.categoryname }}
          </view>
          <view style="height: 30rpx"></view>
        </scroll-view>
        <bottom-mask></bottom-mask>
      </view>
      <view v-if="choosedSuperInfo.id !== -1 && subList.length" class="classfy flex-1 pt-30 pl-30 pr-30">
        <view class="classfy-title">二级分类</view>
        <scroll-view :style="scrollHeight" scroll-y="true" :show-scrollbar="false">
          <view
            v-for="(item, index) in subList"
            :key="index"
            :class="choosedSubInfo.id === item.id ? 'primary-color' : ''"
            class="classfy-content bd-a flex"
            @tap="handleSelectSub(item)"
          >
            <view class="flex-1">{{ item.categoryname }}</view>
            <view v-if="choosedSubInfo.id === item.id" class="fs-22 primary-color">✔</view>
          </view>
        </scroll-view>
      </view>
    </view>
    <view class="pop-bottom flex">
      <button class="primary-btn round inverse plain flex-1" hover-class="button-action" @tap="handleClose">
        取消
      </button>
      <button class="primary-btn round flex-1 ml-30" hover-class="button-action" @tap="handleComfirm">确认</button>
    </view>
  </u-popup>
</template>

<script>
import { apiGetClassifyList } from '@/api/order'
export default {
  name: 'ScanProducts',
  components: {},
  props: {
    value: {
      type: Boolean,
      default: false
    },
    superInfo: {
      type: Object,
      default() {
        return { id: -1 }
      }
    },
    subInfo: {
      type: Object,
      default() {
        return { id: -1 }
      }
    }
  },
  data() {
    return {
      showPopup: false,
      list: [],
      subList: [],
      choosedSuperInfo: {},
      choosedSubInfo: {}
    }
  },
  computed: {
    scrollHeight() {
      return `height:calc(75vh - 220rpx)`
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
      this.choosedSuperInfo = this.superInfo
      this.choosedSubInfo = this.subInfo
      if (v) this.getData()
    }
  },
  onLoad(options) {},
  methods: {
    handleSelect(item) {
      this.choosedSuperInfo = item
      this.choosedSubInfo = { id: -1 }
      this.subList = item.sublist
    },
    handleSelectSub(item) {
      this.choosedSubInfo = item
    },
    async getData() {
      let res = await apiGetClassifyList()
      if (this.$ck(res, true)) {
        this.list = [
          {
            id: -1,
            parentid: -1,
            categoryname: '全部'
          },
          ...res.return_data
        ]
        this.busy = false
      } else {
        this.busy = false
      }
    },
    handleComfirm() {
      this.$emit('update', this.choosedSuperInfo, this.choosedSubInfo)
      this.handleClose()
    },
    handleClose() {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.pop-header {
  border-bottom: 1px solid #ccc;
  padding: 20rpx;
}
.common-popup {
  background-color: #fff;
  @include box;
}
.classfy {
  border-right: 1px solid #ccc;
  .classfy-one {
    display: inline-block;
    min-width: 160rpx;
    height: 68rpx;
    line-height: 68rpx;
    padding: 0 24rpx;
    background: #f7f7f7;
    border-radius: 34rpx;
    margin: 20rpx 0 0 20rpx;
    text-align: center;
    font-weight: 700;
    &.on {
      // background: #ff5e33;
      background: var(--theme-color, $uni-color-primary);
      color: #fff;
    }
  }
  &-title {
    font-size: 32rpx;
    font-weight: 700;
    padding: 20rpx 0;
  }
  &-content {
    font-size: 28rpx;
    line-height: 80rpx;
  }
}
.pop-bottom {
  position: fixed;
  left: 40rpx;
  right: 40rpx;
  bottom: 30rpx;
}
.product {
  &-size {
    width: 60rpx;
    height: 60rpx;
    flex-shrink: 0;
  }
  &-name {
    font-size: 24rpx;
    line-height: 28rpx;
    margin-left: 10rpx;
    text-align: left;
  }
}
@keyframes scale {
  0% {
    transform: scale(0.96);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}
</style>
