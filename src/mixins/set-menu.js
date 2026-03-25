/*
文档地址
 https://miduo1031.yuque.com/xbe40z/xiz3cv/rpae2bmkqba7t2hr
 */
// import { staticURL } from '@/config'
const MenuList = {
  data() {
    return {
      menuList: [], //首页菜单
      // tabData: [], //tabbar
      indexData: [], //数据概览
      showIndexScan: false, //首页扫一扫
      jurisdiction: {
        cloudshopmenu: [], //云店
        homemenu: [], // 首页
        mymenu: [], // 我的
        tabindex: [] //tabbar
      },
      indexMenuLoading: true,
      haveWritoffRight: false, //店铺码显示
      // 我的资产
      myAssets: [] // 我的资产
    }
  },
  methods: {
    setMenu(type) {
      let info = uni.getStorageSync('userMenuInfo') || '{}'
      if (info === '{}') {
        return uni.reLaunch({ url: '/pages/login/index' })
      }
      this.jurisdiction = JSON.parse(info)

      if (type === 'home') {
        // 首页菜单
        const homemenu = this.jurisdiction.homemenu || []
        this.menuList = homemenu
          .filter(item => ![34, 35, 999, 10003, 998, 997, 996, 995, 10004].includes(item.number)) // 排除装修组件控制的菜单
          .filter(({ state }) => state === 1)
          .map(({ name, number, sublist }) => ({
            name,
            number,
            sublist: sublist.filter(({ state }) => state === 1)
          }))

        //店铺码显示（开启核销管理-核销记录）
        this.haveWritoffRight =
          homemenu
            .find(item => item.number === 998 && item.state === 1)
            ?.sublist.some(item => item.number === 6 && item.state === 1) || false

        //数据概览
        this.indexData =
          homemenu
            .find(item => item.number === 999 && item.state === 1)
            ?.sublist?.filter(subItem => subItem.state === 1) || []

        //扫一扫
        this.showIndexScan = homemenu.find(item => item.number === 34)?.state === 1 || false
        // 最新活动
        this.showBanner = homemenu.find(item => item.number === 35)?.state === 1
        this.showBanner && this.fetchBannerList()

        // 我的资产
        this.myAssets =
          homemenu
            .find(item => item.number === 10003 && item.state === 1)
            ?.sublist?.filter(subItem => subItem.state === 1) || []

        this.indexMenuLoading = false
      }

      if (type === 'me') {
        this.menuList = this.jurisdiction.mymenu
          .filter(({ state }) => state === 1)
          .map(({ name, sublist }) => ({
            name,
            sublist: sublist.filter(({ state }) => state === 1)
          }))
      }
      if (type === 'cloud') {
        //注意： 云店下级菜单为空，上级菜单也是要显示的
        this.menuList = this.jurisdiction.cloudshopmenu.map(({ name, state, sublist }) => ({
          state,
          name,
          sublist: sublist.filter(({ state }) => state === 1)
        }))
      }
    }
  }
}

export default MenuList
