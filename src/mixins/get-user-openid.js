import { mapState } from 'vuex'
import { apiGetAuthPath } from '@/api/common'
import { getJsCode } from '@/utils/set-mp'
import userAuthHub from 'packages/utils/user-auth-hub'
const getUserOpenid = {
  computed: {
    ...mapState(['userOpenid']),
    leaderOpenid() {
      return uni.getStorageSync('leaderOpenid')
    }
  },
  methods: {
    async getUserOpenId() {
      const info = {
        userOpenid: this.userOpenid,
        leaderOpenid: this.leaderOpenid
      }
      if (!this.userOpenid) {
        let res = await apiGetAuthPath({ js_code: await getJsCode() })
        if (this.$ck(res)) {
          uni.setStorageSync('authorizeUrl', res.return_data.authurl)
          let authInfo = await new Promise(resolve => {
            userAuthHub.subscribe(resolve)
            uni.navigateTo({
              url: `/packages/src/rule/auth`
            })
          })
          if (authInfo.openid) {
            this.$store.commit('setUserOpenid', authInfo.openid)
            info.userOpenid = authInfo.openid
          }
        }
      }

      return info
    }
  }
}
export default getUserOpenid
