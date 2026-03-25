<template>
  <view class="address-edit" :style="themeVars">
    <view class="form bg-f">
      <view class="form-item flex bd-e">
        <text class="mr-10 require-color">*</text>
        <view class="key">地区信息</view>
        <view v-if="address" class="value flex-1 ellipsis-2" style="margin-right: 150rpx">
          {{ address }}
        </view>
        <view class="iconfont icon-address fs-30 text-center edit-color" @tap="handleAddressMap">
          <text class="fs-24 ml-10">获取定位</text>
        </view>
      </view>
      <view :class="['form-item flex flex-middle', showHouseNumber ? 'bd-e' : '']">
        <text class="mr-10 require-color">*</text>
        <view class="key">详细地址</view>
        <view class="value flex-1">
          <textarea
            v-model.trim="storeInfo.address"
            class="proDescribe"
            placeholder="详细地址"
            :auto-height="true"
            placeholder-class="placeholder"
            maxlength="50"
            @blur="handleGetValue($event, 'a')"
          ></textarea>
        </view>
      </view>
      <view v-if="showHouseNumber" class="form-item flex flex-middle">
        <text class="mr-10 require-color">*</text>
        <view class="key">门牌号</view>
        <view class="value flex-1">
          <textarea
            v-model.trim="storeInfo.houseNumber"
            class="proDescribe"
            placeholder="补充楼栋、门牌号信息"
            :auto-height="true"
            placeholder-class="placeholder"
            maxlength="20"
            @blur="handleGetValue($event, 'h')"
          ></textarea>
        </view>
      </view>
    </view>
    <view class="form-button">
      <button class="primary-btn round" hover-class="button-action" @tap="SaveStoreInfo">确认修改</button>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { getUserLocation } from 'packages/utils/location-mp.js'
import { apiUpdateStoreInfo } from '@/api/store'
import { specialRegisterStyle } from 'packages/config/custom'
export default {
  components: {},
  data() {
    return {
      m: '', // 只有注册 && 宝洁才需要显示门牌号,其他页面不要传品牌编号
      storeInfo: {
        province: '',
        city: '',
        area: '',
        street: '',
        address: '',
        lanandlat: '',
        houseNumber: ''
      },
      loading: false,
      type: 0 // 1店铺  0注册激活页
    }
  },
  computed: {
    isCustom() {
      return specialRegisterStyle.includes(this.m)
    },
    showHouseNumber() {
      return this.m && this.isCustom
    },
    address() {
      let { province, city, area, street } = this.storeInfo
      return (province || '') + (city || '') + (area || '') + (street || '')
    }
  },
  async onLoad(options) {
    this.m = options.m ? options.m.toString() : ''
    this.type = options.type ? Number(options.type) : 0
    const storeInfoTemp = this.type === 1 ? this.$store.state.storeInfo : this.$store.state.storeRegisterAddress
    this.storeInfo = { ...this.storeInfo, ...storeInfoTemp }
    if (!this.storeInfo.lanandlat) {
      setTimeout(() => {
        this.chooseLocation()
      }, 300)
    }
  },
  onShow() {
    this.$refs.privacyPopup && this.$refs.privacyPopup.refresh()
  },
  methods: {
    handleGetValue(e, type) {
      const v = e.detail.value
      type === 'a' ? (this.storeInfo.address = v) : (this.storeInfo.houseNumber = v)
    },
    handleAddressMap() {
      this.chooseLocation()
    },
    // 获取用户当前地址
    async chooseLocation() {
      let resData = await getUserLocation()
      const { province, city, district: area, town: street, address, lonandlat: lanandlat } = resData
      this.storeInfo = {
        ...this.storeInfo,
        province,
        city,
        area,
        street,
        address,
        lanandlat
      }
      this.$uploadLog({
        type: 'location',
        data: resData
      })
    },
    // 保存店铺信息
    SaveStoreInfo() {
      if (this.type === 0 && !this.storeInfo.lanandlat) {
        return this.$msg('暂未录入经纬度信息，请重新获取定位')
      }
      if (this.storeInfo.province === '' || this.storeInfo.city === '') return this.$msg('请选择地区信息')
      if (this.storeInfo.address === '') return this.$msg('请填写详细地址')
      if (this.showHouseNumber && this.storeInfo.houseNumber === '') return this.$msg('请填写门牌号')
      this.updateStoreInfo()
    },
    async updateStoreInfo() {
      if (this.loading) return
      this.loading = true
      if (this.type === 1) {
        // 修改店铺地址
        let { address, lanandlat } = this.storeInfo
        let res = await apiUpdateStoreInfo({
          address,
          lanandlat
        })
        this.loading = false
        if (this.$ck(res, true)) {
          let { province, city, area, street, address } = this.storeInfo
          this.$store.dispatch('updateStoreInfo', {
            province,
            city,
            area,
            street,
            address
          })
          this.$msg('修改成功', { icon: 'success' })
          this.$goBack({ delay: 1500 })
        }
      } else {
        let { province, city, area, street, address, lanandlat, houseNumber } = this.storeInfo
        this.$store.dispatch('updateStoreRegisterInfo', {
          province,
          city,
          area,
          street,
          address,
          lanandlat,
          houseNumber
        })
        this.loading = false
        this.$goBack()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  margin: 20rpx;
  padding: 0 30rpx 30rpx;
  border-radius: 10rpx;
  line-height: 40rpx;
  .form-title {
    @include primary-title(32rpx, #000);
  }
  &-item {
    padding: 30rpx 0;
    font-size: 30rpx;
    .key {
      width: 150rpx;
      color: $uni-text-color-grey;
    }
    .value {
      text-align: left;
    }
    .icon-address {
      position: absolute;
      top: 0;
      right: -20rpx;
      width: 150rpx;
      padding: 30rpx 0;
      z-index: 10;
    }
  }
  .proDescribe {
    display: block;
    width: 100%;
    border: none;
    font-size: 32rpx;
    z-index: 0;
  }
}
.form-button {
  margin: 60rpx 20rpx 0;
}
.require-color {
  color: #ff4b40;
}
</style>
