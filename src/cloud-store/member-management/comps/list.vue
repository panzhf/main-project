<template>
  <view class="listWhole">
    <view v-for="(item, index) in list" :key="index" class="list" @tap="handleDetail(item.Id)">
      <view class="picture">
        <image :src="item.HeadPath || defaultAvatar" />
      </view>
      <view class="main">
        <view v-if="item.NickName" class="common">
          <view class="commonVal">微信名称</view>
          <view>{{ item.NickName ? item.NickName : '---' }}</view>
          <!-- (分销员状态=>0：待审核 1：审核通过（正常） 2：审核不通过 3：已清退) -->
          <view v-if="item.AuditStatus == '0'" class="common-status pass">待审核</view>
          <view v-else-if="item.AuditStatus == '1'" class="common-status normal">正常</view>
          <view v-else-if="item.AuditStatus == '2'" class="common-status audit">未通过</view>
          <view v-else class="common-status pass" @tap.stop="show = true">
            已清退
            <text style="font-size: 23rpx" class="iconfont iconshuoming"></text>
          </view>
        </view>
        <view class="common">
          <view class="commonVal">手机号</view>
          <view>{{ item.Mobile ? item.Mobile : '---' }}</view>
        </view>
        <view class="common">
          <view class="commonVal">创建时间</view>
          <view>{{ item.AddTime }}</view>
        </view>
        <view v-if="item.OpenId && item.AuditStatus === 1" class="common">
          <view class="commonVal">加入时间</view>
          <view>{{ item.AuditTime }}</view>
        </view>
      </view>
    </view>
    <!-- 说明 -->
    <u-modal v-model="show" title="-该分销员被品牌商清退-" confirm-text="我知道了">
      <view class="slot-content" style="font-size: 26rpx; font-weight: bold; padding: 25rpx 83rpx">
        <view>1、无法邀请他人注册成为分销员</view>
        <view>2、无法参与推广赚佣、推广有礼活动</view>
        <view>3、分销员下级可能会被品牌商转移</view>
        <view>4、可以正常结算已存在的推广订单</view>
      </view>
    </u-modal>
  </view>
</template>
<script>
import { staticURL } from '@/config'
export default {
  props: {
    list: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      show: false,
      defaultAvatar: staticURL() + 'personal/defaultHeading.jpg'
    }
  },
  methods: {
    handleDetail(id) {
      uni.navigateTo({
        url: `./detail?Id=${id}`
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.listWhole {
  position: relative;
  padding-bottom: 60rpx;
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
      top: 70rpx;
      width: 80rpx;
      height: 30rpx;
      text-align: center;
      color: #fff;
      background: #ff4c40;
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
      align-items: center;
      .commonVal {
        width: 120rpx;
        margin-right: 41rpx;
        color: #666;
      }
      .common-status {
        padding: 0 10rpx;
        font-size: 21rpx;
        margin-left: 15rpx;
        background: #ffffff;
        border-radius: 16px;
        padding: 0 10rpx;
      }
      .audit {
        border: 1px solid #555555;
        color: #555555;
      }
      .normal {
        border: 1px solid #3daf35;
        color: #3daf35;
      }
      .pass {
        color: #ff4b40;
        border: 1px solid #ff4b40;
      }
    }
  }

  .aduit {
    position: absolute;
    top: 80rpx;
    width: 110rpx;
    height: 56rpx;
    line-height: 56rpx;
    text-align: center;
    right: 32rpx;
    font-size: 26rpx;
    color: #fff;
    background-color: #ff5e33;
    border-radius: 30rpx;
  }

  .iconweitongguo {
    position: absolute;
    top: 46rpx;
    right: 41rpx;
    color: #686868;
    font-size: 90rpx;
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
