import { mapState } from 'vuex'
import { apiHomePage, apiLoginPage, apiMyPage } from '@/api/decoration'
import { getExtConfig, staticURL } from '@/config'
import {
  initPageSetting,
  initHomeComponents,
  initLoginPage,
  initGlobalTheme,
  initMyPageSetting,
  initMyComponents,
  initTabbar
} from '@/config/decoration'

export const decorationHomeMixin = {
  data() {
    return {
      decoration: [],
      navigationBar: {}
    }
  },
  computed: {
    ...mapState(['isSpecialMp'])
  },
  methods: {
    async fetchHomeDecoration(userMenuInfo = null) {
      const defaultAction = () => {
        this.$store.commit('setThemeInfo', initGlobalTheme())
        this.navigationBar = initPageSetting()
        const { Navigation, ...rest } = initTabbar()
        this.$store.commit('tabbar/setTabBarData', Navigation)
        this.$store.commit('tabbar/setTabbarSetting', rest)
        this.decoration = initHomeComponents()
      }
      // if (this.isSpecialMp) {
      const res = await apiHomePage({ sourcetype: 8 })
      if (res === undefined || typeof res === 'undefined') {
        // 登录失效或未登录，然后重定向到登录页，导致首页顶部导航栏会闪过默认色
        defaultAction()
        return { type: 0 }
      }
      const components = res?.return_data?.components || []
      if (!res || res.return_code !== 0 || components.length === 0) {
        defaultAction()
        return { type: 1 }
      }
      let list = []
      components.forEach(item => {
        const data = JSON.parse(item.data)
        if (item.code === 'PageSetting') {
          this.navigationBar = data
        } else if (item.code === 'Navigation') {
          const { Navigation, ...rest } = data
          this.$store.commit('tabbar/setTabBarData', Navigation)
          this.$store.commit('tabbar/setTabbarSetting', rest)
        } else if (item.code === 'GlobalTheme') {
          this.$store.commit('setThemeInfo', data)
        } else if (item.code === 'LoginPage') {
          // ignore
        } else if (item.code === 'RetailDashboardHome') {
          // 旧数据兼容：拆分成8个新组件
          const oldData = data
          // 优先使用传入的 userMenuInfo，如果没有则从本地存储读取
          const menuInfo = userMenuInfo || JSON.parse(uni.getStorageSync('userMenuInfo') || '{}')
          const homemenu = menuInfo.homemenu || []

          // 辅助函数：创建分割组件
          const createBlankSegmente = () => ({
            code: 'BlankSegmente',
            data: {
              Type: 'blank',
              Height: 10,
              BgColor: 'rgba(255, 255, 255, 0)',
              LineColor: '#e5e5e5',
              LineGap: 15,
              LineType: 'solid'
            }
          })
          // 添加分割组件
          list.push(createBlankSegmente())
          // 1. 我的资产（根据showAssets决定）
          if (oldData.showAssets) {
            const assetsMenu = homemenu.find(m => m.number === 10003 && m.state === 1)
            if (assetsMenu) {
              list.push({
                code: 'RetailAssets',
                data: {
                  number: 10003,
                  menuList: (assetsMenu.sublist || []).map(sub => ({
                    name: sub.name,
                    show: true,
                    number: sub.number
                  })),
                  bgUrl: oldData.assetsBgUrl
                }
              })
              // 添加分割组件
              list.push(createBlankSegmente())
            }
          }

          // 2-6. 其他组件按照相同逻辑处理
          const menuConfigs = [
            { code: 'RetailStatistics', number: 999, titleKey: '' },
            { code: 'RetailWriteoff', number: 998, titleKey: 'Title' },
            { code: 'RetailGoods', number: 997, titleKey: 'Title' },
            { code: 'RetailOrder', number: 996, titleKey: 'Title' },
            { code: 'RetailReport', number: 995, titleKey: 'Title' },
            { code: 'RetailWarranty', number: 10004, titleKey: 'Title' }
          ]

          // 默认图标映射表（旧数据兼容用）- 只存储图片名称
          const defaultIconMap = {
            // 核销管理
            6: 'verification-records.png',
            7: 'cash-coupon-icon.png',
            8: 'verification-reward.png',
            22: 'cash-coupon-icon.png',
            // 货品管理
            26: 'goods-receipt.png',
            23: 'inventory-deduction.png',
            24: 'deduction-records.png',
            36: 'consumer-scan.png',
            // 订货管理
            32: 'place-order.png',
            33: 'my-orders.png',
            // 报表
            25: 'inventory-statistics.png'
          }

          // 获取完整图标URL的函数
          const getIconUrl = iconName => {
            if (!iconName) return ''
            return staticURL() + 'home/' + iconName
          }

          menuConfigs.forEach(config => {
            const menu = homemenu.find(m => m.number === config.number && m.state === 1)
            if (menu) {
              const componentData = {
                number: config.number,
                menuList: (menu.sublist || []).map(sub => {
                  // 判断icon是否为有效URL，如果不是（如icon1, icon2等），使用默认图标
                  let iconUrl = sub.icon || ''
                  if (iconUrl && !iconUrl.startsWith('http')) {
                    // 不是有效URL，使用默认图标
                    const iconName = defaultIconMap[sub.number]
                    iconUrl = getIconUrl(iconName)
                  }
                  if (!iconUrl) {
                    // 为空，使用默认图标
                    const iconName = defaultIconMap[sub.number]
                    iconUrl = getIconUrl(iconName)
                  }
                  return {
                    name: sub.name,
                    show: true,
                    number: sub.number,
                    icon: iconUrl,
                    sort: sub.sort || 0
                  }
                })
              }
              if (config.titleKey) {
                componentData.Title = menu.name
                componentData.IsShowTitle = true
              }
              list.push({
                code: config.code,
                data: componentData
              })
              // 添加分割组件
              list.push(createBlankSegmente())
            }
          })

          // 7. 扫一扫
          const scanMenu = homemenu.find(m => m.number === 34 && m.state === 1)
          if (scanMenu) {
            list.push({ code: 'RetailScan', data: { number: 34 } })
          }

          // 8. 最新活动
          const activityMenu = homemenu.find(m => m.number === 35 && m.state === 1)
          if (activityMenu) {
            list.push({
              code: 'RetailActivity',
              data: {
                number: 35,
                Title: '最新活动',
                IsShowTitle: true,
                ActivityType: 'latest',
                size: 1
              }
            })
            // 添加分割组件
            list.push(createBlankSegmente())
          }
        } else {
          item.data = data
          list.push(item)
        }
      })
      this.decoration = list
      return { type: 2 }
    }
  }
}

export const decorationTabbarMixin = {
  computed: {
    ...mapState(['isSpecialMp'])
  },
  methods: {
    async fetchTabbarDecoration() {
      const defaultAction = () => {
        const { Navigation, ...rest } = initTabbar()
        this.$store.commit('tabbar/setTabBarData', Navigation)
        this.$store.commit('tabbar/setTabbarSetting', rest)
      }
      if (this.isSpecialMp) {
        const res = await apiHomePage({ sourcetype: 8 })
        const components = res.return_data?.components || []
        if (!res || res.return_code !== 0 || components.length === 0) {
          defaultAction()
          return
        }
        components.forEach(item => {
          const data = JSON.parse(item.data)
          if (item.code === 'Navigation') {
            const { Navigation, ...rest } = data
            this.$store.commit('tabbar/setTabBarData', Navigation)
            this.$store.commit('tabbar/setTabbarSetting', rest)
          }
        })
      } else {
        defaultAction()
      }
      return true
    }
  }
}

export const decorationLoginMixin = {
  data() {
    return {
      loginPage: {
        imgUrl: '',
        welcomeTip: ''
      }
    }
  },
  computed: {
    ...mapState(['isSpecialMp'])
  },
  methods: {
    async fetchLoginDecoration() {
      const defaultAction = () => {
        this.loginPage = initLoginPage()
      }
      if (this.isSpecialMp) {
        const res = await apiLoginPage({ memberLogin: getExtConfig().memberLogin, sourcetype: 8 })
        if (!res || res.return_code !== 0 || res.return_data.length === 0) {
          defaultAction()
          return
        }
        const components = res.return_data || []
        components.forEach(item => {
          const data = JSON.parse(item.data)
          if (item.code === 'LoginPage') {
            this.loginPage = data
          }
        })
      } else {
        defaultAction()
      }
    }
  }
}

const createBlankSegmente = () => ({
  code: 'BlankSegmente',
  data: {
    Type: 'blank',
    Height: 10,
    BgColor: 'rgba(255, 255, 255, 0)',
    LineColor: '#e5e5e5',
    LineGap: 15,
    LineType: 'solid'
  }
})

const defaultMyOrderData = {
  All: [
    { Id: 1, Name: '全部', Icon: 'iconquanbuicon', Checked: 1 },
    { Id: 2, Name: '兑换中', Icon: 'iconduihuanzhong', Checked: 0 },
    { Id: 3, Name: '待付款', Icon: 'icondaifukuan1', Checked: 1 },
    { Id: 4, Name: '待发货', Icon: 'icondaifahuo1', Checked: 1 },
    { Id: 5, Name: '待收货/核销', Icon: 'icondaishouhuo', Checked: 1 },
    { Id: 6, Name: '已完成', Icon: 'iconyiwancheng', Checked: 0 },
    { Id: 7, Name: '退款/失败', Icon: 'icontuikuanshibai', Checked: 0 },
    { Id: 8, Name: '售后订单', Icon: 'icontuikuan', Checked: 0 }
  ]
}

const defaultOtherMgmtData = {
  number: 992,
  Title: '人员管理',
  IsShowTitle: true,
  menuList: [
    {
      name: '店员管理',
      icon: staticURL() + 'decoration/staff-management.png',
      show: true,
      sort: 1,
      number: 20
    },
    {
      name: '客户管理',
      icon: staticURL() + 'decoration/customer-management.png',
      show: true,
      sort: 2,
      number: 21
    },
    {
      name: '导购管理',
      icon: staticURL() + 'decoration/shopping-guide-management.png',
      show: true,
      sort: 3,
      number: 37
    }
  ]
}

const defaultRetailOtherMgmtItems = {
  Items: [
    { Id: 1, Name: '收货地址', Show: true, Sort: 0 },
    { Id: 2, Name: '我的奖品', Show: true, Sort: 1 },
    { Id: 3, Name: '客服中心', Show: true, Sort: 2 }
  ]
}

export const decorationMyMixin = {
  data() {
    return {
      myNavigationBar: {},
      decoration: [],
      aiFloatData: { showAiFloat: true, aiFloatIcon: '' }
    }
  },
  computed: {
    ...mapState(['isSpecialMp'])
  },
  methods: {
    async fetchMyDecoration() {
      const defaultAction = () => {
        this.myNavigationBar = initMyPageSetting()
        this.decoration = initMyComponents()
        this.aiFloatData = { showAiFloat: true, aiFloatIcon: '' }
      }
      const res = await apiMyPage({ sourcetype: 8 })
      const components = res?.return_data || []
      if (!res || res.return_code !== 0 || components.length === 0) {
        defaultAction()
        return
      }
      let list = []

      components.forEach(item => {
        const data = typeof item.data === 'string' ? JSON.parse(item.data || '{}') : item.data || {}
        if (item.code === 'MyPageSetting') {
          this.myNavigationBar = data
        } else if (item.code === 'RetailAiFloat') {
          this.aiFloatData = {
            showAiFloat: data.showAiFloat !== false,
            aiFloatIcon: data.aiFloatIcon || ''
          }
        } else if (item.code === 'RetailDashboardMy') {
          list.push({ code: 'RetailBrandName', data: {} })
          list.push(createBlankSegmente())
          list.push({ code: 'RetailMyOrder', data: defaultMyOrderData })
          list.push(createBlankSegmente())
          list.push({
            code: 'RetailStaffMgmt',
            data: defaultOtherMgmtData
          })
          list.push(createBlankSegmente())
          list.push({ code: 'RetailOtherMgmt', data: defaultRetailOtherMgmtItems })
          this.aiFloatData = { showAiFloat: true, aiFloatIcon: '' }
        } else {
          list.push({ code: item.code, data })
        }
      })
      this.decoration = list
    }
  }
}
