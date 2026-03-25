export default {
  _listeners: [],
  subscribe(listener) {
    // 前一页面设置监听
    this._listeners.push(listener)
  },
  notify(res) {
    // 登录页进行结果回调
    this._listeners.forEach(listener => listener(res))
    this._listeners = []
  }
}
