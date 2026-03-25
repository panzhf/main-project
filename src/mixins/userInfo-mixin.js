export default {
  data() {
    return {
      canIUseGetUserProfile: false
    }
  },
  onLoad() {
    if (wx.getUserProfile) {
      this.canIUseGetUserProfile = true
    }
  }
}
