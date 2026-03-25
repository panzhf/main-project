<template>
  <view>
    <camera-scan ref="cameraRef" :extract="true" :scan-code-type="scanCodeType" @scanCode="handleScanCode">
      <view slot="result-panel" class="fs-30">
        扫码结果：
        <text :class="['fw-bold', resultMsg === '签收成功' ? 'success-color' : 'error-color']">
          {{ resultMsg }}
        </text>
      </view>
      <view slot="content-panel">
        <view v-if="list.length" class="item-box fs-24 flex flex-between">
          <view class="serial ellipsis-1">物流码</view>
          <view class="number">商品数量</view>
        </view>
        <view v-for="(item, index) in list" :id="'view' + index" :key="index" class="item-box flex flex-between fs-30">
          <view class="serial ellipsis-1">{{ item.serialnumber }}</view>
          <view class="number">x{{ item.productcount }}</view>
        </view>
        <view v-if="!list.length" class="c-6 mt-40">暂无记录，请扫码签收</view>
      </view>
      <view slot="total-panel">
        <total :show-link="showProduct" :total-list="total" @link="handleShowScanProducts('pop')"></total>
      </view>
      <view slot="opera-panel" class="flex">
        <block v-if="insignType === 2">
          <button v-if="storageNo" class="primary-btn round flex-1" @tap="handleCompleteComfirm(storageNo)">
            完成签收
          </button>
          <button v-else class="primary-btn round flex-1" @tap="$goBack">返回列表</button>
        </block>
        <block v-else>
          <button
            v-if="canEndOrder"
            class="primary-btn round inverse flex-1"
            @tap="handleFinishOrderComfirm(storageNo)"
          >
            提前结单
          </button>
          <button
            :class="['primary-btn round flex-1', isFullSuccess ? 'inverse' : '', canEndOrder ? 'ml-20' : '']"
            @tap="$goBack"
          >
            {{ isFullSuccess ? '返回列表' : '暂停签收' }}
          </button>
        </block>
      </view>
    </camera-scan>
    <scan-products v-model="showScanProducts" :intype="insignType" :list="scanProducts"></scan-products>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :placeholder="popPlaceholder"
      :is-textarea="popIsTextarea"
      :max-length="maxLength"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      @confirm="handleConfirm"
    >
      <view v-if="errMsg && popActionType === 'scanFail'" class="tx-l">
        <view class="wb-ba fs-30 primary-color">
          本次扫描物流码：
          {{ errSerialnumber }}
        </view>
        <view class="err-tips wb-ba c-6 fs-24">扫描结果：{{ errMsg }}</view>
      </view>
    </common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
    <OverdueTips v-if="isExpires" v-model="showOverdueTips" />
  </view>
</template>

<script>
import { apiGetScanCodeDetail, apiScanSign, apiFastSign } from '@/api/sign'
import ScanProducts from './comps/scan-products.vue'
import Total from '@/components/camera-scan/total'
import { scanCodeMixin } from '@/mixins/base-set'
import orderPocessMixin from '@/mixins/order-process'
import commonPopupMixin from '@/mixins/common-popup'
import scanSoundMixmin from '@/mixins/scan-sound'
import cameraMixin from '@/mixins/camera'
import overdueMixin from 'packages/mixins/overdue'

export default {
  components: {
    ScanProducts,
    Total
  },
  mixins: [scanCodeMixin, overdueMixin, orderPocessMixin, commonPopupMixin, scanSoundMixmin, cameraMixin],
  data() {
    return {
      showScanProducts: false, // 显示扫码签收的商品列表
      scanProducts: [], //扫码签收的商品列表
      resultMsg: '',
      errMsg: '',
      errSerialnumber: '',
      list: [],
      total: [
        { num: 0, name: '已扫物流码数量' },
        { num: 0, name: '商品总件数' }
      ],
      busy: false, // 防重复标记
      storageNo: '', // 出货单号
      orderNo: '', // 订单号
      insignType: -1, //0-订单签收，1-上级出货签收
      insignStatus: -1,
      isFullSuccess: 0,
      isSignChangeFlag: false
    }
  },
  computed: {
    showProduct() {
      return !(this.insignType === 2 && !this.storageNo)
    },
    canEndOrder() {
      return (this.insignStatus === 2 && !this.isFullSuccess) || (this.isSignChangeFlag && !this.isFullSuccess)
    }
  },
  onLoad(options) {
    /*
    storageno  出货单号
    orderNo 订单号
    insignType 0-商品签收，1-订单签收 2快速签收
    insignStatus 签收状态
   */
    this.storageNo = options.storageNo
    this.orderNo = options.orderNo
    this.insignType = Number(options.insignType)
    this.insignStatus = Number(options.insignStatus)
    this.handleShowScanProducts()
    uni.enableAlertBeforeUnload({
      message: '确认返回吗?'
    })
  },
  onShow() {
    // 防止隐私不触发导致相机不正常初始化
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    async handleShowScanProducts(type) {
      if (this.insignType === 2 && !this.storageNo) return
      let res = await apiGetScanCodeDetail({
        orderno: this.insignType === 1 ? this.orderNo : this.storageNo,
        intype: this.insignType === 2 ? 0 : this.insignType
      })
      if (this.$ck(res, true)) {
        let { list, producttotalcount, storagetotalcount } = res.return_data
        this.scanProducts = list
        this.total[1].num = producttotalcount
        this.total[0].num = storagetotalcount
        if (type === 'pop') this.showScanProducts = true
      }
    },
    setSignFlag(time) {
      if (!this.isSignChangeFlag) {
        this.isSignChangeFlag = true
        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 2]
        prevPage.$vm.refleshData = true
      }
      if (this.isFullSuccess) {
        wx.disableAlertBeforeUnload()
        this.$goBack({ delay: time })
      }
    },
    updateData(type) {
      if (type === 'finishOrder') {
        this.isFullSuccess = true
        this.setSignFlag(0)
      }
    },
    async handleScanCode(value) {
      if (this.busy) return
      this.busy = true
      uni.vibrateShort()
      let query = {
        storageno: this.storageNo,
        serialnumber: value
      }
      let res
      try {
        let requestApi = this.insignType === 2 ? apiFastSign : apiScanSign
        res = await requestApi(query)
        if (this.$ck(res, false)) {
          this.resultMsg = '签收成功'
          const { serialnumber, productcount, storageno, isfullsuccess } = res.return_data
          let item = {
            serialnumber,
            productcount
          }
          this.list.unshift(item)
          if (this.list.length > 300) this.list.splice(this.list.length - 1, 1)
          this.total[0].num++
          if (this.insignType === 2) {
            this.storageNo = storageno
            this.total[1].num = this.total[1].num + productcount
          } else {
            this.isFullSuccess = isfullsuccess
            if (isfullsuccess) {
              this.showTips('商品已全部签收完成', '确定', '签收已完成')
            }
          }
          setTimeout(() => {
            this.handleSoundResult(true)
          }, 500)
          if (!this.isFullSuccess) {
            setTimeout(() => {
              // ios连扫会黑屏，需延时
              this.$refs.cameraRef.autoScan && this.$refs.cameraRef.onChangeScan()
            }, 2000)
          }

          this.setSignFlag(3000)
        } else {
          this.popType = 'tip'
          this.popActionType = 'scanFail'
          this.popTitle = '扫码签收失败'
          this.popContent = ''
          this.popConfirmText = '确定'
          this.resultMsg = '签收失败'
          this.errMsg = res.return_msg
          this.errSerialnumber = query.serialnumber
          this.showPopup = true
          setTimeout(() => {
            this.handleSoundResult(false)
          }, 500)

          this.$refs.cameraRef.isShowCamera = true
          this.$refs.cameraRef.autoScan = false

          this.uploadLog('signCode', {
            api: this.insignType === 2 ? 'goodsmanage/storefastsign' : 'goodsmanage/scancodeinsign',
            param: query || '',
            res: res || {}
          })
        }
        this.cancelBusy()
      } catch (e) {
        this.cancelBusy()
        this.uploadLog('signCode', JSON.stringify(e || {}))
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.item-box {
  padding-right: 40rpx;
  font-weight: bold;
  margin-bottom: 16rpx;
  .serial {
    width: 260rpx;
  }
}
::v-deep .u-checkbox__icon-wrap {
  margin-left: 10rpx;
}
</style>
