# Project Context

## Purpose
万能零售助手小程序（Retail Assistant Mini Program）- 一个面向门店的微信小程序，为门店提供全方位的运营管理功能，包括门店管理、订单管理、商品管理、营销活动、扫码核销、会员管理等。

### 核心功能
- **门店管理**：门店信息维护、店员管理、门店审核
- **订单管理**：订单查询、订单详情、订单统计
- **商品管理**：商品列表、库存管理、商品分类
- **营销活动**：优惠券、红包、促销活动、拼团、秒杀
- **扫码功能**：扫码核销、扫码查询、防伪查询
- **会员管理**：会员信息、会员统计
- **云店管理**：分销管理、商品管理、服务管理

## Tech Stack

### 核心框架
- **uni-app** (2.0.0-32920211029004) - 跨平台应用开发框架
- **Vue.js** (2.6.14) - 前端框架
- **Vuex** (3.2.0) - 状态管理，配合 vuex-persistedstate 实现持久化
- **uView UI** (1.0.4) - UI 组件库

### 语言与预处理器
- **JavaScript** (ES6+) - 主要开发语言
- **SCSS/Sass** (1.35.2) - CSS 预处理器

### 构建与工具链
- **Vue CLI** (~4.5.0) - 项目构建工具
- **@dcloudio/vue-cli-plugin-uni** - uni-app CLI 插件
- **Babel** (~7.12.0) - JavaScript 编译器
- **Webpack** - 模块打包工具（通过 Vue CLI）

### 代码质量
- **ESLint** (7.27.0) - 代码检查
- **Prettier** (2.3.2) - 代码格式化
- **Commitizen** (3.3.0) - Git 提交规范

### 工具库
- **dayjs** (1.11.9) - 日期处理
- **crypto-js** (4.2.0) - 加密工具
- **blueimp-md5** (2.18.0) - MD5 加密
- **wxmp-rsa** (2.1.0) - 微信小程序 RSA 加密
- **miduo-utils** (1.0.3) - 内部工具库

### 平台特定
- **微信小程序** - 目标平台（mp-weixin）
- **@dcloudio/uni-mp-weixin** - 微信小程序适配

## Project Conventions

### Code Style

#### 命名规范
1. **目录和文件名**：采用 `kebab-case` 命名（如 `store-manage`, `order-list.vue`）
2. **Vue 组件 name**：采用 `PascalCase` 命名
3. **类、构造函数、装饰器**：采用 `PascalCase` 命名
4. **函数、变量、参数**：采用 `camelCase` 命名
5. **常量**：推荐采用 `CONSTANT_CASE` 命名
6. **API 接口**：采用 `camelCase` 命名并以 `api` 作前缀，格式 `apiXxYy`

#### 代码格式
- **换行符**：统一使用 `LF` (Line Feed)
- **引号**：使用单引号 `'`
- **分号**：不使用分号（semi: never）
- **缩进**：2 空格
- **最大行长**：无硬性限制，但建议保持代码可读性

#### ESLint 配置要点
- 基于 `eslint:recommended` 和 `plugin:vue/recommended`
- 禁用控制台警告（开发环境）
- 允许未使用的变量（警告级别）
- Vue 组件选项顺序强制规范

### Architecture Patterns

#### 目录结构
```
src/
├── api/                 # API 接口定义
├── components/          # 公共组件
├── mixins/             # 混入（Mixins）
├── pages/              # 页面（主包）
├── pagesA/             # 分包 A
├── store/              # Vuex 状态管理
├── utils/              # 工具函数
├── styles/             # 全局样式
├── config/             # 配置文件
└── packages/           # 共享包（跨项目复用）
```

#### 组件设计
- **原子化设计**：小型、可复用的基础组件
- **业务组件**：组合基础组件形成业务功能
- **页面组件**：使用 `.vue` 文件，遵循 uni-app 页面规范

#### 状态管理
- **Vuex**：用于全局状态管理（用户信息、门店信息、主题配置等）
- **vuex-persistedstate**：状态持久化到 localStorage
- **模块化**：按功能领域划分 modules

#### API 设计
- 统一的 `request.js` 封装
- 装饰器模式防重复登录
- 接口按业务模块分文件（如 `api/store.js`, `api/order.js`）
- 使用 `$ck` 全局方法统一处理响应

#### Mixins 使用
- **loadMoreMixin**：通用上拉加载
- **subscribeMsgMixin**：消息订阅
- **globalThemeMixin**：全局主题
- **scanCodeMixin**：扫码功能
- 其他特定业务 mixins

### Testing Strategy
- 目前主要依赖手动测试和微信开发者工具调试
- 使用 `uni-automator` 进行自动化测试（已安装但未大规模应用）
- 建议在关键业务流程添加单元测试和集成测试

### Git Workflow

#### 分支策略
- `prod`：生产环境分支
- `test`：测试环境分支
- `develop`：开发分支
- `feature/*`：功能分支
- `bugfix/*`：bug 修复分支

#### 提交规范（Commitizen）
使用 Conventional Commits 规范：
```bash
git add .
git cz  # 交互式提交
```

提交类型：
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

#### Git 配置
```bash
# 提交时转为 LF，检出时不转换
git config --global core.autocrlf input
```

## Domain Context

### 业务角色
1. **店主**（roleType: 1）：门店拥有者
2. **负责人**（roleType: 2）：门店管理员，拥有编辑权限
3. **店员**（roleType: 3）：普通员工，权限受限

### 关键业务概念
- **门店（Store）**：零售商的物理或虚拟店铺
- **核销（Write-off）**：优惠券、活动等权益的使用验证
- **返货券（Return Coupon）**：返利类营销工具
- **现金券（Cash Coupon）**：现金等价营销工具
- **云店（Cloud Store）**：线上商城功能
- **扫码查询**：产品防伪、溯源查询

### 数据字段映射
- `storename`: 店铺名称
- `shopfor`: 店铺门头图片
- `percapita`: 人均价格
- `businesshours`: 营业时间
- `characteristic`: 特色服务
- `storeimg`: 门店图片（多张，逗号分隔）
- `phoneno`: 门店电话

### 业务规则
1. 人均价格必须是大于零的整数，最多10位
2. 门店图片最多9张，尺寸 640*340px
3. 店铺名称和负责人必填
4. 只有负责人（roleType === 2）才能编辑门店信息
5. 店员可以退出门店，但无编辑权限

## Important Constraints

### 技术约束
1. **平台限制**：仅支持微信小程序平台
2. **uni-app 版本**：2.0.0-32920211029004
3. **Vue 版本**：2.6.14（Vue 2）
4. **Node 版本**：建议 14.x 或 16.x
5. **包管理器**：使用 yarn

### 性能约束
1. 图片上传最多9张，需控制上传并发
2. 列表加载使用分页，默认 PageSize 控制
3. 避免大量数据同时渲染

### 微信小程序约束
1. 包大小限制：主包不超过 2MB，总包不超过 20MB
2. 使用分包加载策略（pages 和 pagesA，还有更多）
3. 需要遵循微信小程序审核规范
4. 隐私政策弹窗必须集成（PrivacyPopup 组件）

### 安全约束
1. 敏感信息加密传输（RSA）
2. 店员身份下部分信息脱敏显示（手机号、负责人姓名）
3. Token 认证机制

### UI/UX 约束
1. 使用 uView UI 组件库，保持设计一致性
2. 支持主题色定制（themeVars）
3. 适配安全区域（iPhone 刘海屏等）
4. 遵循微信小程序设计规范

## External Dependencies

### 微信平台
- **微信开放平台 API**：登录、用户信息、支付等
- **微信小程序 API**：扫码、位置、图片上传等
- **腾讯地图 API**（qqmap-wx-jssdk.js）：地图定位功能

### 后端 API
- **Base URL**：配置在 `config/index.js`
- **认证方式**：Token-based
- **主要接口模块**：
  - `/commanage/*` - 通用管理
  - `/store/*` - 门店管理
  - `/order/*` - 订单管理
  - `/goods/*` - 商品管理
  - `/activity/*` - 活动管理
  - `/member/*` - 会员管理

### 第三方服务
- **七牛云**：图片存储（基于 uploadImg 实现）
- **日志服务**：wx-log 封装的日志上报

### 共享包依赖
- **packages**：跨项目共享的组件和工具
  - `packages/components/*` - 共享组件
  - `packages/utils/*` - 共享工具函数
  - `packages/filters/*` - 共享过滤器

### CDN 资源
- 静态资源通过 `staticURL()` 方法获取
- 图片使用七牛云等 CDN 服务，支持图片处理参数（如缩略图）

## Additional Notes

### 开发环境设置
```bash
# 安装依赖
yarn install

# 开发模式（微信小程序）
yarn serve

# 生产构建
yarn build

# 代码检查
yarn lint
```

### 调试工具
- 微信开发者工具
- Vue DevTools（H5 调试）
- uni-app 官方调试工具

### 常用全局方法
- `this.$ck(res, showMsg)` - 检查响应结果
- `this.$msg(message)` - 显示提示消息
- `this.$loading` - 显示/隐藏加载动画
- `this.$navPage(url)` - 页面导航
- `this.$goBack()` - 返回上一页
- `this.$log()` / `this.$uploadLog()` - 日志记录

### 注意事项
1. 不要在 `packages/` 目录下的文件运行 ESLint（已忽略）
2. 图片资源优先使用 CDN
3. 样式变量定义在 `uni.scss` 和 `styles/mixins.scss`
4. 页面路由在 `pages.json` 中配置
5. 条件编译使用 `#ifdef MP-RETAIL` 等标识
