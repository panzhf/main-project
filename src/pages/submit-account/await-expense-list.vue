<template>
  <view class="container" style="min-height: 100vh" :class="showNoneData ? 'flex  flex-center flex-column  ' : ''">
    <view class="ticket-box pl-20 pr-20 bg-f fs-28">
      <view v-for="(item, index) in list" :key="index" class="ticket flex-middle" :class="index ? 'bd-t-e' : ''">
        <image class="ticket-pic" :src="item.imgstr" />
        <view class="flex-1 flex flex-column flex-between" style="height: 140rpx">
          <view class="ticket-val ellipsis-2 c-0 fw-bold">{{ item.id }}-{{ item.name }}</view>
          <view class="ticket-val">待报销 × {{ item.awaitexpensecount }}</view>
        </view>
      </view>
    </view>
    <none-data v-if="showNoneData" msg="暂无记录~" icon-width="256" icon-height="190" />
    <load-more v-if="list.length" :has-more="hasMore" />
  </view>
</template>
<script>
import { apiAwaitReiburserList } from '@/api/pick-coupon'
import LoadMore from '@/components/load-more'
import loadMoreMixin from '@/mixins/load-more-maxid'
export default {
  components: {
    LoadMore
  },
  mixins: [loadMoreMixin],
  data() {
    return {
      storeId: 0
    }
  },
  onLoad() {
    let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    this.storeId = Number(storeSettingInfo.storeId || 0)
    this.getData()
  },
  onReachBottom() {
    if (this.hasMore) {
      this.getData()
    }
  },
  methods: {
    onPullDownRefresh() {
      this.resetData()
      this.getData(() => {
        uni.stopPullDownRefresh()
      })
    },
    getData(cb) {
      if (this.busy) return
      this.busy = true
      const nextPage = this.paging.page + 1
      apiAwaitReiburserList({
        pageindex: nextPage,
        pagesize: this.paging.pageSize,
        sourcetype: 1, // 区分端 0-经销商业务帮帮 1-门店
        type: 1,
        querytype: 1,
        id: this.storeId
      }).then(res => {
        if (this.$ck(res)) {
          this.dealRes({ res, nextPage })
          typeof cb === 'function' && cb()
        }
        this.busy = false
        this.loading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.ticket-pic {
  width: 140rpx;
  height: 140rpx;
  margin: 30rpx 30rpx 30rpx 0;
  background: #f6f6f6;
}
.ticket {
  font-size: 28rpx;
  display: flex;
  .ticket-item {
    display: flex;
    padding: 5rpx 0;
    .ticket-key {
      width: 140rpx;
      text-align: left;
      color: #666666;
    }
    .ticket-val {
      color: #000000;
      flex: 1;
    }
  }
}
</style>
