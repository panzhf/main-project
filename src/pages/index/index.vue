<template>
  <view :style="{ 'background-color': navigationBar.PageBgColor }" class="index-page">
    <view v-if="loaded" :style="themeVars">
      <view class="page-home p-r">
        <TitleBar
          :title="navigationBar.Title"
          :bgcolor="navigationBar.BgColor"
          :bg-pic="navigationBar.bgUrl"
          :textcolor="navigationBar.FrontColor"
          mix
        />
        <image v-if="navigationBar.bgUrl" :src="navigationBar.bgUrl" mode="widthFix" class="home-bg" />
        <view v-for="(decorationItem, decorationIndex) in decoration" :key="decorationIndex" class="p-r">
          <template v-if="decorationItem.code === 'RetailStoreInfo'">
            <!-- 店铺信息 -->
            <view
              v-if="storeInfo"
              class="home-info flex flex-middle pt-20"
              :style="{ color: decorationItem.data.color }"
            >
              <view class="home-info__avatar p-r ml-30 mr-20 fw-bold">
                <v-img class="avatar-90 flex" :src="storeInfo.shopfor || defaultHeadImg" :size="90" :is-circle="true" />
                <view class="role fs-22 br-20 text-center">{{ roleType | roleTypeFilter }}</view>
              </view>
              <view class="flex-1" @tap="navigation('/shop/detail?storeId=' + storeId)">
                <view v-if="storeInfo.storeno !== ''" class="flex flex-column flex-between home-info__info">
                  <view class="name fs-30 fw-bold ellipsis">
                    <text>{{ storeInfo.storename || '' }}</text>
                    <text class="icon iconfont icon-arrow-right fs-18 fw-normal ml-20"></text>
                  </view>
                  <view class="flex" style="align-items: center">
                    <view class="fs-24 pr-10">
                      {{ storeInfo.sysclerkname || '' }}
                    </view>
                  </view>
                  <view class="opacity-60 fs-24">编号：{{ storeInfo.storeno || '' }}</view>
                </view>
                <u-loading v-else color="#cccccc" mode="circle"></u-loading>
              </view>
              <view v-if="haveWritoffRight" class="home-info__opera fs-24" @tap="handleShowCode">
                <view class="icon iconfont icon-code"></view>
                <view class="text">店铺码</view>
              </view>
            </view>
            <!-- 品牌信息，单个门店不显示 -->
            <template v-if="showBrandChange">
              <view class="line-top" :style="{ 'border-top-color': decorationItem.data.color }"></view>
              <view
                v-if="storeInfo"
                class="store-info flex fs-28"
                hover-class="none"
                :style="{ color: decorationItem.data.brandColor }"
                @tap="$navPage('/shop/change')"
              >
                <view class="flex-1 ellipsis-1">
                  <text class="icon iconfont icon-pinpaiicon mr-10 fs-28"></text>
                  {{ storeInfo.memberloginname || '' }}
                </view>
                <view class="icon iconfont icon-arrow-right fs-18"></view>
              </view>
            </template>
          </template>
          <!-- 公告通知组件 -->
          <template v-if="decorationItem.code === 'AnnounceNotice'">
            <announce-notice :notice-data="decorationItem.data" />
          </template>
          <!-- 图片广告组件 -->
          <template v-if="decorationItem.code === 'ImageAd'">
            <image-ad :img-data="decorationItem.data" />
          </template>
          <!-- 辅助分割组件 -->
          <template v-if="decorationItem.code === 'BlankSegmente'">
            <blank-segmente :blank-data="decorationItem.data" />
          </template>
          <!-- 我的资产组件 -->
          <template v-if="decorationItem.code === 'RetailAssets'">
            <retail-assets
              :data="decorationItem.data"
              @show-explain="handleShowAssetsExplain"
              @show-point="handleShowPiont"
            />
          </template>
          <!-- 数据概览组件 -->
          <template v-if="decorationItem.code === 'RetailStatistics'">
            <retail-statistics
              :data="decorationItem.data"
              @show-explain="handleShowStatisticsExplain"
              @navigation="navigation"
            />
          </template>
          <!-- 核销管理组件 -->
          <template v-if="decorationItem.code === 'RetailWriteoff'">
            <retail-writeoff :data="decorationItem.data" @navigation="navigation" />
          </template>
          <!-- 货品管理组件 -->
          <template v-if="decorationItem.code === 'RetailGoods'">
            <retail-goods :data="decorationItem.data" :home-data="homeData" @navigation="navigation" />
          </template>
          <!-- 订货管理组件 -->
          <template v-if="decorationItem.code === 'RetailOrder'">
            <retail-order :data="decorationItem.data" @navigation="navigation" />
          </template>
          <!-- 报表组件 -->
          <template v-if="decorationItem.code === 'RetailReport'">
            <retail-report :data="decorationItem.data" @navigation="navigation" />
          </template>
          <!-- 售后换新组件 -->
          <template v-if="decorationItem.code === 'RetailWarranty'">
            <retail-warranty :data="decorationItem.data" @navigation="navigation" />
          </template>
          <!-- 最新活动组件 -->
          <template v-if="decorationItem.code === 'RetailActivity'">
            <retail-activity :data="decorationItem.data" />
          </template>
          <!-- 旧版兼容：原有的菜单列表 -->
          <template v-if="decorationItem.code === 'RetailDashboardHome'">
            <!-- 通知公告 -->
            <view
              v-if="decorationItem.data.showNotice && roleType === 2"
              class="bulletin-board"
              style="margin: 25rpx 20rpx 0"
              @tap="handleBroad"
            >
              <u-notice-bar
                :play-state="list[0] !== '暂无通知' ? 'play' : 'paused'"
                :is-circular="list[0] !== '暂无通知'"
                mode="horizontal"
                :list="list"
                border-radius="10"
                speed="80"
              ></u-notice-bar>
            </view>
            <!-- 旧版菜单 -->
            <menu-list
              v-for="item in menuList"
              :key="item.number"
              :home-data="homeData"
              :menu-obj="item"
              :type="1"
              @navigation="navigation"
            />
            <!--店员 缺省 -->
            <none-data v-if="showNoneMenu" msg="暂无功能" icon-width="256" icon-height="190" class="none-data">
              <view class="none-tips">请联系店老板分配菜单权限</view>
            </none-data>
          </template>
        </view>

        <!-- 扫一扫 -->
        <btn-scan v-if="showRetailScan" @tap="handleScanCode('index')"></btn-scan>

        <tabbar></tabbar>
      </view>
    </view>
    <ContactEntry v-if="showServiceGroup" />
    <CustomAd />
    <view style="height: 300rpx"></view>
    <upgrade-notice v-if="storeInfo.storeid" :uuid="storeInfo.storeid" />
    <Code ref="codeRef"></Code>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    ></common-popup>
    <OverdueTips v-model="showOverdueTips" :show-overdue-type="showOverdueType" />
    <QrcodeDialog v-model="showMoneyDialog" @handleCloseQr="handleCloseQr"></QrcodeDialog>
    <popup-notice />
    <u-popup
      v-model="showStaticsExplain"
      mode="center"
      width="600rpx"
      height="auto"
      border-radius="20"
      closeable="true"
    >
      <Tips :type="type" :role-type="roleType"></Tips>
    </u-popup>
    <!-- 积分帐号不一致弹窗提醒 -->
    <common-popup
      v-model="showJfPopup.show"
      type="confirm"
      :content="showJfPopup.content"
      cancel-text="确定"
      confirm-text="换绑微信"
      @cancel="handleJfcancel"
      @confirm="handleJfConfirm"
    ></common-popup>
    <!-- 登记弹窗 -->
    <register-dialog ref="registerDialog" @continue="handleScanCode('index')" />

    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <!-- 实名认证弹窗 -->
    <realname-auth-popup
      v-model="showRealnameAuthPopup"
      :mode="realnameAuthPopupMode"
      @confirm="handleRealnameAuthConfirm"
      @cancel="handleRealnameAuthCancel"
      @no-remind="handleRealnameAuthNoRemind"
    />
  </view>
</template>

<script>
import { mapState } from 'vuex'
// import { staticURL } from '@/config'
import { apiGetnoticeboard } from '@/api/sales'
import { apiGetStoreData, apiGetHomeNum, apiStoreMdsetting } from '@/api/store'
import { apiGetUserMenu } from '@/api/common'

import TitleBar from '@/components/title-bar/index.vue'
import Tabbar from '@/components/tabbar/index.vue'
import Code from '@/components/pop/code.vue'
import QrcodeDialog from '@/components/pop/qrcode-dialog.vue'
import Tips from '@/components/tips/asset-tips.vue'
import PopupNotice from './comps/popup-notice.vue'
import CustomAd from 'packages/components/custom-ad/index.vue'
import UpgradeNotice from 'packages/components/upgrade-notice/index.vue'
import RegisterDialog from 'packages/components/code-register/index.vue'
import RealnameAuthPopup from 'packages/components/realname-auth-popup/index.vue'
import { roleTypeFilter } from '@/filters'

// 装修组件 - 零售
import RetailAssets from 'packages/design/retail/my-assets.vue'
import RetailStatistics from 'packages/design/retail/statistics.vue'
import RetailWriteoff from 'packages/design/retail/writeoff.vue'
import RetailGoods from 'packages/design/retail/goods.vue'
import RetailOrder from 'packages/design/retail/order.vue'
import RetailReport from 'packages/design/retail/report.vue'
import RetailWarranty from 'packages/design/retail/warranty.vue'
import RetailActivity from 'packages/design/retail/activity.vue'

// 装修组件 - 公共
import AnnounceNotice from 'packages/design/basic/announce-notice.vue'
import ImageAd from 'packages/design/basic/image-ad.vue'
import BlankSegmente from 'packages/design/basic/blank-segmente.vue'

import MenuList from '@/mixins/set-menu'
import ScanCode from '@/mixins/scan-code'
import gzhMixin from '@/mixins/show-gzh'
import SwitchBrand from '@/mixins/switch-brand'
import SwitchStores from '@/mixins/switch-stores'
import activityBannerMixin from 'packages/mixins/activity-banner'
import overdueMixin from 'packages/mixins/overdue'
import getUserOpenId from '@/mixins/get-user-openid.js'
import { decorationHomeMixin } from '@/mixins/decoration'
import { setTitleColorMixin } from 'packages/mixins/navigation'
import { realnameAuthPopupMixin } from 'packages/mixins/realname-auth'

import { checkAuthorize } from '@/utils/set-storage'
import { setNavigationBarColor } from '@/utils/set-mp'
import { storeHeadImage } from '@/utils/default-picture'
import ContactEntry from './comps/contact-entry.vue'

export default {
  components: {
    TitleBar,
    Tabbar,
    ContactEntry,
    Code,
    QrcodeDialog,
    PopupNotice,
    Tips,
    CustomAd,
    UpgradeNotice,
    RegisterDialog,
    RealnameAuthPopup,
    // 零售装修组件
    RetailAssets,
    RetailStatistics,
    RetailWriteoff,
    RetailGoods,
    RetailOrder,
    RetailReport,
    RetailWarranty,
    RetailActivity,
    // 公共装修组件
    AnnounceNotice,
    ImageAd,
    BlankSegmente
  },
  filters: { roleTypeFilter },
  mixins: [
    MenuList,
    gzhMixin,
    ScanCode,
    SwitchStores,
    SwitchBrand,
    activityBannerMixin,
    overdueMixin,
    getUserOpenId,
    decorationHomeMixin,
    setTitleColorMixin,
    realnameAuthPopupMixin
  ],
  data() {
    return {
      list: [], // 通知
      showStaticsExplain: false,
      type: 0, // 说明类型
      // scanbg: staticURL() + 'shop/scan.png',
      assets: false,
      homeData: {
        staySignTotal: 0
      }, // 首页菜单数据
      storeId: 0, //店铺系统级id
      memberLogin: '', //商家编号
      isNullPassword: 0, // 0：已设置密码  1：未设置密码
      roleType: -1, // 该账号在门店的角色 roleType：2-负责人-3店员
      showPopup: false, // true 显示弹窗
      popType: 'tip', //弹窗类型
      popTitle: '', //  弹窗标题
      popContent: '', // 弹窗内容
      popConfirmText: '去设置', // 弹窗确认按钮文案
      popCancelText: '跳过', // 弹窗取消按钮文案
      defaultHeadImg: storeHeadImage, // 缺省图片
      // overviewPicture: staticURL() + 'shop/overview-pic.png', // 概览背景图
      dataInfo: { unpackCout: 0, signCount: 0, writeCount: 0, loading: false },
      indexfromPage: '',
      summaryTitleList: [
        {
          title: '今日',
          type: 1
        },
        {
          title: '本月',
          type: 2
        },
        {
          title: '累计',
          type: 3
        }
      ],
      summaryActive: 1,
      loaded: false,
      showServiceGroup: false
    }
  },
  computed: {
    ...mapState(['storeInfo', 'showOverdue', 'fcBasicSet', 'assetsInfo']),
    showNoneMenu() {
      // 当店员没有任务菜单的时候，显示提示文案
      return !this.menuList.length && this.roleType === 3 && !this.indexMenuLoading
    },
    // 判断是否显示扫一扫组件（从装修数据中查找）
    showRetailScan() {
      return this.decoration.some(item => item.code === 'RetailScan')
    },
    storeSettingInfo() {
      return JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    },
    companyName() {
      return this.storeSettingInfo.memberLoginName
    },
    overViewList() {
      const { loosechange, pointscount, vouchercount, totalrevenue } = this.assetsInfo || {}
      let overViewList = [
        {
          name: '红包零钱',
          data: (loosechange || 0).toFixed(2),
          type: 0,
          url: '/packages/src/personal/change/index'
        },
        { name: '积分', data: pointscount || 0, type: 1, url: '' },
        {
          name: '云店收入',
          data: (totalrevenue || 0).toFixed(2),
          type: 0,
          url: '/pages/store-revenue/index'
        },
        { name: '返货券', data: vouchercount || 0, type: 2, url: '/pages/return-coupon/index' }
      ]
      // 如果是店员，根据权限显示
      if (this.roleType === 3) {
        overViewList = overViewList.filter(item => {
          const asset = this.myAssets.find(a => a.name === item.name && a.state === 1)
          return asset
        })
        return overViewList
      }
      return overViewList
    },
    showBrandChange() {
      const stores = uni.getStorageSync('storeNumber')
      return stores > 1
    }
  },
  watch: {
    isExpires(val) {
      if (val && !this.showOverdue) {
        this.handleShowOverdueTips(1)
        this.$store.dispatch('setShowOverdue', true)
      }
    }
  },
  async onLoad(options) {
    // 先获取菜单数据，确保装修数据使用的是最新的菜单信息
    let userMenuInfo = null
    if (!options.q) {
      // 非扫码场景，先获取菜单数据
      const menuRes = await apiGetUserMenu()
      if (this.$ck(menuRes)) {
        userMenuInfo = menuRes.return_data
        uni.setStorageSync('userMenuInfo', JSON.stringify(userMenuInfo))
      }
    }

    let { type } = await this.fetchHomeDecoration(userMenuInfo)
    this.loaded = true
    if (type === 0) {
      this.setTitleColor({
        frontColor: '#000000',
        backgroundColor: '#ffffff'
      })
    } else {
      this.setTitleColor({
        frontColor: this.navigationBar.statusColor,
        backgroundColor: this.navigationBar.BgColor
      })
    }
    // 检查是否授权
    checkAuthorize()
    // 通过微信扫核销码进来
    if (options.q && !this.isExpires) {
      let str = decodeURIComponent(options.q)
      // console.log('码信息', str)
      let fdStart = str.indexOf('/ordercheck/?orderNumber')
      // 智能营销核销--提领券/--实物兑换
      let fdStart3 = str.indexOf('/TransferScanCode')
      if (fdStart > 0) {
        let data = str.split('&')
        data[0] = data[0].split('=')[1]
        data[1] = data[1].split('=')[1].replace(/['+']/g, ' ')
        data[2] = data[2] && data[2].split('=')[1]
        data[3] = data[3] && data[3].split('=')[1]
        data[4] = 1011
        // 注意--如果核销码不属于该门店下的订单需要自动切换成指定门店
        await this.handleSwitchStores(data[3])
        await this.checkOrderFn(data, 0)
      } else if (fdStart3 > 0) {
        // 提领券 实物
        let data = str.split('&')
        data[0] = data[0].split('=')[1]
        data[1] = data[1].split('=')[1]
        //data[1]包含-字符为实物兑换核销,否则为提领券核销
        if (data[1].includes('-')) {
          data[2] = 'materialCoupon'
          data[3] = 0
        } else {
          data[2] = 'pickupCoupon'
          let fdStart = data[1].indexOf('EV') //以EV为前缀单个核销--0 否则为批量--1(提领券)
          fdStart === 0 ? (data[3] = 0) : (data[3] = 1)
        }
        this.checkOrderFn(data)
      }
    } else {
      this.indexfromPage = options.from || ''
      let storeSettingInfo = uni.getStorageSync('storeSettingInfo')
      this.assets = uni.getStorageSync('assets')
      if (storeSettingInfo) {
        const { storeId, memberLogin, roleType } = JSON.parse(storeSettingInfo)
        this.storeId = storeId
        this.memberLogin = memberLogin
        this.roleType = parseInt(roleType)
        await this.fetchData()
      }
    }
    if (options.scan) {
      // 调用扫一扫
      this.handleScanCode('index')
    }
  },
  async onShow() {
    // 如果是扫码的不用再次获取数据
    if (this.isScan) {
      return
    }
    // 设置顶部导航的颜色
    setNavigationBarColor()
    //进来要获取最新的数据
    this.$store.dispatch('getFcBasicInfo')
    this.$store.dispatch('getAssetInfo')
    this.getHomeNum()
    if (this.indexfromPage === 'storelist') {
      this.setMenu('home')
    } else {
      // 获取最新菜单数据并更新，同时刷新装修数据以确保使用最新菜单
      const userMenuInfo = await this.getMenu()
      // 如果已经有装修数据，需要重新获取以确保使用最新菜单
      if (this.decoration && this.decoration.length > 0 && userMenuInfo) {
        const { type } = await this.fetchHomeDecoration(userMenuInfo)
        // 更新导航栏颜色
        if (type !== 0) {
          this.setTitleColor({
            frontColor: this.navigationBar.statusColor,
            backgroundColor: this.navigationBar.BgColor
          })
        }
      }
    }
    // 检查实名认证状态
    this.checkRealnameAuthStatus()
  },
  async onPullDownRefresh() {
    this.$store.dispatch('getFcBasicInfo')
    this.$store.dispatch('getAssetInfo')
    this.getHomeNum()
    this.fetchData()
    const userMenuInfo = await this.getMenu(() => {
      uni.stopPullDownRefresh()
    })
    // 刷新装修数据以确保使用最新菜单
    if (userMenuInfo) {
      await this.fetchHomeDecoration(userMenuInfo)
      // 更新导航栏颜色
      if (this.navigationBar && this.navigationBar.statusColor) {
        this.setTitleColor({
          frontColor: this.navigationBar.statusColor,
          backgroundColor: this.navigationBar.BgColor
        })
      }
    }
  },
  methods: {
    handleSummaryTitile(type) {
      if (this.summaryActive === type) return
      // 请求接口，请求数据回来再切换，局部loading
      this.getScanData(type)
    },
    async getMenu(cb) {
      let res = await apiGetUserMenu()
      typeof cb === 'function' && cb()
      if (this.$ck(res)) {
        const menuData = res.return_data
        uni.setStorageSync('userMenuInfo', JSON.stringify(menuData))
        this.setMenu('home')
        return menuData
      }
      return null
    },
    async getScanData(type) {
      if (this.dataInfo.loading) return
      this.dataInfo.loading = true
      let res = await apiGetStoreData({
        type: type //1-今日,2-本月 3-累计
      })
      this.dataInfo.loading = false
      if (this.$ck(res)) {
        this.summaryActive = type
        // unpackingcount: 开箱数   signtotalcount:签收数（门店签收商品的数量）  writeoffcount: 核销数（门店已核销提领券+实物+订单+赠品的数量）
        const {
          unpackingcount: unpackCout = 0,
          signtotalcount: signCount = 0,
          writeoffcount: writeCount = 0
        } = res.return_data
        this.dataInfo = { ...this.dataInfo, unpackCout, signCount, writeCount }
      }
      this.setPassword()
    },
    async getHomeNum() {
      let res = await apiGetHomeNum()
      if (this.$ck(res)) {
        // 首页菜单上的数据
        this.homeData = {
          staySignTotal: res.return_data.stayinsigntotalcount || 0
        }
      }
    },
    showScanData(n) {
      const o = {
        29: 'unpackCout',
        30: 'writeCount',
        31: 'signCount'
      }
      return this.dataInfo[o[n]]
    },
    fetchData() {
      this.fetchStoreBaseInfo()
      this.handleGetbroad()
      this.getScanData(this.summaryActive)
      this.getStoreMdsetting()
    },
    getStoreMdsetting() {
      apiStoreMdsetting().then(res => {
        if (this.$ck(res)) {
          const { customaccountstate } = res.return_data
          this.showServiceGroup = !!customaccountstate
        }
      })
    },
    async fetchStoreBaseInfo() {
      this.$store.dispatch('setStoreInfo', { storeid: this.storeId, m: this.memberLogin })
    },
    handleGetbroad() {
      apiGetnoticeboard().then(res => {
        if (this.$ck(res)) {
          const { notice, list } = res.return_data
          list.length ? this.list.push(notice) : this.list.push('暂无通知')
        }
      })
    },
    handleShowOverdueTips(type) {
      this.showOverdueType = type
      this.showOverdueTips = true
    },
    handleBroad() {
      if (this.list[0] === '暂无通知') return
      uni.navigateTo({
        url: '/pages/submit-account/index'
      })
    },
    setPassword() {
      // 专属版暂不支持设置密码
      if (this.isSpecialMp) return
      // 设置密码
      if (uni.getStorageSync('isnullpassword') && uni.getStorageSync('nullpasswordPop')) {
        uni.setStorageSync('nullpasswordPop', false)
        this.popType = 'confirm'
        this.popTitle = '设置密码'
        this.popConfirmText = '去设置'
        this.popContent = '您的平台账号还未设置密码，请您设置密码。'
        this.showPopup = true
      }
    },
    showTips(content, btnText = '确定') {
      // 显示提示信息
      this.popType = 'tip'
      this.popTitle = '温馨提示'
      this.popContent = content
      this.popConfirmText = btnText
      this.showPopup = true
    },
    handleConfirm() {
      uni.navigateTo({ url: `/personal/password/edit?isnullpassword=1` })
      this.showPopup = false
    },
    navigation(url, number = 0) {
      if ([23, 32].includes(number) && this.isExpires) {
        // 过期打烊的提示（库存扣减 、 我要下单 ）
        return this.handleShowOverdueTips(0)
      }
      // 32 我要下单
      if (url.includes('/order/select-product/index') && !this.fcBasicSet.isopendealerordersystem) {
        return this.showTips('厂家已关闭订单系统，暂不支持提交新的订单，请联系品牌商厂家')
      }
      // 23 库存扣减
      if (
        url.includes('/product/deduct/deduct-scan') &&
        (!this.fcBasicSet.isopendeductstock || !this.fcBasicSet.isopenmanualdeductstock)
      ) {
        return this.showTips('厂家已关闭门店手动扣减库存的功能，请联系品牌商厂家')
      }

      ;[29, 30].includes(number) && (url = `${url}?seachTimeType=${this.summaryActive}`)

      uni.navigateTo({
        url
      })
    },
    handleAssets() {
      uni.setStorageSync('assets', !this.assets)
      this.assets = uni.getStorageSync('assets')
    },
    handleShowCode() {
      if (!this.overdueChecked()) return

      // 显示门店码
      let codeInfo = {
        headPic: this.storeInfo.shopfor || this.defaultHeadImg,
        name: this.storeInfo.storename,
        code: this.storeInfo.exchangecode,
        storeId: this.storeId
      }
      this.$refs.codeRef.showDialog(codeInfo)
    },
    handleNavAssets(item) {
      // 门店专属版暂不支持跳转
      // if (this.isSpecialMp) return
      item.type === 1 ? this.handleShowPiont() : this.navigation(item.url)
    },
    handleShowAssetsExplain() {
      // 显示我的资产说明
      this.type = 1
      this.showStaticsExplain = true
    },
    handleShowStatisticsExplain() {
      // 显示数据概览说明
      this.type = 2
      this.showStaticsExplain = true
    }
  }
}
</script>

<style lang="scss" scoped>
.index-page {
  min-height: 100vh;
}
.home-info {
  &__avatar {
    height: 100rpx;
    .role {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 90rpx;
      height: 30rpx;
      line-height: 28rpx;
      background-color: #ffdc1d;
      color: var(--theme-color, $uni-color-primary);
    }
  }
  &__info {
    height: 110rpx;
    .name {
      width: 400rpx;
    }
  }
  &__opera {
    margin-right: 50rpx;
    text-align: center;
    .iconfont {
      font-size: 48rpx;
    }
    .text {
      margin-top: 8rpx;
    }
  }
}
.line-top {
  margin: 20rpx;
  // @include border-top(rgba(255, 255, 255, 0.3));
  border-top-width: 1rpx;
  border-top-style: solid;
  opacity: 0.1;
}
.store-info {
  padding: 20rpx 30rpx 10rpx;
  line-height: 28rpx;
}
.home-overview {
  margin: 20rpx 20rpx 25rpx;
  text-align: center;
  height: 222rpx;
  @include background-set(710rpx 222rpx);
  .data-item {
    line-height: 50rpx;
  }
}

.home-data {
  margin: 0 20rpx;
  background: #fff;
  border-radius: 10rpx;
  &.data-preview {
    padding-top: 20rpx;
    margin: 0 20rpx;
    border-radius: 10rpx;
  }
  .summary-title {
    width: 240rpx;
    line-height: 45rpx;
    border: 1px solid var(--theme-color, $uni-color-primary);
    border-radius: 10rpx;
    color: #333;
    .item {
      flex: 1;
      text-align: center;
      position: relative;
      &:not(:last-child) {
        border-right: 1px solid var(--theme-color, $uni-color-primary);
      }
      &.on {
        background: var(--theme-color, $uni-color-primary);
        color: #fff;
      }
    }
  }
  &__title {
    color: #333;
    line-height: 35rpx;
    padding: 0 20rpx 0 30rpx;
  }
  &__inner {
    padding: 0 0 10rpx;
    position: relative;
    .item {
      width: 33%;
      text-align: center;
      padding: 25rpx 0;
      .item-num {
        // color: $uni-text-color-primary;
        color: var(--theme-color, $uni-color-primary);
        font-size: 34rpx;
        font-weight: bold;
      }
      .item-text {
        color: $uni-text-color-grey;
      }
    }
    .show-load {
      height: 124rpx;
    }
  }
}
.home-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: block;
}
.none-data {
  height: calc(100vh - 360rpx);
  display: inherit;
  background: #fff;
  width: 710rpx;
  margin: 0 auto;
  border-radius: 10rpx;
  margin-top: 40rpx;
  .none-tips {
    width: 400rpx;
    background: #ffffff;
    border-radius: 10rpx;
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #666666;
    margin-top: 10rpx;
  }
}
</style>
