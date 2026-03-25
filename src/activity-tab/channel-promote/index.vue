<template>
  <view class="container" :style="themeVars">
    <!-- tab栏 -->
    <tab
      :tab="tabData"
      :draw-height="5"
      :draw-width="70"
      :active-index.sync="activeIndex"
      :active-bag-color="themeInfo.color"
      @change="handleUpdate"
    ></tab>
    <!-- tab start -->
    <Balance v-if="activeIndex === 0" :balance-obj.sync="balanceObj" :balance-list.sync="balanceList"></Balance>
    <block v-else>
      <view class="tab-box">
        <view
          v-for="(item, index) in tab"
          :key="index"
          :class="['tab-item', index === active ? 'active' : '']"
          @tap="handleSelact(item.value, index)"
        >
          <view>{{ item.name }}</view>
          <text v-if="index !== 0" class="caret-wrapper">
            <text :class="['sort-caret', 'ascending', item.sort === 1 ? 'active-top' : '']"></text>
            <text :class="['sort-caret', 'descending', item.sort === 2 ? 'active-bottom' : '']"></text>
          </text>
        </view>
      </view>
      <!-- tab end -->
      <!-- 提示 start -->
      <view class="product-tips">
        商品佣金=（商品实际成交额-微信结算手续费） x 商品佣金比例，即若订单使用了优惠券等，商品付款金额以折后价为准。
      </view>
      <!-- 提示 end -->
      <!-- 商品盒子 start -->
      <view class="product">
        <view class="product-nav">当前网点已上架的分销商品：</view>
        <view v-for="(item, index) in list" :key="index" class="product-item">
          <view class="product-item-left">
            <image :src="item.PicUrl" />
          </view>
          <view class="product-item-right">
            <view class="product-title">{{ item.GoodsName }}</view>
            <view class="product-price">
              <view v-if="item.MaxPrice > item.Price && item.IsFormat === 1" class="price">
                ￥{{ item.Price }}~￥{{ item.MaxPrice }}
              </view>
              <view v-else class="price">￥ {{ item.Price }}</view>
            </view>
            <view class="earnings">
              佣金比例{{ calcNumber(item.GeneralRate, 100, 'multi') }}%，预计收益
              <text v-if="item.MaxDistributionAmount > item.DistributionAmount" style="color: red">
                ￥{{ item.DistributionAmount }}~￥{{ item.MaxDistributionAmount }}
              </text>
              <text v-else style="color: red">￥{{ item.DistributionAmount }}</text>
            </view>
          </view>
        </view>
      </view>
    </block>
    <!-- 商品盒子 end -->
    <none-data
      v-if="list.length === 0 && activeIndex === 1 && isLoading"
      msg="当前网点暂未上架渠道推广商品~"
      icon-width="256"
      icon-height="190"
    />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import Tab from '@/components/tab/index.vue'
import { apiCloud } from '@/api/cloud-store'
import { calcNumberT } from '@/mixins/calcNumber'
import Balance from './comps/balance'
export default {
  components: {
    Tab,
    Balance
  },
  mixins: [calcNumberT],
  data() {
    return {
      isLoading: false,
      balanceObj: {},
      balanceList: [],
      tabData: ['渠道推广明细', '推广商品'],
      activeIndex: 0,
      tab: [
        {
          name: '默认排序',
          value: 0
        },
        {
          name: '佣金收益',
          value: 1,
          sort: 0
        },
        {
          name: '销量',
          value: 2,
          sort: 0
        },
        {
          name: '价格',
          value: 3,
          sort: 0
        }
      ],
      active: 0,
      point: 0,
      tips: ['当前网点暂未上架推广商品'],
      share: false,
      shareImg: '',
      // 画图部分
      shareImgFlag: 0,
      goodsImg: '',
      httpGoodsImg: '',
      // code: 'https://image.qn.weixin12315.com.cn/10003911/13a4bfad-ba3b-491a-9ead-c2b5c9c4a2a3.jpg',
      code: '',
      photo: '',
      httpPhoto: '',
      wxName: 'waiter-yu',
      title: '',
      httpCode: '',
      text: '',
      ferPrice: '', // 优惠价
      price: '', // 原价
      iconStore: '../static/icon-store.png', // 商店小图标
      storeName: '',
      goodsId: '', // 商品id
      Form: {
        SortKey: 0, // 0为不排序： 1=销量； 2=创建时间； 3=优先级； 4=价格； 5=佣金(佣金商品接口,
        Direction: 0, // 排序方向，0为不排序： 1=升序； 2=降序；
        PageIndex: 1,
        PageSize: 10
      },
      list: [],
      total: 0,
      isLoaded: false,
      uid: '',
      storeId: '',
      shareQuery: ''
    }
  },

  onLoad(option) {
    this.resetData()
    if (option.activeIndex) {
      this.activeIndex = 1
      this.GetActivityList()
    } else {
      this.getBalanceData()
    }
  },

  onShow() {
    if (this.activeIndex === 0) this.GetCloudAssetInfo()
  },

  onReachBottom() {
    // 节流
    var reachBottomStamp = +new Date()
    if (reachBottomStamp - this.reachBottomStamp < 300) return
    this.reachBottomStamp = reachBottomStamp
    if (!this.isLoaded) {
      this.Form.PageIndex++
      if (this.activeIndex === 0) {
        this.getBalanceData()
      } else {
        this.GetActivityList()
      }
    }
  },

  methods: {
    // tab栏的回调
    handleUpdate() {
      this.resetData()
      if (this.activeIndex === 0) {
        this.GetCloudAssetInfo()
        this.getBalanceData()
      } else if (this.activeIndex === 1) {
        this.GetActivityList()
      }
      this.seachData = ''
    },
    /** 切换tab */
    handleSelact(value, e) {
      let index = e
      if (index === 0) {
        if (this.active === 0) return
        this.tab.forEach((item, index) => {
          if (index > 0) {
            item.sort = 0
          }
        })
        this.Form.PageIndex = 1
        this.Form.Direction = index
      } else {
        let sort = this.tab[index].sort
        if (sort !== 0) {
          sort = sort + 1 > 2 ? 0 : sort + 1
          this.tab.forEach((item, index) => {
            if (index > 0) {
              item.sort = 0
            }
          })
          this.tab[index].sort = sort
        } else {
          this.tab.forEach((item, index) => {
            if (index > 0) {
              item.sort = 0
            }
          })
          if (this.active === index) {
            this.tab[index].sort = sort + 1
          }
          this.active = index
        }
      }
      this.Form.SortKey = value
      this.Form.Direction = this.tab[index].sort
      this.Form.PageIndex = 1
      this.isLoaded = false
      this.active = index
      this.list = []
      this.GetActivityList()
    },
    // 获取推广商品列表
    GetActivityList() {
      this.isLoading = false
      /** 请求数据 */
      apiCloud({
        url: '/api/v1/ChannelReward/QueryGoodsList',
        method: 'post',
        data: JSON.stringify(this.Form)
      }).then(res => {
        this.isLoading = true
        if (res.return_code === 0) {
          this.list = this.list.concat(res.return_data.Results || [])
          this.total = res.return_data.TotalCount
          if (this.total === this.list.length) {
            this.isLoaded = true
          }
        } else {
          this.isLoaded = true
        }
      })
    },

    // 获取云店资产
    GetCloudAssetInfo() {
      apiCloud({
        url: '/api/v1/ChannelReward/GetCloudAssetInfo',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          this.balanceObj = (res.return_data && res.return_data) || {}
        }
      })
    },

    /** 请求数据 */
    getBalanceData() {
      let data = {
        PageIndex: this.Form.PageIndex,
        PageSize: this.Form.PageSize
      }
      apiCloud({
        url: '/api/v1/ChannelReward/QueryChannelRewardRecords',
        method: 'post',
        data: JSON.stringify(data)
      }).then(res => {
        if (res.return_code === 0) {
          this.balanceList = this.balanceList.concat(res.return_data.Results || [])
          this.total = res.return_data.TotalCount
          if (this.total === this.balanceList.length) {
            this.isLoaded = true
          }
        } else {
          this.isLoaded = true
        }
      })
    },

    /** 重置 */
    resetData() {
      this.Form = {
        SortKey: 0, // 0为不排序： 1=销量； 2=创建时间； 3=优先级； 4=价格； 5=佣金(佣金商品接口,
        Direction: 0, // 排序方向，0为不排序： 1=升序； 2=降序；
        PageIndex: 1,
        PageSize: 10
      }

      this.isLoaded = false
      this.total = 0
      this.list = []
      this.balanceList = []
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  background-color: #f4f4f4;
}
.caret-wrapper {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  height: 34rpx;
  width: 24rpx;
  vertical-align: middle;
  cursor: pointer;
  overflow: initial;
  position: relative;

  .sort-caret {
    width: 0;
    height: 0;
    border: 8rpx solid transparent;
    position: absolute;
    left: 7rpx;
  }

  .ascending {
    border-bottom-color: #c0c4cc;
    top: -2rpx;
  }

  .descending {
    border-top-color: #c0c4cc;
    bottom: 0rpx;
  }

  .active-top {
    border-bottom-color: var(--theme-color, $uni-color-primary);
  }

  .active-bottom {
    border-top-color: var(--theme-color, $uni-color-primary);
  }
}

.tab-box {
  height: 90rpx;
  display: flex;
  background-color: #fff;

  .tab-item {
    flex: 1;
    font-size: 28rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 90rpx;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;

    .arrow {
      position: absolute;
      right: 14rpx;
      top: -4rpx;
      height: 74rpx;

      text {
        position: relative;
        top: -75rpx;
        display: block;
        font-size: 24rpx;
        transform: scale(0.3);
      }

      .iconarrow-d {
        color: #000000;
      }

      .icon-arrow-up {
        left: -10rpx;
        top: 0;
        transform: rotate(180deg) scale(0.3);
      }

      .down {
        left: -10rpx;
      }

      .theme-color {
        color: var(--theme-color, $uni-color-primary);
      }
    }
  }

  .active {
    color: var(--theme-color, $uni-color-primary);
  }
}

.product-tips {
  background: #fff0eb;
  font-size: 22rpx;
  font-family: PingFang SC;
  font-weight: 500;
  color: #000000;
  line-height: 30rpx;
  padding: 17rpx 31rpx;
}

.product {
  padding: 30rpx;

  .product-nav {
    font-size: 24rpx;
    font-family: PingFang SC;
    font-weight: 500;
    color: #000000;
    line-height: 30rpx;
  }

  .product-item {
    margin-top: 20rpx;
    background: #ffffff;
    border-radius: 20rpx;
    padding: 30rpx;
    display: flex;
    flex-wrap: wrap;

    .free-box {
      width: 100%;
      margin-top: 20rpx;
      display: flex;
      color: #9a9a9a;
      font-size: 22rpx;
      position: relative;

      .free-box-left {
        width: 52rpx;
        font-size: 22rpx;
        font-family: PingFang SC Medium, PingFang SC Medium-Medium;
        font-weight: 500;
        text-align: center;
        color: var(--theme-color, $uni-color-primary);
        line-height: 40rpx;
        background: rgba(255, 75, 64, 0.1);
        border-radius: 3rpx;
        margin-right: 14rpx;
      }

      .free-box-right {
        display: flex;
        justify-content: space-between;
        color: #333;

        .free-name {
          line-height: 40rpx;
          width: 480rpx;
          word-break: keep-all;
          /* 不换行 */
          white-space: nowrap;
          /* 不换行 */
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-all;
        }

        .free-amount {
          margin-left: 30rpx;
        }
      }

      .iconjiantou1 {
        color: #343434;
        position: absolute;
        font-size: 20rpx;
        right: -6rpx;
        top: 8rpx;
      }
    }

    .product-item-left {
      image {
        width: 190rpx;
        height: 190rpx;
        border-radius: 10rpx;
      }
    }

    .product-item-right {
      flex: 1;
      margin-left: 16rpx;

      .product-title {
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 34rpx;
        height: 65rpx;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        word-break: break-all;
      }

      .product-price {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 19rpx;

        .price {
          color: var(--theme-color, $uni-color-primary);
          font-size: 30rpx;
        }

        .product-spread {
          background: var(--theme-color, $uni-color-primary);
          border-radius: 28rpx;
          padding: 10rpx 24rpx;
          font-size: 26rpx;
          font-family: PingFang SC;
          font-weight: bold;
          color: #ffffff;
          line-height: 36rpx;
        }
      }

      .earnings {
        font-size: 24rpx;
        color: #444444ff;
        margin-top: 14rpx;
      }
    }
  }
}

.TabGame {
  flex: 1;
}
</style>
