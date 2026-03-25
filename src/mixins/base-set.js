import { mapState } from 'vuex'
const baseSetMixin = {
  computed: {
    ...mapState(['fcBasicSet']),
    signinType() {
      return this.fcBasicSet.signintype
    },
    isOpenSignType() {
      return this.fcBasicSet.isopensigntype
    }
  }
}
export default baseSetMixin

export const scanCodeMixin = {
  computed: {
    ...mapState(['fcBasicSet']),
    scanCodeType() {
      // 1-二维码和条形码, 2-只能二维码, 3-只能条形码
      return this.fcBasicSet.scancodetype || 1
    }
  }
}
