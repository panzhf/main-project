<template>
  <view class="customer" :style="themeVars">
    <form report-submit="true" @submit="submitHandle">
      <view class="seach-box ub">
        <picker
          v-if="isShowPicker"
          class="picker"
          :value="query.ScreeningType"
          :range="arrType"
          @change="handleDeliveryType"
        >
          <view>{{ arrType[query.ScreeningType] }}</view>
          <text class="iconfont icon-down-arrow"></text>
        </picker>
        <view class="inp">
          <text class="iconfont icon-sousuoicon"></text>
          <input
            v-model="query.KeyWord"
            type="text"
            class="seach-input ub-f1"
            :placeholder="placeholder"
            placeholder-style="color: #aaa"
          />
        </view>
        <button formType="submit" class="seach-btn">搜索</button>
      </view>
    </form>
    <view class="customerNum">
      共
      <text>{{ Total }}</text>
      个客户
      <view class="fk">
        访客：
        <text>{{ visitor }}</text>
        人
      </view>
    </view>
    <view class="listWhole">
      <view v-for="(item, index) in list" :key="index" class="list" @tap="handleDetail(item.OpenId || item.Openid)">
        <view class="list-main">
          <view class="picture">
            <v-img
              :src="item.HeadPath || item.HeadUrl || defaultPhoto"
              :size="81"
              class="flex image"
              :is-circle="true"
            />
            <view
              v-if="item.Type === '分销员' || item.Type === '分销员和客户' || item.IsDistributionUser"
              class="distribution"
            >
              分销员
            </view>
          </view>
          <view class="main">
            <view class="common">
              <view class="commonVal">微信名称</view>
              <view style="max-width: 240rpx">{{ item.NickName || item.UserNickName || '未知' }}</view>
              <view
                v-if="
                  (item.GradeInfo.gradenumber != -1 && !item.GradeNumber) ||
                  (item.GradeNumber != -1 && !item.GradeInfo.gradenumber)
                "
                class="member"
                style="height: 46rpx"
              >
                <view :class="['iconfont', 'grade', 'icon-v-' + item.GradeInfo.gradenumber]"></view>
                {{ item.GradeInfo.gradename || item.GradeName }}
              </view>
            </view>
            <view class="common">
              <view class="commonVal">手机号</view>
              <view>{{ item.Mobile ? item.Mobile : '---' }}</view>
            </view>
            <view class="common">
              <view class="commonVal">首次进店</view>
              <view>{{ item.AddTime || item.BandTime }}</view>
            </view>
          </view>
        </view>
        <view class="iconfont icon-arrow-right"></view>
      </view>
    </view>
    <none-data v-if="list.length <= 0 && !loading" msg="暂无客户" icon-width="256" icon-height="190" />
    <load-more v-if="!loading && list.length" :has-more="hasMore" />
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import LoadMore from '@/components/load-more'
import { staticURL } from '@/config'
export default {
  components: {
    LoadMore
  },
  data() {
    return {
      isShowPicker: true,
      arrType: ['条件筛选', '云店购买客户', '云店未购买客户', '分销员', '我邀请的会员'],
      placeholder: '输入微信昵称、手机号',
      query: {
        ScreeningType: 0,
        KeyWord: ''
      },
      Total: 0,
      visitor: 0,
      loading: true,
      hasMore: true, // 还有更多数据标记
      busy: false, // 防重复标记
      list: [], // 列表数据
      paging: {
        PageSize: 10,
        PageIndex: 1
      },
      defaultPhoto: staticURL() + 'common/photo.png?v1'
    }
  },
  onLoad() {
    this.getData()
  },
  async onShow() {
    let res = await apiCloud({
      url: '/api/v1/MiniUser/GetVisitors',
      method: 'get',
      data: JSON.stringify({})
    })
    if (this.$ck(res)) {
      this.visitor = res.return_data
    }
  },
  onReachBottom() {
    if (this.hasMore) {
      this.paging.PageIndex++
      this.getData()
    }
  },
  methods: {
    handleDetail(id) {
      uni.navigateTo({
        url: `/sales-clerk/customer/detail?id=${id}`
      })
    },
    reset() {
      this.list = [] // 列表数据
      this.paging.PageIndex = 1
      this.loading = true
      this.hasMore = true // 还有更多数据标记
      this.busy = false // 防重复标记
    },
    submitHandle() {
      this.reset()
      this.getData()
    },
    async getData() {
      if (this.busy) return
      this.busy = true
      let res = await apiCloud({
        url: '/api/v1/MiniUser/GetMiniUserList',
        method: 'post',
        data: JSON.stringify({
          ScreeningType: this.query.ScreeningType,
          KeyWord: this.query.KeyWord,
          PageIndex: this.paging.PageIndex,
          PageSize: this.paging.PageSize
        })
      })

      if (this.$ck(res, true)) {
        this.list = [...this.list, ...res.return_data.Results]
        // 判断加载完成
        this.hasMore = res.return_data.TotalCount > this.list.length
        this.Total = res.return_data.TotalCount
        this.busy = false
        this.loading = false
      }
    },
    handleDeliveryType(e) {
      this.query.ScreeningType = e.detail.value
    }
  }
}
</script>

<style lang="scss" scoped>
.fk {
  margin-left: 10rpx;
  display: inline-block;
}
.customer {
  height: 100vh;
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
      // color: #ff4c40;
      color: var(--theme-color, $uni-color-primary);
    }
  }

  .copy {
    color: #ccc;
    padding: 10rpx 0;
    text-align: center;
  }
}
form {
  display: block;
}
button {
  background: transparent;
  border-radius: 0;
  box-sizing: content-box;
}
.seach-box {
  position: relative;
  display: flex;
  margin: 0 10rpx;
  padding: 30rpx 0;

  .inp {
    position: relative;
    .iconfont {
      position: absolute;
      left: 20rpx;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24rpx;
      color: #999;
      z-index: 1;
    }
  }
  .seach-input {
    width: 280rpx;
    height: 70rpx;
    line-height: 70rpx;
    padding-left: 50rpx;
    padding-right: 30rpx;
    background: #ffffff;
    border-radius: 35rpx;
  }
  .seach-width {
    width: 490rpx !important;
  }
  .seach-btn {
    width: 120rpx;
    height: 70rpx;
    line-height: 70rpx;
    margin-left: 10rpx;
    color: #000000;
    background: #ffffff;
    border-radius: 35rpx;
    font-size: 28rpx;
  }
}
.picker {
  position: relative;
  width: 280rpx;
  height: 70rpx;
  line-height: 70rpx;
  color: #000000;
  background: #ffffff;
  border-radius: 35rpx;
  margin-right: 10rpx;
  text-align: right;
  padding-right: 50rpx;
  view {
    margin-left: 14rpx;
    font-size: 28rpx;
    text-align: center;
  }
  .iconfont {
    position: absolute;
    right: 20rpx;
    top: 38rpx;
    transform: translateY(-50%);
    font-size: 16rpx;
    z-index: 1;
  }
}
.listWhole {
  position: relative;
  padding: 0 20rpx;

  .list {
    position: relative;
    padding: 33rpx;
    background: #fff;
    .list-main {
      display: flex;
      border-bottom: 1rpx solid #eee;
      width: 100%;
      padding-bottom: 40rpx;
    }
  }

  .picture {
    position: relative;
    margin-right: 21rpx;

    .image {
      width: 81rpx;
      height: 81rpx;
      border-radius: 50%;
    }

    .distribution {
      position: absolute;
      bottom: 30rpx;
      width: 80rpx;
      height: 30rpx;
      text-align: center;
      color: #fff;
      // background: #ff4c40;
      background: var(--theme-color, $uni-color-primary);
      border-radius: 15rpx;
      font-size: 22rpx;
      font-family: PingFang SC;
      font-weight: 500;
    }
  }

  .main {
    .common {
      display: flex;
      line-height: 40rpx;
      color: #000;
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;

      .commonVal {
        width: 120rpx;
        margin-right: 16rpx;
        color: #666;
      }
    }
  }

  .icon-arrow-right {
    position: absolute;
    top: 94rpx;
    right: 32rpx;
    font-size: 20rpx;
  }

  .member {
    position: relative;
    min-width: 100rpx;
    padding: 3rpx 5rpx;
    margin-left: 10rpx;
    border-radius: 20rpx;
    color: #000;
    background: rgba(255, 75, 64, 0.1);
    font-size: 24rpx;
    padding-left: 48rpx;

    .grade {
      display: flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 6rpx;
      left: 8rpx;
      width: 34rpx;
      height: 34rpx;
      color: #fff;
      background: rgb(246, 198, 102);
      border-radius: 100%;
      font-size: 18rpx;
    }
  }
}
</style>
