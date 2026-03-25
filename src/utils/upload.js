import { baseURL } from '@/config'
import defineConfig from '@/utils/header'
import { msg, loading, compareVersion } from '@/utils'
import log from 'packages/utils/wx-log'
import { getJsCode } from '@/utils/set-mp'
export async function uploadImg(filePath, showLoading = true) {
  const jsCode = await getJsCode()
  return new Promise((resolve, reject) => {
    showLoading && loading.show('图片上传中')
    uni.uploadFile({
      url: baseURL + 'commanage/uploadimage',
      filePath,
      name: 'path',
      header: {
        ...defineConfig({}),
        // 'content-type': 'multipart/form-data',
        Token: uni.getStorageSync('token')
      },
      formData: {
        path: filePath,
        js_code: jsCode
      },
      success(res) {
        showLoading && loading.hide()
        const result = JSON.parse(res.data)
        // console.log('result', result)
        if (result.return_code !== 0) {
          log.error({
            type: 'uploadImage',
            data: JSON.stringify(result)
          })
          return msg(result.return_msg || '上传失败,请重试！')
        }
        resolve(result)
      },
      fail(err) {
        showLoading && loading.hide()
        log.error({
          type: 'uploadImage',
          data: JSON.stringify(err)
        })
        msg('上传失败,请重试！')
        reject(new Error(err))
      }
    })
  })
}

const formatSize = (size = 0) => {
  if (size < 1024) return `${size}B`
  else if (size < 1024 * 1024) return `${Math.floor(size / 1024)}KB`
  else return `${Math.floor(size / 1024 / 1024)}MB`
}
const formatMedia = type => {
  if (type.length === 1) {
    if (type[0] === 'image') return '图片'
    else return '视频'
  } else return '文件'
}
/**
 * 选择图片，根据resolve是否为空判断成功
 * `const paths = await chooseImg()
 * if (paths?.length) {// 选择图片成功}`
 *
 * @param mediaType uni.chooseMedia使用，默认支持视频和图片
 * @param limit 开启限制大小，默认不限制
 * @param maxsize 限制大小，默认5M，单位B
 * @param count 一次最多选取图片张数，网络原因限制最多9张，默认1
 */
export function chooseImg({
  mediaType = ['image', 'video'],
  sizeType = ['compressed'],
  sourceType = ['album', 'camera'],
  limit = false,
  maxsize = 5 * 1024 * 1024,
  count = 1
} = {}) {
  if (count > 9 || count < 1) {
    throw new Error('最多可选文件数：1~9')
  }
  const newVersion = compareVersion('2.10.0')
  return new Promise(resolve => {
    if (newVersion) {
      uni.chooseMedia({
        count,
        mediaType,
        sizeType,
        sourceType,
        success: ({ tempFiles }) => {
          if (limit && tempFiles.some(item => item.size > maxsize)) {
            return msg(`${formatMedia(mediaType)}最大${formatSize(maxsize)}`)
          }
          resolve(tempFiles.map(item => item.tempFilePath))
        },
        fail(res) {
          !res.errMsg.includes('cancel') && msg('请稍后重试')
          resolve()
        }
      })
    } else {
      uni.chooseImage({
        count,
        sizeType,
        sourceType,
        success: ({ tempFiles }) => {
          if (limit && tempFiles.some(item => item.size > maxsize)) {
            return msg(`${formatMedia(['image'])}最大${formatSize(maxsize)}`)
          }
          resolve(tempFiles.map(item => item.path))
        },
        fail(res) {
          !res.errMsg.includes('cancel') && msg('请稍后重试')
          resolve()
        }
      })
    }
  })
}
