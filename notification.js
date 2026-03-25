const axios = require('axios')
const argv = require('minimist')(process.argv.slice(2))

function sendMsg() {
  const ENV = argv.b === 'prod' ? '生产环境' : '测试环境'
  const markdownData = {
    msgtype: 'markdown',
    markdown: {
      content: `发布版本
> 类型：<font color="info">万能零售助手</font>
> 环境：<font color="warning">${ENV}</font>`
    }
  }
  return axios({
    headers: { 'Content-Type': 'application/json' },
    method: 'post',
    url: argv.u,
    data: markdownData
  })
}
sendMsg()
