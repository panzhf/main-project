<template>
  <view class="page-reward" :style="themeVars">
    <view :style="{ height: tabIndex === 1 ? `580rpx` : `520rpx` }"></view>
    <view class="top-fixed" :style="{ height: tabIndex === 1 ? `580rpx` : `520rpx` }">
      <tab
        :tab="tabList"
        :draw-height="5"
        :draw-width="60"
        :active-index.sync="tabIndex"
        :active-bag-color="themeInfo.color"
        @change="handleChange"
      ></tab>
      <view class="reward-tips">
        {{ tipsText }}
      </view>
      <view class="search-box">
        <SelectorDate v-model="dateValue" class="flex-1"></SelectorDate>
      </view>
      <view class="search-box">
        <selector-picker v-model="typeValue" :options="typeOption" class="flex-1" range-key="label"></selector-picker>
        <selector-picker
          v-model="statusValue"
          class="selector-width ml-20"
          :options="statusOption"
          range-key="label"
        ></selector-picker>
      </view>
      <view class="search-box">
        <search-input
          v-model="keyValue"
          class="flex-1"
          :placeholder="placeholderText"
          @search="handleSearch"
        ></search-input>
      </view>

      <view class="total-number">
        <text class="mr-20" @tap="handleShowPiont">
          积分：
          <text class="primary-color">
            {{ pointCount }}
            <text class="iconfont icon-arrow-right ml-10 fs-20 fw-normal"></text>
          </text>
        </text>
        红包：
        <text class="primary-color mr-40">￥{{ amountCount }}</text>
        <text
          v-if="roleType === 2"
          class="edit-color fs-24 fw-normal click-p"
          @tap="$navPage('/packages/src/personal/change/index')"
        >
          前往提现
          <text class="iconfont icon-arrow-right fs-20 fw-normal"></text>
        </text>
        <text
          class="iconfont icon-explain fs-26 primary-color ml-10 fw-normal click-p"
          @tap="showStaticsExplain = true"
        ></text>
      </view>
      <view v-if="tabIndex === 1" class="total-number">
        <text class="mr-40" @tap="$navPage('/pages/return-coupon/index')">
          卡券：
          <text class="primary-color">
            {{ vouchercount }}
            <text class="iconfont icon-arrow-right ml-10 fs-20 fw-normal"></text>
          </text>
        </text>
      </view>
    </view>
    <view v-for="(item, index) in list" :key="index" class="reward-item">
      <view class="reward-status flex flex-between bd-e">
        <view class="fs-26 c-6">获得时间：{{ item.writeofftime }}</view>
        <status-text :item="item" :tab-id="tabId"></status-text>
      </view>
      <view class="flex reward-info flex-middle flex-between" @tap="handleGoDetail(item)">
        <image
          class="reward-pic"
          :src="item.prizetype === 1 ? pointAvatar : item.prizetype === 14 ? item.voucherimg : moneyAvatar"
        />
        <view class="infos flex-1 flex flex-column flex-between">
          <view class="fs-28 fw-bold">
            <text v-if="item.prizetype === 14">
              {{ item.rewardcontent }}
            </text>
            <text v-else>
              {{ item.prizetype !== 1 ? '￥' : '' }}{{ item.amount }}{{ item.prizetype | rewardTypwFilter }}
            </text>
          </view>
          <view class="fs-22" :class="item.status === 3 ? 'primary-color' : ''">
            {{ item.message }}
          </view>
          <view v-if="item.prizetype === 14" class="fs-22">x {{ item.amount }}</view>
          <view class="fs-22 c-9">{{ item.voucherno || '' }}</view>
        </view>
        <view class="icon iconfont icon-arrow-right fs-22"></view>
      </view>
    </view>
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
    <none-data v-if="list.length === 0 && !loading" msg="暂无奖励哦" icon-width="256" icon-height="190"></none-data>
    <common-popup
      v-model="showJfPopup.show"
      type="confirm"
      :content="showJfPopup.content"
      cancel-text="确定"
      confirm-text="换绑微信"
      @cancel="handleJfcancel"
      @confirm="handleJfConfirm"
    ></common-popup>
    <u-popup
      v-model="showStaticsExplain"
      mode="center"
      width="600rpx"
      height="auto"
      border-radius="20"
      closeable="true"
    >
      <Tips :type="roleType === 2 ? 3 : 4"></Tips>
      <!-- #ifdef MP-WEIXIN -->
      <PrivacyPopup />
      <!-- #endif -->
    </u-popup>
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiWriteoffRewardList } from '@/api/pick-coupon'
import SearchInput from '@/components/search/search-input'
import SelectorPicker from '@/components/search/selector-picker'
import SelectorDate from '@/components/search/selector-date'
import LoadMore from '@/components/load-more'
import gzhMixin from '@/mixins/show-gzh'
import Tab from '@/components/tab/index.vue'
import StatusText from './comps/status-text.vue'
import { rewardTypwFilter } from '@/filters'
import Tips from '@/components/tips/asset-tips.vue'
import getUserOpenId from '@/mixins/get-user-openid.js'
export default {
  components: { LoadMore, SearchInput, SelectorPicker, SelectorDate, Tab, StatusText, Tips },
  filters: { rewardTypwFilter },
  mixins: [gzhMixin, getUserOpenId],
  data() {
    return {
      showStaticsExplain: false,
      list: [],
      noDataPic: staticURL() + 'personal/default.png',
      moneyAvatar: staticURL() + 'reward/money.png',
      pointAvatar: staticURL() + 'reward/point.png',
      statusValue: -1,
      keyValue: '', // 关键字
      dateValue: '', // 日期
      typeValue: -1, // 选择奖项类型 奖品类型 1:积分 2:微信红包  3 : 红包零钱 4 : 企业付款红包
      tabList: [
        { name: '提领券', id: 1 },
        { name: '兑奖码', id: 14 }
      ],
      tabId: 1,
      tabIndex: 0,
      statusOption: [
        {
          val: -1,
          label: '发放状态'
        }
      ],
      typeOption: [
        {
          val: -1,
          label: '奖励类型'
        },
        {
          val: 1,
          label: '积分'
        },
        {
          val: 2,
          label: '红包'
        },
        {
          val: 14,
          label: '卡券'
        }
      ],
      hbOption: [
        // （-1：全部 1: 发送中 2: 发放成功（已到账） 3: 发放失败 5：发放成功（待到账））
        {
          val: -1,
          label: '发放状态'
        },
        {
          val: 1,
          label: '发放中'
        },
        {
          val: 2,
          label: '发放成功（已到账）'
        },
        {
          val: 3,
          label: '发放失败'
        },
        {
          val: 5,
          label: '发放成功（待到账）'
        },
        {
          val: 6,
          label: '补发成功'
        },
        {
          val: 7,
          label: '补发中'
        }
      ],
      pointsOption: [
        {
          val: -1,
          label: '发放状态'
        },
        {
          val: 1,
          label: '发放中'
        },
        {
          val: 2,
          label: '发放成功'
        },
        {
          val: 3,
          label: '发放失败'
        }
      ],
      dateString: '',
      writeoffNumber: 0,
      vouchercount: 0,
      amountCount: 0,
      pointCount: 0,
      totalCount: '', //门店数量
      roleType: 0,
      page: {
        pageIndex: 0,
        pageSize: 10
      },
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    placeholderText() {
      return this.tabId === 1 ? '请输入券码编号' : '请输入码ID'
    },
    tipsText() {
      return this.tabId === 1
        ? '奖励来源：给消费者手动核销提领券时，核销成功后将有机会获取核销奖励哦~奖励解释权归品牌商所有。'
        : '奖励来源：在N元换购活动中核销拉环、瓶盖等二维码后有机会获得核销奖励哦~奖励解释权归品牌商所有。'
    },
    startDate() {
      if (!this.dateValue) return ''
      let dateArr = this.dateValue.split(',')
      return dateArr[0]
    },
    endDate() {
      if (!this.dateValue) return ''
      let dateArr = this.dateValue.split(',')
      return dateArr[1]
    },
    paramFiler() {
      return this.typeValue + this.statusValue + this.dateValue
    }
  },
  watch: {
    typeValue(val) {
      let defaultOption = [
        {
          val: -1,
          label: '发放状态'
        }
      ]
      this.statusValue = -1
      this.statusOption = val === 1 ? this.pointsOption : val === 2 ? this.hbOption : defaultOption
    },
    paramFiler() {
      this.handleSearch()
    }
  },
  onLoad() {
    const { roleType } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    this.roleType = roleType
    this.getData()
  },
  onShow() {},
  methods: {
    changeTab(tabId) {
      this.tabIndex = this.tabList.findIndex(item => {
        return item.id === tabId
      })
    },
    async getData() {
      if (this.busy || !this.hasMore) return
      let pageIndex = this.page.pageIndex + 1
      this.busy = true
      let res = await apiWriteoffRewardList({
        starttime: this.startDate,
        endtime: this.endDate,
        prizetype: this.typeValue,
        status: this.statusValue,
        voucherno: this.keyValue,
        pageIndex: pageIndex,
        pageSize: 10,
        type: this.tabId
      })
      if (this.$ck(res, true)) {
        this.page.pageIndex++
        let { amountcount, pointcount, totalcount, vouchercount, list } = res.return_data
        this.amountCount = amountcount
        this.pointCount = pointcount
        this.totalCount = totalcount
        this.vouchercount = vouchercount
        this.list = [...this.list, ...list]
        this.hasMore = this.totalCount > this.list.length
      }
      this.busy = false
      this.loading = false
    },
    onReachBottom() {
      // 上拉加载
      if (this.hasMore) {
        this.getData()
      }
    },
    handleSearch() {
      setTimeout(() => {
        this.list = []
        this.hasMore = true
        this.busy = false
        this.loading = true
        this.totalCount = 0
        this.pointCount = 0
        this.amountCount = 0
        this.page = {
          pageIndex: 0,
          pageSize: 10
        }
        this.getData()
      }, 200)
    },
    handleChange(e) {
      this.tabId = e.id
      this.list = []
      this.changeTab(this.tabId)
      this.handleSearch()
    },
    handleGoDetail(item) {
      uni.navigateTo({
        url: `/pages/reimburse-reward/detail?type=${this.tabId}&info=${encodeURIComponent(JSON.stringify(item))}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-reward {
  .top-fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 520rpx;
    z-index: 99;
    background: #f5f5f5;
  }
  .search-box {
    display: flex;
    margin: 0 30rpx 20rpx 30rpx;
  }
  .selector-width {
    width: 400rpx;
    flex-shrink: 0;
  }
  .reward-tips {
    padding: 18rpx;
    font-size: 24rpx;
    line-height: 32rpx;
    background: #fff5f1;
    color: #ff5e33;
  }
  .total-number {
    font-size: 28rpx;
    font-weight: 700;
    padding: 0 30rpx 20rpx 30rpx;
  }
  .click-p {
    padding: 8rpx;
  }
  .reward-item {
    margin: 0 30rpx 20rpx;
    padding: 30rpx;
    background: #fff;
    padding: 30rpx;
    z-index: 1;
    border-radius: 20rpx;
    .reward-pic {
      width: 100rpx;
      height: 100rpx;
    }
    .reward-status {
      padding-bottom: 20rpx;
    }
    .reward-info {
      padding-top: 20rpx;
      .infos {
        height: 100rpx;
        margin-left: 20rpx;
      }
    }
  }
}
</style>
