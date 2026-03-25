<template>
  <view class="person-box flex flex-middle" :style="{ backgroundColor: bgColor }">
    <image :src="headpath" class="img mr-20" />
    <view class="flex-1 overflow-h">
      <view class="fs-30 fw-bold c-3 ellipsis mb-10">{{ item.showname }}</view>
      <view class="fs-28 c-6">{{ item.mobile }}</view>
    </view>
    <view class="iconfont icon-dianhua phone-icon fs-34" @click="phoneCall(item.mobile)"></view>
  </view>
</template>

<script>
import { staticURL } from '@/config'
export default {
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      }
    },
    bgColor: {
      type: String,
      default: '#fff'
    }
  },
  data() {
    return {}
  },
  computed: {
    // 头像, 没有上传头像的展示默认头像
    headpath() {
      const { salesmanid, headpath } = this.item
      const defaultAvatar = staticURL() + (salesmanid ? 'common/default-sale.png' : 'common/default-dealer.png')
      return headpath || defaultAvatar
    }
  },
  methods: {
    // 拨打电话
    phoneCall(phoneNumber) {
      uni.makePhoneCall({
        phoneNumber: phoneNumber
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.person-box {
  position: relative;
  border-radius: 10rpx;
  padding: 32rpx 34rpx;
  .img {
    width: 90rpx;
    height: 90rpx;
    flex-shrink: 0;
  }
  .phone-icon {
    color: $uni-color-edit;
  }
}
</style>
