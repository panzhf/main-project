/*
 * @Author: hishion
 * @Date: 2021-07-15 14:01:31
 * @Description 订阅消息。只有用户发生点击行为或支付回调后才能调起。
 */
const subscribeMsgMixin = {
  data() {
    return {
      noticeTempId: '', // 订阅消息id
      noticeTempList: [] // 订阅消息id集合
    }
  },
  methods: {
    requestSubscribeMsg(tempIds) {
      let that = this
      return new Promise(resolve => {
        // 传入模板id集合，[this.noticeTempId]，或者 this.noticeTempList
        if (tempIds.length === 0) {
          setTimeout(() => {
            resolve()
          }, 300)
        }
        uni.requestSubscribeMessage({
          tmplIds: tempIds,
          success(res) {
            // res格式为 {'TEMPLATE_ID': 'accept'|'rject'|'ban'|'filter'}
            resolve(res) // 传递结果出去，页面进行业务处理
          },
          fail(res) {
            const msg = {
              // 10001: '模块ID为空',
              10002: '请求消息列表失败，请检查网络',
              10003: '订阅消息失败，请检查网络',
              10004: '参数类型错误',
              10005: '小程序退后台无法展示 UI',
              20001: '模板ID不存在，或者和模板类型不对应',
              20002: '模板消息类型需要同种类型',
              20003: '模板消息数量超过上限',
              20004: '您设置了不接收订阅消息',
              20005: '小程序被禁封'
            }

            if (res.errCode === 20004) {
              uni.showModal({
                title: msg[`${res.errCode}`],
                cancelText: '确定',
                confirmText: '去开启',
                success(res) {
                  if (res.confirm) {
                    // uni暂时没有withSubscriptions选项
                    uni.openSetting({
                      withSubscriptions: true,
                      complete() {
                        resolve()
                      }
                    })
                  } else {
                    resolve()
                  }
                }
              })
            } else {
              msg[`${res.errCode}`] && that.$msg(msg[`${res.errCode}`])
              resolve()
            }
          }
        })
      })
    }
  }
}

export default subscribeMsgMixin
