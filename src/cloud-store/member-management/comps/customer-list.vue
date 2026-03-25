<template>
  <view class="listWhole" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="list" @tap="handleDetail(item.OpenId || item.Openid)">
      <view class="picture">
        <image :src="item.HeadPath || item.HeadUrl" />
        <view
          v-if="item.Type === '分销员' || item.Type === '分销员和客户' || item.IsDistributionUser"
          class="distribution"
        >
          分销员
        </view>
      </view>
      <view class="main">
        <view class="common">
          <view class="commonVal">微信名称</view>
          <view>{{ item.NickName || item.UserNickName }}</view>
          <view
            v-if="
              (item.GradeInfo.gradenumber != -1 && !item.GradeNumber) ||
              (item.GradeNumber != -1 && !item.GradeInfo.gradenumber)
            "
            class="member"
          >
            <view :class="['iconfont', 'grade', 'icon-v-' + item.GradeNumber]"></view>
            {{ item.GradeInfo.gradename || item.GradeName }}
          </view>
        </view>
        <view class="common">
          <view class="commonVal">手机号</view>
          <view>{{ item.Mobile ? item.Mobile : '---' }}</view>
        </view>
        <view class="common">
          <view class="commonVal">首次进店</view>
          <view>{{ item.AddTime || item.BandTime }}</view>
        </view>
      </view>
      <view class="iconfont icon-arrow-right"></view>
    </view>
  </view>
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  methods: {
    handleDetail(id) {
      uni.navigateTo({
        url: `./customer-detail?Id=${id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.listWhole {
  position: relative;

  .list {
    position: relative;
    display: flex;
    padding: 33rpx;
    background: #fff;
  }

  .picture {
    position: relative;
    margin-right: 21rpx;

    image {
      width: 81rpx;
      height: 81rpx;
      border-radius: 50%;
    }

    .distribution {
      position: absolute;
      bottom: 30rpx;
      width: 80rpx;
      height: 30rpx;
      text-align: center;
      color: #fff;
      background: var(--theme-color, $uni-color-primary);
      border-radius: 15rpx;
      font-size: 22rpx;
      font-family: PingFang SC;
      font-weight: 500;
    }
  }

  .main {
    .common {
      display: flex;
      line-height: 40rpx;
      color: #000;
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;

      .commonVal {
        width: 120rpx;
        margin-right: 41rpx;
        color: #666;
      }
    }
  }

  .icon-arrow-right {
    position: absolute;
    top: 80rpx;
    right: 32rpx;
    font-size: 20rpx;
  }

  .member {
    position: relative;
    min-width: 100rpx;
    padding: 3rpx 5rpx;
    margin-left: 10rpx;
    border-radius: 20rpx;
    color: #000;
    background: rgba(255, 75, 64, 0.1);
    font-size: 24rpx;
    padding-left: 48rpx;

    .grade {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 6rpx;
      left: 8rpx;
      width: 34rpx;
      height: 34rpx;
      color: #fff;
      background: rgb(246, 198, 102);
      border-radius: 100%;
      font-size: 18rpx;
    }
  }
}
</style>
