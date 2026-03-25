<template>
  <view class="container">
    <view class="tab-container">
      <tab
        :tab="tabList"
        :draw-height="5"
        :draw-width="50"
        :active-index.sync="tabIndex"
        :active-bag-color="themeInfo.color"
        @change="onTabChange"
      ></tab>
    </view>
    <view class="activity-content">
      <view v-for="(item, index) in list" :key="index" class="mt-20">
        <BannerItem :info="item" show-link />
      </view>
      <LoadMore v-if="!loading && list.length" :has-more="hasMore" />
    </view>

    <view v-if="showNoneData" class="vh-80 flex flex-middle flex-center">
      <none-data msg="暂无活动" icon-width="256" icon-height="190" />
    </view>
    <Tabbar />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiGetActivityList } from '@/api/activity'
import Tab from '@/components/tab/index.vue'
import Tabbar from '@/components/tabbar/index.vue'
import LoadMore from '@/components/load-more/index.vue'
import BannerItem from 'packages/components/activity-banner'
import { getDate } from '@/filters'
import loadMoreMixin from '@/mixins/load-more-maxid'
import { hideHomeButton } from '@/utils/set-mp'
export default {
  components: {
    Tab,
    Tabbar,
    LoadMore,
    BannerItem
  },
  filters: { getDate },
  mixins: [loadMoreMixin],
  data() {
    return {
      tabList: [
        {
          name: '全部',
          value: -1
        },
        {
          name: '参与中',
          value: 1
        },
        {
          name: '未参与',
          value: 2
        }
      ],
      tabIndex: 0,
      joinstatus: -1, // -1-全部；1-参与中；2-未参与
      companyName: '',
      loading: true
    }
  },
  onLoad() {
    hideHomeButton()
    this.getData()
  },
  methods: {
    async getData() {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      try {
        const res = await apiGetActivityList({
          pageindex: nextPage,
          pagesize: this.paging.pageSize,
          joinstatus: this.joinstatus
        })
        if (this.$ck(res)) {
          this.dealRes({ res, nextPage })
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    // tab栏的回调
    onTabChange(item) {
      this.joinstatus = item.value
      this.resetData()
      this.getData()
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
  height: 86rpx;
  z-index: 10;
  background: #fff;
}
.activity-content {
  padding: 86rpx 20rpx 100rpx;
}
</style>
