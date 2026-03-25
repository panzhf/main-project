export default {
  data() {
    return {
      qrURL: '',
      localBgInfo: '', // 图片本地信息
      localQrInfo: '' // 太阳码本地信息
    }
  },
  methods: {
    async getBg() {
      let res = await this.getImgInfo(this.bgURL)
      if (res) {
        this.localBgInfo = res.path
      }
    },
    ellipsis(s) {
      return !!s && s.length > 10 ? s.slice(0, 10) + '...' : s
    }
  }
}
