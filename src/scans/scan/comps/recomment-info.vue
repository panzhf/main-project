<template>
  <view v-if="showPopup" class="wrap-popup" @touchmove.stop="handleMove">
    <view class="common-popup" @touchmove.stop="handleMove">
      <view class="header fw-bold fs-32 text-center">- 推荐返利说明 -</view>
      <scroll-view :style="{ height: scrollViewHeight }" scroll-y="true" :show-scrollbar="false">
        <view class="content fs-26 c-2a">
          <view class="item">
            推荐消费者购买箱内产品并扫码时，可额外获得返利哦～可前往［返利明细］查看返利到账情况！
          </view>
          <view class="item">返利规则如下：</view>
          <view v-if="isRelated" class="award-table mt-20">
            <!-- 表头行 -->
            <view class="award-title flex flex-middle">
              <view class="flex-1">消费者中奖结果</view>
              <view class="flex-1">可获得奖励</view>
            </view>
            <!-- 表格数据行 -->
            <view v-for="(item, index) in info.relatedprizelist" :key="index" class="award-item flex flex-middle">
              <view class="flex-1">{{ item.sharecondition }}</view>
              <view class="flex-1">{{ item.shareawardcontent }}</view>
            </view>
          </view>
          <view v-if="info.shareprizelist && info.shareprizelist.length" class="award-table mt-20">
            <!-- 表头行 -->
            <view class="award-title flex flex-middle">
              <view class="flex-1">消费者扫码{{ isRelated ? '领奖' : '' }}个数</view>
              <view class="flex-1">可获得奖励</view>
            </view>
            <!-- 表格数据行 -->
            <view v-for="(item, index) in info.shareprizelist" :key="index" class="award-item flex flex-middle">
              <view class="flex-1">{{ item.sharecondition }}</view>
              <view class="flex-1">{{ item.shareawardcontent }}</view>
            </view>
          </view>
          <view v-if="!isRelated" class="item mt-30">
            扫码个数仅针对单箱产品独立计算，每次消费者扫码，您最多可获得一份返利，优先发放累计扫码个数的奖励。
          </view>
          <view v-else class="item mt-30">
            中奖结果仅针对单箱产品独立计算，每次消费者扫码领奖，您最多可获得一份返利，优先发放累计扫码领奖个数的奖励
          </view>
        </view>
      </scroll-view>

      <button class="primary-btn round mb-20 recommand-btn" hover-class="button-action" @click="dropReturn">
        返利明细
      </button>
    </view>
    <view class="pop-close icon iconfont icon-guanbi1" @tap="handleClose"></view>
  </view>
</template>

<script>
export default {
  name: 'RecommentPop',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    info: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      showPopup: false,
      scrollViewHeight: ''
    }
  },
  computed: {
    isRelated() {
      return this.info.relatedprizelist?.length
    }
  },
  watch: {
    value(v) {
      this.showPopup = v
    }
  },

  mounted() {
    let sys = uni.getSystemInfoSync()
    this.scrollViewHeight = `calc(${sys.windowHeight}px - 550rpx)`
  },
  methods: {
    dropReturn() {
      this.$emit('drop')
    },
    handleClose() {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrap-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 999;
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
}
.pop-close {
  color: #fff;
  font-size: 60rpx;
  padding: 20rpx;
  margin-top: 40rpx;
}
.common-popup {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  animation-name: scale;
  animation-duration: 0.4s;
  animation-timing-function: ease-in-out;
  width: 660rpx;
  @include box;
  .header {
    @include lh(100rpx);
  }
  .title {
    font-weight: bold;
    padding: 6px 0 20rpx 0;
  }
  .content {
    padding: 0 30rpx 20rpx;
    line-height: 40rpx;
    text-align: justify;
    .item {
      font-size: 26rpx;
      font-weight: 500;
      line-height: 40rpx;
      color: #333333;
    }
    .award-table {
      border: 1px solid #f5f5f5;
      text-align: center;
      line-height: 48rpx;
      .award-title {
        font-size: 24rpx;
        background: #eeeeee;
        font-weight: 500;
        color: #333333;
      }
      .award-item {
        border-top: 1px solid #f5f5f5;
        view {
          padding: 0 10rpx;
        }
      }
    }
  }
  .recommand-btn {
    width: 420rpx;
    margin: 44rpx auto 40rpx;
  }
}
@keyframes scale {
  0% {
    transform: scale(0.98);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
