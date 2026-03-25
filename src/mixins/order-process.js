import { apiCancelOrder } from '@/api/order'
import { apiSignAll, apiFinishOrder, apiComfirmSign } from '@/api/sign'
const orderProcessMixin = {
  data() {
    return {
      cancelOrderNo: '', // 要取消的订单号
      operaStorageNo: '', // 正在操作的出货订单号
      popActionType: '', //弹窗类型
      refleshData: false
    }
  },
  methods: {
    handleCancelComfirm(cancelOrderNo) {
      if (typeof this.overdueChecked === 'function' && !this.overdueChecked()) return

      //  取消订单确认
      this.popActionType = 'cancelOrder'
      this.cancelOrderNo = cancelOrderNo
      this.popType = 'confirm'
      this.popTitle = '取消订单'
      this.popContent = '确定取消该订单吗？'
      this.popConfirmText = '确定'
      this.popCancelText = '取消'
      this.showPopup = true
    },
    handleSignOrderComfirm(storageNo) {
      if (typeof this.overdueChecked === 'function' && !this.overdueChecked()) return

      //一键签收确认
      this.popActionType = 'signOrder'
      this.operaStorageNo = storageNo
      this.popType = 'confirm'
      this.popTitle = '温馨提示'
      this.popContent = '确定一键签收此单据？'
      this.popConfirmText = '确定'
      this.popCancelText = '取消'
      this.showPopup = true
    },
    handleFinishOrderComfirm(storageNo) {
      if (typeof this.overdueChecked === 'function' && !this.overdueChecked()) return

      this.popActionType = 'finishOrder'
      this.operaStorageNo = storageNo
      this.popType = 'prompt'
      this.popTitle = '提前结单'
      this.popIsTextarea = true
      this.maxLength = 50
      this.popContent = '提前结单需要填写原因由上级审核确认，同时未签收的商品将不能出货给下级，确定要提前结单吗？'
      this.popPlaceholder = '请输入提前结单理由，限50字'
      this.popConfirmText = '确定并提交'
      this.popCancelText = '取消'
      this.popTips = ``
      this.showPopup = true
    },
    handleCompleteComfirm(operaStorageNo) {
      if (typeof this.overdueChecked === 'function' && !this.overdueChecked()) return

      //  快签确认
      this.popActionType = 'fastComfirm'
      this.operaStorageNo = operaStorageNo
      this.popType = 'confirm'
      this.popTitle = '温馨提示'
      this.popContent = '确认完成本次签收扫码？'
      this.popConfirmText = '确定'
      this.popCancelText = '取消'
      this.showPopup = true
    },
    handleCancelOrder() {
      // 去掉订单
      this.showPopup = false
      apiCancelOrder({ orderno: this.cancelOrderNo }).then(res => {
        if (this.$ck(res)) {
          this.$msg('订单取消成功！', { icon: 'success' })
          setTimeout(() => {
            this.updateData()
          }, 3000)
        }
      })
    },
    reflehPrePageData() {
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2]
      prevPage.$vm.refleshData = true
    },
    handleSignOrder() {
      // 一键签收
      this.showPopup = false
      apiSignAll({ storageno: this.operaStorageNo }).then(res => {
        if (this.$ck(res)) {
          this.$msg('订单签收成功！', { icon: 'success' })
          setTimeout(() => {
            this.updateData()
          }, 3000)
        }
      })
    },
    handleFininshOrder(value) {
      // 提前结单
      if (value === '') {
        return this.$msg('请填写提前结单的理由')
      }
      if (value.length > this.maxLength) {
        return this.$msg(`不能超过${this.maxLength}字`)
      }
      this.showPopup = false
      apiFinishOrder({ storageno: this.operaStorageNo, remark: value }).then(res => {
        if (this.$ck(res)) {
          this.$msg('结单成功！', { icon: 'success' })
          setTimeout(() => {
            this.updateData('finishOrder')
          }, 3000)
        }
      })
    },
    handleConfirm(value) {
      switch (this.popActionType) {
        case 'cancelOrder':
          // 取消订单
          this.handleCancelOrder()
          break
        case 'signOrder':
          // 签收订单
          this.handleSignOrder()
          break
        case 'finishOrder':
          // 提前结单
          this.handleFininshOrder(value)
          break
        case 'fastComfirm':
          // 快速签收
          this.handleCompleteSign()
          break

        default:
          break
      }
    },
    handleScanCodeFromOrder(orderNo, storageNo, orderStatus) {
      let insignType = 1
      /*
      订单状态 0待审核；1待出货；2出货中；3待签收；4签收中；5订单完成；6订单取消
            订单列表  ->    签收列表
      待签收   3                0
      签收中   4                2
      */
      let insignStatus = orderStatus === 3 ? 0 : orderStatus === 4 ? 2 : -1
      this.handleJumpScanCode(orderNo, storageNo, insignType, insignStatus)
    },
    handleJumpScanCode(orderNo, storageNo, insignType, insignStatus) {
      if (typeof this.overdueChecked === 'function' && !this.overdueChecked()) return

      //  跳到扫码签收页 "insignType":0,0-普通签收，1-订单签收
      uni.navigateTo({
        url: `/product/sign/scan?orderNo=${orderNo}&storageNo=${storageNo}&insignType=${insignType}&insignStatus=${insignStatus}`
      })
    },
    handleCompleteSign() {
      // 快速签收
      this.showPopup = false
      apiComfirmSign({ storageno: this.operaStorageNo }).then(res => {
        if (this.$ck(res)) {
          this.$msg('已完成签收！', { icon: 'success' })
          setTimeout(() => {
            this.updateData('finishOrder')
          }, 3000)
        }
      })
    }
  }
}
export default orderProcessMixin
