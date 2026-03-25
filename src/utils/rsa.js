import WxmpRsa from 'wxmp-rsa'
/*
wxmp-rsa
前端rsa加解密工具
基于jsencrypt修改扩展功能。
兼容小程序环境，压缩后60kb左右的大小，节省小程序空间。
支持超长文本加解密。
支持中文字符的加解密。

*/
export function getRsa(data) {
  if (!data) return
  const rsa = new WxmpRsa()
  let publicKey =
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCJVe8zX9QD13lmqTQErnrwMIKQYccMf9OxrAfGJ61RChJEpcJe87ljKEYs3lhtYqVzKv7204y72GrhHPXEIZ9JyQmWaR0Cjg1jOo8RI0p5vv0g3Tni3D5K9TpLp5U90tfO2NzKNs98z4tvvCB+AAKGyRJ0JDFL4vLnI1KQq6sk/wIDAQAB'
  rsa.setPublicKey(publicKey)
  const cryptStr = rsa.encryptLong(data)
  return cryptStr
}
