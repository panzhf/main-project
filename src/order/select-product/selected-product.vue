<template>
  <view class="page-selected" :style="themeVars">
    <view v-for="(item, index) in list" :key="item.productno" class="item flex">
      <v-img class="item-pic" :src="item.picurl || defaultProductPic" :size="120" />
      <view class="item-info flex-1">
        <view class="name fw-bold ellipsis-2">
          {{ item.productname }}
        </view>
        <view class="format">{{ item.productformatname }}</view>
        <view class="num">
          <text v-if="showOrderPrice" class="mr-20">订货价：￥{{ item.storeorderprice }}</text>
          <text>数量：{{ item.value }}</text>
        </view>
      </view>
      <view class="btn-dele" @tap="handleDelete(item, index)">
        <image class="icon-delete" :src="iconDele" mode="scaleToFill" />
      </view>
    </view>
    <view v-if="list.length === 0" style="min-height: 80vh" class="flex flex-middle">
      <none-data msg="暂无已选商品" icon-width="256" icon-height="196" />
    </view>
    <view style="height: 150rpx"></view>
    <button class="primary-btn size-small fixed-bottom fixed-wide" hover-class="button-action" @tap="handleComfirm">
      确认
    </button>
  </view>
</template>

<script>
import { mapGetters } from 'vuex'
import { staticURL } from '@/config'
import { deepClone } from '@/utils/function.js'
export default {
  data() {
    return {
      iconDele: staticURL() + 'common/icon-dele2.png?t=7',
      defaultProductPic: staticURL() + 'common/default-pic.png',
      list: [], // 已选的商品列表
      deletedGoodsList: [] //删除的商品id
    }
  },
  computed: {
    ...mapGetters(['showOrderPrice'])
  },
  onLoad() {
    let list = this.$store.state.choosedGoodsList
    this.list = deepClone(list)
  },
  onShow() {},
  methods: {
    handleDelete(item, index) {
      item.checked = false
      this.deletedGoodsList.push(item)
      this.list.splice(index, 1)
    },
    handleComfirm() {
      this.$store.dispatch('updateChoosedGoodsList', this.list)
      uni.$emit('deletedGoods', this.deletedGoodsList)
      uni.navigateBack()
    }
  }
}
</script>
<style lang="scss" scoped>
.page-selected {
  margin: 0 30rpx;
  .item {
    background: #ffffff;
    border-radius: 10rpx;
    margin: 20rpx 0;
    position: relative;
    .item-info {
      margin: 30rpx 0;
      padding-right: 30rpx;
      .name {
        color: #000;
        font-size: 28rpx;
        font-weight: 700;
        line-height: 32rpx;
      }
      .format {
        margin-top: 5rpx;
        font-size: 24rpx;
        color: #999;
      }
      .num {
        margin-top: 5rpx;
        color: #444;
        font-size: 24rpx;
      }
    }
    .item-pic {
      width: 130rpx;
      height: 130rpx;
      background: #f6f6f6;
      border-radius: 10rpx;
      margin: 30rpx 21rpx 30rpx 30rpx;
    }
  }
  .btn-dele {
    position: absolute;
    right: -20rpx;
    top: -20rpx;
    padding: 20rpx;
    .icon-delete {
      width: 37rpx;
      height: 39rpx;
      background-size: 100% 100%;
    }
  }
}
</style>
