const cameraMixin = {
  onShow() {
    this.$refs.cameraRef.checkSetting()
  },
  methods: {
    cancelBusy() {
      setTimeout(() => {
        this.busy = false
      }, 1000)
    },
    uploadLog(codeType, logContent) {
      if (!codeType || !logContent) return
      this.$log.info({
        func: codeType,
        data: JSON.stringify(logContent || {})
      })
    }
  }
}
export default cameraMixin
