<template>
  <view class="container">
    <view>
      <view class="advertising-bg" :style="{ backgroundImage: `url(${bg})` }"></view>
      <view class="canvas-share">
        <view class="share-l" @click="handleAppNext">
          <text class="iconfont icon-jinruyundianxiaochengxu"></text>
        </view>
        <view style="margin-bottom: 30rpx">云店主页</view>
        <view class="share-l" @click="handleShare">
          <text class="iconfont icon-tuiguangyundian"></text>
        </view>
        <view>分享云店</view>
      </view>
      <view v-if="!showAllNoData" style="padding: 0 20rpx; margin-top: -70rpx">
        <!-- tab栏 -->
        <view v class="home-data__tab flex flex-middle">
          <view
            v-for="(item, index) in menuList"
            :key="index"
            class="tab flex-1 fs-28"
            :class="[menuIndex === index ? 'active' : '']"
            @tap="menuIndex = index"
          >
            <text class="p-r">{{ item.name }}</text>
          </view>
          <!-- 部分iPhone机型不支持rotateY，故用两张图 -->
          <image v-show="menuIndex === 0" class="tab-bg left" :src="tabLeft" />
          <image v-show="menuIndex === 1" class="tab-bg right" :src="tabRight" />
        </view>
        <view class="bg-f">
          <menu-list
            :key="item.number"
            :menu-obj="menuList[menuIndex]"
            :type="menuIndex === 0 ? 3 : 4"
            :show-title="false"
          />
          <none-data
            v-if="showNoData"
            custom-style=" width: 680rpx; margin: 0 auto; padding: 0 200rpx  50rpx"
            msg="暂时还没有内容哦~"
            icon-width="256"
            icon-height="190"
          />
        </view>
      </view>
      <none-data v-if="showAllNoData" msg="暂时还没有内容哦" icon-width="256" icon-height="190" class="nono-enum" />
    </view>
    <tabbar></tabbar>
    <indexPoup ref="indexPoup" :show-wx-video="showWxVideo" @openSunshine="openSunshine"></indexPoup>
    <canvas
      id="myQrcode"
      canvas-id="myQrcode"
      class="share-canvas"
      catchtouchmove="true"
      :style="{ height: `${canvasHeight}px` }"
    ></canvas>
    <canvasPopup ref="canvasPopup"></canvasPopup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup />
    <!-- #endif -->
  </view>
</template>

<script>
import { staticURL } from '@/config'
import { apiCloud } from '@/api/cloud-store'
import navigateToMP from '@/utils/navigate-mp'
import indexPoup from './comps/index-poup.vue'
import canvasPopup from './comps/canvas.vue'
import canvasT from './canvas/index.js'
import Tabbar from '@/components/tabbar/index.vue'
import MenuList from '@/mixins/set-menu'
import { hideHomeButton } from '@/utils/set-mp'
export default {
  components: {
    Tabbar,
    indexPoup,
    canvasPopup
  },
  mixins: [canvasT, MenuList],
  data() {
    return {
      bg: staticURL() + 'shop/云店bg.jpg',
      menuIndex: 0,
      tabLeft: staticURL() + 'shop/menu-active.png', // tab选中背景
      tabRight: staticURL() + 'shop/menu-active-right.png?v=1', // tab选中背景
      showWxVideo: false
    }
  },
  computed: {
    showNoData() {
      return !this.menuList[this.menuIndex]?.sublist?.length
    },
    showAllNoData() {
      return !this.menuList?.some(({ state }) => state === 1)
    }
  },
  onLoad() {
    hideHomeButton()
    this.setMenu('cloud')
  },
  methods: {
    // 右上角跳转微信小程序的回调
    handleAppNext() {
      apiCloud({
        url: '/api/v1/BaseSet/GetMiniAppid',
        method: 'get',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          const storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo'))
          const path = `/pages/index/index?storeId=${storeSettingInfo.storeId}`
          navigateToMP({ appId: res.return_data, path })
        }
      })
    },
    // 右上角分享的回调
    handleShare() {
      apiCloud({
        url: '/api/v1/WXInfo/IsAddStoreExtendLink',
        method: 'post',
        data: JSON.stringify({})
      }).then(res => {
        if (this.$ck(res)) {
          this.showWxVideo = res.return_data
          this.$refs.indexPoup.open()
        }
      })
    },
    // 小程序太阳码的回调
    openSunshine(type) {
      // 这里调用的是从外部引入canvas.js的方法
      this.hanldbranch(type)
    }
  }
}
</script>
<style lang='scss' scoped>
//@import url(); 引入公共css类
.container {
  .advertising-bg {
    position: relative;
    left: 0;
    top: 0;
    width: 100%;
    height: 450rpx;
    border-bottom-left-radius: 30rpx;
    border-bottom-right-radius: 30rpx;
    background-size: cover;
  }
  .canvas-share {
    position: absolute;
    right: 40rpx;
    top: 50rpx;
    text-align: center;
    color: #fff;
    .share-l {
      width: 68rpx;
      height: 68rpx;
      line-height: 68rpx;
      border-radius: 50%;
      background: #cc5e33;
      margin: 0 auto;
      .icon-jinruyundianxiaochengxu {
        font-size: 30rpx;
      }
      .icon-tuiguangyundian {
        font-size: 30rpx;
      }
    }
  }
  .nono-enum {
    display: inherit;
    width: 710rpx;
    height: calc(100vh - 610rpx);
    height: calc(100vh - 610rpx + constant(safe-area-inset-bottom));
    background: #fff;
    margin-left: -358rpx;
    left: 50%;
    top: 420rpx;
    position: fixed;
    z-index: 10;
    border-radius: 10rpx;
  }
  .home-data__tab {
    position: relative;
    height: 70rpx;
    background: linear-gradient(0deg, #ffece8 0%, #ffffff 100%);
    border-radius: 10rpx 10rpx 0px 0px;
    .tab {
      color: #000;
      text-align: center;
      z-index: 10;
      line-height: 70rpx;
      &.active {
        font-size: 32rpx;
        font-weight: 700;
      }
    }
    .tab-bg {
      position: absolute;
      bottom: 0;
      @include wh(374rpx, 94rpx);
      &.left {
        left: -10rpx;
      }
      &.right {
        right: -10rpx;
      }
    }
  }
  .share-canvas {
    border: 1px solid #c3c3c3;
    width: 630px;
    height: 960px;
    position: fixed;
    z-index: -1;
    top: -10000000px;
    left: 0;
    opacity: 0;
    pointer-events: none;
  }
}
</style>
