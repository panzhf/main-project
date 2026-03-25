<template>
  <view class="brand-box" :style="themeVars">
    <view v-for="(item, index) in storeList" :key="index" class="brand-item">
      <view class="brand-info flex-middle">
        <image
          class="avatar"
          :src="item.memberloginheadpath ? item.memberloginheadpath : defaultHeadImg"
          mode="scaleToFill"
        />
        <text class="name ellipsis">{{ item.memberloginname }}</text>
      </view>
      <view class="shop-list">
        <view
          v-for="(storeItem, storeIndex) in item.storelist"
          :key="storeIndex"
          class="shop-item flex ub-pj flex-middle"
        >
          <view class="shop-info">
            <view class="shop-info__name ellipsis-2">
              {{ storeItem.mainpartname }}
            </view>
            <view class="mt-10">
              <view v-if="storeItem.systemid == storeId" class="choosedStore mr-10">当前店铺</view>
              <view class="role">
                {{ storeItem.roletype | roleTypeFilter }}
              </view>
            </view>
          </view>
          <view class="shop-select" @tap="handleSelect(storeItem)">选择</view>
        </view>
      </view>
    </view>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
  </view>
</template>

<script>
import { hideHomeButton } from '@/utils/set-mp'
import { apiGetstoreList } from '@/api/store'
import { storeHeadImage } from '@/utils/default-picture'
import { roleTypeFilter } from '@/filters'
import commonPopupMixin from '@/mixins/common-popup'
import { jumpToSpecial } from '@/utils/set-storage'
export default {
  filters: { roleTypeFilter },
  mixins: [commonPopupMixin],
  data() {
    return {
      defaultHeadImg: storeHeadImage, // 缺省图片
      storeList: [], // 店铺列表
      storeId: -1, // 当前店铺的id
      from: ''
    }
  },
  onLoad(options) {
    // 隐藏主页按钮
    hideHomeButton()
    this.from = options.from || ''
    let storeSettingInfo = uni.getStorageSync('storeSettingInfo')
    if (storeSettingInfo) {
      let storeInfo = JSON.parse(storeSettingInfo)
      this.storeId = storeInfo.storeId
    }
    if (this.from === 'login') {
      this.storeList = JSON.parse(uni.getStorageSync('brandList'))
    } else {
      this.fetchStoreList()
    }
  },
  methods: {
    async fetchStoreList() {
      // 获取店铺列表
      let res = await apiGetstoreList()
      if (this.$ck(res, true)) {
        this.storeList = res.return_data.list
        uni.setStorageSync('storeNumber', res.return_data.totalcount)
      }
    },
    handleSelect(item) {
      let { systemid, mainpartname } = item
      if (parseInt(systemid) === 0) return this.$msg(`不存在店铺"${mainpartname}"`)
      jumpToSpecial(item)
    },
    handleConfirm() {
      this.showPopup = false
    }
  }
}
</script>

<style lang="scss" scoped>
.brand-box {
  padding: 22rpx 20rpx;
  .brand-item {
    border-radius: 10rpx;
    &:not(:first-child) {
      margin-top: 30rpx;
    }
    .brand-info {
      padding: 16rpx 30rpx 16rpx 0;
      display: flex;
      .avatar {
        width: 48rpx;
        height: 48rpx;
        border-radius: 100%;
      }
      .name {
        flex: 1;
        font-size: 30rpx;
        color: #000;
        font-weight: 700;
        margin-left: 13rpx;
      }
    }
    .shop-list {
      padding: 0 30rpx;
      background: #fff;
      border-radius: 10rpx;
      box-shadow: 0 0 5rpx 5rpx #eaeaea;
      .shop-item {
        padding: 40rpx 0;
        &:not(:last-child) {
          @include border-bottom($uni-bg-color-split);
        }
        .shop-info {
          flex: 1;
          &__name {
            width: 472rpx;
            font-size: 30rpx;
            font-weight: 700;
          }
          .role {
            @include role-tag;
          }
          .choosedStore {
            display: inline-block;
            width: 100rpx;
            height: 30rpx;
            // background: #ff7640;
            background: var(--theme-color, $uni-color-primary);
            border-radius: 15rpx;
            font-size: 22rpx;
            letter-spacing: -1rpx;
            text-align: center;
            color: #fff;
            font-weight: 500;
          }
        }
        .shop-select {
          width: 120rpx;
          height: 60rpx;
          line-height: 58rpx;
          text-align: center;
          // color: $uni-text-color-primary;
          color: var(--theme-color, $uni-color-primary);
          // border: 1px solid $uni-text-color-primary;
          border: 1px solid var(--theme-color, $uni-color-primary);
          border-radius: 32rpx;
        }
      }
    }
  }
}
</style>
