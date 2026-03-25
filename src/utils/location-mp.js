import QQMapWX from '@/libs/qqmap-wx-jssdk.js'
import { specialDistrict } from 'packages/config/custom'

/*
直接用 
import { getLocation, reverseGeocoder } from 'packages/utils/location-mp.js'
*/

/*以下方法废弃*/
export function getLocation() {
  return new Promise(resolve => {
    uni.getLocation({
      type: 'gcj02',
      success(res) {
        resolve(res)
      },
      fail(err) {
        if (
          err.errMsg === 'getLocation:fail:ERROR_NOCELL&WIFI_LOCATIONSWITCHOFF' ||
          err.errMsg === 'getLocation:fail system permission denied'
        ) {
          resolve({
            longitude: '',
            latitude: '',
            status: 1
          })
          return
        }

        uni.getSetting({
          success({ authSetting }) {
            if (!authSetting['scope.userLocation']) {
              uni.showModal({
                title: '温馨提示',
                content: '检测到小程序未开启定位权限，是否去设置打开？',
                confirmText: '去开启',
                cancelText: '取消',
                success({ confirm }) {
                  if (confirm) {
                    uni.openSetting({
                      success({ authSetting }) {
                        if (authSetting['scope.userLocation']) {
                          getLocation().then(res => {
                            resolve(res)
                          })
                        } else {
                          resolve({
                            longitude: '',
                            latitude: ''
                          })
                        }
                      }
                    })
                  } else {
                    resolve({
                      longitude: '',
                      latitude: ''
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  })
}

/*以下方法废弃*/
export function reverseGeocoder(latitude, longitude) {
  return new Promise((resolve, reject) => {
    if (latitude && longitude) {
      // 多个key均衡使用频率
      const keys = ['CFXBZ-JJPW6-HNSSY-E5ENG-WOKW5-WHBDJ', '2XBBZ-N52KU-PTRVC-2YG4P-64OE6-BNBVD']
      const key = keys[new Date().getTime() % keys.length]
      const qqmapsdk = new QQMapWX({
        key
      })
      qqmapsdk.reverseGeocoder({
        location: {
          latitude,
          longitude
        },
        success(res) {
          if (res.status === 0) {
            let { province, city, district } = res.result.address_component
            const town = res.result.address_reference?.town?.title || ''
            const replaceName = (province === city ? city : province + city) + district

            if (!district || specialDistrict.includes(district)) {
              district = town
            }
            resolve({
              province,
              city,
              district,
              town,
              address: res.result.address,
              street:
                res.result.address.replace(replaceName, '') +
                res.result?.formatted_addresses?.recommend.replace(district, '')
            })
          } else {
            reject(new Error('location is null'))
          }
        },
        fail(err) {
          reject(err)
        }
      })
    } else {
      reject(new Error('latitude or longitude is null'))
    }
  })
}
