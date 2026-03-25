# retail-assistant-mp

万能零售助手小程序。

## 起步
### 配置
项目使用`lf`作为统一换行符，`vscode` 编辑器打开【文件】-【首选项】-【设置】，搜索`end of line`，设置为`lf`。

`prettier`会警告`crlf`，为了保持项目统一，同时`git`设置：
```bash
# 提交时转为lf，检出时不转换
git config --global core.autocrlf input
```

### 运行
使用 `yarn` 作为包管理工具，改写了默认 `uni-app` 的 `serve` 和 `build` 指令为**微信小程序**

```bash
yarn install
# 运行微信小程序
yarn serve
# 构建微信小程序
yarn build
```

vue 配置 参考 [Configuration Reference](https://cli.vuejs.org/config/).

## 命名规范
1. 目录和文件名采用`kebab-case`命名
2. 类、构造函数和装饰器采用`PascalCase`命名
3. 普通函数、变量、参数采用`camelCase`命名
4. 常量推荐采用`CONSTANT_CASE`命名
5. `page.json`中`path`同文件名(`kebab-case`)
6. `vue`文件的`class`名(`name`属性)采用`PascalCase`命名
7. 导出的API接口推荐采用`camelCase`命名并以`api`作前缀，格式 `apiXxYy`

## 组件库
[uview-ui](https://www.uviewui.com/components/intro.html)

## 文件说明
### uni.scss
放置scss变量，建议把颜色等变量定义在此文件，统一维护且方便后期主题色更换

### utils/index.js

封装了一些工具集等

### utils/decorator.js

装饰器集合

### utils/request.js

通用请求，使用装饰器防重复登录，可根据业务场景修改。基于 `uni.request` 封装，理论上全端兼容，有特殊端自行根据文档调整逻辑或参数。

### mixins

- loadMoreMixin

通用**上拉加载**，由于定义了一个`getData`获取数据的方法，需要在引入`mixin`的地方自定义`getData`函数。可以定义标志变量用于防重复请求，这里采用`busy`

```js
getData() {
  if (this.busy) return
  this.busy = true
  const nextPage = this.paging.page + 1
  API({
    Page: nextPage,
    PageSize: this.paging.pageSize,
    ...this.otherParams
  }).then(res => {
    if (this.ck(res)) {
      this.dealRes(res, nextPage)
      // 其他业务逻辑
    }
    this.busy = false
  }).catch(() => {
    this.busy = false
  })
}
```

- subscribeMsgMixin

**消息订阅**，封装了基本的`requestSubscribeMsg`。如果返回数据表示成功调起订阅界面，否则失败，失败时会自动提示。

```js
const res = await this.requestSubscribeMsg(this.noticeTempList)
// 处理用户选择的数据
if (res) {
  // 筛选允许的模板
  this.acceptList = this.noticeTempList.filter(item => res[`${item}`] === 'accept')
  // 提交允许模板
  this.uploadAcceptList()
}
```

## 提交

内置了 `Commitizen` ，用于提交规范的 `git message`，简单使用（命令式）

```bash
git add .
# 这步会出现一些交互式命令
git cz
git push origin master
```
