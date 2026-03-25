<template>
  <view :style="themeVars">
    <view class="shop-detail">
      <tab
        :tab="tabMenu"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="activeIndex"
        :active-bag-color="themeInfo.color"
      ></tab>
      <view v-show="activeIndex === 0">
        <!-- 基础 门店信息 -->
        <view class="form bg-f">
          <view class="form-item flex flex-middle bd-e" @tap="changeHeadImg">
            <view class="form-item__key">门头照</view>
            <view class="form-item__value flex-1 flex flex-end">
              <v-img
                class="personal-avatar avatar-72"
                :src="storeInfo.shopfor || defaultHeadImg"
                lazy-load="true"
                :is-circle="true"
                :size="72"
              />
            </view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handlePopup('editShopName')">
            <view class="form-item__key">店铺名称</view>
            <view class="form-item__value flex-1 ellipsis-2">{{ storeInfo.storename }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handleEditAdress">
            <view class="form-item__key">店铺地址</view>
            <view class="form-item__value flex-1 ellipsis-2">{{ storeAdress }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex">
            <view class="form-item__key">创建时间</view>
            <view class="form-item__value flex-1">{{ storeInfo.addtime }}</view>
            <text v-if="roleType === 2" class="form-item__right"></text>
          </view>
        </view>
        <!-- 负责人信息 -->
        <view v-if="roleType === 2 || roleType === 3" class="form bg-f">
          <view class="form-title pt-30">负责人信息</view>
          <view class="form-item flex bd-e" @tap="handlePopup('editLeader')">
            <view class="form-item__key">负责人</view>
            <view class="form-item__value flex-1">{{ leader }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item" @tap="handleChangePhone">
            <view class="flex">
              <view class="form-item__key">手机号码</view>
              <view class="form-item__value flex-1">{{ mobile }}</view>
              <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
            </view>
            <view class="fs-22 c-9 tx-r">门店负责人手机号码，用于登录管理门店助手</view>
          </view>
        </view>
        <!-- 绑定信息 -->
        <bind-account class="block" />
      </view>
      <view v-show="activeIndex === 1">
        <view class="form bg-f">
          <view class="form-item flex bd-e" @tap="handleEditStoreImg">
            <view class="form-item__key shrink-0">门店图片</view>
            <view class="form-item__value flex-1">
              <view v-if="storeImgList.length > 0" class="shop-img-wrapper flex-wrap flex-end">
                <v-img
                  v-for="(img, index) in storeImgList"
                  :key="index"
                  :src="img"
                  lazy-load="true"
                  :size="80"
                  class="shop-img"
                />
              </view>
              <view v-if="storeImgList.length === 0">暂无</view>
            </view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handlePhoneEdit">
            <view class="form-item__key">门店电话</view>
            <view class="form-item__value flex-1">{{ phoneno }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handlePopup('editAvgPrice')">
            <view class="form-item__key">人均价格</view>
            <view class="form-item__value flex-1">{{ avgPrice }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handlePopup('editBusinessHours')">
            <view class="form-item__key">营业时间</view>
            <view class="form-item__value flex-1">{{ businessHours }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handlePopup('editRecommend')">
            <view class="form-item__key">推荐</view>
            <view class="form-item__value flex-1">{{ recommend }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex bd-e" @tap="handlePopup('editSpecialService')">
            <view class="form-item__key">特色服务</view>
            <view class="form-item__value flex-1">{{ specialService }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
          <view class="form-item flex" @tap="handlePopup('editIntroduction')">
            <view class="form-item__key">简介</view>
            <view class="form-item__value flex-1">{{ introduction }}</view>
            <text v-if="roleType === 2" class="form-item__right" :class="operClass"></text>
          </view>
        </view>
      </view>
    </view>
    <!-- 店员退出按钮 -->
    <template v-if="roleType === 3">
      <view class="exit-button-placeholder"></view>
      <button class="exit-button" @click="handleExitStore">退出门店</button>
    </template>
    <common-popup
      v-model="showPopup"
      type="prompt"
      :title="popTitle"
      :max-length="maxLength"
      :tip="popTips"
      :default-value="popDaultValue"
      :input-type="popInputType"
      :placeholder="popPlaceholder"
      :suffix-text="popSuffix"
      @cancel="cancelConfirm"
      @confirm="popupComfirm"
    ></common-popup>
    <common-popup
      v-model="showConfirmPopup"
      :confirm-delay="5"
      type="confirm"
      title="温馨提示"
      content="确定退出本店吗？"
      @confirm="exitStore"
    ></common-popup>
    <common-popup
      v-model="showStoreImgPopup"
      type="confirm"
      title="修改门店图片"
      :max-size="true"
      @cancel="handleCancelStoreImg"
      @confirm="handleConfirmStoreImg"
    >
      <view class="store-img-popup-content">
        <upload v-model="tempStoreImgList" :max-length="9" :multiple="true" />
        <view class="fs-24 mt-20 text-left" style="color: #aaa">最多可上传9张图片，尺寸为：640*340px</view>
      </view>
    </common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiLogout } from '@/api/personal'
import { apiUpdateStoreInfo } from '@/api/store'
import { apiGetclerkDelete } from '@/api/sales.js'
import { chooseImg, uploadImg } from '@/utils/upload'
import { storeHeadImage } from '@/utils/default-picture'
import Tab from '@/components/tab/index.vue'
import BindAccount from '@/components/bind-account'
import Upload from 'packages/components/upload/upload.vue'
export default {
  components: {
    Tab,
    BindAccount,
    Upload
  },
  data() {
    return {
      storeId: 0, // 门店id
      memberLogin: '', //商家编号
      roleType: -1, // 1-店主2-负责人-3店员,负责人才可修改内容
      popType: '', //editShopName：修改店铺名称   editLeader：修改负责人
      showPopup: false, // true 显示弹窗
      showConfirmPopup: false, // true 显示弹窗
      maxLength: 30, // 弹窗输入框输入字符长度
      popTitle: '', // 弹窗标题
      popTips: '', // 弹窗里显示的提示文字
      popDaultValue: '', // 弹窗输入框的默认文字
      popInputType: 'input', // 弹窗输入框类型：input / textarea / number
      popPlaceholder: '', // 弹窗输入框的 placeholder
      popSuffix: '', // 弹窗输入框的后缀文字
      defaultHeadImg: storeHeadImage, // 缺省图片
      activeIndex: 0, // 切换
      tabMenu: ['基础信息', '服务信息'],
      storeImgList: [], // 门店图片列表
      showStoreImgPopup: false, // 门店图片编辑弹窗
      tempStoreImgList: [] // 临时门店图片列表
    }
  },
  computed: {
    storeAdress() {
      let { province, city, area, street, address } = this.storeInfo
      return (province || '') + (city || '') + (area || '') + (street || '') + (address || '')
    },
    operClass() {
      return this.roleType === 2 ? 'icon iconfont icon-arrow-right' : ''
    },
    storeInfo() {
      return this.$store.state.storeInfo
    },
    mobile() {
      let { mobile } = this.storeInfo
      let reg = /^(\d{3})\d{4}(\d{4})$/
      if (this.roleType === 3) mobile = mobile.replace(reg, '$1****$2')
      return mobile
    },
    leader() {
      let { leader } = this.storeInfo
      if (this.roleType === 3) leader = leader.replace(/^./, '*')
      return leader
    },
    avgPrice() {
      return this.storeInfo.percapita || '暂无'
    },
    businessHours() {
      return this.storeInfo.businesshours || '暂无'
    },
    recommend() {
      return this.storeInfo.recommend || '暂无'
    },
    specialService() {
      return this.storeInfo.characteristic || '暂无'
    },
    introduction() {
      return this.storeInfo.introduction || '暂无'
    },
    phoneno() {
      return this.storeInfo.phoneno || '暂无'
    }
  },
  watch: {
    'storeInfo.storeimg': {
      handler(val) {
        if (val) {
          this.storeImgList = val.split(',').filter(item => item)
        } else {
          this.storeImgList = []
        }
      },
      immediate: true
    }
  },
  onLoad() {},
  onShow() {
    let info = JSON.parse(uni.getStorageSync('storeSettingInfo'))
    this.storeId = info.storeId
    this.memberLogin = info.memberLogin
    this.roleType = parseInt(info.roleType)
    this.fetchStoreBaseInfo()
  },
  methods: {
    async exitStore() {
      this.showConfirmPopup = false
      try {
        const res = await apiGetclerkDelete({ sysclerkid: 0 })
        if (!this.$ck(res)) return

        this.$msg('退出成功')
        const outInfo = await apiLogout()
        if (this.$ck(outInfo, true)) {
          uni.reLaunch({ url: '/pages/login/index' })
        } else {
          this.$uploadLog({
            type: 'logout',
            desc: '登出-店员退出门店',
            data: outInfo
          })
        }
      } catch (error) {
        this.$msg('操作失败，请重试')
      }
    },
    handleExitStore() {
      this.showConfirmPopup = true
    },
    fetchStoreBaseInfo() {
      this.$store.dispatch('setStoreInfo', { storeid: this.storeId, m: this.memberLogin })
    },
    handlePopup(type) {
      if (this.roleType !== 2) return
      this.popType = type
      this.popSuffix = ''
      switch (type) {
        case 'editShopName':
          this.popTitle = '修改店铺名称'
          this.popPlaceholder = ''
          this.popTips = '最多30个字，不应含有地区、地址、分店名、括号、特殊字符等信息，错误示例：北京XXX公司（XX）'
          this.maxLength = 30
          this.popInputType = 'input'
          this.popDaultValue = this.storeInfo.storename
          break
        case 'editLeader':
          this.popTitle = '修改负责人'
          this.popPlaceholder = ''
          this.popTips = '最多8个字'
          this.maxLength = 8
          this.popInputType = 'input'
          this.popDaultValue = this.storeInfo.leader
          break
        case 'editAvgPrice':
          this.popTitle = '修改人均价格'
          this.popPlaceholder = ''
          this.popTips = '最多10位数，大于零的整数，须如实填写，默认单位为人民币'
          this.maxLength = 10
          this.popInputType = 'number'
          this.popDaultValue = this.storeInfo.percapita || ''
          this.popSuffix = '元'
          break
        case 'editBusinessHours':
          this.popTitle = '修改营业时间'
          this.popPlaceholder = '如，10:00-24:00'
          this.popTips = '最多20个字'
          this.maxLength = 20
          this.popInputType = 'input'
          this.popDaultValue = this.storeInfo.businesshours || ''
          break
        case 'editRecommend':
          this.popTitle = '修改推荐'
          this.popPlaceholder = '如，推荐菜、推荐商品、推荐房间'
          this.popTips = '最多200个字'
          this.maxLength = 200
          this.popInputType = 'textarea'
          this.popDaultValue = this.storeInfo.recommend || ''
          break
        case 'editSpecialService':
          this.popTitle = '修改特色服务'
          this.popPlaceholder = '如，免费停车，WIFI'
          this.popTips = '最多50个字'
          this.maxLength = 50
          this.popInputType = 'textarea'
          this.popDaultValue = this.storeInfo.characteristic || ''
          break
        case 'editIntroduction':
          this.popTitle = '修改简介'
          this.popPlaceholder = '对品牌或门店的简要介绍'
          this.popTips = '最多300个字'
          this.maxLength = 300
          this.popInputType = 'textarea'
          this.popDaultValue = this.storeInfo.introduction || ''
          break
        case 'editPhoneno':
          this.popTitle = '修改门店电话'
          this.popPlaceholder = ''
          this.popTips = '最多20个字，手机号／固话，固定电话需加区号；区号、分机号均用"-"连接'
          this.maxLength = 20
          this.popInputType = 'input'
          this.popDaultValue = this.storeInfo.phoneno || ''
          break
      }
      this.showPopup = true
    },
    popupComfirm(data) {
      // 处理返回的数据
      let newData = data && data.trim()

      // 店铺名称和负责人姓名必填
      if (!newData && (this.popType === 'editShopName' || this.popType === 'editLeader')) {
        const msgMap = {
          editShopName: '请输入店铺名称',
          editLeader: '请输入负责人姓名'
        }
        return this.$msg(msgMap[this.popType])
      }

      // 人均价格校验：如果有输入，必须是大于零的整数，最多10位数
      if (this.popType === 'editAvgPrice' && newData) {
        // 检查是否为纯数字
        if (!/^\d+$/.test(newData)) {
          return this.$msg('人均价格必须是整数')
        }
        // 检查是否大于0
        const price = parseInt(newData, 10)
        if (price <= 0) {
          return this.$msg('人均价格必须大于零')
        }
        // 检查位数
        if (newData.length > 10) {
          return this.$msg('人均价格最多10位数')
        }
      }

      if (this.popType === 'editPhoneno' && newData) {
        if (!/^[0-9-]+$/.test(newData)) {
          return this.$msg('请填写正确的门店电话')
        }
      }

      const paramMap = {
        editShopName: { storename: newData },
        editLeader: { leader: newData },
        editAvgPrice: { percapita: newData ? Number(newData) : 0 },
        editBusinessHours: { businesshours: newData || '' },
        editRecommend: { recommend: newData || '' },
        editSpecialService: { characteristic: newData || '' },
        editIntroduction: { introduction: newData || '' },
        editPhoneno: { phoneno: newData || '' }
      }

      if (paramMap[this.popType]) {
        this.updateStoreInfo(paramMap[this.popType])
      }
      this.popHide()
    },
    cancelConfirm() {
      this.popHide()
    },
    popHide() {
      this.popDaultValue = ''
      this.popType = ''
      this.showPopup = false
    },
    handleChangePhone() {
      if (this.roleType !== 2 || !this.storeInfo.mobile) return
      // 修改手机号码
      uni.navigateTo({
        url: `/shop/mobile/confirm?leaderOldMobile=${this.storeInfo.mobile}&storeLeader=${this.storeInfo.leader}`
      })
    },
    async changeHeadImg() {
      // 店铺负责人才可以修改门店
      if (this.roleType !== 2) return
      // 修改头像
      const paths = await chooseImg({ mediaType: ['image'] })
      if (paths?.length) {
        let res = await uploadImg(paths[0])
        if (this.$ck(res, true)) {
          let path = res.return_data
          if (path) {
            let param = {
              shopfor: path
            }
            this.updateStoreInfo(param)
          }
        }
      }
    },
    async updateStoreInfo(param) {
      // 修改店铺信息,包括头像 名称 负责人姓名等
      let res = await apiUpdateStoreInfo(param)
      if (this.$ck(res, true)) {
        this.fetchStoreBaseInfo()
        this.$msg('修改成功', { icon: 'success' })
      }
    },
    handleEditAdress() {
      if (this.roleType !== 2) return
      uni.navigateTo({
        url: `/shop/address/edit?type=1`
      })
    },
    handleEditStoreImg() {
      // 编辑门店图片
      if (this.roleType !== 2) return
      this.tempStoreImgList = [...this.storeImgList]
      this.showStoreImgPopup = true
    },
    handleCancelStoreImg() {
      // 取消门店图片编辑
      this.showStoreImgPopup = false
      this.tempStoreImgList = []
    },
    handleConfirmStoreImg() {
      // 确认门店图片编辑
      const storeimg = this.tempStoreImgList.join(',')
      this.updateStoreInfo({ storeimg })
      this.showStoreImgPopup = false
    },
    handlePhoneEdit() {
      // 编辑门店电话
      if (this.roleType !== 2) return
      this.handlePopup('editPhoneno')
    }
  }
}
</script>

<style lang="scss" scoped>
.form {
  margin: 20rpx;
  padding: 0 30rpx;
  border-radius: 10rpx;
  line-height: 40rpx;
  .form-title {
    @include primary-title(32rpx, #000);
  }
  &-item {
    padding: 30rpx 0;
    font-size: 30rpx;
    &__key {
      color: $uni-text-color-grey;
    }
    &__value {
      margin-left: 30rpx;
      text-align: right;
    }
    &__right {
      font-size: 20rpx;
      color: $uni-text-color-grey;
      width: 40rpx;
      text-align: right;
    }
  }
}
.block {
  display: block;
  padding: 0 20rpx;
}
.exit-button-placeholder {
  @include safe-area(90rpx, height);
}
.exit-button {
  position: fixed;
  background: var(--theme-color, $uni-color-primary);
  border-radius: 45rpx;

  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
  left: 50%;
  transform: translateX(-50%);
  @include whl(580rpx, 90rpx);
  @include safe-area(30rpx, bottom);
}
.shop-img-wrapper {
  margin-right: -16rpx;
  margin-bottom: -16rpx;
}
.shop-img {
  width: 80rpx;
  height: 80rpx;
  border-radius: 10rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}
.store-img-popup-content {
  padding: 20rpx 0;
}
</style>
