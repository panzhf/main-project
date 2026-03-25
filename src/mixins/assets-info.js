import { mapState } from 'vuex'
const assetInfoMixin = {
  computed: {
    ...mapState(['assetsInfo']),
    returnCouponFirst() {
      // 有返货券的记录
      return this.assetsInfo.isdisplay
    },
    isGetAssetsInfo() {
      return this.assetsInfo.isGetData
    }
  }
}
export default assetInfoMixin
