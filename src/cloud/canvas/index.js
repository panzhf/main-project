// 根目录的static下创建js文件夹并创建mixin.js文件
import { apiCloud } from '@/api/cloud-store'
import { staticURL } from '@/config'
export default {
  data() {
    return {
      iconCity: staticURL() + 'personal/icon-city.png',
      iconStore: staticURL() + 'personal/icon-store.png',
      // 推广网点部分
      website: {
        photo: '',
        wxName: '',
        storeName: '',
        city: '',
        time: '',
        code: ''
      },
      httpCode: '',
      httpPhoto: '',
      httpBg: '',
      storeId: '',
      canvasType: 'store' // store 门店  card 会员卡
    }
  },
  computed: {
    canvasHeight() {
      return this.canvasType === 'store' ? 960 : 630
    }
  },

  methods: {
    /** 推广网点 */
    async hanldbranch(type) {
      this.canvasType = type
      await this.fetchStoreInfo()
      await this.fetchMiniCode()
      this.setShareInfo()
    },
    async fetchStoreInfo() {
      let res = await apiCloud({
        url: '/api/v1/Store/GetStoreInfo',
        method: 'get',
        data: JSON.stringify({})
      })

      if (res.return_code !== 0) {
        this.$msg(res.return_msg)
        return
      }

      this.updateWebsiteData(res.return_data)
      this.storeId = res.return_data.Id || ''
    },
    updateWebsiteData(data) {
      this.website.photo = data.UserHeadPath || ''
      this.website.wxName = data.UserNickName || ''
      this.website.storeName = data.Name || ''
      this.website.city = `${data.ProvinceName}${data.CityName}${data.AreaName}${data.Address}`
      this.website.time = data.BusinessHours || ''
    },
    async fetchMiniCode() {
      const str = `storeId=${this.storeId}`
      this.shareQuery = str

      const data = {
        pageUrl: this.canvasType === 'store' ? 'pages/index/index' : 'cloudStore/member/membershipCard',
        parameters: encodeURIComponent(str)
      }

      let res = await apiCloud({
        url: '/api/v1/Store/GetMiniCode',
        method: 'get',
        data: JSON.stringify(data)
      })

      if (res.return_code !== 0) {
        this.$msg(res.return_msg)
        return
      }

      this.processMiniCode(res.return_data)
    },
    processMiniCode(data) {
      if (data && data.state === 0 && data.ImgPath) {
        this.website.code = data.ImgPath.indexOf('https://') === -1 ? 'https:' + data.ImgPath : data.ImgPath
      } else {
        this.$msg('获取小程序码失败')
      }
    },
    // 下载图片,下载到本地，供绘图使用
    downLoadImg(url) {
      return new Promise(resolve => {
        let result = ''
        uni.getImageInfo({
          src: url,
          success(res) {
            result = res.path
            resolve(result)
          },
          fail() {
            uni.showToast({
              title: '下载图片失败',
              icon: 'none'
            })
          }
        })
      })
    },
    /** 生成海报 */
    async setShareInfo() {
      uni.showLoading({
        title: '正在生成图片'
      })
      // 图片下载
      let httpPhoto = ''
      if (this.website.photo) {
        httpPhoto = await this.downLoadImg(this.website.photo)
      }
      let httpCode = await this.downLoadImg(this.website.code)
      if (this.canvasType === 'store') {
        this.iconCity = await this.downLoadImg(this.iconCity)
        this.iconStore = await this.downLoadImg(this.iconStore)
      }
      this.httpCode = httpCode
      this.httpPhoto = httpPhoto
      this.canvasCreat()
    },
    /**
     * ctx： 画布的上下文环境
     * content： 需要绘制的文本内容
     * drawX： 绘制文本的x坐标
     * drawY： 绘制文本的y坐标
     * lineHeight：文本之间的行高
     * lineMaxWidth：每行文本的最大宽度
     * lineNum：最多绘制的行数
     * color：字体颜色
     * fontSize：字体大小
     */
    textPrewrap(ctx, content, drawX, drawY, lineHeight, lineMaxWidth, lineNum, color = '#000', fontSize = '28') {
      var drawTxt = '' // 当前绘制的内容
      var drawLine = 1 // 第几行开始绘制
      var drawIndex = 0 // 当前绘制内容的索引
      ctx.setFillStyle(color)
      ctx.setFontSize(fontSize)
      // 判断内容是否可以一行绘制完毕
      if (ctx.measureText(content).width <= lineMaxWidth) {
        ctx.fillText(content.substring(drawIndex, i), drawX, drawY)
      } else {
        for (var i = 0; i < content.length; i++) {
          drawTxt += content[i]
          if (ctx.measureText(drawTxt).width >= lineMaxWidth) {
            if (drawLine >= lineNum) {
              ctx.fillText(content.substring(drawIndex, i) + '..', drawX, drawY)
              break
            } else {
              ctx.fillText(content.substring(drawIndex, i + 1), drawX, drawY)
              drawIndex = i + 1
              drawLine += 1
              drawY += lineHeight
              drawTxt = ''
            }
          } else {
            // 内容绘制完毕，但是剩下的内容宽度不到lineMaxWidth
            if (i === content.length - 1) {
              ctx.fillText(content.substring(drawIndex), drawX, drawY)
            }
          }
        }
      }
    },
    /** 绘制 */
    canvasCreat() {
      return new Promise(() => {
        let ctx = uni.createCanvasContext('myQrcode')
        this.drawBaseCanvas(ctx)
        if (this.canvasType === 'store') {
          this.drawStoreInfo(ctx)
        }

        this.drawQrCodeAndHint(ctx)

        setTimeout(() => {
          let _this = this
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            width: 630,
            height: this.canvasHeight,
            destWidth: 630,
            destHeight: this.canvasHeight,
            canvasId: 'myQrcode',
            fileType: 'jpg',
            success(res) {
              wx.hideLoading()
              _this.type2 = 'branch'
              _this.$refs.canvasPopup.show(res.tempFilePath)
              _this.shareImg = res.tempFilePath
              // 绘画成功
            },
            fail(err) {
              wx.showToast({
                title: '生成失败,' + err,
                icon: 'none'
              })
            }
          })
        }, 1000)
      })
    },
    drawBaseCanvas(ctx) {
      ctx.setFillStyle('white')
      ctx.fillRect(0, 0, 630, this.canvasHeight)
      ctx.draw(true)
      ctx.stroke() // 不加这句会是下面的arc失效
    },
    drawStoreInfo(ctx) {
      //  商店名称
      ctx.setFontSize(28)
      ctx.setTextAlign('left')
      ctx.setFillStyle('#333333')
      this.textPrewrap(ctx, this.website.storeName, 130, 142, 28, 241, 2)
      ctx.draw(true)
      // 画出店铺图标
      ctx.drawImage(this.iconStore, 80, 120, 30, 30)
      ctx.draw(true)
      // 画出地区图标
      ctx.drawImage(this.iconCity, 80, 200, 30, 30)
      // 地址名称
      this.textPrewrap(ctx, this.website.city, 120, 222, 30, 425, 2, '#333', 24)
    },
    drawQrCodeAndHint(ctx) {
      // 画出二维码
      ctx.drawImage(this.httpCode, 95, this.canvasType === 'store' ? 358 : 40, 440, 440)
      // 画出提示
      ctx.setFontSize(26)
      ctx.setTextAlign('left')
      ctx.setFillStyle('#666666')
      ctx.fillText(`长按识别图中小程序码`, 186, this.canvasType === 'store' ? 890 : 590)
      ctx.draw(true)
    }
  }
}
