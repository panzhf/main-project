<template>
  <view v-if="!loading" :style="themeVars">
    <view v-if="list.length" class="share-product">
      <picker :value="value" :range="list" range-key="Title" @change="handleChange">
        <view class="share-title">
          <view class="title">{{ list[value].Title }}</view>
          <view class="select">
            <text class="iconfont icon-arrow-right"></text>
          </view>
        </view>
      </picker>
      <view class="share-content">
        <u-parse :html="info.Content"></u-parse>
        <view v-if="info.MiniShowType == 1" class="share-text">
          <text class="iconfont iconxiaochengxu"></text>
          <text class="name">{{ info.MiniShowContent }}</text>
        </view>
        <div v-if="info.MiniShowType == 2" class="share-img">
          <text class="iconfont iconxiaochengxu"></text>
          <image class="cover" :src="info.MiniShowImage" alt="" />
        </div>
        <view v-if="info.MiniShowType == 3" class="share-miniprogram">
          <view class="miniprogram-header">
            <image :src="info.MiniHeadImageUrl" alt="" />
            <view class="name">{{ info.MiniName }}</view>
          </view>
          <view class="miniprogram-title">
            {{ info.MiniShowContent }}
          </view>
          <view class="miniprogram-img">
            <image :src="info.MiniShowImage" alt="" />
          </view>
          <view class="miniprogram-footer">
            <text class="iconfont iconxiaochengxu"></text>
            <text class="name">小程序</text>
          </view>
        </view>
      </view>
      <view class="kong" />
      <view class="footer">
        <view class="button" @click="handleOpenHistory">查看历史数据</view>
        <view class="button sub" @click="handlAdd">开始转链</view>
      </view>
    </view>
    <none-data v-else msg="品牌方还未设置模板库，请联系品牌商生成" icon-width="256" icon-height="190" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiCloud } from '@/api/cloud-store'
// import { baseImg } from '@/config/image.config.js'
export default {
  data() {
    return {
      // baseImg: baseImg.noShareData,
      list: [],
      loading: true,
      busy: false,
      value: 0,
      showpage: true,
      info: {},
      option: {},
      storeId: 0
    }
  },
  async onLoad() {
    let info = await apiCloud({
      url: '/api/v1/Store/GetStoreInfo',
      method: 'get',
      data: JSON.stringify({})
    })
    if (this.$ck(info)) this.storeId = info.return_data.Id || 0
    this.$loading.show()
    try {
      let res = await apiCloud({
        url: '/api/v1/WXInfo/GetTemplateList',
        method: 'post',
        data: JSON.stringify({})
      })
      this.list = res.return_data || []
      if (this.list.length) {
        await this.getDetail(this.list[0].ID)
      }
      this.$loading.hide()
      this.loading = false
    } catch (err) {
      this.$loading.hide()
      this.loading = false
    }
  },
  methods: {
    async handlAdd() {
      let obj = {
        PagePath: `/pages/index/index?storeId=${this.storeId}`,
        ID: this.list[this.value].ID
      }
      if (this.busy) return
      this.$loading.show()
      try {
        this.busy = true
        let res = await apiCloud({
          url: '/api/v1/WXInfo/AddExtendLink',
          method: 'post',
          data: JSON.stringify(obj)
        })
        this.busy = false
        this.$loading.hide()
        if (this.$ck(res, true)) {
          uni.navigateTo({
            url: `./video-history`
          })
        }
      } catch (err) {
        this.$loading.hide()
        this.$msg('网络错误')
        this.busy = false
      }
    },
    async getDetail(ID) {
      this.$loading.show()
      try {
        let res = await apiCloud({
          url: '/api/v1/WXInfo/GetTemplateDetail',
          method: 'post',
          data: JSON.stringify({ ID })
        })
        this.$loading.hide()
        this.info = res.return_data
      } catch (err) {
        this.$loading.hide()
        this.$msg('网络错误')
      }
    },
    handleChange(e) {
      let value = Number(e.detail.value)
      this.value = value
      this.getDetail(this.list[value].ID)
    },
    handleOpenHistory() {
      uni.navigateTo({
        url: './video-history'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.share-product {
  .share-title {
    display: flex;
    padding: 30rpx;
    background-color: #fff;
    .title {
      width: 628rpx;
      font-weight: 700;
      color: #000;
      font-size: 30rpx;
      text-overflow: -o-ellipsis-lastline;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .select {
      .icon-arrow-right {
        display: inline-block;
        font-size: 24rpx;
        line-height: 42rpx;
        margin-left: 10rpx;
        transform: rotate(90deg);
      }
    }
  }
  .kong {
    height: 200rpx;
  }
  .footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    padding-top: 40rpx;
    padding-bottom: constant(safe-area-inset-bottom); // 核心代码
    padding-bottom: env(safe-area-inset-bottom); // 核心代码
    background-color: #fff;
    .button {
      background: #ffffff;
      border: 1px solid #cccccc;
      border-radius: 41rpx;
      width: 330rpx;
      height: 80rpx;
      line-height: 80rpx;
      text-align: center;
      font-size: 32rpx;
      font-weight: 700;
      margin-left: 30rpx;
    }
    .sub {
      background-color: var(--theme-color, $uni-color-primary);
      color: #fff;
      border: none;
    }
  }
  .share-content {
    padding: 30rpx;
    background-color: #fff;
    .share-img {
      margin-top: 20rpx;
      position: relative;
      .cover {
        width: 100%;
      }
      .iconxiaochengxu {
        position: absolute;
        right: 10rpx;
        top: 18rpx;
        color: #6367f1;
        font-size: 24rpx;
        background-color: #fff;
        padding: 4px;
        border-radius: 50%;
      }
    }
    .share-text {
      margin-top: 20rpx;
      .iconxiaochengxu {
        color: #6367f1;
        font-size: 28rpx;
      }
      .name {
        font-size: 30rpx;
        margin-left: 10rpx;
      }
    }
    .share-miniprogram {
      margin-top: 32rpx;
      background-color: #f8f8f8;
      border-radius: 15px;
      padding: 23rpx 26rpx;
      .miniprogram-header {
        display: flex;
        align-items: center;
        image {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
        }
        .name {
          font-size: 28rpx;
          color: #818181;
          font-weight: 500;
          margin-left: 14rpx;
        }
      }
      .miniprogram-title {
        color: #000000;
        font-weight: 500;
        font-size: 32rpx;
        margin-top: 34rpx;
      }
      .miniprogram-img {
        width: 100%;
        height: 519rpx;
        margin-top: 34rpx;
        image {
          width: 100%;
          height: 100%;
        }
      }
      .miniprogram-footer {
        margin-top: 25rpx;
        .iconxiaochengxu {
          color: #6367f1;
          font-size: 27rpx;
        }
        .name {
          font-size: 28rpx;
          color: #7c7c7c;
          margin-left: 14rpx;
        }
      }
    }
  }
}
</style>
