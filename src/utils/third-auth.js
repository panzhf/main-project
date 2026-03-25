import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'
import encUtf8 from 'crypto-js/enc-utf8'

const apiEndpoint = 'https://dynamic-tag.newayz.com/openapi/midoo/auth'

function generateApiKey(phone, timestamp) {
  // 1. 拼接原始字符串
  const rawString = `midoo${phone}${timestamp}`

  // 2. Base64编码
  const base64String = Base64.stringify(encUtf8.parse(rawString))

  // 3. SHA256哈希处理
  return sha256(base64String).toString()
}

export async function authRequest(storeInfo, personInfo) {
  const userData = {
    phone: storeInfo.mobile,
    nickname: personInfo.leader,
    stores: [
      {
        storeId: storeInfo.storeid,
        storeName: storeInfo.storename,
        location: storeInfo.lanandlat.split(',').reverse().join(','),
        provinceName: storeInfo.provincename,
        cityName: storeInfo.cityname,
        areaName: storeInfo.areaname,
        address: storeInfo.address
      }
    ]
  }
  // 生成当前时间戳（秒级）
  const currentTimestamp = Math.floor(Date.now() / 1000)

  // 生成API Key
  const apiKey = generateApiKey(userData.phone, currentTimestamp)

  // 发送请求
  const [err, res] = await uni.request({
    url: apiEndpoint,
    method: 'POST',
    header: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
      'X-Api-Timestamp': currentTimestamp.toString()
    },
    data: userData
  })
  if (err) {
    uni.showToast({
      title: '系统繁忙请稍后重试',
      icon: 'none'
    })
    return ''
  }
  const { code, data, msg } = res.data
  if (code !== 200) {
    uni.showToast({
      title: msg,
      icon: 'none'
    })
  }
  return code === 200 ? data : ''
}
