<template>
  <view class="people-picker fs-28" :style="themeVars">
    <u-popup
      v-model="showPicker"
      mode="bottom"
      border-radius="30"
      safe-area-inset-bottom
      @close="$emit('input', false)"
    >
      <view class="title fs-30 fw-bold tx-c">选择经销商</view>
      <view class="search-box">
        <search-input
          v-model="keywordOri"
          :placeholder="searchPlacehoder"
          :max-length="20"
          :style-type="2"
          custom-style="background: #f5f5f5"
          btn-style="background: #FF7640;color: #fff"
          @clearKeyword="handleChange(2)"
          @search="handleChange(2)"
        />
      </view>
      <view v-if="list.length && searchType === 1" class="mb-10 fs-24 ml-40 mt-20 primary-color">
        下列为根据门店定位推荐的经销商
      </view>
      <scroll-view class="list" scroll-y scroll-left="120" enable-flex @scrolltolower="scrollBottom">
        <view
          v-for="(item, index) in list"
          :key="index"
          class="item flex flex-middle pt-20 pb-20"
          @click="handleSelect(item)"
        >
          <view class="flex-1 overflow-h">
            <view class="name fs-30 fw-bold">{{ item.dealername }}</view>
            <view class="c-9 fs-24 pt-10">{{ item.fulladdress }}</view>
          </view>
          <view v-if="dealerId == item.id" class="fs-28 primary-color mr-20">✔</view>
        </view>
        <none-data v-if="!list.length && !busy" :msg="nonMsg" :view-height="560" :icon="nonoDataIcon" />
      </scroll-view>
      <view v-if="showOrigin" class="pt-30 pb-30 tx-c" @tap="handleSelect(originInfo)">
        若需选择品牌商总部，请点击
        <text class="fw-bold primary-color">选择{{ originInfo.dealername }}</text>
      </view>
    </u-popup>
  </view>
</template>

<script>
import { apiGetStoreDealer } from '@/api/activity.js'
import { staticURL } from '@/config'
import SearchInput from '@/components/search/search-input.vue'
import { getJsCode } from '@/utils/set-mp'
export default {
  components: {
    SearchInput
  },
  props: {
    value: Boolean,
    memberlogin: {
      type: String,
      default: ''
    },
    dealerId: {
      type: Number,
      default: -1
    },
    dxmDealerId: {
      type: Number,
      default: 0
    },
    lanandlat: {
      type: String,
      default: ''
    },
    showOrigin: Boolean // 总部
  },
  data() {
    return {
      searchType: 1, // 1-匹配街、区、市、省、全国，2-不匹配省市区街道
      nonoDataIcon: staticURL() + '/personal/default.png',
      activeIndex: 0, // 切换
      showPicker: this.value,
      keyword: '', // 搜索关键字
      keywordOri: '',
      originInfo: {
        id: 0,
        dealername: '总部'
      },
      list: [], // 列表数据
      paging: {
        pageSize: 10,
        PageIndex: 0
      },
      hasMore: true, // 还有更多数据标记
      busy: false // 防重复标记
    }
  },
  computed: {
    searchPlacehoder() {
      return this.searchType === 1 ? '若推荐不正确，请在此处搜索选择' : '请输入关键词搜索'
    },
    nonMsg() {
      return this.searchType === 1 ? '暂无推荐经销商，请在上方搜索选择' : '暂无经销商'
    }
  },
  watch: {
    value(val) {
      this.showPicker = val
      if (val && this.list.length === 0) {
        this.getData()
      }
    }
  },
  methods: {
    scrollBottom() {
      if (this.hasMore) {
        this.getData()
      }
    },
    resetData() {
      this.hasMore = true // 还有更多数据标记
      this.busy = false // 防重复标记
      this.paging.PageIndex = 0
      this.list = []
    },
    handleChange(type = 1) {
      this.keyword = this.keywordOri.trim()
      if (this.keyword !== '' && !/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(this.keyword)) {
        return this.$msg('请正确输入搜索关键字')
      }
      this.searchType = type
      this.resetData()
      this.getData()
    },
    async getData(type = 0) {
      // type等于1 父页面主动调用该方法并将第一个经销商信息回传
      if (this.busy) return
      this.busy = true
      let pageIndex = this.paging.PageIndex + 1
      let res = await apiGetStoreDealer({
        memberlogin: this.memberlogin, //品牌商账号
        keyword: this.keyword,
        pageindex: pageIndex,
        pagesize: this.paging.pageSize,
        js_code: await getJsCode(),
        dxmdealerid: this.dxmDealerId,
        lanandlat: this.lanandlat,
        matchingtype: this.searchType
      })
      if (this.$ck(res, true)) {
        this.paging.PageIndex++
        let list = res.return_data.list || []
        this.list = [...this.list, ...list]
        // 判断加载完成
        this.hasMore = res.return_data.totalcount > this.list.length
        this.busy = false
        if (type === 1 && this.list.length && this.paging.PageIndex === 1) {
          this.$emit('submit', this.list[0])
        }
      } else {
        this.busy = false
      }
    },

    handleSelect(item) {
      this.$emit('submit', item)
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  padding: 30rpx 20rpx 20rpx;
  // font-size: 30rpx;
  // font-weight: 700;
}
.list {
  height: 650rpx;
  margin: 30rpx 0;
  box-sizing: border-box;
  padding-right: 0;
  ::-webkit-scrollbar {
    width: 0;
    height: 0;
    color: transparent;
  }
  .item {
    border-bottom: 1rpx solid #e5e5e5;
    padding: 30rpx;
    margin: 0 30rpx;
    // padding-bottom: 30rpx;
    // padding-top: 30rpx;
    .name {
      color: #000;
      // font-weight: bold;
      // margin-top: 30rpx;
      // width: 660rpx;
    }
  }
}
.search-box {
  // margin-top: 30rpx;
  // display: flex;
  // padding-right: 30rpx;
  margin: 30rpx 30rpx 0;
  // .search-input {
  //   flex: 1;
  // }
}
</style>
