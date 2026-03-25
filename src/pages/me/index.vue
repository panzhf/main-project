<template>
  <view :style="themeVars">
    <view class="personal-info" :style="{ 'background-color': myNavigationBar.PageBgColor }">
      <TitleBar
        :title="myNavigationBar.Title"
        :bgcolor="myNavigationBar.BgColor"
        :bg-pic="myNavigationBar.bgUrl"
        :textcolor="myNavigationBar.FrontColor"
        mix
      />
      <image v-if="myNavigationBar.bgUrl" :src="myNavigationBar.bgUrl" mode="widthFix" class="home-bg" />
      <view v-for="(decorationItem, decorationIndex) in decoration" :key="decorationIndex" class="p-r">
        <template v-if="decorationItem.code === 'RetailUserInfo'">
          <view
            class="main-info flex flex-middle ub-pj"
            :style="{ backgroundImage: `url(${decorationItem.data.bgUrl})`, color: decorationItem.data.color }"
            @tap="handleNavigate"
          >
            <view class="personal-name flex-1">
              <view class="fs-36 ellipsis fw-bold">{{ personalInfo.leader }}</view>
              <view class="fs-28 opacity-70">{{ personalInfo.mobile }}</view>
            </view>
            <image
              class="personal-avatar avatar-96 ml-30"
              :src="personalInfo.headpath ? personalInfo.headpath : defaultHeadImg"
              mode="scaleToFill"
            />
            <view class="ml-20 icon iconfont icon-arrow-right fs-18"></view>
          </view>
        </template>
        <template v-if="decorationItem.code === 'RetailBrandName'">
          <brand-name />
        </template>
        <template v-if="decorationItem.code === 'RetailMyOrder'">
          <my-order :data="decorationItem.data" />
        </template>
        <template v-if="decorationItem.code === 'RetailStaffMgmt'">
          <staff-mgmt :data="decorationItem.data" />
        </template>
        <template v-if="decorationItem.code === 'RetailOtherMgmt'">
          <other-mgmt :data="decorationItem.data" />
        </template>
        <template v-if="decorationItem.code === 'RetailMyImageAd' || decorationItem.code === 'ImageAd'">
          <view class="decoration-full-bleed">
            <image-ad :img-data="decorationItem.data" />
          </view>
        </template>
        <template v-if="decorationItem.code === 'RetailMyBlankSegmente' || decorationItem.code === 'BlankSegmente'">
          <view class="decoration-full-bleed">
            <blank-segmente :blank-data="decorationItem.data" />
          </view>
        </template>
      </view>
    </view>

    <AiEntry v-if="showAiEntry" :ai-float-icon="aiFloatData.aiFloatIcon" @ai-entry="handleAiEntry" />
    <tabbar></tabbar>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { mapState } from 'vuex'
import { staticURL } from '@/config'
import { apiGetPersonalInfo } from '@/api/personal'
import { apiServiceConfig } from 'packages/api/service'
import TitleBar from '@/components/title-bar/index.vue'
import Tabbar from '@/components/tabbar/index.vue'
import AiEntry from './comps/ai-entry.vue'
import MenuList from '@/mixins/set-menu'
import BrandName from 'packages/design/retail/brand-name.vue'
import MyOrder from 'packages/design/retail/my-order.vue'
import StaffMgmt from 'packages/design/retail/staff-mgmt.vue'
import OtherMgmt from 'packages/design/retail/other-mgmt.vue'
import ImageAd from 'packages/design/basic/image-ad.vue'
import BlankSegmente from 'packages/design/basic/blank-segmente.vue'
import { decorationMyMixin } from '@/mixins/decoration'
import { setTitleColorMixin } from 'packages/mixins/navigation'
import { hideHomeButton } from '@/utils/set-mp'
import { personalHeadImage } from '@/utils/default-picture'
import { authRequest } from '@/utils/third-auth'
import { reportLog } from 'packages/utils/report'
import { getExtConfig } from '@/config'
export default {
  components: {
    TitleBar,
    Tabbar,
    AiEntry,
    BrandName,
    MyOrder,
    StaffMgmt,
    OtherMgmt,
    ImageAd,
    BlankSegmente
  },
  mixins: [MenuList, decorationMyMixin, setTitleColorMixin],
  data() {
    return {
      brandImg: staticURL() + 'shop/shopPictureDefault.png',
      memberLoginName: '',
      defaultHeadImg: personalHeadImage, // 默认图片
      // bgPic: staticURL() + 'personal/bg.png', // 顶部背景图
      personalInfo: {
        headpath: '',
        loginname: '',
        mobile: '',
        leader: ''
      },
      storeSettingInfo: {},
      unReflesh: false, // true:不需要重新请求数据
      serviceShowAssistant: true
    }
  },
  computed: {
    ...mapState(['storeInfo']),
    showAiEntry() {
      return this.serviceShowAssistant && this.aiFloatData.showAiFloat
    },
    isexpires() {
      return this.storeInfo.isexpires
    },
    showBrandChange() {
      const stores = uni.getStorageSync('storeNumber')
      return stores > 1
    }
  },
  async onLoad() {
    hideHomeButton()
    // 专属版暂时隐藏；showassistant: 0 不显示，1 显示
    const config = getExtConfig()
    this.serviceShowAssistant = !config.isSpecial

    const res = await apiServiceConfig()
    if (this.$ck(res) && res.return_data) {
      const { showassistant } = res.return_data
      // showassistant: 0 不显示，1 显示；未返回时兼容旧接口，默认显示
      this.serviceShowAssistant = !config.isSpecial && (showassistant === undefined || showassistant === 1)
    }
    await this.fetchMyDecoration()
    this.setTitleColor({
      frontColor: this.myNavigationBar.statusColor,
      backgroundColor: this.myNavigationBar.BgColor
    })
    this.setMenu('me')
    let storeSettingInfo = uni.getStorageSync('storeSettingInfo')
    if (storeSettingInfo) {
      let storeInfo = JSON.parse(storeSettingInfo)
      this.memberLoginName = storeInfo.memberLoginName || ''
      //储存信息
      this.storeSettingInfo = JSON.parse(storeSettingInfo)
    }
    this.fetchPersonalInfo()
  },
  onShow() {
    uni.$emit('pageMeOnShow')

    if (this.unReflesh) {
      this.unReflesh = false
      this.personalInfo = JSON.parse(uni.getStorageSync('personalInfo') || '{}')
    }
    uni.$once('aiAgree', () => {
      this.handleAiEntry()
    })
  },
  methods: {
    handleChangeStore() {
      uni.navigateTo({
        url: '/shop/change'
      })
    },
    handleClickOrderList(type) {
      uni.navigateTo({
        url: `/packages/src/order/list?type=${type}`
      })
    },
    handleToDetail(item) {
      if (item.path) {
        uni.navigateTo({
          url: item.path
        })
      }
    },
    async fetchPersonalInfo() {
      // 获取个人信息
      let res = await apiGetPersonalInfo()
      if (this.$ck(res, true)) {
        let personalInfoTemp = {}
        for (let a in res.return_data.accountinfo) {
          personalInfoTemp[a] = res.return_data.accountinfo[a] == null ? '' : res.return_data.accountinfo[a]
        }
        this.personalInfo = personalInfoTemp
        uni.setStorageSync('personalInfo', JSON.stringify(this.personalInfo))
      }
    },
    handleNavigate() {
      // 跳转到个人信息页
      this.unReflesh = true
      uni.navigateTo({
        url: '/personal/info'
      })
    },
    async handleAiEntry() {
      const key = `${this.storeInfo.memberlogin}_${this.storeInfo.storeid}_${this.storeInfo.mobile}`
      uni.setStorageSync('aiAgreeKey', key)
      const map = uni.getStorageSync('aiAgreeMap') || {}
      if (!map[key]) {
        map[key] = {
          agree: false,
          url: ''
        }
      }
      let webViewPath = 'https://www.deeplocal.cn/#/agreement' // 授权页
      const options = { scene: 1310 }

      if (map[key].agree) {
        // 同意过协议直接进入
        if (map[key].url) {
          webViewPath = map[key].url
          reportLog(options)
        } else {
          const authUrl = await authRequest(this.storeInfo, this.personalInfo)
          if (!authUrl) return
          webViewPath = authUrl
          map[key].url = authUrl
          reportLog(options)
          uni.setStorageSync('aiAgreeMap', map)
        }
      }
      uni.setStorageSync('webViewPath', webViewPath)
      uni.navigateTo({
        url: '/packages/src/rule/webview'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.personal-info {
  padding: 0rpx 20rpx 120rpx;
  .brandImg {
    width: 60rpx;
    height: 60rpx;
    text-align: center;
    background: #fff2f2;
    image {
      width: 60rpx;
      height: 60rpx;
    }
  }
  .main-info {
    padding: 0 30rpx 10rpx 40rpx;
    height: 210rpx;
    background-repeat: no-repeat;
    background-position: top center;
    background-size: 750rpx 210rpx;
    margin-top: 10rpx;
    .personal-name {
      width: 300rpx;
    }
    .personal-avatar {
      border: 2px solid currentColor;
    }
  }
  .logout {
    height: 100rpx;
    padding: 0 30rpx;
  }

  .overdue {
    color: #ff4b40;
    font-size: 22rpx;
    margin-right: 16rpx;
  }

  /* 抵消 .personal-info 左右 padding，广告图与空白段占满屏宽 */
  .decoration-full-bleed {
    margin-left: -20rpx;
    margin-right: -20rpx;
    width: calc(100% + 40rpx);
  }
}

.home-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: block;
}
</style>
