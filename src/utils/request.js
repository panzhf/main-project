import { baseURL, baseAPIURL } from '@/config'
import defineConfig from './header'
import { uploadLog } from 'packages/utils/wx-log'
import dayjs from 'dayjs'
// import { Singleton } from './decorator'
class HttpRequest {
  DEFAULT_OPTIONS = {
    loading: true,
    loadingText: '加载中',
    barLoading: false,
    showToast: true,
    requireAuth: true // 校验权限，用于非登录接口
  }
  ERROR_COUNT = 0
  ERROR_CODE = {
    401: '暂未登录或token已经过期',
    600012: '未登录或登录失效',
    60030: '品牌公众号与系统解绑',
    600013: '没有通过校验'
  }

  loginTimer = 0
  isLoggingIn = false // 添加登录状态标记，防止重复调用
  stopFlowSymbol = Symbol('stopFlow')
  // 登录
  // @Singleton
  login() {
    // 如果已经在登录过程中，直接返回
    if (this.isLoggingIn) {
      return
    }

    const currentPage = getCurrentPages().pop()
    const isLoginPage = currentPage.route === 'pages/login/index'

    if (!isLoginPage) {
      this.isLoggingIn = true
      clearTimeout(this.loginTimer)
      this.loginTimer = 0
      uni.reLaunch({
        url: '/pages/login/index',
        success: () => {
          // 登录页面跳转成功后重置状态
          setTimeout(() => {
            this.isLoggingIn = false
          }, 1000)
        },
        fail: () => {
          // 跳转失败时重置状态
          this.isLoggingIn = false
        }
      })
    }
  }
  // 通用请求
  _request(config) {
    return new Promise((resolve, reject) => {
      const { url, data, method, options } = config
      options.loading &&
        !uni.getStorageSync('hiddenLoading') &&
        uni.showLoading({
          title: options.loadingText,
          mask: true
        })
      options.barLoading && uni.showNavigationBarLoading()
      let contentType = options.contentType || 'application/json'
      let otherHeaderConfig = {}
      if (
        url &&
        [
          'request/codeScanApi',
          'request/codeScanApi2',
          'request/codeScanApi3',
          'scancode/minisaoma',
          'request/smartMarketingRewardDispatchApi',
          'request/smartMarketingScanCodeApi'
        ].includes(url)
      ) {
        otherHeaderConfig['Auth-Key'] = uni.getStorageSync('jscode')
      }
      uni.request({
        url: (options.isBase ? baseAPIURL : baseURL) + url,
        data,
        method,
        header: {
          'content-type': contentType,
          Token: uni.getStorageSync('token'),
          mToken: uni.getStorageSync('mToken'),
          TestFlag: uni.getStorageSync('TestFlag') || '',
          ...otherHeaderConfig,
          ...defineConfig(data)
        },
        success(res) {
          const status = res.statusCode
          const result = res.data
          if (status === 200 || status === 304) {
            if (result?.return_code !== 0) {
              uni.removeStorageSync('keepLoading')
              options.loading && uni.hideLoading()
            }
            resolve(result)
          } else {
            reject(new Error('请检查你的网络'))
          }
        },
        fail(err) {
          uni.removeStorageSync('keepLoading')
          options.loading && uni.hideLoading()
          reject(err || new Error('请检查你的网络'))
        },
        complete() {
          if (!uni.getStorageSync('keepLoading')) {
            options.loading && uni.hideLoading()
          }
          options.barLoading && uni.hideNavigationBarLoading()
        }
      })
    })
  }

  async fetch(config) {
    // 可选。其他配置如loading
    const NEW_OPTIONS = { ...this.DEFAULT_OPTIONS, ...config.options }
    if (NEW_OPTIONS.requireAuth && !uni.getStorageSync('token')) {
      if (this.isLoggingIn) {
        return Promise.resolve()
      }
      return this.login()
    }

    try {
      const res = await this._request({
        ...config,
        options: NEW_OPTIONS
      })
      // 跳过校验的
      const ignoreLogin = config.url && ['biwarehouse/report'].includes(config.url)

      if (~[401, 600012, 600013, 60030].indexOf(res.return_code) && !ignoreLogin) {
        const getToken = config.url.includes('getclerkapprove')
        this.ERROR_COUNT = getToken ? 0 : this.ERROR_COUNT + 1
        const onlyTips = getToken && ~[600013, 60030].indexOf(res.return_code)

        // 判断当前是不是扫码页面, 如果账号被删除重新走一下流程
        const pages = getCurrentPages()
        const hasScanTemplate = pages.some(item => item.route.includes('scan-templates'))
        let scanCustomOptions = uni.getStorageSync('scanCustomOptions')
        const scanOptions = uni.getStorageSync('scanOptions')
        if (~[600013, 600012].indexOf(res.return_code) && scanCustomOptions && hasScanTemplate) {
          if (scanOptions && scanCustomOptions.code !== scanOptions.q) {
            scanCustomOptions.code = scanOptions.q
            scanCustomOptions.transfer = scanOptions.transfer
          }
          // 如果扫码页面，账号被删除或手机号已被修改，即将返回登录页
          scanCustomOptions.isRedirectLogin = true
          const query = Object.entries(scanCustomOptions)
            .map(([key, value]) => `${key}=${value}`)
            .join('&')
          uni.removeStorageSync('token')
          uni.redirectTo({
            url: `/packages/src/transfer/index?${query}`
          })
          const stopErr = new Error('扫码流程跳转完成，停止后续操作')
          stopErr[this.stopFlowSymbol] = true
          throw stopErr
        }
        if (getToken) {
          uni.showModal({
            title: '温馨提示',
            content: res.return_msg,
            showCancel: false,
            success: () => {}
          })
        } else {
          uni.showToast({ title: res.return_msg, icon: 'none' })
        }
        if (!onlyTips) {
          uni.removeStorageSync('token')
          if (this.loginTimer) return
          this.loginTimer = setTimeout(() => {
            this.login()
          }, 3000)
        }
        if (this.ERROR_COUNT > 1) return
        const exitTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const timeOfLogin = { ...uni.getStorageSync('timeOfLogin'), exitTime }
        uploadLog({
          type: ~[60030].indexOf(res.return_code) ? 'system' : 'logout',
          desc: this.ERROR_CODE[res.return_code],
          extend: getToken ? { memberlogin: config.data?.memberlogin, memberloginname: '' } : timeOfLogin,
          data: res
        })
        return
      } else {
        this.ERROR_COUNT = 0
        return Promise.resolve(res)
      }
    } catch (error) {
      if (error[this.stopFlowSymbol]) {
        return
      }
      // 服务器异常等，可以统一提示
      this.ERROR_COUNT = 0
      uni.showToast({ title: '网络异常，请检查您的网络连接', icon: 'none' })
      uploadLog({
        type: 'system',
        desc: '服务器异常',
        extend: { api: config.url },
        data: { error: error || '服务器开小差' }
      })
    }
  }
}

const httpRequest = new HttpRequest()
export const httpPost = (url, params, options = {}) => httpRequest.fetch({ url, data: params, method: 'POST', options })
export const httpGet = (url, params, options) => httpRequest.fetch({ url, data: params, method: 'GET', options })

/**
 * 业务接口包装器
 * @param {String} url 实际请求路径
 * @param {Object} data 参数
 * @param {String} type 类型
 * @param {String} method 请求方式，小写
 * @param {Object} options 配置，可选
 */
export const httpWrap = ({ url, data, type = 1, method = 'get', options = {} } = {}) => {
  const o = {
    1: {
      prefix: '/api/',
      suffix: 'channelassetsrequestapi'
    }, // 防窜业务
    2: {
      prefix: '/api/',
      suffix: 'bigenginerequestapi'
    }, // 大数据引擎
    3: {
      prefix: '/api/',
      suffix: 'memberMpApi'
    }, // 会员中心
    4: {
      prefix: '/api/',
      suffix: 'centerCodeAPIUrl'
    }, // 服务中心
    5: {
      prefix: '/api/',
      suffix: 'activemarketingapi'
    }, // 动销有礼
    6: {
      // 扫码业务
      prefix: '',
      suffix: 'codeScanApi'
    },
    7: {
      // 扫码业务
      prefix: '',
      suffix: 'codeScanApi2'
    },
    8: {
      // 扫码业务
      prefix: '',
      suffix: 'codeScanApi3'
    },
    9: {
      // 装修中心
      prefix: '',
      suffix: 'decrationcenterApi'
    },
    10: {
      prefix: '',
      suffix: 'smartMarketingRewardDispatchApi'
    },
    11: {
      prefix: '',
      suffix: 'smartMarketingScanCodeApi'
    },
    12: {
      prefix: '/api/',
      suffix: 'bigengineywcentapi'
    },
    13: {
      prefix: '/api/',
      suffix: 'accountservicecenterapi'
    }, // 商户服务中心
    14: {
      prefix: '',
      suffix: 'retailcommon/miduobasebackendapi'
    } // 公用接口（如 weizhi/page），不拼接 request 前缀
  }
  const requestUrl = type === 14 ? o[type].suffix : `request/${o[type].suffix}`
  return httpRequest.fetch({
    url: requestUrl,
    data: { url: `${o[type].prefix}${url}`, method, data },
    method: 'POST',
    options
  })
}
