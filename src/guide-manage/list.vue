<template>
  <view class="container" :style="themeVars">
    <view class="tab-container">
      <tab
        class="bg-f"
        :tab="tabList"
        :draw-height="5"
        :is-loading="busy"
        :draw-width="50"
        :active-bag-color="themeInfo.color"
        :active-index.sync="tabIndex"
        :loading="busy"
        @change="handleSearch"
      ></tab>
      <view class="flex m-20">
        <selector-picker
          v-if="tabIndex"
          v-model="reviewStatus"
          :value="type"
          class="selector-width"
          :options="reviewOption"
          range-key="label"
          style="width: 270rpx; flex-shrink: 0"
        ></selector-picker>
        <selector-picker
          v-else
          v-model="status"
          :value="type"
          class="selector-width"
          :options="statusOption"
          range-key="label"
          style="width: 230rpx; flex-shrink: 0"
        ></selector-picker>
        <search-input
          v-model="keyword.ori"
          :max-length="30"
          class="ml-20"
          placeholder="姓名、手机、微信号"
          @search="handleSearch"
        ></search-input>
      </view>
      <view class="m-20">
        <text class="c-6">导购数量：</text>
        <text class="fw-bold">{{ totalcount }}</text>
      </view>
    </view>
    <view v-if="list" class="activity-content">
      <view v-for="item in list" :key="item.salergroupid" class="mt-20">
        <item
          :item="item"
          :is-audit="isAudit"
          :default-heading="guideHead"
          @tap="handleNav(`/guide-manage/detail?mode=${tabIndex}&id=${item.salerid}`)"
        />
      </view>
      <LoadMore v-if="!loading && list.length" :has-more="hasMore" />
    </view>

    <view v-if="showNoneData" class="vh-80 flex flex-middle flex-center">
      <none-data msg="暂无记录" icon-width="256" icon-height="190" />
    </view>
    <FooterBtn v-if="!isAudit && !loading" :foot-btns="footBtns" @nav="handleNav($event)" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGuideList } from '@/api/guide'
import Tab from '@/components/tab/index.vue'
import LoadMore from '@/components/load-more/index.vue'
import item from 'packages/components/guide/guide-list.vue'
import FooterBtn from 'packages/components/btns/list-btn.vue'
import loadMoreMixin from '@/mixins/load-more-maxid'
import { guideHead } from '@/utils/default-picture.js'
import SelectorPicker from '@/components/search/selector-picker'
import SearchInput from '@/components/search/search-input'
import refreshPageMixin from '@/mixins/refresh-page'
export default {
  components: {
    Tab,
    LoadMore,
    item,
    SelectorPicker,
    SearchInput,
    FooterBtn
  },
  mixins: [loadMoreMixin, refreshPageMixin],
  data() {
    return {
      guideHead,
      tabList: [
        {
          name: '导购列表',
          value: 0
        },
        {
          name: '导购审核',
          value: 1
        }
      ],
      keyword: {
        cur: '',
        ori: ''
      },
      tabIndex: 0,
      loading: true,
      status: -1,
      reviewStatus: 0, // 默认显示未审核的
      totalcount: 0,
      reviewOption: [
        // 只显示 0 2
        // {
        //   val: -1,
        //   label: '全部状态'
        // },
        {
          val: 0,
          label: '未审核'
        },
        // {
        //   val: 1,
        //   label: '审核通过'
        // },
        {
          val: 2,
          label: '审核未通过'
        }
      ],
      statusOption: [
        {
          val: -1,
          label: '全部状态'
        },
        {
          val: 0,
          label: '未激活'
        },
        {
          val: 1,
          label: '正常'
        },
        {
          val: 2,
          label: '已禁用'
        }
      ]
    }
  },
  computed: {
    isAudit() {
      return this.tabIndex === 1
    },
    storeInfo() {
      let { storeId, memberLogin } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      return { storeId, memberLogin }
    },
    footBtns() {
      const { ismdadddginfo: add, ismdinvitationdgregister: invite } = this.$store.state.guideManage
      const o = [
        {
          id: 1,
          name: '添加导购员',
          path: '/guide-manage/add?id=0'
        },
        {
          id: 2,
          name: '邀请导购员',
          path: '/pagesA/invite/index?role=1&tabId=0&showTab=1'
        },
        {
          id: 3,
          name: '邀请激活',
          path: '/pagesA/invite/index?role=1&tabId=1&showTab=0'
        }
      ]
      let s
      if (add && invite) {
        s = [1, 2]
      } else if (add) {
        s = [1, 3]
      } else if (invite) {
        s = [2]
      } else {
        s = [3]
      }
      return o.filter(item => s.includes(item.id))
    },
    paramChange() {
      return `${this.status}${this.reviewStatus}`
    }
  },
  watch: {
    paramChange() {
      setTimeout(() => {
        this.handleSearch()
      }, 20)
    }
  },
  onLoad() {
    this.$store.dispatch('getStoreSet')
    this.getData()
  },
  methods: {
    handleSearch() {
      this.keyword.cur = this.keyword.ori
      this.resetData()
      this.getData()
    },
    refreshPage() {
      this.handleSearch()
      this.$store.commit('updateRefreshTag', false)
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      const state = this.tabIndex ? { reviewstate: this.reviewStatus } : { status: this.status, reviewstate: 1 }
      try {
        const param = {
          storeid: this.storeInfo.storeId,
          keyword: this.keyword.cur,
          pagesize: this.paging.pageSize,
          pageindex: nextPage,
          ...state
        }
        const res = await apiGuideList(param)
        if (this.$ck(res)) {
          res.return_data.list = res.return_data.list.map(item => {
            return {
              salerid: item.salerid,
              mobile: item.mobile,
              checkstate: item.checkstate,
              salerstate: item.salerstate,
              realname: item.realname,
              addtime: item.addtime,
              salerimg: item.salerimg
            }
          })
          this.dealRes({ res, nextPage })
          this.totalcount = res.return_data.totalcount
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    handleNav(url) {
      uni.navigateTo({
        url
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.tab-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 250rpx;
  z-index: 10;
  background-color: #f4f4f4;
}
.activity-content {
  padding: 250rpx 20rpx 20rpx;
}
</style>
