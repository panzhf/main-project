<template>
  <view :style="themeVars">
    <camera-scan
      ref="cameraRef"
      :custom-panel="false"
      :extract="true"
      :scan-code-type="scanCodeType"
      @scanCode="handleScanCode"
    >
      <block slot="all">
        <view class="flex flex-between">
          <view class="left fs-32 fw-bold">单号:{{ orderNo }}</view>
          <view class="right" style="margin-right: -20rpx">
            <u-checkbox-group
              placement="column"
              :active-color="themeInfo.color"
              icon-placement="right"
              label-size="15"
              @change="checkboxChange"
            >
              <u-checkbox v-model="checked" name="true">错误回退</u-checkbox>
            </u-checkbox-group>
          </view>
        </view>
        <view class="flex flex-between fs-30 peresult-view">
          <view class="left">
            本次{{ checked ? '回退' : '扫码' }}结果：
            <text class="fw-bold" :class="resultMsg.includes('成功') ? 'success-color' : 'error-color'">
              {{ resultMsg }}
            </text>
          </view>
          <view class="right">
            总扫码数：
            <text class="primary-color">{{ storageTotalCount }}</text>
          </view>
        </view>
        <view class="result-view p-20 flex flex-column">
          <view>
            <view class="item">
              <view class="key">物流码：</view>
              <view class="val ellipsis-1">{{ resuleData.serialnumber || '-' }}</view>
            </view>
            <view class="item">
              <view class="key">商品名称：</view>
              <view class="val ellipsis-1">{{ resuleData.productname || '-' }}</view>
            </view>
            <view class="item">
              <view class="key">{{ checked ? '回退' : '扣减' }}数量：</view>
              <view class="val">{{ resuleData.storagecount || '-' }}</view>
            </view>
          </view>
          <view class="wb-ba tx-c fs-30 fw-bold bd-t-e primary-color mt-10 flex-1 flex flex-middle">
            <view class="tx-c" style="width: 100%">{{ resuleData.resultMsg }}</view>
          </view>
        </view>
        <view :class="['tips-view', !checked ? 'flex flex-between' : '']">
          <block v-if="checked">扫错的物流码可在当前页面进行回退操作，回退后仍可再次操作库存扣减</block>
          <block v-else>
            <view>扫码成功后需品牌商审核通过后才执行库存扣减</view>
            <view class="edit-color fw-bold" @tap="handleShowScanProducts('pop')">
              已扫码统计
              <text class="icon iconfont icon-more edit-color fs-26"></text>
            </view>
          </block>
        </view>
        <view class="flex">
          <block v-if="checked">
            <button class="primary-btn round flex-1" @tap="checked = false">完成回退</button>
          </block>
          <block v-else>
            <button class="primary-btn round inverse flex-1" @tap="showStopTips">暂存草稿</button>
            <button :disabled="storageTotalCount === 0" class="primary-btn round flex-1 ml-20" @tap="handleSendComfirm">
              提交审核
            </button>
          </block>
        </view>
      </block>
    </camera-scan>
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :content="popContent"
      :confirm-text="popConfirmText"
      :cancel-text="popCancelText"
      :placeholder="popPlaceholder"
      :is-textarea="popIsTextarea"
      :max-length="maxLength"
      @confirm="handleConfirm"
    ></common-popup>
    <scan-products
      v-model="showScanProducts"
      :list="scanProducts"
      :kind-count="kindCount"
      :storage-total-count="storageTotalCount"
    ></scan-products>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiDeduce, apiGetDeduceStatistics, apiGetDeduceInfo, apiDeduceSubmit } from '@/api/stock.js'
import ScanProducts from './comps/scan-products.vue'
import commonPopupMixin from '@/mixins/common-popup'
import { scanCodeMixin } from '@/mixins/base-set'
import cameraMixin from '@/mixins/camera'
import ScanSound from '@/mixins/scan-sound'
export default {
  components: {
    ScanProducts
  },
  mixins: [scanCodeMixin, commonPopupMixin, cameraMixin, ScanSound],
  data() {
    return {
      showScanProducts: false, // 显示扫码签收的商品列表
      scanProducts: [], //扫码签收的商品列表
      resultMsg: '',
      checked: false,
      busy: false, // 防重复标记
      resuleData: {
        //本次扫描结果
        serialnumber: '',
        productname: '',
        storagecount: 0,
        productno: '',
        resultMsg: ''
      },
      popActionType: '',
      orderNo: '',
      kindCount: 0,
      storageTotalCount: 0
    }
  },
  computed: {
    brandInfo() {
      return JSON.parse(uni.getStorageSync('currentBrandInfo') || '{}')
    }
  },
  async onLoad() {
    await this.getDeduceInfo()
    this.handleShowScanProducts()
    uni.enableAlertBeforeUnload({
      message: '返回上一页会自动暂存数据，不会直接扣库存，确定返回上一页？'
    })
  },
  onShow() {
    // 防止隐私不触发导致相机不正常初始化
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    async getDeduceInfo() {
      let res = await apiGetDeduceInfo({})
      if (this.$ck(res, true)) {
        this.orderNo = res.return_data.orderno
      }
    },
    async handleShowScanProducts(type) {
      let res = await apiGetDeduceStatistics({
        orderno: this.orderNo
      })
      if (this.$ck(res, true)) {
        this.scanProducts = res.return_data.list
        this.kindCount = res.return_data.kindcount
        this.storageTotalCount = res.return_data.storagetotalcount
        if (type === 'pop') this.showScanProducts = true
      }
    },
    async checkboxChange() {
      this.resetResultData()
    },
    resetResultData() {
      this.resuleData = {
        serialnumber: '',
        productname: '',
        storagecount: 0,
        productno: '',
        resultMsg: ''
      }
      this.resultMsg = ''
    },
    async handleScanCode(value) {
      if (this.busy) return
      this.busy = true
      uni.vibrateShort()
      let query = {
        serialnumber: value,
        orderno: this.orderNo,
        datatype: this.checked ? 1 : 0 // 0-正常扣减 1-错误回退
      }
      try {
        let res = await apiDeduce(query)
        if (this.$ck(res, false)) {
          let { productname, serialnumber, storagecount } = res.return_data
          this.resuleData = {
            productname,
            serialnumber,
            storagecount,
            resultMsg: `物流码"${serialnumber}"扫描成功`
          }
          this.resultMsg = this.checked ? '回退成功' : '扣减成功'
          if (this.checked) {
            this.storageTotalCount = this.storageTotalCount - storagecount
          } else {
            this.storageTotalCount = this.storageTotalCount + storagecount
          }
          setTimeout(() => {
            this.handleSoundResult(true)
          }, 500)

          setTimeout(() => {
            // ios连扫会黑屏，需延时
            this.$refs.cameraRef.autoScan && this.$refs.cameraRef.onChangeScan()
          }, 2000)
        } else {
          this.resuleData = {
            productname: '',
            serialnumber: value,
            storagecount: 0,
            resultMsg: res.return_msg
          }
          this.resultMsg = this.checked ? '回退失败' : '扣减失败'
          setTimeout(() => {
            this.handleSoundResult(false)
          }, 500)

          this.$refs.cameraRef.isShowCamera = true
          this.$refs.cameraRef.autoScan = false

          this.uploadLog('signCode', JSON.stringify(res || {}))
        }
        this.cancelBusy()
      } catch (e) {
        this.cancelBusy()
        this.uploadLog('signCode', JSON.stringify(e || {}))
      }
    },
    showStopTips() {
      this.popActionType = 'saveScanData'
      this.popType = 'confirm'
      this.popTitle = '温馨提示'
      this.popIsTextarea = false
      this.popContent = '暂存操作仅保存扫码记录，不直接扣库存'
      this.popPlaceholder = ''
      this.popConfirmText = '确定'
      this.popCancelText = '取消'
      this.showPopup = true
    },
    handleSendComfirm() {
      this.popActionType = 'sendCode'
      this.popType = 'prompt'
      this.popTitle = '提交审核'
      this.popIsTextarea = true
      this.maxLength = 50
      this.popContent = '提交品牌商审核需要填写扣减原因，是否确定库存扣减并提交审核？'
      this.popPlaceholder = '请输入库存扣减理由，限50字'
      this.popConfirmText = '确定并提交'
      this.popCancelText = '取消'
      this.showPopup = true
    },
    handleConfirm(value) {
      if (this.popActionType === 'sendCode') {
        if (value === '') {
          return this.$msg('请输入库存扣减理由')
        }
        if (value.length > this.maxLength) {
          return this.$msg(`不能超过${this.maxLength}字`)
        }
        this.showPopup = false
        apiDeduceSubmit({ orderno: this.orderNo, remark: value }).then(res => {
          if (this.$ck(res)) {
            this.showTips(res.return_data.auditmsg, '确定', '温馨提示')
            setTimeout(() => {
              uni.redirectTo({
                url: `/product/deduct/deduct-list`
              })
            }, 3000)
          }
        })
      } else if (this.popActionType === 'saveScanData') {
        this.showPopup = false
        wx.disableAlertBeforeUnload()
        this.$goBack()
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.result-view {
  height: calc(100vh - 940rpx);
  background: #f7f7f7;
  overflow-y: scroll;
  .item {
    display: flex;
    font-size: 28rpx;
    padding: 10rpx;
    text-align: left;
    .key {
      width: 150rpx;
      color: #666;
    }
    .val {
      flex: 1;
      color: #333;
    }
  }
}
.peresult-view {
  padding: 20rpx 0 16rpx;
}
.tips-view {
  font-size: 24rpx;
  color: #999;
  padding: 30rpx 0;
}
</style>
