<template>
  <view :style="themeVars">
    <camera-scan ref="cameraRef" :show-keyword="false" @scanCode="handleScanCode">
      <view slot="result-panel" class="flex" style="width: 100%">
        <view class="fs-30 flex-1">
          核销结果：
          <text :class="['fw-bold', resultText === '核销成功' ? 'success-color' : 'error-color']">
            {{ resultText || '' }}
          </text>
        </view>
        <view class="fs-24 c-6" @tap="handleShowTips(1, '核销数值说明', '', '我知道了')">
          核销数值说明
          <text class="iconfont icon-explain fs-28 ml-20 c-2"></text>
        </view>
      </view>
      <view slot="content-panel">
        <view
          v-for="(item, index) in successList"
          :id="'view' + index"
          :key="index"
          class="fs-28 pr-20 mb-30 pb-30 bd-e"
        >
          <view class="fs-28 fw-bold">核销成功！</view>
          <view class="fs-24 c-6">核销人：{{ storeInfo.sysclerkname }}（{{ storeInfo.storename }}）</view>
          <view class="fs-24 c-6">{{ item.writeoffDate }}</view>
          <view v-if="item.voucherName || item.awardRecord" class="fs-24 c-6">
            获得：
            <template v-if="item.voucherName">{{ item.voucherName }}*{{ item.voucherCount }}</template>
            <template v-if="item.voucherName && item.awardRecord">、</template>
            <template v-if="item.awardRecord">{{ item.awardRecord }}</template>
          </view>
        </view>
        <view v-if="!successList.length" class="c-6 mt-40">暂无核销记录</view>
      </view>
      <view slot="total-panel">
        <total :show-link="false" :total-list="total"></total>
      </view>
      <view slot="opera-panel">
        <button class="primary-btn round flex-1" @tap="goBack">完成</button>
      </view>
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
    >
      <block v-if="slotType === 1">
        <view class="fs-26 tx-l">
          <text class="fw-bold">核销成功数：</text>
          本次连续扫码核销，核销成功的数量之和
        </view>
        <view class="fs-26 tx-l pt-20">
          <text class="fw-bold">扫码总数：</text>
          本次连续扫码核销，扫描的二维码数量之和
        </view>
      </block>
    </common-popup>
    <!-- #ifdef MP-WEIXIN -->
    <PrivacyPopup ref="privacyPopup" />
    <!-- #endif -->
  </view>
</template>

<script>
import { apiScanSourceCodeWriteOff, apiWriteoffProduct } from '@/api/pick-coupon'
import commonPopupMixin from '@/mixins/common-popup'
import scanSoundMixmin from '@/mixins/scan-sound'
import cameraMixin from '@/mixins/camera'
import Total from '@/components/camera-scan/total'
export default {
  components: {
    Total
  },
  mixins: [commonPopupMixin, scanSoundMixmin, cameraMixin],
  data() {
    return {
      successList: [],
      resultText: '',
      successTotal: 0, // 成功扫码数
      codeList: [], // 码记录
      busy: false,
      slotType: 0,
      updateFlag: false
    }
  },
  computed: {
    total() {
      return [
        {
          num: this.successTotal,
          name: '核销成功数'
        },
        {
          num: this.codeList.length,
          name: '扫码总数'
        }
      ]
    },
    storeInfo() {
      return this.$store.state.storeInfo
    }
  },
  onReady() {
    // 判断是否有店铺信息，没有则从缓存获取并调用接口
    if (!this.storeInfo || !this.storeInfo.storeid) {
      const storeSettingInfo = uni.getStorageSync('storeSettingInfo')
      if (storeSettingInfo) {
        const { memberLogin, storeId } = JSON.parse(storeSettingInfo)
        if (memberLogin && storeId) {
          this.$store.dispatch('setStoreInfo', {
            storeid: storeId,
            m: memberLogin
          })
        }
      }
    }
  },
  onShow() {
    // 防止隐私不触发导致相机不正常初始化
    this.$refs.privacyPopup.refresh()
  },
  methods: {
    handleShowTips(type, title, con, btnText) {
      this.slotType = type
      this.popTitle = title
      this.popContent = con
      this.popType = 'tip'
      this.popConfirmText = btnText
      this.showPopup = true
    },
    handleScanCode(e) {
      if (this.busy) return
      this.busy = true
      apiScanSourceCodeWriteOff({
        code: e
      })
        .then(res => {
          if (this.$ck(res, false)) {
            const { prizetype, writeoffdate, vouchername, vouchercount, awardrecord, prizecode, goodsvoucher } =
              res.return_data
            if (prizetype === 1) {
              this.resultText = '核销成功'
              this.successList.unshift({ writeoffDate: writeoffdate })
            } else if (prizetype === 3) {
              this.resultText = '核销成功'
              this.handleSuccessResult({
                writeoffdate: goodsvoucher ? goodsvoucher.writeoffdate : writeoffdate,
                vouchername: goodsvoucher ? goodsvoucher.vouchername : vouchername,
                vouchercount: goodsvoucher ? goodsvoucher.vouchercount : vouchercount,
                awardrecord: goodsvoucher
                  ? (goodsvoucher.awardrecord || []).filter(item => item.isextendaward !== 0)
                  : awardrecord // 门店明文兑奖核销获得奖励中与voucher重复，需过滤掉
              })
            } else if (prizetype === 2) {
              // N元换购实物核销单独拆个接口核销
              this.handleWriteoffProduct(prizecode)
            } else {
              this.handleFailResult(res)
            }
          } else {
            this.handleFailResult(res)
          }
          if (!this.codeList.includes(e)) this.codeList.push(e)
          this.cancelBusy()
        })
        .catch(e => {
          this.cancelBusy()
          this.$msg('网络异常，请重试！')
          this.uploadLog('returnCode', JSON.stringify(e || {}))
        })
    },
    // 核销失失败回调
    handleFailResult(res) {
      this.resultText = '核销失败'
      let msg = res.return_msg || '此码无法识别，请检查后重试'
      this.handleShowTips(0, '核销失败', msg, '我知道了')
      setTimeout(() => {
        this.handleSoundResult(false)
      }, 500)

      this.$refs.cameraRef.isShowCamera = true
      this.$refs.cameraRef.autoScan = false

      !res.return_msg.includes('此码已核销过了') && this.uploadLog('returnCode', JSON.stringify(res || {}))
    },
    // 核销成功回调
    handleSuccessResult({ writeoffdate, vouchername, vouchercount, awardrecord } = {}) {
      let awardRecords = []
      awardrecord.forEach(item => {
        if (item.prizetype === 10) {
          awardRecords.push(`￥${item.amount}(品牌红包)`)
        } else if (item.prizetype === 1) {
          awardRecords.push(`${item.points}(积分)`)
        } else if (item.prizetype === 14) {
          awardRecords.push(`${item.prizename}*${item.amount}`)
        }
      })
      let item = {
        writeoffDate: writeoffdate,
        voucherName: vouchername,
        voucherCount: vouchercount,
        awardRecord: awardRecords.join('、')
      }
      this.successList.unshift(item)
      this.successTotal++
      if (!this.updateFlag) {
        this.$store.commit('updateRefreshTag', true)
        this.updateFlag = true
      }
      setTimeout(() => {
        this.handleSoundResult(true)
      }, 500)

      setTimeout(() => {
        // ios连扫会黑屏，需延时
        this.$refs.cameraRef.autoScan && this.$refs.cameraRef.onChangeScan()
      }, 2000)
    },

    // 核销实物礼品
    handleWriteoffProduct(code) {
      // 实物单个核销
      apiWriteoffProduct({
        sourcetype: 0, // 核销类型 0 扫码核销 1手动输入
        expirycode: code
      })
        .then(res => {
          this.cancelBusy()
          if (this.$ck(res, false)) {
            this.resultText = '核销成功'
            this.handleSuccessResult({
              writeoffdate: res.return_data.writeoffdate,
              vouchername: res.return_data.vouchername,
              vouchercount: res.return_data.vouchercount,
              awardrecord: res.return_data.awardrecord || []
            })
          } else {
            this.handleFailResult(res)
          }
        })
        .catch(e => {
          this.cancelBusy()
          this.$msg('网络异常，请重试！')
          this.uploadLog('returnCode', JSON.stringify(e || {}))
        })
    },
    goBack() {
      let pages = getCurrentPages()
      if (pages[pages.length - 2]) {
        uni.navigateBack()
      } else {
        uni.redirectTo({ url: '/pages/management/verification-mgm?type=7' })
      }
    }
  }
}
</script>
