import { msg } from '@/utils'
const copy = (content, successMsg = '复制成功', emptyMsg = '复制内容不能为空') => {
  if (!content) {
    return msg(emptyMsg)
  }
  // 复制内容，必须字符串，数字需要转换为字符串
  content = typeof content === 'string' ? content : content.toString()
  //#ifndef H5
  uni.setClipboardData({
    data: content,
    success() {
      msg(successMsg, { icon: 'success' })
    }
  })
  //#endif
  //#ifdef H5
  if (!document.queryCommandSupported('copy')) {
    //为了兼容有些浏览器 queryCommandSupported 的判断
    // 不支持
    msg('浏览器不支持')
  }
  let textarea = document.createElement('textarea')
  textarea.value = content
  textarea.readOnly = 'readOnly'
  document.body.appendChild(textarea)
  textarea.select() // 选择对象
  textarea.setSelectionRange(0, content.length) //核心
  let result = document.execCommand('copy') // 执行浏览器复制命令
  if (result) {
    msg(successMsg, { icon: 'success' })
  } else {
    msg('复制失败')
  }
  textarea.remove()
  //#endif
}
export default copy
