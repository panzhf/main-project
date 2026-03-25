<template>
  <view class="container">
    <!-- 顶部 -->
    <view class="container-header" :style="{ height: topHeight }">
      <!-- =搜索= -->
      <view class="search-box">
        <view class="flex" style="width: 710rpx">
          <view class="search-date flex flex-1" @tap="showDatePicker = true">
            <view v-if="dateFilter.startTime" class="flex-1">{{ dateFilter.startTime }}-{{ dateFilter.endTime }}</view>
            <view v-else class="flex-1">出货时间</view>
            <text class="icon iconfont icon-down-arrow fs-20 c-2a ml-10"></text>
          </view>
        </view>
        <date-picker
          v-model="showDatePicker"
          :default-date.sync="startDefault"
          class="flex-1"
          @confirm="datePickerComfirm"
        ></date-picker>
      </view>
      <view class="search-box">
        <search-input
          v-model="dealerValueOri"
          class="flex-1"
          :max-length="30"
          :show-search-btn="false"
          placeholder="请输入总部或经销商名称、手机号查询"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="search-box">
        <selector-picker
          v-model="statusValue"
          :value="statusValue"
          class="selector-width"
          :options="statusOption"
          range-key="label"
        ></selector-picker>

        <search-input
          v-model="keyValueOri"
          :max-length="30"
          class="ml-20"
          placeholder="出货单号或订单号"
          @search="handleSearch"
        ></search-input>
      </view>
    </view>
    <view :style="{ height: topHeight }"></view>
    <!-- 内容 -->
    <Item :list="list" :signin-type="signinType" @update="handleSearch"></Item>
    <none-data v-if="list.length === 0 && !loading" msg="暂无记录~" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
    <btn-scan
      v-if="isOpenSignType"
      scan-text="快速签收"
      custom-style="bottom: 8%;"
      @tap="handleClickFastSign"
    ></btn-scan>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>
<script>
import { filterRmb } from '@/filters'
import Item from './comps/item'
import SearchInput from '@/components/search/search-input'
import SelectorPicker from '@/components/search/selector-picker'
import DatePicker from '@/components/search/date-picker'
import { apiGetGignList } from '@/api/sign'
import LoadMore from '@/components/load-more'
import baseSetMixin from '@/mixins/base-set'
import overdueMixin from 'packages/mixins/overdue'

export default {
  components: {
    SearchInput,
    SelectorPicker,
    Item,
    LoadMore,
    DatePicker
  },
  filters: { filterRmb },
  mixins: [baseSetMixin, overdueMixin],
  data() {
    return {
      customStyle: {
        width: '120rpx',
        height: '70rpx',
        fontSize: '30rpx'
      },
      showDatePicker: false, // 显示时间选择
      dateFilter: '', // 时间
      statusValue: -1,
      keyValue: '', // 关键字
      keyValueOri: '',
      dealerValue: '',
      dealerValueOri: '',
      statusOption: [
        //  "status":-1,签收状态 -1全部，0-待签收，1-已签收，2-签收中，3-待确认
        {
          val: -1,
          label: '全部'
        },
        {
          val: 0,
          label: '待签收'
        },
        {
          val: 1,
          label: '已签收'
        },
        {
          val: 2,
          label: '签收中'
        },
        {
          val: 3,
          label: '待确认'
        }
      ],

      list: [],
      form: {
        pageIndex: 0,
        pageSize: 10
      },
      totalCount: 0,
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    topHeight() {
      return '320rpx'
    },
    isParaChange() {
      return `${this.statusValue}${this.dateFilter.startTime}${this.dateFilter.endTime}`
    }
  },
  watch: {
    isParaChange(val) {
      // 监听这几个参数，有改变则立即请求数据
      this.handleSearch()
    }
  },
  onLoad() {
    this.$store.dispatch('getFcBasicInfo')
    this.getData()
  },
  async onShow() {
    uni.$once('signListReflesh', res => {
      if (res) {
        this.handleSearch()
      }
    })
    if (this.refleshData) {
      this.refleshData = false
      this.handleSearch()
    }
  },
  onPullDownRefresh() {
    this.$store.dispatch('getFcBasicInfo')
    this.handleSearch(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    handleClickFastSign() {
      if (!this.overdueChecked()) return

      //快速签收
      uni.navigateTo({
        url: `/product/sign/scan?insignType=2`
      })
    },
    datePickerComfirm(e) {
      if (!e) return
      this.dateFilter = {
        startTime: e.starttime,
        endTime: e.endtime
      }
    },
    // 搜索按钮的回调
    handleSearch(cb) {
      // 重置
      this.list = []
      this.form.pageIndex = 0
      this.hasMore = true
      this.loading = true
      this.totalCount = 0
      this.dealerValue = this.dealerValueOri
      this.keyValue = this.keyValueOri
      this.getData(cb)
    },
    handleDetail(t) {
      uni.navigateTo({
        url: t
      })
    },
    getData(cb) {
      if (this.busy) return
      this.busy = true
      let pageIndex = this.form.pageIndex + 1
      apiGetGignList({
        pageindex: pageIndex,
        pagesize: this.form.pageSize,
        starttime: this.dateFilter.startTime ? `${this.dateFilter.startTime} 00:00:00` : '', //开始时间
        endtime: this.dateFilter.endTime ? `${this.dateFilter.endTime} 23:59:59` : '', //结束时间
        status: this.statusValue,
        keyword: this.keyValue,
        dealerkeyword: this.dealerValue
      })
        .then(res => {
          typeof cb === 'function' && cb()
          if (this.$ck(res)) {
            this.form.pageIndex = pageIndex
            let { totalcount, list } = res.return_data
            this.totalCount = totalcount
            this.list = [...this.list, ...list]
            this.hasMore = this.totalCount > this.list.length
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
.container-header {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 99;
  background: #f5f5f5;
}
.search-box {
  display: flex;
  margin: 20rpx 30rpx 20rpx 30rpx;
  .order-ralation {
    width: 250rpx;
    text-align: center;
    background: #fff;
    padding: 0 0 0 32rpx;
    height: 76rpx;
    border-radius: 35rpx;
    line-height: 76rpx;
  }
  .selector-width {
    width: 250rpx;
    flex-shrink: 0;
  }
  .search-date {
    text-align: center;
    background: #fff;
    padding: 0 32rpx;
    height: 76rpx;
    border-radius: 35rpx;
    line-height: 76rpx;
  }
}
.tabs {
  position: fixed;
  width: 100%;
  height: 106rpx;
  left: 0;
  top: 0;
  display: flex;
  background: #fff;
  z-index: 111;
  border-bottom: 1px solid #dedede;

  .tabs-item {
    flex: 1;
    line-height: 106rpx;
    text-align: center;
    font-size: 30rpx;
    position: relative;
    font-weight: bold;

    &.on {
      color: #ff5d33;

      &::after {
        content: '';
        width: 46rpx;
        height: 20rpx;
        position: absolute;
        background: #ff5d33;
        opacity: 0.1;
        border-radius: 10rpx;
        left: 0;
        right: 0;
        margin: 0 auto;
        bottom: 25rpx;
      }
    }
  }
}

.setCustomTime {
  background-color: #fff;
  padding: 20rpx 0;
  position: relative;
  .pickerWrapper {
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 15rpx;
    height: 100%;
    .picker-box {
      display: block;
      height: 63rpx;
      border-radius: 32rpx;
      background-color: #f0f0f0;
      color: #666;
      font-size: 26rpx;
      padding: 0 65rpx;
      margin: 0 6px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

.drop-box {
  background-color: #fff;
  font-weight: 700;
}

.seach {
  position: relative;
}

.noConfirm-wrap {
  .top {
    padding: 20rpx 40rpx;
    background-color: #fff4f4;
    color: #ff4c40;
    font-size: 24rpx;
    display: flex;
    .top-text {
      margin-left: 10rpx;
    }
  }
}
</style>
