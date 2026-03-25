const baseSetMixin = {
  data() {
    return {}
  },
  computed: {},
  methods: {
    fetchStoreBaseInfo() {
      let storeSettingInfo = JSON.parse(uni.getStorageSync('storeSettingInfo'))
      const { storeId, memberLogin } = storeSettingInfo
      this.storeId = storeId
      this.$store.dispatch('setStoreInfo', { storeid: storeId, m: memberLogin })
    }
  }
}
export default baseSetMixin
