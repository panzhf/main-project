<template>
  <view
    :class="['menu-wrap br-10 bg-f', type === 1 ? 'ml-20 mr-20' : '']"
    :style="![3, 4].includes(type) ? 'margin-top: 25rpx;' : ''"
  >
    <view v-if="showTitle" class="menu-title c-3 fs-28 fw-bold">{{ menuObj.name }}</view>
    <view class="menu-inner">
      <view v-for="item in menuObj.sublist" :key="item.number" class="item" @tap="navigation(item)">
        <view class="menu-icon" :class="item.icon" :style="{ 'background-image': 'url(' + imgSrc + ')' }"></view>
        <view v-if="showTag(item.number)" class="total">
          <view class="tag">{{ showData(item.number) | digitShowFilter }}</view>
        </view>
        <view class="tx-c mt-20">{{ item.name }}</view>
      </view>
    </view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { digitShowFilter } from '@/filters'
import { mapState } from 'vuex'

export default {
  filters: { digitShowFilter },
  props: {
    type: {
      type: Number, // 1 首页 2我的  3云店-店铺管理 4云店-营销活动
      default: 1
    },
    staySignTotal: {
      type: Number,
      default: 0
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    homeData: {
      type: Object,
      default: () => {}
    },
    menuObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapState(['isSpecialMp']),
    imgSrc() {
      const icons = {
        1: staticURL() + 'menu/index.png?v=9',
        2: staticURL() + (this.isSpecialMp ? 'menu/my_base.png' : 'menu/my.png?v=3'),
        3: staticURL() + 'menu/store.png?v=5',
        4: staticURL() + 'menu/market.png?v=5'
      }
      return icons[this.type]
    }
  },
  methods: {
    navigation(item) {
      if (this.type === 1) return this.$emit('navigation', item.mplink, item.number)
      uni.navigateTo({
        url: item.mplink
      })
    },
    showTag(n) {
      const o = {
        26: 'staySignTotal'
      }
      return Object.keys(o).some(key => n === Number(key) && !!this.homeData[o[key]])
    },
    showData(n) {
      const o = {
        26: 'staySignTotal'
      }
      return this.homeData[o[n]]
    }
  }
}
</script>

<style lang="scss" scoped>
.menu-wrap {
  box-sizing: border-box;
  .menu-title {
    padding: 30rpx 0 0 30rpx;
  }
}
.menu-inner {
  padding: 40rpx 0;
  display: grid;
  grid-template-columns: 25% 25% 25% 25%;
  grid-gap: 70rpx 0;
  border-radius: 0 0 10rpx 10rpx;
  .item {
    position: relative;
    width: 140rpx;
    margin: 0 auto;
    .total {
      position: absolute;
      left: 88rpx;
      top: -19rpx;
      .tag {
        position: relative;
        display: inline-block;
        border-radius: 5rpx;
        white-space: nowrap;
        line-height: 30rpx;
        height: 30rpx;
        padding: 0 4rpx;
        min-width: 36rpx;
        text-align: center;
        font-size: 24rpx;
        color: #fff;
        background: #ff6f52;
        border-radius: 10rpx;
        &::after {
          content: '';
          left: 6rpx;
          bottom: -6rpx;
          position: absolute;
          display: inline-block;
          width: 0;
          height: 0;
          border-right: 8rpx solid transparent;
          border-left: 4rpx solid transparent;
          border-left-color: transparent;
          border-top: 8rpx solid #ff6f52;
        }
      }
    }
  }
}
.menu-icon {
  width: 64rpx;
  height: 64rpx;
  background-size: 64rpx;
  margin: 0 auto;
  background-repeat: no-repeat;
}

@for $num from 1 through 11 {
  .icon#{$num} {
    background-position: 0 ($num - 1) * (-72rpx);
  }
}
</style>
