// 基础域名
const domain = 't.miduonet.com' // 测试环境：t.miduonet.com，生产环境：weixin12315.com

// 静态域名
export const staticDomain = `https://stati.${domain}/`

// 请求接口域名
let baseURL = `https://mini.${domain}/retailassistant/api/`
let baseAPIURL = `https://mini.${domain}`

if (process.env.NODE_ENV === 'development') {
  // baseURL = 'http://192.168.5.191:8183/api/'
}

export { baseURL, baseAPIURL }
// 规则中心域名
export const ruleUrl = `https://mini.${domain}/rule/`

// 投诉页面域名
export const usercenterUrl = `https://my.${domain}/`
// 授权
export const authHost = `https://api.${domain}`
export const postUrl = `https://mdzs.${domain}/miniprogram/auth.html`

/*
 * 静态资源路径
 * e.g `${staticURL}avatar.png`
 */
export const staticURL = (isPackages = false) => {
  if (isPackages) return `${staticDomain}activity-packages/`
  return `${staticDomain}retail-assistant-mp/`
}
// 获取第三方配置
export function getExtConfig() {
  let config = {}
  if (process.env.NODE_ENV === 'production') {
    if (Object.keys(config).length > 0) {
      return config
    }
    config = uni.getExtConfigSync ? uni.getExtConfigSync() : {}
    console.log('ext', config)
    return config
  }
  // 专属小程序：本地测试
  // config = {
  //   memberLogin: '10006138', // 哆哆: 10006138
  //   appID: 'wx6630b7ed1aaa2582',
  //   isSpecial: 1 // 专属版 0.否 1.是
  // }
  // 线上
  /* config = {
    memberLogin: '10000672', // 优柯码
    appID: 'wx71038198e67c9842',
    isSpecial: 1
  } */
  return config
}
