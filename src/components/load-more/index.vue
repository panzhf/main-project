<template>
  <view class="loadmore" @tap="$emit('click')">
    <view v-show="loading" class="icon"></view>
    <view class="text">
      <template v-if="hasMore">加载中，请稍后</template>
      <template v-else>亲，没有更多了</template>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    hasMore: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss">
.loadmore {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  padding-bottom: 30rpx;
  padding-bottom: calc(30rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  .icon {
    margin-right: 10rpx;
    width: 32rpx;
    height: 32rpx;
    animation: anim 1s steps(12, end) infinite;
    background: transparent
      url("data:image/svg+xml;charset=utf8, %3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 100 100'%3E%3Cpath fill='none' d='M0 0h100v100H0z'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23E9E9E9' rx='5' ry='5' transform='translate(0 -30)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23989697' rx='5' ry='5' transform='rotate(30 105.98 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%239B999A' rx='5' ry='5' transform='rotate(60 75.98 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23A3A1A2' rx='5' ry='5' transform='rotate(90 65 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23ABA9AA' rx='5' ry='5' transform='rotate(120 58.66 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23B2B2B2' rx='5' ry='5' transform='rotate(150 54.02 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23BAB8B9' rx='5' ry='5' transform='rotate(180 50 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23C2C0C1' rx='5' ry='5' transform='rotate(-150 45.98 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23CBCBCB' rx='5' ry='5' transform='rotate(-120 41.34 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23D2D2D2' rx='5' ry='5' transform='rotate(-90 35 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23DADADA' rx='5' ry='5' transform='rotate(-60 24.02 65)'/%3E%3Crect width='7' height='20' x='46.5' y='40' fill='%23E2E2E2' rx='5' ry='5' transform='rotate(-30 -5.98 65)'/%3E%3C/svg%3E")
      no-repeat;
    background-size: 100% 100%;
    @keyframes anim {
      0% {
        transform: rotate3d(0, 0, 1, 0deg);
      }
      100% {
        transform: rotate3d(0, 0, 1, 360deg);
      }
    }
  }
  .text {
    margin-left: 4rpx;
    vertical-align: middle;
    font-size: 24rpx;
    color: #666;
  }
}
</style>
