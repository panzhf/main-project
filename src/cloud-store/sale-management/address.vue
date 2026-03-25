<template>
  <view class="ressList" :style="themeVars">
    <view v-for="(item, index) in list" :key="index" class="ressList-item">
      <view class="ress-name">{{ item.Name }} {{ item.Mobile }}</view>
      <view class="ress-detail">{{ item.ProvinceName }}{{ item.CityName }}{{ item.TownName }}{{ item.Address }}</view>
      <view class="ress-handle">
        <view class="ress-hanle-left" @tap="handleDefault(index)">
          <text v-if="item.IsDefault" class="iconfont icon-checked primary-color"></text>
          <text v-else class="iconfont icon-unchecked"></text>
          <view class="tips">默认地址</view>
        </view>
        <view class="ress-hanle-right" style="color: blue">
          <view class="tips" @tap="handlEdit(index)">修改</view>
          <view style="margin-left: 24rpx" class="tips" @tap="handldelete(item.ID)">删除</view>
        </view>
      </view>
    </view>
    <view v-if="list.length === 0 && !loading" class="vh-80 flex flex-column flex-middle flex-center">
      <none-data :icon="noneIcon" msg="暂无地址~" icon-width="256" icon-height="190" />
    </view>
    <view class="asrres-button">
      <button class="primary-btn plain size-small flex-1 mr-10" hover-class="button-action" @tap="handleAdd">
        新增收货地址
      </button>
      <button class="primary-btn size-small flex-1" hover-class="button-action" @tap="getWeChatAddress">
        获取微信地址
      </button>
    </view>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      list: [],
      noneIcon: staticURL() + 'shop/default-2.png'
    }
  },
  onShow() {
    this.GetList()
  },
  methods: {
    /** 获取微信收货地址 */
    async getWeChatAddress() {
      const res = await this.getWeChatAddressFn()
      if (res.res) {
        apiCloud({
          url: '/api/v1/Store/CreateSellerAddress',
          method: 'post',
          data: JSON.stringify(res.res)
        }).then(res2 => {
          if (this.$ck(res2)) {
            this.GetList()
          }
        })
      }
    },
    handleAdd() {
      uni.navigateTo({
        url: './add-address'
      })
    },
    handlEdit(e) {
      let row = JSON.stringify(this.list[e])
      uni.navigateTo({
        url: `./add-address?row=${row}`
      })
    },
    async handldelete(id) {
      const res = await apiCloud({
        url: '/api/v1/Store/DeleteSellerAddress',
        method: 'post',
        data: JSON.stringify({ ID: id })
      })
      if (this.$ck(res)) {
        this.$msg('操作成功')
        this.GetList()
      }
    },
    async handleDefault(e) {
      let index = e
      let row = JSON.parse(JSON.stringify(this.list[index]))
      if (row.IsDefault) return
      row.IsDefault = 1
      this.$loading.show('设置中')
      try {
        await apiCloud({
          url: '/api/v1/Store/UpdateSellerAddress',
          method: 'post',
          data: JSON.stringify(row)
        })
        this.$loading.hide()
        this.$msg('操作成功')
        this.GetList()
      } catch (err) {
        this.$loading.hide()
        this.$msg(err.Return_msg)
      }
    },
    GetList() {
      apiCloud({
        url: '/api/v1/Store/GetSellerAddressList',
        method: 'post',
        data: JSON.stringify({ KeyWord: '' })
      }).then(res => {
        if (this.$ck(res)) {
          this.list = res.return_data.Return_data || []
        }
      })
    },
    async getWeChatAddressFn() {
      return new Promise(resolve => {
        uni.chooseAddress({
          success: res => {
            const form = {
              Name: res.userName,
              Mobile: res.telNumber,
              IsDefault: 1,
              Address: res.detailInfo,
              ProvinceCode: '',
              ProvinceName: res.provinceName,
              CityCode: '',
              CityName: res.cityName,
              TownCode: res.nationalCode,
              TownName: res.countyName
            }
            resolve({
              succeeded: true,
              res: form
            })
          },
          fail: err => {
            this.$msg('选择地址错误')
            resolve({
              succeeded: true,
              errMsg: err.errMsg
            })
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
page {
  height: 100%;
  background-color: #f5f5f5;
}
.ressList {
  background-color: #f5f5f5;
  .ressList-item {
    margin-top: 20rpx;
    background: #fff;
    padding: 30rpx;
    .ress-name {
      font-size: 3r0px;
      font-family: PingFang SC;
      font-weight: bold;
      color: #000000;
      line-height: 34rpx;
    }
    .ress-detail {
      font-size: 26rpx;
      font-family: PingFang SC;
      font-weight: 500;
      color: #666666;
      line-height: 34rpx;
      margin-top: 30rpx;
    }
    .ress-handle {
      margin-top: 30rpx;
      display: flex;
      justify-content: space-between;
      .ress-hanle-left {
        .iconziyuan6 {
          color: #ff4b40;
        }
      }
      .ress-hanle-right,
      .ress-hanle-left {
        display: flex;
        align-items: center;
        font-size: 26rpx;
        font-family: PingFang SC;
        font-weight: 500;
        color: #000000;
        line-height: 34rpx;
        .tips {
          margin-left: 10rpx;
        }
      }
    }
  }
  .asrres-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    bottom: 40rpx;
    bottom: calc(40rpx + constant(safe-area-inset-bottom));
    padding: 0 20rpx;
    width: 100%;
  }
}
</style>
