<template>
  <view class="container" :style="themeVars">
    <!-- tab栏 -->
    <tab
      :tab="tabList"
      :active-index.sync="tabIndex"
      :is-loading="busy"
      :show-count="true"
      :draw-height="5"
      :draw-width="70"
      :active-bag-color="themeInfo.color"
      @change="onTabChange"
    />
    <view class="content">
      <view
        v-for="(item, index) in list"
        :key="index"
        class="item mt-20 br-10 bg-f p-30 fs-24"
        @tap="handleDetail(item)"
      >
        <view class="title fs-30 fw-bold">{{ item.sendtype | filterType }}</view>
        <view class="message c-6 mt-20 mb-20 p-20">
          {{ item.content }}
        </view>
        <view class="footer flex flex-middle flex-between c-6">
          <view>消息时间：{{ item.sendtime }}</view>
          <view v-if="tabIndex === 0" class="link flex flex-middle">
            详情
            <view class="iconfont icon-arrow-right ml-10"></view>
          </view>
        </view>
        <view v-if="item.status === 0" class="new-dot"></view>
      </view>
      <LoadMore v-if="!loading && list.length" :has-more="hasMore" />
      <none-data v-if="showNoneData" :msg="msg" icon-width="256" icon-height="190" />
    </view>
    <tabbar />
  </view>
</template>

<script>
import Tabbar from '@/components/tabbar/index.vue'
import Tab from '@/components/tab/index.vue'
import LoadMore from '@/components/load-more/index.vue'
import loadMoreMixin from '@/mixins/load-more-maxid'
import { hideHomeButton } from '@/utils/set-mp'
import { apiMessageList, apiMessageRead } from '@/api/message'

const SEND_TYPES = {
  135: '零钱提现到账通知',
  136: '商品待签收通知',
  137: '库存扣减审核通知',
  138: '宴席有礼订单审核通知',
  139: '陈列有礼订单审核通知',
  140: '陈列有礼任务开始通知',
  77: '店员退出门店通知',
  312: 'N元换购核销奖励开启通知',
  313: 'N元换购核销奖励变更通知',
  318: '门店动销有礼订单审核结果通知',
  321: '门店动销有礼奖励规则变更',
  319: '门店团购有礼订单审核通知',
  141: '门店推荐有礼到账通知'
}

export default {
  components: {
    Tabbar,
    Tab,
    LoadMore
  },
  filters: {
    filterType(val) {
      return SEND_TYPES[val] || '通知'
    }
  },
  mixins: [loadMoreMixin],
  data() {
    return {
      tabIndex: 0,
      loading: true
    }
  },
  computed: {
    tabList() {
      return [
        {
          name: '业务通知',
          count: this.$store.state.messageCenter.businessNoticeCount
        },
        {
          name: '系统消息',
          count: this.$store.state.messageCenter.systemNoticeCount
        }
      ]
    },
    msg() {
      return this.tabIndex === 0 ? '暂无通知' : '暂无消息'
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
      // 根据当前 tabIndex 筛选 sendtypes
      const isBusiness = this.tabIndex === 0
      const sendtypes = Object.keys(SEND_TYPES)
        .map(Number)
        .filter(type => (isBusiness ? ![77, 312, 313, 321].includes(type) : [77, 312, 313, 321].includes(type)))
      const nextPage = this.paging.page + 1

      try {
        const res = await apiMessageList({
          sendtypes: sendtypes,
          pageindex: nextPage,
          pagesize: this.paging.pageSize
        })
        if (this.$ck(res)) {
          this.dealRes({ res, nextPage, listProp: 'results' })
        }
      } finally {
        this.busy = false
        this.loading = false
      }
    },
    onTabChange() {
      this.resetData()
      this.getData()
    },
    handleDetail(item) {
      const { id, status, link } = item
      if (!link && item.sendtype !== 77) return
      if (status === 0) {
        // 标记通知已读
        apiMessageRead({
          messageids: [id]
        }).then(res => {
          if (this.$ck(res)) {
            item.status = 1
            this.$store.dispatch('messageCenter/updateMessageCount')
          }
        })
      }
      item.sendtype !== 77 &&
        uni.navigateTo({
          url: link.startsWith('/') ? link : `/${link}`
        })
    }
  }
}
</script>
<style lang='scss' scoped>
.container {
  min-height: 100%;
  ::v-deep .tab-box {
    position: fixed;
    width: 100%;
    z-index: 10;
  }
  .content {
    padding: 86rpx 20rpx 100rpx;
  }
  .item {
    position: relative;
    .message {
      background: #f8f8f8;
      line-height: 40rpx;
    }
    .link {
      color: #000;

      .iconfont {
        font-size: 20rpx;
      }
    }
    .new-dot {
      position: absolute;
      top: 30rpx;
      right: 30rpx;
      width: 14rpx;
      height: 14rpx;
      border-radius: 50%;
      background-color: $uni-color-error;
    }
  }
}
</style>
