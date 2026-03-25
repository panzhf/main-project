var mpLog = wx.getRealtimeLogManager ? wx.getRealtimeLogManager() : null

export default {
  debug() {
    if (!mpLog) return
    mpLog.debug.apply(mpLog, arguments)
  },
  info() {
    if (!mpLog) return
    mpLog.info.apply(mpLog, arguments)
  },
  warn() {
    if (!mpLog) return
    mpLog.warn.apply(mpLog, arguments)
  },
  error() {
    if (!mpLog) return
    mpLog.error.apply(mpLog, arguments)
  },
  setFilterMsg(msg) {
    // 从基础库2.7.3开始支持
    if (!mpLog || !mpLog.setFilterMsg) return
    if (typeof msg !== 'string') return
    mpLog.setFilterMsg(msg)
  }
}
