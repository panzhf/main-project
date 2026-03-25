<template>
  <view class="container" :style="themeVars">
    <!-- 顶部 -->
    <view class="container-header bg-white" :style="{ height: topHeight }">
      <view class="warm-tip flex flex-middle">
        领奖记录非实时显示，将会在扫码一分钟后显示
        <text class="iconfont icon-explain fs-26 ml-10 fw-normal click-p ml-20" @tap="showExplain = true"></text>
      </view>
      <!-- Tab切换 -->
      <tab
        :active-index.sync="activeIndex"
        :tab="tabArr"
        :draw-height="6"
        :draw-width="60"
        inactive-color="#666"
        :active-bag-color="themeInfo.color"
        @change="handleTabChange"
      ></tab>
      <!-- 营销奖品子分类切换 -->
      <view v-if="activeIndex === 1" class="sub-tab-container">
        <scroll-view class="sub-tab-list" scroll-x :show-scrollbar="false" enhanced :scroll-left="scrollLeft">
          <view
            v-for="(item, index) in subTabArr"
            :key="index"
            class="sub-tab-item"
            :class="{ active: subActiveIndex === index }"
            @tap="handleSubTabChange(index)"
          >
            {{ item.name }}
          </view>
        </scroll-view>
      </view>
      <!-- 筛选区域 -->
      <view class="filter-component">
        <view class="search-box">
          <selector-picker
            v-model="filter.prizeType"
            :value="filter.prizeType"
            class="selector-width"
            :options="typeOptions"
            range-key="label"
            @change="handleChange"
          ></selector-picker>
          <view class="search-date flex flex-1 ml-20" @tap="showDatePicker = true">
            <view v-if="filter.startTime" class="flex-1 text-left">
              {{ filter.startTime | dateSplit }}-{{ filter.endTime | dateSplit }}
            </view>
            <view v-else class="flex-1"></view>
            <text class="icon iconfont icon-down-arrow fs-20 c-2a ml-10"></text>
          </view>
        </view>
        <date-picker
          ref="datePicker"
          v-model="showDatePicker"
          :max-days="365"
          :default-date.sync="startDefault"
          class="flex-1"
          @confirm="datePickerComfirm"
        ></date-picker>
      </view>

      <view v-if="[1, 14, 103].includes(filter.prizeType)" class="mt-20 mb-20">
        <view
          class="award-show-info award-show-info-small flex flex-middle c-3 p-30"
          :class="{ 'is-special': isSpecialMp }"
        >
          <text class="fs-28">{{ awardPrizeInfo[0].label }}：</text>
          <u-loading :show="amountLoading" mode="flower" size="24" color="#FF7640"></u-loading>
          <text v-if="!amountLoading" class="fw-bold fs-36">{{ awardPrizeInfo[0].amount }}</text>
          <image class="type-icon" :src="awardPrizeInfo[0].iconUrl" mode="widthFix" />
        </view>
        <view class="fs-28 c-3 fw-bold ml-30 mt-10">
          记录条数：
          <u-loading :show="amountLoading" mode="flower" size="24" color="#FF7640"></u-loading>
          <text v-if="!amountLoading">
            <text class="primary-color mr-5 mt-30">{{ rowcount }}</text>
          </text>
        </view>
      </view>
      <view v-else-if="filter.prizeType === -1" class="flex award-show-wrap mt-20 mb-20">
        <view
          v-for="(item, index) in awardPrizeInfo"
          :key="index"
          class="flex-1 award-show-info award-show-info-big c-3"
          :class="{ 'is-special': isSpecialMp }"
        >
          <view class="fs-36 fw-bold mt-20">
            <u-loading :show="amountLoading" mode="flower" size="24" color="#FF7640"></u-loading>
            <text v-if="!amountLoading">{{ item.amount }}</text>
          </view>
          <view class="fs-24">{{ item.label }}</view>

          <image class="type-icon" :src="item.iconUrl" mode="widthFix" />
        </view>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <!-- 内容 -->
    <item :list="showList" :award-tab-type="activeIndex + 1" @update="handleSearch" />
    <load-more v-if="list.length" :has-more="hasMore" />
    <none-data v-if="showList.length === 0 && !loading" msg="暂无记录" icon-width="256" icon-height="190" />
    <u-popup v-model="showExplain" mode="center" width="600rpx" height="auto" border-radius="20" closeable="true">
      <view class="fs-28 pt-50 pb-60 pl-40 pr-40">
        <view class="fw-bold fs-32 tx-c mb-30">说明</view>
        <view class="mb-10">
          <text class="fw-bold">扫码奖品：</text>
          包含开箱奖、门店推荐返利奖等扫码活动奖品。
        </view>
        <view>
          <text class="fw-bold">营销奖品：</text>
          包含渠道返利、N元换购、宴席有礼等活动中获得的奖品。
        </view>
      </view>
    </u-popup>
  </view>
</template>
<script>
import { mapState } from 'vuex'
import Item from './comps/prize-item'
import Tab from '@/components/tab/index.vue'
import {
  apiGetsweetprizelist,
  apiGetsweepprizestatistics,
  apiGetmarketprizelist,
  apiGetmarketprizestatistics
} from '@/api/scan-code'
import LoadMore from '@/components/load-more'
import SelectorPicker from '@/components/search/selector-picker'
import DatePicker from '@/components/search/date-picker'
import { getdayScope } from '@/utils/index.js'
import { dateSplit } from '@/filters'
import { staticURL } from '@/config'
export default {
  components: {
    Item,
    LoadMore,
    Tab,
    SelectorPicker,
    DatePicker
  },
  filters: { dateSplit },
  mixins: [],
  data() {
    return {
      showExplain: false, // tab说明
      showDatePicker: false, // 显示时间选择
      filter: {
        startTime: getdayScope(-30),
        endTime: getdayScope(0),
        prizeType: -1
      },
      typeOptions: [
        { label: '奖品类型', val: -1 },
        { label: '红包', val: 103 },
        { label: '积分', val: 1 },
        { label: '提领券', val: 11 },
        { label: '返货券', val: 14 },
        { label: '实物奖品', val: 0 }
      ],
      redPacketamount: 0,
      couponcount: 0,
      pointtotal: 0,
      totalAmount: 0,
      amountLoading: true,
      activeIndex: 0,
      subActiveIndex: 0, // 子分类选中索引
      scrollLeft: 0, // scroll-view滚动位置
      tabArr: [
        {
          name: '扫码奖品',
          value: '0'
        },
        {
          name: '营销奖品',
          value: '1'
        }
      ],
      subTabArr: [
        {
          name: '渠道返利',
          value: 24
        },
        {
          name: 'N元换购',
          value: 25
        },
        {
          name: '宴席有礼',
          value: 31
        },
        {
          name: '陈列有礼',
          value: 40
        },
        {
          name: '团购有礼',
          value: 38
        },
        {
          name: '动销有礼',
          value: 37
        },
        {
          name: '推荐有礼',
          value: 39
        }
      ],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      list: [],
      rowcount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    ...mapState(['isSpecialMp']),
    topHeight() {
      const prizeType = this.filter.prizeType
      let baseHeight = prizeType === -1 ? '395rpx' : [1, 14, 103].includes(prizeType) ? '435rpx' : '254rpx'
      // 如果是营销奖品tab，需要加上子分类的高度
      if (this.activeIndex === 1) {
        baseHeight = baseHeight.replace('rpx', '')
        return parseInt(baseHeight) + 100 + 'rpx'
      }
      return baseHeight
    },
    awardPrizeInfo() {
      return [
        { label: '红包', val: 103, amount: `￥${this.redPacketamount}`, iconUrl: staticURL() + 'prizes/list/hb.png' },
        { label: '返货券', val: 14, amount: this.couponcount, iconUrl: staticURL() + 'prizes/list/volume.png' },
        { label: '积分', val: 1, amount: this.pointtotal, iconUrl: staticURL() + 'prizes/list/point.png' }
      ].filter(item => {
        const prizeType = this.filter.prizeType
        return prizeType === -1 || item.val === prizeType
      })
    },
    showList() {
      let list = this.list
      if (this.activeIndex === 0) {
        list = this.list.filter(item => {
          return [1, 2, 3].includes(item.type) || (item.type === 4 && [1011, 14].includes(item.volumetype))
        })
      }
      return list
    }
  },
  mounted() {
    this.handleSearch()
  },
  onLoad(options) {
    if (options.index) {
      this.activeIndex = +options.index
    }
    if (options.subIndex) {
      this.subActiveIndex = +options.subIndex
    }
  },
  onReady() {
    // 页面渲染完成后，如果当前是营销奖品tab，滚动到对应位置
    if (this.activeIndex === 1) {
      this.scrollToCenter(this.subActiveIndex)
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },

  methods: {
    handleTabChange(e) {
      // e.value 为当前选中的标签值
      this.activeTab = e.value
      this.handleSubTabChange(0) // 切换主tab时重置子分类
    },
    handleSubTabChange(index) {
      this.subActiveIndex = index
      this.scrollToCenter(index)
      this.handleSearch()
    },
    handleChange() {
      this.handleSearch()
    },
    datePickerComfirm(e) {
      if (!e) return
      this.filter.startTime = e.starttime
      this.filter.endTime = e.endtime
      this.handleSearch()
    },
    // 搜索按钮的回调
    handleSearch() {
      // 重置
      this.list = []
      this.totalAmount = 0
      this.redPacketamount = 0
      this.couponcount = 0
      this.pointtotal = 0
      this.form.pageIndex = 0
      this.hasMore = true
      this.loading = true
      if ([-1, 1, 14, 103].includes(this.filter.prizeType)) {
        this.initStatistics()
      }
      this.getData()
    },
    handleDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    // 滚动到居中位置
    scrollToCenter(index) {
      this.$nextTick(() => {
        const query = uni.createSelectorQuery().in(this)
        query.select('.sub-tab-list').boundingClientRect()
        query.selectAll('.sub-tab-item').boundingClientRect()
        query.exec(res => {
          if (res[0] && res[1] && res[1].length > 0) {
            const scrollView = res[0]
            const items = res[1]
            const currentItem = items[index]

            if (currentItem) {
              // 判断当前元素是否完全在可视区域内
              const itemLeft = currentItem.left
              const itemRight = currentItem.left + currentItem.width
              const viewLeft = scrollView.left
              const viewRight = scrollView.left + scrollView.width

              // 如果元素已经完全可见，不需要滚动
              if (itemLeft >= viewLeft && itemRight <= viewRight) {
                return
              }

              // 计算目标滚动位置：让当前item居中显示
              const targetScrollLeft = items[index].left - items[0].left - (scrollView.width - currentItem.width) / 2

              // 计算最大可滚动距离
              const lastItem = items[items.length - 1]
              const maxScrollLeft = lastItem.left - items[0].left + lastItem.width - scrollView.width

              // 确保滚动位置在有效范围内
              const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft))

              // 设置滚动位置
              this.scrollLeft = finalScrollLeft
            }
          }
        })
      })
    },
    initStatistics() {
      const statisticsApi = this.activeIndex === 0 ? apiGetsweepprizestatistics : apiGetmarketprizestatistics
      this.amountLoading = true

      const baseParams = {
        starttime: this.filter.startTime ? `${this.filter.startTime} 00:00:00` : '', //开始时间
        endtime: this.filter.endTime ? `${this.filter.endTime} 23:59:59` : '', //结束时间
        sourceType: 1
      }

      // 如果是营销奖品tab，添加activitytype参数
      if (this.activeIndex === 1 && this.subTabArr[this.subActiveIndex]) {
        baseParams.activitytype = this.subTabArr[this.subActiveIndex].value
      }

      if (this.filter.prizeType === -1) {
        // 拆成三次异步调用，分别查询不同奖品类型
        const promises = [
          statisticsApi({ ...baseParams, awardtypes: [1] }), // 积分
          statisticsApi({ ...baseParams, awardtypes: [14] }), // 返货券
          statisticsApi({ ...baseParams, awardtypes: [103] }) // 红包
        ]

        Promise.all(promises)
          .then(results => {
            this.amountLoading = false
            // results[0] - 积分
            if (this.$ck(results[0])) {
              const data = results[0].return_data?.data || {}
              this.pointtotal = data?.pointtotal || 0
            }
            // results[1] - 返货券
            if (this.$ck(results[1])) {
              const data = results[1].return_data?.data || {}
              this.couponcount = data?.returncoupon || 0
            }
            // results[2] - 红包
            if (this.$ck(results[2])) {
              const data = results[2].return_data?.data || {}
              this.redPacketamount = data?.redpacker || 0
            }
          })
          .catch(() => {
            this.amountLoading = false
          })
      } else {
        // 单个类型查询
        const params = {
          ...baseParams,
          awardtypes: [this.filter.prizeType]
        }

        statisticsApi(params)
          .then(res => {
            this.amountLoading = false
            if (this.$ck(res)) {
              const data = res.return_data?.data || {}
              this.redPacketamount = data?.redpacker || 0
              this.couponcount = data?.returncoupon || 0
              this.pointtotal = data?.pointtotal || 0
            }
          })
          .catch(() => {
            this.amountLoading = false
          })
      }
    },
    getData(cb) {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      let p = {
        starttime: this.filter.startTime ? `${this.filter.startTime} 00:00:00` : '', //开始时间
        endtime: this.filter.endTime ? `${this.filter.endTime} 23:59:59` : '', //结束时间
        sourcetype: 1,
        awardtype: this.filter.prizeType
      }

      // 如果是营销奖品tab，添加activitytype参数
      if (this.activeIndex === 1 && this.subTabArr[this.subActiveIndex]) {
        p.activitytype = this.subTabArr[this.subActiveIndex].value
      }

      const api = this.activeIndex === 0 ? apiGetsweetprizelist : apiGetmarketprizelist

      api({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        ...p
      })
        .then(res => {
          if (this.$ck(res)) {
            this.form.pageIndex = pageIndex
            let result = res.return_data.data || []
            result.forEach(item => {
              item.addtime = item.winningtime
              item.getstatus = item.status
            })
            this.rowcount = res.return_data?.extend?.rowcount || 0
            this.list = [...this.list, ...result].map(item => {
              item.activitytype = p.activitytype
              return item
            })
            this.hasMore = result.length >= this.form.pageSize
          } else {
            this.hasMore = false
          }
          this.busy = false
          this.loading = false
        })
        .catch(() => {
          this.busy = false
          this.loading = false
          typeof cb === 'function' && cb()
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './styles/list.scss';
</style>
