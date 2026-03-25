export function _getSetting(field) {
  return new Promise((resolve, reject) => {
    uni.getSetting({
      success(res) {
        const scope = 'scope.' + field
        uni.authorize({
          scope,
          success() {
            res.authSetting[scope] = true
            resolve(res)
          },
          fail(err) {
            reject(err)
          }
        })
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
// 检查是否授权
export async function getSetting(field) {
  try {
    let setting = await _getSetting(field)
    return setting.authSetting['scope.' + field] ? Promise.resolve(setting) : Promise.reject()
  } catch (e) {
    return Promise.reject()
  }
}
// 打开设置
export function openSetting() {
  return new Promise((resovle, reject) => {
    uni.openSetting({
      success(res) {
        resovle(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

export function getLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success(res) {
        resolve(res)
      },
      fail(err) {
        reject(err)
      }
    })
  })
}

// 获取页面参数
export function parseUrlQuery(search) {
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

export function deepClone(source) {
  const targetObj = source.constructor === Array ? [] : {} // 判断复制的目标是数组还是对象
  for (let keys in source) {
    // 遍历目标
    if (source.hasOwnProperty(keys)) {
      if (source[keys] && typeof source[keys] === 'object') {
        // 如果值是对象，就递归一下
        targetObj[keys] = source[keys].constructor === Array ? [] : {}
        targetObj[keys] = deepClone(source[keys])
      } else {
        // 如果不是，就直接赋值
        targetObj[keys] = source[keys]
      }
    }
  }
  return targetObj
}
