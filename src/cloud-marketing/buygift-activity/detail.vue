<template>
  <view class="container" :style="themeVars">
    <!-- tab栏 -->
    <view class="tabs">
      <tab
        :tab="activiyTab"
        :draw-height="5"
        :draw-width="70"
        :active-index.sync="activiyTabIndex"
        :active-bag-color="themeInfo.color"
        @change="handleTabChange"
      ></tab>
    </view>
    <view class="tabs-height"></view>
    <view v-if="activiyTabIndex === 0 && isLoading" class="free-detail">
      <view class="info">
        <view class="key-item">
          <view class="key">活动ID:</view>
          <view class="key-val">{{ actData.Id }}</view>
        </view>
        <view class="key-item">
          <view class="key">活动名称:</view>
          <view class="key-val">
            {{ actData.Name }}
          </view>
        </view>
        <view class="key-item">
          <view class="key">开始时间:</view>
          <view class="key-val color-red">
            <view>{{ actData.StartTime }}</view>
          </view>
        </view>
        <view class="key-item">
          <view class="key">结束时间:</view>
          <view class="key-val color-red">
            <view>{{ actData.EndTime }}</view>
          </view>
        </view>
        <view class="key-item">
          <view class="key">活动持续时间:</view>
          <view class="key-val color-red">
            <view>{{ actData.DurationTime }}</view>
          </view>
        </view>
        <view class="key-item">
          <view class="key">活动状态:</view>
          <view class="key-val">{{ actData.Status }}</view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">活动商品</view>
        <view v-for="(item, index) in actData.Goods" :key="index" class="info-goods-box">
          <view class="info-goods-box-left">
            <image :src="item.PicUrl" @error="headPathError" />
          </view>
          <view class="info-goods-box-right">
            <view class="info-title">{{ item.GoodsName }}</view>
            <view class="info-config">
              <view class="info-price">￥ {{ item.Price }}</view>
              <view class="info-qi">{{ item.Limit }}件起送</view>
            </view>
          </view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">赠品</view>
        <view v-for="(item, index) in actData.FreeGoods" :key="index" class="info-goods-box">
          <view class="info-goods-box-left">
            <image :src="item.PicUrl" @error="headPathError" />
          </view>
          <view class="info-goods-box-right">
            <view class="info-title">{{ item.FreeGoodsName }}</view>
            <view class="info-config">
              <view class="info-amount">x{{ item.Quantity }}</view>
            </view>
          </view>
        </view>
        <view style="margin-top: 60rpx">
          <view v-if="actData.Vouchers && actData.Vouchers.VouchersId > 0" class="hot-row">
            <view class="product-hot-tag">
              <view class="product-hot-tag-name">优惠券</view>
            </view>
            <view class="product-hot-name">
              {{ (actData.Vouchers && actData.Vouchers.VouchersName) || '优惠券名称' }}
            </view>
            <view class="product-quantity">x{{ (actData.Vouchers && actData.Vouchers.VouchersNumber) || 1 }}</view>
          </view>
          <view v-if="actData.Integral > 0" class="hot-row mt-20">
            <view class="product-hot-tag">
              <view class="product-hot-tag-name">积分</view>
            </view>
            <view class="product-hot-name">积分*{{ actData.Integral || 0 }}</view>
            <view class="product-quantity">x1</view>
          </view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">优惠规则</view>
        <view class="info-rule-box">
          <view class="info-rule-row">
            <text class="info-lable">每人最多参与:</text>
            <text v-if="actData.JoinNum">{{ actData.JoinNum }}次</text>
            <text v-else>不限制次数</text>
          </view>
          <view class="info-rule-row">
            <text class="info-lable">下单可用优惠：</text>
            <text v-if="actData.IsUseCoupon">购物券</text>
            <text v-else>无可用优惠</text>
          </view>
        </view>
      </view>
      <view class="info">
        <view class="info-goods-title">活动统计</view>
        <view class="info-rule-box">
          <view class="info-rule-row">
            累计购买人数（人）:
            <text>{{ actData.BuyerCount }}</text>
          </view>
          <view class="info-rule-row">
            累计订单数量（个）:
            <text>{{ actData.OrderCount }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-if="activiyTabIndex === 1" class="customer">
      <view style="padding: 30rpx 15rpx">
        <Search
          :drown-flag="true"
          placeholder="输入赠品名称、赠品id"
          :value="searchText"
          :drown-list="drownList"
          @handleSearch="handleSearch"
        ></Search>
      </view>
      <view class="customerNum">
        累计赠品数量：
        <text>{{ SendOffTotalAmount }}个</text>
      </view>
      <List v-if="list.length > 0" :list="list" />
      <view v-if="defaultCopy" class="copy">没有更多了</view>
      <view v-if="list.length === 0 && isLoading" class="vh-60 flex flex-column flex-middle flex-center">
        <none-data :icon="noneIcon" msg="暂无赠品~" icon-width="256" icon-height="190" />
      </view>
    </view>
  </view>
</template>
<script>
import tab from '@/components/tab/index.vue'
import Search from '@/components/search'
import List from './comps/detail-list.vue'
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
export default {
  components: {
    tab,
    Search,
    List
  },

  data() {
    return {
      noneIcon: staticURL() + 'shop/default-2.png',
      isLoading: false,
      drownList: [
        {
          value: 0,
          label: '状态筛选'
        },
        {
          value: 1,
          label: '已完成'
        },
        {
          value: 2,
          label: '已退回'
        }
      ],
      Status: 0,
      SendOffTotalAmount: 0,
      activiyTab: ['活动详情', '赠品明细'],
      activiyTabIndex: 0,
      activityID: '',
      actData: {},
      type: 0, // 索引
      searchText: '', // 搜索
      page: {
        index: 1,
        size: 10
      },
      list: [],
      Total: 0,
      defaultCopy: false
    }
  },

  onLoad(data) {
    this.activityID = data.Id || ''
    this.Status = Number(data.Status) || 0
    this.GetStoreLotteryInfo(data)
  },

  onReachBottom() {
    if (this.activiyTabIndex === 1) {
      if (this.Total > 0 && this.Total > this.list.length) {
        this.GetStoreSelectGiftPageList(this.page.index, this.page.size)
      } else {
        this.defaultCopy = true
      }
    }
  },

  methods: {
    // 头部类目切换
    handleTabChange() {
      this.page.index = 1
      this.list = []
      if (this.activiyTabIndex === 0) {
        let form = {
          Id: this.activityID
        }
        this.GetStoreLotteryInfo(form)
      } else {
        this.GetStoreSelectGiftPageList(this.page.index, this.page.size)
      }
    },
    // 获取赠品明细
    GetStoreSelectGiftPageList(pageIndex, pageSize) {
      this.isLoading = false
      let data = {
        ActivityId: Number(this.activityID),
        SendUserStatus: Number(this.type), // 赠送状态 (0-全部 1-已完成 2-已退回)
        KeyWord: this.searchText,
        PageIndex: pageIndex,
        PageSize: pageSize,
        Status: this.Status
      }
      apiCloud({
        url: '/api/v1/FreeGoodsActivities/StoreSelectGiftPageList',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          let OrderList = (res.return_data && res.return_data.OrderList) || []
          this.list = [...this.list, ...OrderList]
          this.Total = res.return_data && res.return_data.TotalCount
          this.SendOffTotalAmount =
            res.return_data && res.return_data.SendOffTotalAmount ? res.return_data.SendOffTotalAmount : 0
          this.page.index = this.page.index + 1
        }
      })
    },
    // 获取赠品活动详情
    GetStoreLotteryInfo(data) {
      this.isLoading = false
      let form = {
        activityId: data.Id
      }
      apiCloud({
        url: '/api/v1/FreeGoodsActivities/get',
        method: 'get',
        data: JSON.stringify(form)
      }).then(res => {
        this.isLoading = true
        if (this.$ck(res)) {
          this.actData = res.return_data
        }
      })
    },
    // 赠品明细搜索的回调
    handleSearch(val, index) {
      this.searchText = val
      this.type = index
      this.list = []
      this.Total = 0
      this.page = {
        index: 1,
        size: 10
      }
      this.GetStoreSelectGiftPageList(this.page.index, this.page.size)
    }
  }
}
</script>
<style lang="scss" scoped>
.container {
  height: 100%;
  background-color: #f7f7f7;
  .customer {
    min-height: calc(100vh - 106rpx);
    background: #f5f5f5;
    .customerNum {
      line-height: 40rpx;
      padding: 0 30rpx;
      margin-bottom: 20rpx;
      color: #000000;
      font-size: 28rpx;
      font-family: PingFang SC;
      font-weight: 500;
      text {
        color: var(--theme-color, $uni-color-primary);
      }
    }

    .copy {
      color: #ccc;
      padding: 10rpx 0;
      text-align: center;
    }
  }
  .tabs {
    position: fixed;
    width: 100%;
    left: 0;
    top: 0;
    background: #fff;
    z-index: 111;
  }
  .tabs-height {
    height: 85rpx;
  }
  .info {
    background-color: #fff;
    padding: 30rpx 30rpx;
    margin-bottom: 30rpx;
    .info-rule-box {
      margin-top: 38rpx;
      .info-rule-row {
        font-size: 28rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #666666;
        line-height: 56rpx;
        .info-lable {
          margin-right: 20rpx;
          text {
            color: #000000;
          }
        }
      }
    }
    .info-goods-title {
      font-size: 28rpx;
      font-weight: bold;
      color: #000000;
      line-height: 40rpx;
    }
    .info-goods-box {
      margin-top: 20rpx;
      display: flex;
      .info-goods-box-left {
        width: 120rpx;
        height: 120rpx;
        margin-right: 20rpx;
        image {
          width: 100%;
          height: 100%;
        }
      }
      .info-goods-box-right {
        .info-config {
          display: flex;
          justify-content: space-between;
          margin-top: 20rpx;
          .info-price {
            color: var(--theme-color, $uni-color-primary);
            font-size: 26rpx;
          }
          .info-qi {
            font-size: 22rpx;
            color: #999999;
            font-weight: 500;
          }
          .info-amount {
            font-size: 24rpx;
          }
        }
        .info-title {
          width: 550rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          font-size: 26rpx;
          min-height: 70rpx;
        }
      }
    }
    .key-item {
      display: flex;
      margin-bottom: 20rpx;
      .key {
        width: 177rpx;
        text-align: left;
        font-size: 28rpx;
        color: #333333;
      }
      .key-val {
        flex: 1;
        padding-left: 24rpx;
        color: #666666;
        font-size: 28rpx;
      }
      .color-red {
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }
  .detail-button {
    background-color: var(--theme-color, $uni-color-primary);
    width: 90%;
    color: #fff;
    margin: 0 auto;
    position: fixed;
    bottom: 40px;
    left: 0;
    right: 0;
    border-radius: 40rpx;
    text-align: center;
    height: 80rpx;
    line-height: 80rpx;
  }
  .hot-row {
    display: flex;
    align-items: center;
    .product-hot-tag {
      width: 102rpx;
      .product-hot-tag-name {
        font-size: 22rpx;
        flex-wrap: 500;
        background: rgba(255, 76, 64, 0.1);
        border-radius: 3px;
        color: var(--theme-color, $uni-color-primary);
        line-height: 40rpx;
        padding: 0 6rpx;
        margin-right: 10rpx;
        text-align: center;
      }
      .w50 {
        width: 50rpx;
      }
    }
    .w120 {
      width: 120rpx;
    }
    .f-26 {
      font-size: 26rpx;
      line-height: 36rpx;
      font-weight: 500;
    }
    .hot-tips {
      line-height: 30rpx;
      font-size: 22rpx;
      font-weight: 500;
      color: #999999;
    }
    .product-hot-name {
      margin-left: 10rpx;
      width: 550rpx; //自己调整
      /* 不换行 */
      white-space: nowrap;
      /* 不换行 */
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 26rpx;
      line-height: 40rpx;
      word-break: break-all;
    }
    .product-quantity {
      color: #333333;
      font-size: 24rpx;
      font-family: PingFang SC;
      font-weight: 500;
      line-height: 40rpx;
    }
  }
}
</style>
