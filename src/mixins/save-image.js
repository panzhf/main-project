export default {
  data() {
    return {
      shareImg: '', // 用于保存到相册的图片
      canSaveToAlbum: true,
      isSaving: false
    }
  },
  methods: {
    downloadImg(t) {
      let u = t.replace(/^(http:)?(\/\/)/, 'https:$2')
      return new Promise((resolve, reject) => {
        uni.downloadFile({
          url: u,
          success(res) {
            resolve(res.tempFilePath)
          }
        })
      })
    },
    getImgInfo(t) {
      let u = t.replace(/^(http:)?(\/\/)/, 'https:$2')
      return new Promise((resolve, reject) => {
        uni.getImageInfo({
          src: u,
          success(res) {
            resolve(res)
          },
          fail(err) {
            console.log(err)
          }
        })
      })
    },
    drawText(ctx, txt, x, y, w, lh = 42) {
      let { row } = this.calcTxtLine(ctx, txt, x, y, w)
      for (let b = 0; b < row.length; b++) {
        ctx.fillText(row[b], x, y + (b + 1) * lh) // 设置字体行高
      }
    },
    calcTxtHeight(ctx, txt, x, y, w, fs, lh = 42) {
      let { row } = this.calcTxtLine(ctx, txt, x, y, w)
      let h = 0
      for (let b = 0; b < row.length; b++) {
        h += b === 0 ? fs : lh
      }
      return h
    },
    calcTxtWidth(ctx, txt, x, y, w) {
      let { row } = this.calcTxtLine(ctx, txt, x, y, w)
      return row.length > 1 ? w : ctx.measureText(txt).width
    },
    calcTxtLine(ctx, txt, x, y, w) {
      // ctx：canvas对象，txt：绘制的文字，x,y:文字坐标，w：文字最大宽度
      let chr = txt && txt.split('')
      let temp = ''
      let row = []

      for (let a = 0; a < chr.length; a++) {
        if (ctx.measureText(temp).width < w && ctx.measureText(temp + chr[a]).width <= w) {
          temp += chr[a]
        } else {
          row.push(temp)
          temp = chr[a]
        }
      }
      row.push(temp)
      return {
        row
      }
    },
    saveToAlbum() {
      let vm = this
      if (this.isSaving) return
      this.isSaving = true
      uni.saveImageToPhotosAlbum({
        filePath: vm.shareImg,
        success(res) {
          uni.showToast({
            title: '图片保存成功',
            icon: 'success',
            duration: 3000
          })
        },
        fail() {
          uni.showToast({
            title: '图片保存失败',
            icon: 'none'
          })
        },
        complete() {
          vm.isSaving = false
        }
      })
    },
    saveImg() {
      if (!this.shareImg) return
      let vm = this
      if (!this.canSaveToAlbum) {
        uni.openSetting({
          success(res) {
            if (res.authSetting['scope.writePhotosAlbum']) {
              vm.canSaveToAlbum = true
              vm.saveToAlbum()
            }
          }
        })
      } else {
        uni.getSetting({
          success(res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
              uni.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  vm.canSaveToAlbum = true
                  vm.saveToAlbum()
                },
                fail() {
                  vm.canSaveToAlbum = false
                  uni.showModal({
                    title: '提示',
                    content: '需要您授权保存相册',
                    showCancel: false
                  })
                }
              })
            } else {
              vm.canSaveToAlbum = true
              vm.saveToAlbum()
            }
          }
        })
      }
    }
  }
}
