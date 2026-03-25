import log from 'packages/utils/wx-log'
import dayjs from 'dayjs'
/**
 * 接口统一判断，挂载Vue使用 this.$ck(res) {}
 * @param {Object} res 接口响应
 * @param {Boolean} showMsg 是否自动提示错误信息
 */
export const ck = (
  res = {},
  showMsg = true,
  { codeKey = 'return_code', msgKey = 'return_msg', successCode = 0, excludeCode = [401, 600012, 600013, 60030] } = {}
) => {
  if (res[codeKey] === successCode) {
    return true
  } else {
    if (!showMsg) return false
    if (!excludeCode.includes(res[codeKey])) {
      msg(res[msgKey])
    }
    return false
  }
}

/**
 * 提示，挂载Vue使用 this.$msg('hello')
 * @param {String} title 提示信息
 * @param {Object} config 配置图标、时间等
 */
export const msg = (title, { icon = 'none', duration = 2000, mask = false } = {}) => {
  title &&
    uni.showToast({
      title,
      duration,
      mask,
      icon
    })
}

// this.$loading.show()
// this.$loading.hide()
export const loading = {
  show(title = '加载中') {
    uni.showLoading({
      title,
      mask: true
    })
  },
  hide() {
    uni.hideLoading()
  }
}
/**
 * 页面回退 this.$goBack(), this.$goBack({ delay: 1500 })
 * @param {Number} delta 返回层级，默认1
 * @param {Number} delay 延迟返回，默认不延迟，单位毫秒。一般用在提示语结束后返回
 */
export const goBack = ({ delta = 1, delay = 0 } = {}) => {
  setTimeout(() => {
    uni.navigateBack({ delta })
  }, delay)
}

export const navPage = url => {
  if (!url) return
  uni.navigateTo({
    url: url
  })
}

// 简单以对象形式返回链接上的参数
export const getQuery = url => {
  // eslint-disable-next-line no-sequences
  return url.match(/([^?=&]+)(=[^&]*)/g).reduce((acc, val) => ((acc[val.split('=')[0]] = val.split('=')[1]), acc), {})
}

export const previewImage = opts => {
  function foramtUrl(url) {
    if (!url.startsWith('https://')) {
      if (url.startsWith('//')) {
        url = 'https:' + url
      } else {
        url = 'https://' + url
      }
    }
    return url
  }
  opts.current = foramtUrl(opts.current)
  opts.urls.map((item, index) => {
    opts.urls[index] = foramtUrl(item)
  })
  uni.previewImage({
    current: opts.current,
    urls: opts.urls || [],
    fail() {}
  })
}
// 获取url参数
export function getUrlQuery(str) {
  let arr = str.split('&') //先通过？分解得到？后面的所需字符串，再将其通过&分解开存放在数组里
  let obj = {}
  for (let i of arr) {
    obj[i.split('=')[0]] = i.split('=')[1] //对数组每项用=分解开，=前为对象属性名，=后为属性值
  }
  return obj
}

/** 最近的天数，返回日期数组 */
export function getdayScope(day) {
  let today = new Date()

  let targetday_milliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day

  today.setTime(targetday_milliseconds) //注意，这行是关键代码

  let tYear = today.getFullYear()

  let tMonth = today.getMonth()

  let tDate = today.getDate()

  tMonth = doHandleMonth(tMonth + 1)

  tDate = doHandleMonth(tDate)

  return tYear + '-' + tMonth + '-' + tDate
}
function doHandleMonth(month) {
  let m = month

  if (month.toString().length === 1) {
    m = '0' + month
  }

  return m
}
// 基础库比较
export function compareVersion(v2) {
  let v1 = wx.getSystemInfoSync().SDKVersion
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return true
    } else if (num1 < num2) {
      return false
    }
  }

  return 0
}

export function isInfiniteTime(start, end) {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  if (!startDate.isValid() || !endDate.isValid()) return false
  return endDate.diff(startDate, 'year', true) > 100
}
