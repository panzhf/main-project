/**
 * 门店名称聚焦 + 地理位置授权 mixin
 * - isterminalsmartmatch 为 true 时：进入页面请求一次定位授权；点击门店名称输入框先获取位置，成功后再聚焦滚动；拒绝一次授权后下次不再获取地址、不弹窗；用户去设置中开启定位后可再次触发聚焦滚动
 * - 门店建议列表来自接口 POST /api/weizhi/page（按中心点经纬度查周边门店，固定每页 20 条）
 */
import { getLocation } from 'packages/utils/location-mp.js'
import { apiWeizhiPage } from '@/api/common'

const WEIZHI_PAGE_SIZE = 20

export default {
  data() {
    return {
      isterminalsmartmatch: false,
      locationDeniedOnce: false,
      /** 定位拒绝提示弹窗只弹一次 */
      locationDeniedModalShown: false,
      locationRequestedOnEnter: false,
      listDismissed: false,
      storeNameFocused: false,
      _neededSpacerToScroll: false,
      _pageScrollTop: 0,
      /** 门店名称输入变化时请求建议的 loading 状态 */
      storeSuggestionsLoading: false,
      /** 防抖定时器：停止输入后延迟再发请求 */
      _storeSuggestionsDebounceTimer: null,
      /** 最近一次定位成功的经纬度，仅用于聚焦滚动等；请求周边门店时每次重新获取 */
      lastLatitude: null,
      lastLongitude: null,
      /** 门店建议列表（由 /api/weizhi/page 按 shopName 参数查询返回） */
      storeSuggestionsList: [],
      /** 是否已经触发过至少一次门店建议接口，用于首个请求不防抖 */
      _storeSuggestionsRequestedOnce: false
    }
  },
  onPageScroll(e) {
    this._pageScrollTop = e.scrollTop
  },
  beforeDestroy() {
    if (this._storeSuggestionsDebounceTimer) {
      clearTimeout(this._storeSuggestionsDebounceTimer)
      this._storeSuggestionsDebounceTimer = null
    }
  },
  computed: {
    // 输入超过 2 个字且接口返回有结果且未在选择后关闭时，才显示建议列表（仅 isterminalsmartmatch 为 true 时展示）
    showStoreSuggestionsList() {
      if (!this.isterminalsmartmatch) return
      const kw = (this.form?.storename || '').trim()
      return (
        kw.length >= 2 &&
        (this.storeSuggestionsList || []).length > 0 &&
        !this.listDismissed &&
        !!this.rules?.ShopName?.show
      )
    }
  },
  methods: {
    // 转化参数
    recordToSuggestion(r) {
      const province = r.provincename || ''
      const city = r.cityname || ''
      const area = r.adminname || ''
      const address = r.address || ''
      const lanandlat = `${r.latgcj02 || ''},${r.longcj02 || ''}`
      return {
        id: r.id,
        name: r.shopname || '',
        code: r.code || '',
        averagecost: r.averagecost || '',
        businesshours: r.businesshours || '',
        specialservices: r.specialservices || '',
        address,
        province,
        city,
        area,
        street: '',
        lanandlat,
        houseNumber: ''
      }
    },
    /**
     * 在页面 onShow 中调用：isterminalsmartmatch 为 true 且在第二步/整页模式时，请求一次地理位置授权
     */
    async storeFocusLocationOnShow() {
      if (!this.isterminalsmartmatch || this.locationRequestedOnEnter || this.locationDeniedOnce) {
        return
      }
      this.locationRequestedOnEnter = true
      try {
        const res = await getLocation()
        if (res.latitude && res.longitude) {
          this.lastLatitude = res.latitude
          this.lastLongitude = res.longitude
        } else {
          this.locationDeniedOnce = true
        }
      } catch {
        this.locationDeniedOnce = true
      }
    },
    /**
     * 门店名称输入框 focus：仅 isterminalsmartmatch 为 true 时执行（先取位置，成功后再聚焦滚动）；为 false 时不执行任何操作
     */
    async onStoreNameFocus() {
      if (!this.isterminalsmartmatch) return
      const res = await new Promise(resolve => {
        uni.getLocation({
          type: 'gcj02',
          success: data => resolve(data || {}),
          fail: () => resolve({})
        })
      }) 
      if (res.latitude && res.longitude) {
        this.locationDeniedOnce = false
      }
      if (this.locationDeniedOnce && !this.locationDeniedModalShown) {
        this.showStoreLocationDeniedModal()
        return
      } 
      if (res.latitude && res.longitude) { 
        this.lastLatitude = res.latitude
        this.lastLongitude = res.longitude
        this.doStoreNameFocusScroll()
        // 聚焦时如果已有门店名称且长度满足条件，则重新触发一次搜索
        const kw = (this.form?.storename || '').trim()
        if (kw.length >= 2) {
          this.listDismissed = false
          this.storeSuggestionsLoading = true
          this.storeSuggestionsList = []
          this.fetchStoreSuggestionsFromApi()
        }
      }
    },
    /**
     * 用户已拒绝定位时提示；全流程只弹一次，避免重复打扰
     */
    showStoreLocationDeniedModal() {
      this.locationDeniedModalShown = true
      const LOCATION_DENIED_TIP = '小程序位置信息未开启：需要获取您的位置信息，便于协助您完成门店注册。'
      uni.showModal({
        title: '提示',
        content: LOCATION_DENIED_TIP,
        confirmText: '去开启',
        cancelText: '取消',
        success: res => {
          if (res.confirm) {
            uni.openSetting({
              success: async settingRes => {
                if (settingRes.authSetting && settingRes.authSetting['scope.userLocation']) {
                  this.locationDeniedOnce = false
                  try {
                    const loc = await getLocation()
                    if (loc.latitude && loc.longitude) {
                      this.lastLatitude = loc.latitude
                      this.lastLongitude = loc.longitude
                    }
                    this.doStoreNameFocusScroll()
                  } catch {
                    // 用户取消或获取失败，不阻塞
                  }
                }
              }
            })
          }
        }
      })
    },
    /**
     * 执行门店名称区域的聚焦与滚动到可视区
     */
    doStoreNameFocusScroll() {
      this.listDismissed = false
      this.storeNameFocused = true
      this.$nextTick(() => {
        setTimeout(() => this.scrollStoreNameToTop(), 150)
      })
    },
    /**
     * 将门店名称所在表单区域滚动到顶部可见
     */
    scrollStoreNameToTop() {
      const sysInfo = uni.getSystemInfoSync() || {}
      const statusBarHeight = sysInfo.statusBarHeight || 0
      const topOffset = statusBarHeight + 44 + 8
      const duration = 350
      const doScroll = scrollTop => {
        uni.pageScrollTo({ scrollTop: Math.max(0, scrollTop), duration })
      }
      const query = uni.createSelectorQuery().in(this)
      query.selectViewport().scrollOffset()
      query.select('#basic-info-form').boundingClientRect()
      query.exec(res => {
        if (!res || !res[0] || !res[1]) {
          doScroll(0)
          return
        }
        const [scrollOffset, rect] = [res[0], res[1]]
        const targetScrollTop = scrollOffset.scrollTop + rect.top - topOffset
        const windowHeight = sysInfo.windowHeight || 600
        const maxScrollTop = (scrollOffset.scrollHeight || 0) - windowHeight
        const canReachTop = maxScrollTop >= targetScrollTop - 20
        this._neededSpacerToScroll = !canReachTop
        if (canReachTop) {
          doScroll(targetScrollTop)
          return
        }
        this.$nextTick(() => {
          setTimeout(() => {
            const q = uni.createSelectorQuery().in(this)
            q.selectViewport().scrollOffset()
            q.select('#basic-info-form').boundingClientRect()
            q.exec(r => {
              if (r && r[0] && r[1]) {
                doScroll(r[0].scrollTop + r[1].top - topOffset)
              } else {
                doScroll(targetScrollTop)
              }
            })
          }, 80)
        })
      })
    },
    onStoreNameBlur() {
      this.storeNameFocused = false
    },
    /**
     * 根据中心点经纬度 + 门店名称关键词请求周边门店（POST /api/weizhi/page），结果写回 storeSuggestionsList
     * 每次请求前重新获取经纬度，不使用缓存
     */
    async fetchStoreSuggestionsFromApi() {
      // 发起新请求前先清空当前列表，避免旧数据短暂残留
      this.storeSuggestionsList = []
      if (!this.isterminalsmartmatch) {
        this.storeSuggestionsLoading = false
        return
      }
      if (this.locationDeniedOnce) {
        this.storeSuggestionsLoading = false
        return
      }
      const shopName = (this.form?.storename || '').trim()
      try {
        const res = await getLocation()
        if (!res.latitude || !res.longitude) {
          this.locationDeniedOnce = true
          return
        }
        const apiRes = await apiWeizhiPage({
          current: 1,
          size: WEIZHI_PAGE_SIZE,
          coordType: 'gcj02',
          centerLat: res.latitude,
          centerLon: res.longitude,
          shopName: shopName || undefined
        })
        if (this.$ck(apiRes)) {
          const list = this.$toLowerKey(apiRes, true).return_data.records || []
          this.storeSuggestionsList = list.map(item => this.recordToSuggestion(item))
        }
      } catch {
      } finally {
        this.storeSuggestionsLoading = false
      }
    },
    /**
     * 门店名称输入变化：防抖后请求周边门店建议（需有定位），避免快速输入重复请求
     */
    onStoreNameInput() {
      const kw = (this.form?.storename || '').trim()
      // 用户手动输入时清空门店匹配 id，仅从建议列表选择时才带 smartMatchMdid
      this.form.smartMatchMdid = ''
      if (kw.length < 2) {
        this.storeSuggestionsLoading = false
        return
      }
      // 清理上一次的防抖定时器
      if (this._storeSuggestionsDebounceTimer) {
        clearTimeout(this._storeSuggestionsDebounceTimer)
        this._storeSuggestionsDebounceTimer = null
      }
      // 首次满足条件时：立即请求，不做防抖
      if (!this._storeSuggestionsRequestedOnce) {
        this._storeSuggestionsRequestedOnce = true
        if (!this.isterminalsmartmatch) {
          this.storeSuggestionsList = []
          this.storeSuggestionsLoading = false
          return
        }
        this.storeSuggestionsLoading = true
        this.fetchStoreSuggestionsFromApi()
        return
      }
      // 后续输入：走 300ms 防抖逻辑
      const DEBOUNCE_MS = 300
      this._storeSuggestionsDebounceTimer = setTimeout(() => {
        this._storeSuggestionsDebounceTimer = null
        if (!this.isterminalsmartmatch) {
          this.storeSuggestionsList = []
          this.storeSuggestionsLoading = false
          return
        }
        this.storeSuggestionsLoading = true
        this.fetchStoreSuggestionsFromApi()
      }, DEBOUNCE_MS)
    },
    closeStoreSuggestions() {
      this.listDismissed = true
      this.storeNameFocused = false
      this.restoreStoreNameScroll()
    },
    onCloseStoreSuggestions() {
      this.closeStoreSuggestions()
    },
    onSelectStoreSuggestion(item) {
      this.form.storename = item.name
      // 门店搜索选中的记录 id，提交注册时作为 smartMatchMdid 传给接口
      this.form.smartMatchMdid = item.id || ''
      // 按页面配置回填扩展信息
      if (this.rules?.PerPrice?.show) {
        this.form.percapita = item.averagecost || ''
      }
      if (this.rules?.BusinessHours?.show) {
        this.form.businesshours = item.businesshours || ''
      }
      if (this.rules?.SellingPoint?.show) {
        this.form.characteristic = item.specialservices || ''
        this.$refs.characteristicTextareaRef &&
          (this.$refs.characteristicTextareaRef.textVal = this.form.characteristic)
      }
      const { province, city, area, street, address, lanandlat, houseNumber } = item
      // 有省市区时与 setAddress 一致拼接 fullAddress，否则用 address
      if (province || city || area) {
        this.fullAddress =
          (province || '') +
          (city || '') +
          (area || '') +
          (area === street ? '' : street || '') +
          (address || '') +
          (houseNumber || '')
        this.form.address = (address || '') + (houseNumber || '')
      } else {
        this.fullAddress = item.address || ''
        this.form.address = item.address || ''
      }
      if (lanandlat) {
        this.form.lanandlat = lanandlat
      }
      // 同步到 vuex，与直接选地址一致，支持点击「门店地址」重新编辑
      const current = this.$store.state.storeRegisterAddress || {}
      const payload = {
        ...current,
        province: province ?? current.province,
        city: city ?? current.city,
        area: area ?? current.area,
        street: street ?? current.street,
        address: address ?? item.address ?? current.address,
        houseNumber: houseNumber ?? current.houseNumber
      }
      if (lanandlat) payload.lanandlat = lanandlat
      this.$store.dispatch('updateStoreRegisterInfo', payload)
      this.closeStoreSuggestions()
    },
    restoreStoreNameScroll() {
      if (!this._neededSpacerToScroll) return
      this._neededSpacerToScroll = false
      uni.pageScrollTo({ scrollTop: 0, duration: 300 })
    }
  }
}
