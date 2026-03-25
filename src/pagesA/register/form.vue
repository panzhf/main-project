<template>
  <view class="containter" :style="themeVars">
    <view class="form-title">门店信息</view>
    <view class="store-info">
      <u-form ref="uForm" :model="form" label-width="170" :label-style="{ fontSize: '30rpx' }">
        <u-form-item :required="reuseInfo.IsSearchStore" label="门店编号">
          <view class="flex flex-between flex-middle">
            <u-input
              v-model="form.StoreNo"
              style="width: 60%"
              :disabled="reuseInfo.waitStore === 1 || reuseInfo.waitStore === 2"
              :clearable="false"
              maxlength="20"
              placeholder="限20个字符"
            />
            <view v-if="reuseInfo.IsSearchStore" class="special-brands" style="flex: 1">
              <buttom style="margin-right: 12rpx" @tap="handleSearch">搜索</buttom>
              <buttom @tap="handleClear">清空</buttom>
            </view>
          </view>
        </u-form-item>
        <u-form-item required label="门店名称">
          <u-input
            v-model="form.Name"
            :disabled="reuseInfo.waitStore === 1 || reuseInfo.waitStore === 2 || reuseInfo.IsSearchStore"
            :clearable="false"
            maxlength="20"
            placeholder="限20个字符"
          />
        </u-form-item>
        <u-form-item required label="门店地址">
          <view :class="[reuseInfo.waitStore === 1 ? 'stopbind' : '']" @tap="handleChooseLocation">
            <view class="flex flex-between flex-middle">
              <view>{{ form.ProvinceName }}&nbsp;{{ form.CityName }}&nbsp;{{ form.AreaName }}</view>
              <view class="iconfont icon-address"></view>
            </view>
            <view>{{ form.Address }}</view>
          </view>
        </u-form-item>
      </u-form>
    </view>
    <view class="form-title">负责人信息</view>
    <view class="store-info">
      <u-form ref="uForm" :model="form" label-width="170" :label-style="{ fontSize: '30rpx' }">
        <u-form-item required label="负责人">
          <u-input
            v-model="form.Leader"
            maxlength="30"
            :disabled="reuseInfo.waitStore === 1 || reuseInfo.waitStore === 2 || reuseInfo.IsSearchStore"
            :clearable="false"
            placeholder="请输入门店负责人姓名"
          />
        </u-form-item>
        <u-form-item required label="联系手机">
          <u-input v-model="form.Mobile" disabled :clearable="false" maxlength="11" placeholder="请输入手机号码" />
        </u-form-item>
      </u-form>
    </view>
    <!-- 渠道信息 -->
    <view v-if="reuseInfo.IsShowChannel" class="channel-box">
      <view class="form-title">渠道信息</view>
      <view class="store-info">
        <u-form ref="uForm" :model="form" label-width="170" :label-style="{ fontSize: '30rpx' }">
          <u-form-item label="业务员">
            <u-input
              v-model="form.BusinessmanName"
              :disabled="reuseInfo.IsSearchStore"
              placeholder="请输入业务员姓名"
              maxlength="20"
              :clearable="false"
            />
          </u-form-item>
          <u-form-item label="经销商名称">
            <u-input v-model="dealerName" :disabled="reuseInfo.IsSearchStore" type="select" @click="show = true" />
            <u-picker
              v-model="show"
              mode="selector"
              :range="dealerSelect"
              range-key="Name"
              :default-selector="[selectIndex]"
              @confirm="handleSelect"
            ></u-picker>
          </u-form-item>
          <u-form-item label="经销商编号">
            <u-input v-model="dealerNo" disabled :clearable="false" />
          </u-form-item>
        </u-form>
      </view>
    </view>
    <view class="agreement-box">
      <u-checkbox v-model="checked" shape="circle" active-color="#ff5e33">我已阅读并同意</u-checkbox>
      <text style="color: #1ba8ee" @click="handleNacigate">《门店注册协议》</text>
    </view>
    <view class="button-box">
      <view v-if="reuseInfo.IsSearchStore" class="cancel">
        <u-button shape="circle" :custom-style="customStyle" type="error" plain @click="handleBack">取消</u-button>
      </view>
      <view v-if="reuseInfo.waitStore === 1" class="flex-1">
        <u-button type="error" shape="circle" @click="handleActivation">激活</u-button>
      </view>
      <view v-else class="flex-1">
        <u-button type="error" :disabled="reuseInfo.IsSearchStore && btnFlag" shape="circle" @click="handleRegistered">
          {{ reuseInfo.IsSearchStore ? '激活门店' : '提交审核' }}
        </u-button>
      </view>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloudT } from '@/api/cloud-store'
import { getJsCode, hideHomeButton } from '@/utils/set-mp.js'
// import { getLocation, reverseGeocoder } from '@/utils/location-mp.js'
import { getLocation, reverseGeocoder } from 'packages/utils/location-mp.js'
export default {
  components: {},
  data() {
    return {
      form: {
        StoreNo: '',
        Name: '',
        Leader: '',
        Mobile: '',
        BusinessmanName: '',
        DealerId: 0,
        ProvinceName: '',
        CityName: '',
        AreaName: '',
        Address: '',
        LanAndLat: '',
        Latitude: '',
        Longitude: ''
      },
      checked: false,
      show: false,
      btnFlag: true,
      dealerSelect: [],
      selectIndex: 0,
      dealerName: '',
      dealerNo: '',
      chooseInfo: {},
      reuseInfo: {},
      optionsT: ''
    }
  },
  async onLoad(options) {
    hideHomeButton()
    this.optionsT = options.optionsT || '' //定制功能-返回按钮需要用到
    options.chooseInfo ? (this.chooseInfo = JSON.parse(options.chooseInfo)) : (this.chooseInfo = {})
    this.form.StoreNo = this.chooseInfo.StoreNo
    this.form.Name = this.chooseInfo.Name
    this.form.Leader = this.chooseInfo.Leader
    this.reuseInfo = JSON.parse(options.reuseInfo)
    this.form.Mobile = this.reuseInfo.mobile
    this.form.DealerId = this.reuseInfo.dealerId || 0
    if (this.chooseInfo.LanAndLat) {
      this.form.LanAndLat = this.chooseInfo.LanAndLat
      let LanAndLat = this.chooseInfo.LanAndLat.split(',')
      this.form.Latitude = LanAndLat[0]
      this.form.Longitude = LanAndLat[1]
      let res = await reverseGeocoder(this.form.Latitude, this.form.Longitude)
      this.form.ProvinceName = res.province
      this.form.CityName = res.city
      this.form.AreaName = res.district
      this.form.Address = res.street
    } else {
      this.handleLocation()
    }
    // 是否显示渠道信息
    this.reuseInfo.IsShowChannel ? this.handleGetDealerCombo() : ''
  },
  onShow() {
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    // 激活门店的回调
    async handleActivation() {
      if (!this.checked) return this.$msg('请阅读并同意《门店注册协议》')
      if (this.form.StoreNo && !/^[A-Za-z0-9_-]+$/.test(this.form.StoreNo)) {
        return this.$msg('门店编号只能包含英文、数字、英文符号“-” “_”')
      }
      if (!this.form.Name) return this.$msg('请输入门店名称')
      if (!this.form.Leader) return this.$msg('请输入负责人名称')
      if (!this.form.Address) return this.$msg('经纬度不允许为空，请检查是否开启定位并重试')
      let data = {
        StoreID: this.chooseInfo.StoreID,
        MemberLogin: this.reuseInfo.m,
        ChannelID: this.reuseInfo.c,
        Mobile: this.form.Mobile,
        ProvinceName: this.form.ProvinceName,
        CityName: this.form.CityName,
        AreaName: this.form.AreaName,
        Address: this.form.Address,
        Longitude: this.form.Longitude,
        Latitude: this.form.Latitude
      }
      const res = await apiCloudT({
        url: '/api/v1/StoreRegister/ActiveStore',
        method: 'post',
        js_code: await getJsCode(),
        data: JSON.stringify(data)
      })
      if (this.$ck(res)) {
        this.$msg('激活成功')
        setTimeout(() => {
          uni.redirectTo({
            url: './success?type=1'
          })
        }, 1500)
      }
    },
    // 提交审核的/定制功能--激活门店的回调
    async handleRegistered() {
      if (!this.checked) return this.$msg('请阅读并同意《门店注册协议》')
      if (!this.form.StoreNo && this.reuseInfo.IsSearchStore) return this.$msg('请输入门店编号')
      if (this.form.StoreNo && !/^[A-Za-z0-9_-]+$/.test(this.form.StoreNo)) {
        return this.$msg('门店编号只能包含英文、数字、英文符号“-” “_”')
      }
      if (!this.form.Name) return this.$msg('请输入门店名称')
      if (!this.form.Leader) return this.$msg('请输入负责人名称')
      if (!this.form.Address) return this.$msg('经纬度不允许为空，请检查是否开启定位并重试')
      uni.getStorageSync('activateUserInfo')
      let activateUserInfo = uni.getStorageSync('activateUserInfo')
        ? JSON.parse(uni.getStorageSync('activateUserInfo'))
        : {}
      let data = {
        MemberLogin: this.reuseInfo.m,
        ChannelID: this.reuseInfo.c,
        DealerId: Number(this.form.DealerId),
        Name: this.form.Name,
        StoreNo: this.form.StoreNo,
        Mobile: this.form.Mobile,
        ProvinceName: this.form.ProvinceName,
        CityName: this.form.CityName,
        AreaName: this.form.AreaName,
        Address: this.form.Address,
        LanAndLat: this.form.LanAndLat,
        Leader: this.form.Leader,
        BusinessmanName: this.form.BusinessmanName,
        OpenID: activateUserInfo.openid,
        UnionID: activateUserInfo.UnionID
      }
      const res = await apiCloudT({
        url: '/api/v1/StoreRegister/RegisterStore',
        method: 'post',
        js_code: await getJsCode(),
        data: JSON.stringify(data)
      })

      if (this.$ck(res)) {
        uni.removeStorageSync('activateUserInfo')
        if (this.reuseInfo.IsSearchStore) {
          if (res.return_data > 0) {
            this.$msg('激活成功')
            setTimeout(() => {
              uni.redirectTo({
                url: '/pages/login/index'
              })
            }, 1500)
          } else {
            uni.redirectTo({
              url: `./success?msg=${res.return_msg}`
            })
          }
        } else {
          this.$msg('提交审核成功')
          setTimeout(() => {
            uni.redirectTo({
              url: './success?type=2'
            })
          }, 1500)
        }
      } else if (res.return_code === 37018) {
        // 已经创建数量上限的门店跳转到登录页
        this.$msg(res.return_msg)
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/index'
          })
        }, 1500)
      }
    },
    // 定制功能-取消的回调
    handleBack() {
      uni.redirectTo({
        url: `./index?scene=${this.optionsT}`
      })
    },
    // 定制功能--根据门店编号搜索
    async handleSearch() {
      if (!this.form.StoreNo) return this.$msg('请输入门店编号')
      if (this.form.StoreNo && !/^[A-Za-z0-9_-]+$/.test(this.form.StoreNo)) {
        return this.$msg('门店编号只能包含英文、数字、英文符号“-” “_”')
      }
      let data = {
        StoreNo: this.form.StoreNo,
        m: this.reuseInfo.m,
        channelID: this.reuseInfo.c
      }
      const res = await apiCloudT({
        url: '/api/v1/StoreRegister/CheckStoreNo',
        method: 'get',
        js_code: await getJsCode(),
        data: JSON.stringify(data)
      })
      if (this.$ck(res)) {
        let resp = res.return_data
        if (resp === null) return this.$msg('暂无该编号')
        this.form.Name = resp.Name
        this.form.ProvinceName = resp.ProvinceName === null ? '' : resp.ProvinceName
        this.form.CityName = resp.CityName === null ? '' : resp.CityName
        this.form.AreaName = resp.AreaName === null ? '' : resp.AreaName
        this.form.Address = resp.Address === null ? '' : resp.Address
        this.form.Leader = resp.Leader === null ? '' : resp.Leader
        this.form.BusinessmanName = resp.BusinessmanName === null ? '' : resp.BusinessmanName
        this.form.DealerId = resp.DealerId || 0
        this.dealerName = resp.DealerName
        this.dealerNo = resp.DealerNo
        this.btnFlag = false //用来判断一开始激活门店的按钮状态
      }
    },
    // 定制功能-清空数据的回调
    handleClear() {
      this.form.StoreNo = ''
      this.form.Name = ''
      this.form.Leader = ''
      this.dealerName = ''
      this.dealerNo = ''
      this.form.DealerId = 0
      this.form.BusinessmanName = ''
      this.btnFlag = true //用来判断一开始激活门店的按钮状态
    },
    // 跳转门店注册协议
    handleNacigate() {
      uni.navigateTo({
        url: `./agreement?m=${this.reuseInfo.m}&MiniName=${this.reuseInfo.MiniName}&EntName=${this.reuseInfo.EntName}`
      })
    },
    // 获取经销商下拉框数据
    async handleGetDealerCombo() {
      let data = {
        m: this.reuseInfo.m,
        DealerID: Number(this.reuseInfo.dealerId),
        PageIndex: 1,
        ChannelID: this.reuseInfo.c
      }
      let res = await apiCloudT({
        url: '/api/v1/StoreRegister/GetDealerCombo',
        method: 'post',
        js_code: await getJsCode(),
        data: JSON.stringify(data)
      })
      if (this.$ck(res)) {
        this.dealerSelect = res.return_data.Results
        this.dealerName = this.dealerSelect[this.selectIndex].Name
        this.dealerNo = this.dealerSelect[this.selectIndex].No || '-'
        this.form.DealerId = this.dealerSelect[this.selectIndex].ID
      }
    },
    // 选择经销商下拉框的数据
    handleSelect(e) {
      this.selectIndex = e[0]
      this.dealerName = this.dealerSelect[this.selectIndex].Name
      this.dealerNo = this.dealerSelect[this.selectIndex].No || '-'
      this.form.DealerId = this.dealerSelect[this.selectIndex].ID
    },
    // 选择地址
    async handleChooseLocation() {
      let res = await getLocation()
      if (res.latitude && res.longitude) {
        uni.chooseLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          success: res => {
            if (res.name) {
              this.form.Latitude = res.latitude
              this.form.Longitude = res.longitude
              this.form.LanAndLat = `${res.latitude},${res.longitude}`
              const address = res.address
              const name = res.name
              reverseGeocoder(this.form.Latitude, this.form.Longitude).then(resT => {
                this.form.ProvinceName = resT.province
                this.form.CityName = resT.city
                this.form.AreaName = resT.district
                const replaceName =
                  (resT.province === resT.city ? resT.city : resT.province + resT.city) + resT.district
                this.form.Address = address.replace(replaceName, '') + name
              })
            }
          }
        })
      } else {
        this.$msg('获取定位信息失败,请检查是否有开启定位功能')
      }
    },
    async handleLocation() {
      let res = await getLocation()
      if (res.latitude && res.longitude) {
        this.form.Latitude = res.latitude
        this.form.Longitude = res.longitude
        this.form.LanAndLat = `${res.latitude},${res.longitude}`
        let resT = await reverseGeocoder(this.form.Latitude, this.form.Longitude)
        this.form.ProvinceName = resT.province
        this.form.CityName = resT.city
        this.form.AreaName = resT.district
        this.form.Address = resT.street
      }
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.containter {
  .special-brands buttom {
    font-size: 24rpx;
    border-radius: 8rpx;
    border: 2rpx solid #e1e1e1;
    padding: 8rpx 14rpx;
    color: #999;
  }
  .stopbind {
    pointer-events: none;
  }
  .form-title {
    position: relative;
    margin-left: 30rpx;
    padding: 20rpx;
    font-size: 32rpx;
    color: #000;
    &::before {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      margin-top: auto;
      margin-bottom: auto;
      width: 7rpx;
      height: 28rpx;
      border-radius: 4rpx;
      background-color: var(--theme-color, $uni-color-primary);
    }
  }
  .store-info {
    background: #fff;
    padding: 0 50rpx;
  }
  .agreement-box {
    display: flex;
    align-items: center;
    padding: 30rpx 28rpx;
    font-size: 30rpx;
    ::v-deep .u-checkbox__label.data-v-532d01c7 {
      margin-right: 0;
    }
  }
  .button-box {
    display: flex;
    justify-content: space-between;
    padding: 0 30rpx;
    padding-bottom: constant(safe-area-inset-bottom); /*兼容 IOS<11.2*/
    padding-bottom: env(safe-area-inset-bottom); /*兼容 IOS>11.2*/
    .cancel {
      width: 50%;
      margin-right: 15rpx;
    }
  }
}
</style>
