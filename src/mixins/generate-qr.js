import QRCode from '@/libs/qr-code'
/** 一般搭配save-qr.vue（easycom全局注册）使用
 * @param {string} canvasId 默认是myCanvas
 * @param {string} text 生成二维码的链接/文本
 *
 * this.generateQr({ text: path })
 */
const generateQrMixin = {
  methods: {
    generateQr({ canvasId = 'myCanvas', text = '' } = {}) {
      this.$loading.show('正在生成二维码')
      new QRCode(canvasId, {
        text,
        width: 150,
        height: 150,
        padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
        correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
        callback: res => {
          this.$loading.hide()
          this.$refs.saveQr.showToast(res.path, 2)
        }
      })
    }
  }
}

export default generateQrMixin
