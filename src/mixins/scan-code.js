/*
 * @Description 用于扫一扫
 */
import { apiScanSourceCodeWriteOff, apiScanCodeWriteoff, apiScanSourcecodeInfo, apiIsNCode } from '@/api/pick-coupon'
const scanCodeMixmin = {
  data() {
    return {
      isCheckAuth: true, //核销权限
      isFromIndex: true, //从哪里扫
      codeType: 0, // 码的类型 0-默认(流程继续);1-提领劵核销;2-实物核销;3-返货券核销,4-动销码领奖
      locationInfo: {}, // 地理位置
      isScan: false
    }
  },
  methods: {
    // 判断是否为实物礼品线下核销
    isPhysicalGiftWriteOff(result) {
      return result.startsWith('SW') && result.includes('-')
    },
    // 扫码的回调
    handleScanCode(from) {
      this.$store.dispatch('updateWriftoffResult', {})
      if (typeof this.overdueChecked === 'function' && !this.overdueChecked()) return
      if (!this.isCheckAuth) return this.$msg('核销失败，你没有核销权限')
      this.isScan = true
      uni.scanCode({
        onlyFromCamera: false,
        scanType: ['qrCode', 'barCode'],
        success: async res => {
          let { result } = res
          setTimeout(() => {
            this.isScan = false
          }, 500)
          if (!result) return this.$msg('扫码失败，请重试')
          // 自动过滤首尾无效字符（空格、换行、制表符）
          result = result.trim()
          // 判断是否为N元换购实物礼品线下核销
          const isPhysicalGift = this.isPhysicalGiftWriteOff(result)
          // N元换购单独拆一个接口
          if (from === 'convert' || isPhysicalGift) {
            this.scanSourceCodeWriteOff(result, isPhysicalGift ? 'convert' : from)
            return
          }
          // 云店核销
          let fdStart2 = result.indexOf('/ordercheck/?orderNumber')
          // 智能营销核销--提领券/--实物兑换
          let fdStart3 = result.indexOf('/TransferScanCode')
          let data, type
          if (fdStart2 > 0) {
            data = result.split('&')
            if (data.length === 0) return this.$msg('扫码失败，请重试')
            data[0] = data[0].split('=')[1]
            data[1] = data[1].split('=')[1]
            data[2] = data[2] && data[2].split('=')[1]
            data[3] = data[3] && data[3].split('=')[1]
            type = 0
            this.checkOrderFn(data, type)
          } else if (fdStart3 > 0) {
            // 码格式 http://md.t.miduonet.com/Stores/TransferScanCode.aspx?m=10003911&code=0605-289-03Jb7vw6hreeig8i-18787
            data = result.split('&').map(item => item.split('=')[1] || '')
            if (data.length < 2 || !data[0] || !data[1]) return this.$msg('扫码失败，请重试')
            // data[1]包含-字符为实物兑换核销,否则为提领券核销
            if (data[1].includes('-')) {
              data[2] = 'materialCoupon'
              data[3] = 0
            } else {
              // 示例 https://md.t.miduonet.com/Stores/TransferScanCode.aspx?m=10003911&code=EV175091733278827624
              // https://md.t.miduonet.com/Assistant/Stores/TransferScanCode?m=10006138&code=Batchb002d924ce365d6a
              data[2] = 'pickupCoupon'
              data[3] = data[1].startsWith('EV') ? 0 : 1 // 以EV为前缀单个核销--0 否则为批量--1(提领券)
            }
            this.checkOrderFn(data, type)
          } else {
            // 这里做核销
            // 先判断码的类型
            let codeRes = await apiScanSourcecodeInfo({ code: result })
            if (!this.$ck(codeRes)) {
              return
            }
            this.codeType = codeRes.return_data.type

            if (this.codeType === 4) {
              const pages = getCurrentPages()
              const pageUrl = '/' + pages[pages.length - 1].route || ''
              if (pageUrl !== '/scans/scan/detail') {
                uni.navigateTo({
                  url: `/scans/scan/detail?code=${result}`
                })
              } else {
                this.handleScanLocation && this.handleScanLocation(result)
              }
              return
            }
            // 如果是物流码且支持登记，就显示登记成功弹窗
            if (this.codeType === 5) {
              if (from === 'index' && this.$refs.registerDialog) {
                this.$refs.registerDialog.show(result)
              } else {
                this.$msg('此码无法识别')
              }
              return
            }
            this.scanSourceCodeWriteOff(result)
          }
        }
      })
    },
    async scanSourceCodeWriteOff(code, from) {
      let data, type
      //  智能营销码，动销码核销
      const writeoffApi = from === 'convert' ? apiScanCodeWriteoff : apiScanSourceCodeWriteOff
      try {
        const sourceCodeRes = await writeoffApi({
          code,
          type: this.codeType,
          // 添加经纬度
          ...this.locationInfo
        })
        // 日志
        if (sourceCodeRes.return_code !== 0) {
          this.$uploadLog({ type: 'scanCode', desc: this.codeType, data: sourceCodeRes, extend: { code } })
        }
        if (sourceCodeRes.return_code === 0) {
          let { prizetype, prizecode } = sourceCodeRes.return_data
          //prizetype：1提领券   2实物   3返货券
          let prizeTypeText = ''
          switch (prizetype) {
            case 1:
              prizeTypeText = 'pickupCoupon'
              break
            case 2:
              prizeTypeText = 'materialCoupon'
              break
            case 3:
              prizeTypeText = 'returnCoupon'
              break
            default:
              break
          }
          if (prizetype === 3) {
            // 返货券直接返回核销结果,其他不直接返回核销结果
            return this.resuleDataProcess(sourceCodeRes, prizeTypeText)
          }
          data = []
          data[0] = '' // 商户编号
          data[1] = prizecode // 码内容
          data[2] = prizeTypeText // 码类型
          data[3] = 0 // 单个核销
          this.checkOrderFn(data, type)
        } else {
          // N元换购失败时也跳转到结果页
          const isConvert = from === 'convert'

          if (isConvert) {
            // 跳转到核销结果页显示失败信息
            return this.resuleDataProcess(sourceCodeRes, 'returnCoupon')
          }

          // 其他情况保持原有的提示逻辑
          let msg = sourceCodeRes.return_msg ? sourceCodeRes.return_msg : '此码无法识别，请检查后重试'
          if (msg.includes('品牌商未开启扫源码核销功能，') && typeof this.showTips === 'function') {
            this.showTips(msg)
          } else {
            // N元换购失败时跳转到结果页显示失败信息，其他保持原提示
            const nCodeRes = await apiIsNCode({ code, type: this.codeType })
            if (nCodeRes.return_code === 0 && nCodeRes.return_data) {
              this.resuleDataProcess(sourceCodeRes, 'returnCoupon')
            } else {
              this.$msg(msg)
            }
          }
        }
      } catch (err) {
        this.$uploadLog({ type: 'scanCode', desc: this.codeType, data: err })
        this.$msg('网络异常，请重试！')
      }
    },
    async checkOrderFn(data, type) {
      //type:0--云店  否则为智能核销-实物兑换/-提领券核销
      if (!this.isCheckAuth) return this.$msg('核销失败，你没有核销权限')
      if (type === 0) {
        uni.reLaunch({
          url: `/pages/write-off/scan-code?orderNumber=${data[0]}&checkCode=${data[1]}&type=${
            data[2]
          }&CheckCodeTimestamp=${data[3]}&scene=${data[4] || 0}`
        })
      } else {
        if (data[0]) {
          // 如果有品牌商编号则需要判断码关联的品牌与当前品牌是否一致
          await this.autoSwitchStore(data[0])
        }
        let url = `/pages/write-off/index?m=${data[0]}&code=${data[1]}&type=${data[2]}&isbatch=${data[3]}`
        uni.reLaunch({
          url: url
        })
      }
    },
    resuleDataProcess(res, type) {
      let result = res.return_code === 0 ? 'success' : 'fail'
      res.return_data && res.return_data.goodsvoucher && Object.assign(res.return_data, res.return_data.goodsvoucher)
      this.$store.dispatch('updateWriftoffResult', res)
      uni.reLaunch({
        url: `/pages/write-off/result?type=${type}&result=${result}&isbatch=0`
      })
    }
  }
}

export default scanCodeMixmin
