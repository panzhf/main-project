// import refreshPageMixin from '@/mixins/refresh-page'
// 页面自行定义 refreshPage 方法
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['refreshTag'])
  },
  onLoad() {
    this.$store.commit('updateRefreshTag', false)
  },
  onShow() {
    if (this.refreshTag) {
      // 从详情返回列表后刷新
      this.refreshPage()
    }
  }
}
