<template>
  <view :style="themeVars">
    <view class="page-invite" :style="{ backgroundImage: `url(${pics.bgLogin})` }">
      <title-bar showback="true" :bg-pic="pics.bgLogin" title="活动详情"></title-bar>

      <view class="invite flex flex-between flex-middle c-0">
        <image
          class="invite-avatar shrink-0"
          :src="storeSettingInfo.memberloginimg ? storeSettingInfo.memberloginimg : brandImg"
          mode="scaleToFill"
        />
        <view class="flex-1">
          <view class="fw-bold fs-30">{{ storeSettingInfo.memberloginname || '' }}</view>
          <view class="fs-28 mt-5 invite-con primary-color">{{ storeSettingInfo.acttitle || '' }}</view>
        </view>
        <view>
          <!-- 活动说明 -->
          <image class="invite-pic shrink-0" :src="pics.invite" mode="scaleToFill" @tap="handleShowExplain" />
        </view>
      </view>

      <view class="invite-time flex flex-between flex-middle">
        <view>
          <view class="fw-bold fs-28">活动时间：长期</view>
          <view class="fs-24 c-6 mt-10">实际期限以厂家通知为准</view>
        </view>
        <view v-if="storeSettingInfo.actstatus" class="tx-c">
          <image class="shrink-0 status" :src="pics.actRun" mode="scaleToFill" />
          <view class="status-text primary-color">活动进行中</view>
        </view>
        <view v-else class="tx-c">
          <image class="shrink-0 status" :src="pics.actOver" mode="scaleToFill" />
          <view class="status-text primary-color">活动已结束</view>
        </view>
      </view>

      <view class="invite-list">
        <image class="list-bg__top" :src="pics.inviteListTop" mode="scaleToFill" />
        <image class="list-bg__title" :src="pics.inviteListTile" mode="scaleToFill" />
        <view class="invite-box">
          <view class="fs-28 c-3">
            累计邀请：
            <text class="primary-color fw-bold">{{ storeSettingInfo.storeinvitecount }}</text>
          </view>
          <view v-for="(item, index) in list" :key="index" class="item" @tap="handleJump(item)">
            <view class="flex flex-between flex-middle">
              <view class="info flex-1">
                <view class="fs-28 c-3 fw-bold">{{ item.storename }}({{ item.leader }})</view>
                <view class="fs-26 c-6 mt-10">{{ item.mobileno }}</view>
                <view class="fs-26 c-6 mt-5 mb-20">创建日期：{{ item.reviewtime }}</view>
              </view>
              <view v-if="isShowMdOrderCount" class="icon iconfont icon-arrow-right c-0 fs-20"></view>
            </view>
            <view v-if="isShowMdOrderCount" class="bd-t-e fw-bold fs-28 pt-20">
              <text class="mr-10">已完成订单数</text>
              <text class="primary-color mr-20">{{ item.ordercount }}</text>
              <text class="mr-10">订单商品总数</text>
              <text class="primary-color">{{ item.goodscount }}</text>
            </view>
          </view>
          <none-data
            v-if="list.length === 0 && !loading"
            icon-width="282"
            icon-height="208"
            msg="暂无邀请的门店"
          ></none-data>
          <load-more v-if="!loading && list.length" :has-more="hasMore" />
        </view>
      </view>
      <!-- 生成邀请海报 -->

      <image
        v-if="storeSettingInfo.actstatus"
        class="invite-button"
        :src="pics.inviteButton"
        mode="scaleToFill"
        @tap="handleNav"
      />
      <button
        v-else
        class="invite-button primary-btn round disabled"
        @click="showTips('品牌商已暂停活动，无法生成海报')"
      >
        生成邀请海报
      </button>

      <view style="height: 140rpx"></view>
    </view>
    <u-popup v-model="showExplain" mode="center" width="600rpx" height="auto" border-radius="20" closeable="true">
      <view class="fs-26" style="padding: 50rpx">
        <view class="fs-32 fw-bold tx-c pb-20">活动说明</view>
        <scroll-view class="explain-list" scroll-y="true" scroll-left="120" :show-scrollbar="false">
          <!-- <view class="pd-20 pt-20" v-html="storeSettingInfo.actremark"></view> -->
          <u-parse :html="storeSettingInfo.actremark" :tag-style="parseStyle"></u-parse>
        </scroll-view>
      </view>
    </u-popup>
    <common-popup v-model="showPopup" type="tip" title="温馨提示" :content="popContent"></common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { staticURL } from '@/config'
import TitleBar from '@/components/title-bar/index.vue'
import commonPopupMixin from '@/mixins/common-popup'
import richTextMixin from 'packages/mixins/rich-text'
import { apiGetInviteInfo, apiGetInviteStoreList } from '@/api/activity'
import LoadMore from '@/components/load-more'
export default {
  components: {
    TitleBar,
    LoadMore
  },
  mixins: [commonPopupMixin, richTextMixin], //弹窗
  data() {
    return {
      storeSettingInfo: {}, // 活动详情
      showExplain: false,
      brandImg: staticURL() + 'shop/shopPictureDefault.png',
      pics: {
        bgLogin: staticURL() + 'acitivity/bg.jpg', // 背景图
        invite: staticURL() + 'acitivity/sm.png',
        actRun: staticURL() + 'acitivity/runing.png',
        actOver: staticURL() + 'acitivity/over.png',
        inviteListTile: staticURL() + 'acitivity/title.png',
        inviteListTop: staticURL() + 'acitivity/bg1.png',
        inviteButton: staticURL() + 'acitivity/inviteBtn.png'
      },
      totalCount: '', //门店数量
      list: [], // 门店列表
      page: {
        pageIndex: 0,
        pageSize: 10
      },
      isShowMdOrderCount: 0, //是否显示受邀门店订货数 0：不显示，1：显示
      hasMore: true, // 还有更多数据标识
      loading: true, // 页面显示loading标识
      busy: false // 防重复请求标识
    }
  },
  computed: {
    companyInfo() {
      return JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
    }
  },
  onLoad(options) {
    this.getActInfo()
  },
  onShow() {},
  methods: {
    showTips(content) {
      // 显示提示信息
      this.popContent = content
      this.showPopup = true
    },
    async getActInfo() {
      let res = await apiGetInviteInfo()
      if (this.$ck(res, true)) {
        this.storeSettingInfo = res.return_data
        this.$store.dispatch('updateInviteActivityInfo', res.return_data)
        this.isShowMdOrderCount = res.return_data.isshowmdordercount
        this.getStoreList()
      }
    },
    async getStoreList() {
      if (this.busy || !this.hasMore) return
      let pageIndex = this.page.pageIndex + 1
      this.busy = true
      let res = await apiGetInviteStoreList({
        isshowmdordercount: this.isShowMdOrderCount,
        pageindex: pageIndex,
        pagesize: 10
      })
      if (this.$ck(res, true)) {
        this.page.pageIndex++
        let { totalcount, list } = res.return_data
        this.totalCount = totalcount
        if (this.page.pageIndex === 1) {
          this.list = list
        } else {
          this.list = [...this.list, ...list]
        }
        this.hasMore = this.totalCount > this.list.length
        this.busy = false
        this.loading = false
      } else {
        this.busy = false
        this.loading = false
      }
    },
    onReachBottom() {
      // 上拉加载
      if (this.hasMore) {
        this.getStoreList()
      }
    },
    handleShowExplain() {
      this.showExplain = true
    },
    handleNav() {
      let url = `/activity-tab/invite/register/register-poster?m=${this.companyInfo.memberLogin}&id=${this.companyInfo.storeId}`
      uni.navigateTo({
        url: url
      })
    },
    handleJump(item) {
      if (!this.isShowMdOrderCount) return
      uni.navigateTo({
        url: `/order/order-list?storeno=${item.storeno}&storetype=invitedStore`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.page-invite {
  background-repeat: no-repeat;
  background-size: 750rpx 690rpx;
}
.invite-list {
  margin: 20rpx;
  position: relative;
  background: #fff;
  .list-bg__top {
    position: absolute;
    left: 4rpx;
    top: 4rpx;
    width: 704rpx;
    height: 31rpx;
  }
  .list-bg__title {
    position: absolute;
    left: 147rpx;
    top: -8rpx;
    width: 454rpx;
    height: 68rpx;
  }
  .invite-box {
    padding: 80rpx 0 30rpx 0;
    min-height: 400rpx;
    margin: 0 20rpx;
    .item {
      margin-top: 20rpx;
      background: #fff8f1;
      padding: 30rpx;
    }
  }
}
.invite {
  padding: 40rpx 0 34rpx 30rpx;
  color: #2a2a2a;
  &-avatar {
    margin-right: 20rpx;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
  }
  .invite-pic {
    width: 180rpx;
    height: 70rpx;
  }
}
.invite-time {
  margin: 0 20rpx;
  padding: 14rpx 34rpx;
  border-radius: 10rpx;
  background: #fff;
  .status {
    width: 94rpx;
    height: 86rpx;
  }
  .status-text {
    font-size: 24rpx;
  }
}
.invite-button {
  position: fixed;
  left: 30rpx;
  bottom: 30rpx;
  width: 690rpx;
  height: 80rpx;
  &.disabled {
    background: #ccc;
    color: #fff;
    height: 90rpx;
  }
}
.explain-list {
  max-height: 650rpx;
  padding: 0 18rpx;
  margin: 30rpx 0;
  box-sizing: border-box;
  padding-right: 0;
}
</style>
