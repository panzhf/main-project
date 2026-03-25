import MD5 from 'blueimp-md5'

/** 对象属性值小写 */
function sortObjectKey(source) {
  if (!source) return
  let target = {}
  Object.keys(source)
    .sort()
    .forEach(key => {
      if (source[key] !== undefined) {
        target[key.toLowerCase()] = source[key]
      }
    })
  return _sortObjectKey(target)
}

function _sortObjectKey(source) {
  if (!source) return
  let target = {}
  Object.keys(source)
    .sort()
    .map(key => {
      if (source[key] !== undefined) {
        target[key] = source[key]
      }
    })
  return target
}

/** 将请求参数格式按键值对应的顺序转换成字符串 */
function paramStringify(data) {
  if (!data) return ''
  let str = []
  for (let i in data) {
    if (!(data[i] instanceof Object)) {
      let val = data[i] + ''
      str.push(i + '' + val.toLowerCase())
    } else {
      /*  数组与对象都直接转为字符串 */
      str.push(i + '' + JSON.stringify(data[i]))
    }
  }
  return str.join('')
}

function getValueNull(arg) {
  if (typeof arg === 'object') {
    const obj = {}
    for (const key in arg) {
      if (arg[key] !== null) {
        obj[key] = arg[key]
      }
    }
    return obj
  } else {
    return arg
  }
}

// 自定义请求头
export default function defineConfig(data) {
  data = getValueNull(data)
  const timestamp = Math.round(new Date().valueOf() / 1000).toString() || ''
  let sortedParams = sortObjectKey(data)
  let signStr = paramStringify(sortedParams).toLowerCase()
  // //console.log('signStr', signStr)
  let tokenHeader = {}
  //console.log(timestamp, signStr)
  // 增加自定义headers
  Object.assign(tokenHeader, {
    TimeStamp: timestamp,
    Sign: MD5(`${signStr}${timestamp}`)
  })
  return tokenHeader
}
