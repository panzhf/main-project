export const timeFilter = (t, type = 'date') => {
  if (!t) return ''
  const [date, time] = t.split(' ')
  return type === 'date' ? date : time
}
// 多余，可用 {{ time | timeFilter }} 代替
export const getDate = t => {
  let timeArr = t.split(' ')
  return timeArr[0]
}

export const dateSplit = t => {
  if (!t) return ''
  return t.replaceAll('-', '.')
}

// 将手机号中间4位改为星号显示
export const hideMobileFilter = (mobile, notReplace = false) => {
  if (notReplace) return mobile
  if (mobile === '') return ''
  const reg = /^(\d{3})\d*(\d{4})$/
  return mobile.replace(reg, '$1****$2')
}
// 替换名字的第一个字
export const hideNameFilter = (v, notReplace = false) => {
  let vString = v + ''
  if (notReplace) return vString
  if (vString === '') return ''
  return '*' + vString.substr(1)
}
export const digitShowFilter = v => {
  let t = v
  if (v > 99) {
    t = '99+'
  }
  return t
}
export const roleTypeFilter = v => {
  const o = {
    1: '店长',
    2: '负责人',
    3: '店员'
  }
  return o[v]
}

// 价格除整
export function filterRmb(num, unit = false) {
  num = parseFloat(num) // 将输入转换为浮点数
  if (isNaN(num)) {
    return unit ? '￥0.00' : '0.00' // 处理无效输入
  }

  num = (Math.round(num * 100) / 100).toFixed(2) // 四舍五入保留两位小数

  return unit ? `￥${num}` : num
}

// 价格四舍五入并最多保留两位小数
export const formatPrice = v => {
  return Math.round(v * 100) / 100
}

// 积分 1: 发送中 2: 发放成功 3: 发放失败
export const rewardStatusFilter = v => {
  const o = {
    0: '发放中',
    1: '发放中',
    2: '发放成功',
    3: '发放失败'
  }
  return o[v]
}

//  奖品类型: 2-微信红包,3-红包零钱,4-企业付款红包,10-品牌红包
export const rewardTypesFilter = v => {
  const o = {
    2: '微信红包',
    3: '红包零钱',
    4: '企业付款红包',
    10: '品牌红包'
  }
  return o[v]
}

// 红包状态—Status（1: 发送中 2: 发放成功（已到账） 3: 发放失败 5：发放成功（待到账））
export const hbStatusFilter = v => {
  const o = {
    1: '发放中',
    2: '发放成功(已到账)',
    3: '发放失败',
    5: '发放成功(待到账)'
  }
  return o[v]
}

// 兑换券的(红包与积分) —  -1 发放失败 0：未发放（未领取）； 1：已发放 (已领取) 2：补发成功 3：发放中 4:补发中
export const chbStatusFilter = v => {
  if (v === -1) v = 99
  const o = {
    99: '发放失败',
    0: '发放中',
    1: '发放成功(已到账)',
    2: '补发成功',
    3: '发放中',
    4: '补发中'
  }
  return o[v]
}

// 返货券
export const fhqStatusFilter = v => {
  if (v === -1) v = 99
  const o = {
    99: '发放失败',
    0: '发放中',
    1: '发放成功',
    2: '补发成功',
    3: '发放中',
    4: '补发中'
  }
  return o[v]
}

// 1:积分 2:微信红包  3 : 红包零钱 4 : 企业付款红包
export const rewardTypwFilter = v => {
  const o = {
    1: '积分',
    2: '微信红包',
    3: '红包零钱',
    4: '企业付款红包',
    10: '品牌红包'
  }
  return o[v]
}

// 订单状态 0待审核；1待出货；2出货中；3待签收；4签收中；5订单完成；6订单取消
export const orderStatusFilter = v => {
  const o = {
    0: '待审核',
    1: '待出货',
    2: '出货中',
    3: '待签收',
    4: '签收中',
    5: '订单完成',
    6: '已取消'
  }
  return o[v]
}

// 订单签收状态搜索  签收状态 -1全部，0-待签收，1-已签收，2-签收中，3-待确认
export const orderSignStatusFilter = v => {
  const o = {
    0: '待签收',
    1: '已签收',
    2: '签收中',
    3: '待确认'
  }
  return o[v]
}

// 详情页签收状态
export const signDetailStatusFilter = v => {
  const o = {
    0: '待签收',
    1: '已签收',
    2: '签收中',
    3: '结单待上级确认',
    4: '待确认'
  }
  return o[v]
}

// 扣减状态
export const deduceFilter = v => {
  const o = {
    0: '待审核',
    1: '审核通过',
    2: '审核不通过'
  }
  return o[v]
}

// 标签 0-大标，1-中标，2-小标，3-垛标
export const tagstyleFilter = v => {
  const o = {
    0: '大标',
    1: '中标',
    2: '小标',
    3: '垛标'
  }
  return o[v]
}

//  前后加括号
export const bracketFilter = (s = '') => {
  return s === '' ? '' : `(${s})`
}

// 数量
export const numberUnitFilter = v => {
  if (v === '') return
  if (v > 10000 || v === 10000) {
    return `${v / 10000}万`
  } else {
    return v
  }
}

// 发放渠道
export const channelFilter = v => {
  const o = {
    0: '门店码',
    1: '云店'
  }
  return o[v]
}
// 奖励状态
export const prizeStatusFilter = v => {
  const o = {
    1: '待奖励',
    2: '已奖励',
    3: '已失效'
  }
  return o[v]
}
// 发放状态
export const sendStatusFilter = v => {
  const o = {
    1: '发放中',
    2: '发放成功',
    3: '发放成功',
    4: '发放失败'
  }
  return o[v]
}

// 红包类型
export const hbTypeFilter = v => {
  const o = {
    0: '微信红包',
    1: '零钱红包',
    2: '企业付款',
    3: '品牌红包'
  }
  return o[v]
}
