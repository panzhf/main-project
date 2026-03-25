/*
 * @Description 用于自动切换门店
 */
import { setToken } from '@/utils/set-storage'
const switchStoresmixin = {
  methods: {
    async handleSwitchStores(storeID) {
      let storeObj = JSON.parse(uni.getStorageSync('storeSettingInfo'))
      if (storeID !== storeObj.storeId) {
        let accounList = JSON.parse(uni.getStorageSync('accountsyslist'))
        const s = accounList.find(i => i.systemid === storeID)
        if (s) {
          await setToken(s, 1)
        }
      }
    }
  }
}
export default switchStoresmixin
