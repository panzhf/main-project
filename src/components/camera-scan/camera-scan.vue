<template>
  <view>
    <view v-if="isShowCamera" class="special-box">
      <img :src="linkImg" alt="" class="flash" />
    </view>
    <camera
      v-if="isShowCamera"
      device-position="back"
      flash="off"
      style="width: 100%; height: 560rpx"
      mode="scanCode"
      @initdone="initdone"
      @scancode="throttle"
      @error="catchCamera"
    />
    <CameraZoom v-if="isShowCamera" :max-zoom="maxZoom" @zoom="setZoom" @change-mode="onChangeScan" />
    <view v-if="!scanState" class="manual-box">
      <view class="manual-input flex bg-f">
        <view class="search-box flex bg-f pr-30">
          <search-input
            ref="searchInput"
            v-model="keyword"
            placeholder="请输入物流码"
            class="flex-1"
            :max-length="50"
            :show-search-btn="false"
            :custom-style="customStyle"
            use-blur
            @search="handleSchare()"
          />
          <view class="search-button fs-30 c-f tx-c" @click="handleSchare(1)">确定</view>
        </view>
      </view>
    </view>
    <view v-if="showKeyword" :class="['switch-box center-middle', scanState ? '' : 'cal']" @click="handleSwitch">
      <text v-if="scanState" class="iconfont icon-shoudongshuru fs-40 c-f"></text>
      <text v-else class="iconfont icon-shexiangtou fs-40"></text>
    </view>
    <view :style="wrapStyle" class="content-box bg-f">
      <block v-if="customPanel">
        <view class="panel">
          <slot name="result-panel"></slot>
        </view>
        <view class="list-box flex mt-40">
          <scroll-view class="list-left" scroll-y scroll-with-animation :scroll-into-view="toView">
            <slot name="content-panel"></slot>
          </scroll-view>
          <view class="flex flex-column flex-1">
            <slot name="total-panel"></slot>
          </view>
        </view>
        <view class="opera-box mt-40">
          <slot name="opera-panel"></slot>
        </view>
      </block>
      <slot v-else name="all"></slot>
    </view>

    <common-popup
      v-model="showPopup"
      type="tip"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @close="handleOpenSetting"
    ></common-popup>
  </view>
</template>
<script>
/*
 * @Author: Ling
 * @Date: 2023-05-23
 * @Description 扫码组件
 * <camera-scan ref="cameraRef" :show-keyword="false" :zoom="2" @scanCode="handleScanCode"/>
 */
import { getSetting, openSetting } from '@/utils/function.js'
import { staticURL } from '@/config'
import commonPopupMixin from '@/mixins/common-popup'
import SearchInput from '@/components/search/search-input.vue'
import cameraZoomMixin, { autoScanMixin, deviceMixin, scanTypeMixin } from 'packages/mixins/camera-zoom'
import CameraZoom from 'packages/components/camera/zoom'
import { extractCode } from 'packages/utils/index.js'
export default {
  components: {
    SearchInput,
    CameraZoom
  },
  mixins: [commonPopupMixin, cameraZoomMixin, autoScanMixin, deviceMixin, scanTypeMixin],
  props: {
    showKeyword: {
      type: Boolean,
      default: true
    },
    toView: {
      type: String,
      default: 'view0'
    },
    customPanel: {
      type: Boolean,
      default: true
    },
    wrapStyle: {
      type: String,
      default: ''
    },
    extract: {
      type: Boolean,
      default: false // 截取物流码
    },
    scanCodeType: {
      type: Number,
      default: 1 // 1-二维码和条形码, 2-只能二维码, 3-只能条形码
    }
  },
  data() {
    return {
      scanBg: staticURL() + 'shipping/scan-bg.png?v1',
      linkImg: staticURL() + 'shipping/link.png',
      isShowCamera: true,
      scanState: true, //扫码状态
      keyword: '',
      timestamp: new Date().getTime(),
      customStyle: 'background: #f5f5f5;border-radius: 10rpx;margin: 0 20rpx;'
    }
  },
  watch: {
    scanCodeType: {
      handler(newVal) {
        this.setScanType({ isqrcode: newVal === 1 || newVal === 2, isbarcode: newVal === 1 || newVal === 3 })
      },
      immediate: true
    }
  },
  methods: {
    checkSetting() {
      if (!this.isShowCamera) {
        getSetting('camera')
          .then(() => {
            this.isShowCamera = true
          })
          .catch(() => {
            this.isShowCamera = false
          })
      }
    },
    handleOpenSetting() {
      this.isShowCamera = false
      openSetting()
    },
    initdone(e) {
      this.isIOS && this.initScanTimer()
      this.initCtx(e.detail.maxZoom)
      this.setZoom()
    },
    async handleSchare(delay) {
      if (delay) {
        await new Promise(resolve => {
          setTimeout(() => {
            resolve()
          }, 100)
        })
      }
      if (!this.keyword.trim()) {
        delay && this.$msg('请输入物流码')
        return
      }
      // let reg = /^[\da-z]+$/i
      // if (!reg.test(this.keyword)) {
      //   return this.$msg('只能输入数字或字母')
      // }
      // 自动过滤首尾无效字符（空格、换行、制表符）
      this.scancode(this.keyword.trim())
      this.$refs.searchInput && this.$refs.searchInput.clearAndFocus()
    },
    catchCamera() {
      getSetting('camera').catch(() => {
        this.popContent = '授权使用摄像头后才能扫描货品请您授权开启摄像头'
        this.popConfirmText = '去授权'
        this.popTitle = '温馨提示'
        this.showPopup = true
      })
    },
    handleSwitch() {
      this.scanState = !this.scanState
    },
    throttle(e) {
      this.isIOS && this.clearScanTimer()
      if (!this.validateScanType(e)) return
      if (new Date().getTime() - this.timestamp >= 1500 && this.scanState) {
        let { result } = e.detail
        // 自动过滤首尾无效字符（空格、换行、制表符）
        result = result.trim()
        const code = this.extract ? extractCode(result) : result
        this.scancode(code)
      }
    },
    scancode(e) {
      this.timestamp = new Date().getTime()
      this.$emit('scanCode', e)
    }
  }
}
</script>
<style lang="scss" scoped>
.special-box {
  position: fixed;
  height: 560rpx;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  background-size: 100%;
  .flash {
    width: 590rpx;
    height: 35rpx;
    margin: 0 auto;
    display: block;
    margin-top: 100rpx;
    animation-name: scanAnimation;
    animation-duration: 2.4s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;
    animation-direction: alternate;
  }
}
.manual-box {
  position: fixed;
  height: 560rpx;
  width: 100%;
  top: 0;
  background-color: rgba(0, 0, 0, 1);
  z-index: 2;
  .manual-input {
    position: absolute;
    @include hv-cen;
    width: 700rpx;
    height: 160rpx;
    border-radius: 10rpx;
    overflow: hidden;
    .search-box {
      width: 100%;
      align-items: center;
      .search-button {
        width: 110rpx;
        height: 80rpx;
        background: $uni-text-color-primary;
        border-radius: 15rpx;
        line-height: 80rpx;
      }
    }
  }
}
.switch-box {
  position: fixed;
  width: 70rpx;
  height: 70rpx;
  opacity: 0.8;
  border-radius: 50%;
  top: 120rpx;
  left: -15rpx;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 5;
  &.cal {
    background-color: rgba(255, 255, 255, 1);
  }
}
.content-box {
  position: fixed;
  bottom: 0;
  width: 100%;
  left: 0;
  padding: 50rpx 40rpx 50rpx;
  border-radius: 30rpx 30rpx 0px 0px;
  z-index: 2;
  .list-box {
    .list-left {
      height: calc(100vh - 800rpx);
      width: 400rpx;
    }
  }
}
@keyframes scanAnimation {
  0% {
    margin-top: 80rpx;
  }
  90% {
    margin-top: 400rpx;
  }
  100% {
    margin-top: 400rpx;
  }
}
</style>
