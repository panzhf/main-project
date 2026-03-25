/*
 * @Author: Ling
 * @Date: 2022-01-24
 * @Description 弹窗组件
    <common-popup
      v-model="showPopup"
      :type="popType"
      :title="popTitle"
      :max-length="maxLength"
      :default-value.sync="popDaultValue"
      :content="popContent"
      :tip="popTips"
      :default-value="popDaultValue"
      :confirm-text="popConfirmText"
      :popHideButton="popHideButton"
      @cancel="cancelConfirm"
      @confirm="popupComfirm"
    ></common-popup>
 */
const commonPopupMixin = {
  data() {
    return {
      showPopup: false, //true 显示弹窗
      popType: 'tip', //弹窗类型  confirm：需要确认的   prompt：表单
      popTitle: '', //弹窗标题
      popTips: '', // 弹窗里显示的提示文字
      popDaultValue: '', // 默认显示文字
      maxLength: 8, //输入的长度
      popContent: '', //显示提示信息
      popConfirmText: '确定', // 弹窗确认按钮文案
      popCancelText: '跳过', // 弹窗取消按钮文案
      popIsTextarea: false,
      popHideButton: false,
      popPlaceholder: '' //输入框
    }
  },
  methods: {
    showTips(content, popConfirmText = '确定', popTitle = '温馨提示') {
      if (content === '') return
      // 显示提示信息
      this.popType = 'tip'
      this.popTitle = popTitle
      this.popContent = content
      this.popConfirmText = popConfirmText
      this.showPopup = true
    }
  }
}
export default commonPopupMixin

export const simplePopupMixin = {
  data() {
    return {
      showPopup: false,
      popType: 'tip',
      popTitle: '温馨提示',
      popContent: '',
      popConfirmText: '确定',
      popCancelText: '取消'
    }
  },
  methods: {
    showTips({ type = 'tip', title = '温馨提示', content, confirmText = '确定', cancelText = '取消' } = {}) {
      this.popType = type
      this.popTitle = title
      this.popContent = content
      this.popConfirmText = confirmText
      this.popCancelText = cancelText
      this.showPopup = true
    }
  }
}
