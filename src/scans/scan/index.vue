<template>
  <view :style="themeVars">
    <view class="scan-special">
      <image v-if="!busy && isShowCamera && !showRewardExpress" :src="linkImg" class="link" />
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
    <!-- <view class="camera-button" @click="wxscanCode">
      <text class="iconfont icon-a-xingzhuang37 fs-40"></text>
    </view> -->
    <CameraZoom v-if="isShowCamera" :max-zoom="maxZoom" @zoom="setZoom" @change-mode="onChangeScan" />
    <view class="tool-content bg-f">
      <view class="panel ub ub-pj">
        <view class="left fs-30">
          扫描结果：
          <text class="success-state">{{ resultMsg }}</text>
        </view>
        <view class="right" @tap="showRewardExpress = true">
          <text class="fs-24 desc">说明</text>
          <text class="icon iconfont icon-explain fs-26 ml-10"></text>
        </view>
      </view>
      <view class="list-box ub">
        <scroll-view class="left scroll-wrap" scroll-y scroll-with-animation :scroll-into-view="toView">
          <view v-for="(item, index) in rewardsList" :id="'view' + index" :key="index" class="item ub ub-pj fs-28">
            <view class="ellipsis" :class="item.type + '-color'">{{ item.rewards }}</view>
          </view>
          <view v-if="!rewardsList.length" class="no-data center-middle fw-bold fs-30">暂无记录</view>
        </scroll-view>
        <view class="right flex flex-column flex-1">
          <view class="view center-middle flex-column flex-1" @tap="goUnpack">
            <view class="num fs-60 mb-20">{{ validCodes }}</view>
            <view class="title flex flex-middle flex-center">
              <text class="fs-28">有效扫码个数</text>
              <text class="con iconfont icon-more"></text>
            </view>
          </view>
          <view class="view center-middle flex-column flex-1">
            <view class="num fs-60 mb-20">{{ codesList.length }}</view>
            <view class="title fs-28">全部扫码个数</view>
          </view>
        </view>
      </view>
      <button class="my-reward primary-btn round" hover-class="button-action" @tap="goUnpack">查看开箱记录</button>
    </view>
    <common-popup
      v-model="tips.show"
      type="tip"
      :title="popTitle"
      :confirm-text="tips.buttonText"
      :content="tips.codeTips"
      @input="handleOpenSetting"
    >
      <view v-if="tips.contentArray && tips.contentArray.length" class="has-scan-tip fs-24 mt-30">
        <view v-for="item in tips.contentArray" :key="item">{{ item }}</view>
      </view>
    </common-popup>
    <reward-explain v-model="showRewardExpress" />
    <canvas id="canvas" ref="canvas" canvas-id="canvas" style="width: 100%; height: 100%; display: none"></canvas>
    <location ref="location" @location="setLocation" />
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { getSetting, openSetting } from 'packages/utils/function.js'
import { audioSuccess, audioFail, scanBg, scanlink } from '@/utils/default-picture'
import { apiSalesActivityscancode, apiSalesRewardstatus, apiCommanageGetlocation } from '@/api/scan-code'
import RewardExplain from './comps/reward-explain.vue'
import { getJsCode } from '@/utils/set-mp'

import Location from 'packages/components/location/index.vue'
import SwitchBrand from '@/mixins/switch-brand'
import cameraZoomMixin, { autoScanMixin, deviceMixin } from 'packages/mixins/camera-zoom'
import CameraZoom from 'packages/components/camera/zoom'
export default {
  components: {
    RewardExplain,
    Location,
    CameraZoom
  },
  mixins: [SwitchBrand, cameraZoomMixin, autoScanMixin, deviceMixin],
  data() {
    return {
      timestamp: new Date().getTime(),
      isShowCamera: true,
      showRewardExpress: false,
      codesList: [], // 码列表
      rewardsList: [], // 奖项列表
      resultMsg: '',
      errMsg: '',
      errSerialnumber: '',
      title: '',
      popTitle: '温馨提示',
      tips: {
        show: false,
        codeTips: '', // 主要提示
        contentArray: [], // 奖项信息
        buttonText: '好的'
      },
      toView: '',
      scanBg,
      linkImg: scanlink,
      busy: true,
      locationInfo: {},
      options: {}
    }
  },
  computed: {
    validCodes() {
      return this.rewardsList.filter(item => item.code).length
    }
  },
  watch: {
    'tips.show'(v) {
      if (v) {
        this.setScanStatus(true)
      }
    }
  },
  onLoad(options) {
    // 获取地理位置授权
    if (process.env.NODE_ENV === 'development') {
      // 开发工具没有相机
      this.$refs.location.setLocation()
    }
  },
  onShow() {
    // 防止隐私不触发导致相机不正常初始化
    this.$refs.privacyPopup.refresh()
    if (!this.isShowCamera) {
      getSetting('camera')
        .then(() => {
          this.isShowCamera = true
        })
        .catch(() => {
          this.isShowCamera = true
        })
    }
  },
  methods: {
    initdone(e) {
      this.isIOS && this.initScanTimer()
      this.initCtx(e.detail.maxZoom)
      this.setZoom()

      setTimeout(() => {
        this.$refs.location.setLocation()
      }, 300)
    },
    async setLocation(val) {
      this.locationInfo = val
      this.setScanStatus(true)
      let jsCode = await getJsCode()
      let params = {
        lng: val.longitude,
        lat: val.latitude
      }
      const { memberLogin: memberlogin = '' } = JSON.parse(uni.getStorageSync('storeSettingInfo') || '{}')
      // 获取详细的地址信息
      let res = await apiCommanageGetlocation({
        memberlogin,
        ...params,
        js_code: jsCode
      })
      if (this.$ck(res, true)) {
        this.locationInfo = {
          ...params,
          ...res.return_data
        }
        this.setScanStatus()
        // 扫码进来自动触发
        if (this.options.q) {
          this.takeCode({
            detail: {
              result: this.options.q
            }
          })
        }
      }
    },
    // 返回主页
    goBack() {
      uni.navigateTo({
        url: '/pages/index/index'
      })
    },
    // 查看开箱记录
    goUnpack() {
      uni.navigateTo({
        url: '/scans/record/unpack-list?seachTimeType=2'
      })
    },
    // 微信扫一扫uni.scanCode
    // wxscanCode() {
    //   this.busy = false
    //   uni.scanCode({
    //     onlyFromCamera: false, //值为 false  既可以使用相机也可以使用相册，  值为true 只能使用相机
    //     scanType: ['barCode', 'qrCode'], //分别对应 一维码  二维码
    //     success: async res => {
    //       let e = {
    //         detail: res
    //       }
    //       this.takeCode(e)
    //     }
    //   })
    // },
    throttle(e) {
      this.isIOS && this.clearScanTimer()
      if (new Date().getTime() - this.timestamp >= 2000) {
        this.takeCode(e)
      }
    },
    async takeCode(e) {
      // 判断是否有码正在处理中, 说明弹窗是否打开
      if (this.busy || this.showRewardExpress) {
        return
      }
      this.timestamp = new Date().getTime()
      this.setScanStatus(true)
      uni.vibrateShort()
      // 校验扫描结果，并处理
      let scanInfo = e.detail
      scanInfo.result && (scanInfo.result = scanInfo.result.trim())
      // 判断是否已被扫过码了
      if (this.codesList.indexOf(scanInfo.result) > -1) {
        this.tips = {
          show: true,
          codeTips: '该码已被扫过了！',
          buttonText: '继续扫码'
        }
        if (this.autoScan) {
          // 高清模式下扫码有提示，重置
          this.isShowCamera = true
          this.autoScan = false
        }
      } else {
        // 对扫码结果进行处理
        this.findCodeInfo(scanInfo)
      }
    },
    // 设置是否可以扫码
    setScanStatus(val = false) {
      // 设置为false 可扫码
      this.busy = val
    },
    //扫一扫
    async findCodeInfo(scanInfo) {
      if (scanInfo.result) {
        this.getScanInfo(scanInfo.result)
      } else {
        if (this.autoScan) {
          // 高清模式下扫码有提示，重置
          this.isShowCamera = true
          this.autoScan = false
        }
        if (scanInfo.errMsg.indexOf('fail cancel') > -1) {
          this.setScanStatus()
        } else {
          this.tips = {
            show: true,
            codeTips: scanInfo.errMsg ? scanInfo.errMsg : '扫码失败',
            buttonText: '好的'
          }
        }
      }
    },
    // 扫码查询码信息
    async getScanInfo(code) {
      let {
        lng, //经度
        lat, //纬度
        provincename, //省
        cityname, //市
        areaname, //区
        streetname, //街道
        streetnumber, //门牌号
        forthstreet,
        recommend
      } = this.locationInfo
      let params = {
        code, //码信息
        lng, //经度
        lat, //纬度
        provincename, //省
        cityname, //市
        areaname, //区
        streetname, //街道
        streetnumber, //门牌号
        forthstreet,
        recommend
      }
      this.codesList.push(code)
      this.resultMsg = ''
      apiSalesActivityscancode(params)
        .then(res => {
          this.resultMsg = [0, 1].includes(res.return_code) ? '扫码成功' : '扫码失败'
          this.setScanStatus()
          // 记录已扫过的code
          if (this.$ck(res, false)) {
            setTimeout(() => {
              this.handleRadio(true)
            }, 500)
            let data = res.return_data
            let count = 0
            this.toView = 'view0'

            // 返利登记
            if (data.dxmregisinfo && data.dxmregisinfo.regissuccess) {
              this.rewardsList.unshift({ rewards: '推荐返利信息登记成功！' })
            }
            this.rewardsList.unshift({ ...data, rewards: '排队中~' })

            this.getRewardInfo(
              {
                code: data.code,
                activityid: data.activityid,
                codeid: data.codeid
              },
              count
            )
            setTimeout(() => {
              // ios连扫会黑屏，需延时
              this.autoScan && this.onChangeScan()
            }, 2000)
          } else if (res.return_code === 1) {
            let data = res.return_data
            setTimeout(() => {
              this.handleRadio(true)
            }, 500)
            this.rewardsList.unshift({ ...data, rewards: '信息登记成功！' })
            this.toView = 'view0'
            setTimeout(() => {
              // ios连扫会黑屏，需延时
              this.autoScan && this.onChangeScan()
            }, 2000)
          } else {
            setTimeout(() => {
              this.handleRadio(false)
            }, 500)
            /*-----提示语----*/
            let codeTips = ''
            let contentArray = []
            let buttonText = '知道了'
            if (res.return_data || res.return_msg) {
              switch (res.return_code) {
                case 2:
                  // 活动状态 paramcode：2未开始  0已结束 null 超过次数
                  if (res.return_data.paramcode === 2) {
                    codeTips = '活动未开始哦！'
                  } else if (res.return_data.paramcode === 0) {
                    codeTips = '活动已结束了！'
                  } else {
                    codeTips = res.return_msg
                  }
                  break
                case 4:
                  // 活动未开启
                  codeTips = '活动未开启哦！'
                  break
                case 600007:
                  // 领过奖
                  codeTips = '该码已被扫过了！'
                  contentArray = [
                    `扫码人：${res.return_data.nickname || ''}`,
                    `扫码时间：${res.return_data.addtime || ''}`
                  ]
                  buttonText = '继续扫码'
                  break
                default:
                  codeTips = res.return_msg
              }
            } else {
              codeTips = '网络繁忙，请重试'
            }
            this.tips = {
              show: true,
              codeTips: codeTips,
              contentArray: contentArray,
              buttonText: buttonText
            }
            if (this.autoScan) {
              // 高清模式下扫码有提示，重置
              this.isShowCamera = true
              this.autoScan = false
            }
            this.$uploadLog({
              type: 'scanCode',
              desc: '连续扫码领奖',
              data: res || {},
              extend: { api: 'guideassistant/api/sales/activityscancode' }
            })
          }
        })
        .catch(error => {
          this.tips = {
            show: true,
            codeTips: error.return_msg || '网络繁忙，请重试',
            buttonText: '知道了'
          }
          if (this.autoScan) {
            // 高清模式下扫码有提示，重置
            this.isShowCamera = true
            this.autoScan = false
          }
        })
    },

    // 修改奖项状态
    setRewardStatus(code, rewardStatus = {}) {
      this.rewardsList = this.rewardsList.map(item => {
        const { rewards, type } = rewardStatus
        if (item.code === code && rewards) {
          item = { ...item, rewards, type }
        }
        return item
      })
    },

    // 根据码的状态 确定是否继续轮询 或者 查询奖品详情
    async getRewardInfo(data, count) {
      let result = await this.findRewardStatus(data)
      // 0 就是中奖 3就是未中奖 null(需要继续查询状态) 202(需要等待另一方扫了码才能中奖)
      let rewardStatus = {
        rewards: data.rewards,
        type: ''
      }
      if (result.return_code === 0) {
        let rewardresults = result.return_data
        // iswiningcode是否中奖，0不中奖，1中奖
        // 奖项具体展示
        // 0:微信红包,1：红包零钱，2：企业红包，3：购物券，4：积分，5：实物奖品，6：活动参与资格

        if (rewardresults.iswiningcode === 1 && rewardresults.items) {
          let awardsArr = rewardresults.items.map(item => {
            let otherTip = ''
            if ([0, 2].includes(item.type)) {
              otherTip = '微信红包'
            }
            if ([1].includes(item.type)) {
              otherTip = '红包零钱'
            }
            return item.title + otherTip
          })
          rewardStatus = {
            rewards: `获得${awardsArr.join('、')}`
          }
        } else {
          rewardStatus = {
            rewards: '发放失败',
            type: 'error'
          }
        }
      } else if (result.return_code === 3) {
        rewardStatus = {
          rewards: '未中奖'
        }
      } else {
        let timer = setTimeout(() => {
          count++
          // 轮询最多6次，否则视为失败
          if (count < 6) {
            this.getRewardInfo(data, count)
          } else {
            rewardStatus = {
              rewards: '发放失败',
              type: 'error'
            }
          }
          clearTimeout(timer)
        }, 2 * 1000)
      }
      rewardStatus.rewards && this.setRewardStatus(data.code, rewardStatus)
    },
    async findRewardStatus(data) {
      return new Promise((resolve, reject) => {
        let params = data
        apiSalesRewardstatus(params)
          .then(res => {
            resolve(res)
          })
          .catch(error => {
            resolve(error)
          })
      })
    },
    handleBack() {
      uni.navigateBack()
    },
    handleOpenSetting() {
      if (this.tips.buttonText === '去授权') {
        this.isShowCamera = false
        openSetting()
      } else {
        setTimeout(() => {
          this.setScanStatus()
        }, 1500)
      }
    },
    catchCamera() {
      getSetting('camera').catch(() => {
        this.tips = {
          show: true,
          codeTips: '授权使用摄像头后才能扫描二维码领奖，请您授权开启摄像头',
          buttonText: '去授权'
        }
      })
    },
    handleRadio(state) {
      let Audio = uni.createInnerAudioContext()
      Audio.autoplay = true
      Audio.src = state ? audioSuccess : audioFail
      Audio.onPlay()
    }
  }
}
</script>

<style lang="scss" scoped>
// 滚动条样式
::v-deep ::-webkit-scrollbar {
  width: 6rpx;
}

::v-deep ::-webkit-scrollbar-thumb {
  width: 6rpx;
  border-radius: 3rpx;
  background: #d1d1d1;
}

::v-deep ::-webkit-scrollbar-track-piece {
  background: #ededed;
  border-radius: 2rpx;
}
.tool-content {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40rpx;
  border-radius: 30rpx 30rpx 0px 0px;
  z-index: 2;
  .panel {
    .left {
      .success-state {
        color: $uni-color-primary;
      }
    }
    .right {
      .desc {
        color: #666666;
      }
      .icon-explain {
        color: #2a2a2a;
      }
    }
  }
  .list-box {
    margin-top: 52rpx;
    .left {
      height: calc(100vh - 810rpx);
      width: 400rpx;
      .item {
        padding-right: 40rpx;
        margin-bottom: 16rpx;
        .serial {
          width: 280rpx;
        }
      }
      .no-data {
        height: 100%;
        color: #aaaaaa;
        font-family: PingFang SC;
      }
    }
    .right {
      .view {
        .title {
          line-height: 30rpx;
          .icon-more {
            font-size: 18rpx;
            color: #666;
            font-weight: 400;
            margin-left: 16rpx;
          }
        }
        .num {
          font-size: 60rpx;
          line-height: 60rpx;
          // color: $uni-color-primary;
          color: var(--theme-color, $uni-color-primary);
        }
      }
    }
  }
  .my-reward {
    margin: 40rpx auto 0;
    width: 600rpx;
    height: 90rpx;
    line-height: 90rpx;
    border-radius: 45rpx;
    font-family: PingFang SC;
  }
}
.camera-button {
  position: fixed;
  width: 70rpx;
  height: 70rpx;
  opacity: 0.8;
  border-radius: 50%;
  top: 120rpx;
  left: -15rpx;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  .icon-a-xingzhuang37 {
    color: #fff;
  }
}
.cal {
  background-color: rgba(255, 255, 255, 1);
}
.scan-special {
  position: fixed;
  height: 560rpx;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  background-size: 100%;
  .link {
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
.has-scan-tip {
  font-weight: 500;
  color: #666666;
  line-height: 40rpx;
}
@keyframes scanAnimation {
  0% {
    margin-top: 100rpx;
  }
  90% {
    margin-top: 400rpx;
  }
  100% {
    margin-top: 400rpx;
  }
}
</style>
