# Design: Realname Authentication Feature

## Context
根据《中华人民共和国个人所得税法实施条例》规定，品牌商需要开通个税代缴功能。系统需要实现实名认证功能，确保用户完成个人信息认证后才能获得佣金或奖励。该功能需要在多个场景下使用，包括首页提醒、提现前校验、个人信息页展示等。

**重要说明**：实名认证的核心组件（页面、弹窗组件、mixin、API接口）已在 `distribution-assistant-mp` 项目中开发完成，位于 `packages` 目录下，属于共用组件。在 `retail-assistant-mp` 中只需要：
1. 在 `pages.json` 中配置实名认证页面路由
2. 在各个页面中引入共用的 mixin 和组件
3. 调用相应的生命周期方法或事件处理函数

## Goals / Non-Goals

### Goals
- 实现实名认证信息收集和提交
- 实现认证状态的统一管理
- 实现弹窗提醒机制（可配置"7天内不再提示"）
- 实现数据加密传输和存储
- 实现品牌商名单控制（仅签约品牌商显示）
- 适配零售小程序（MP-RETAIL）

### Non-Goals
- 不实现第三方实名认证服务集成（由后端处理）
- 不实现身份证OCR识别（需手动输入）
- 不实现认证信息的编辑功能（只能提交一次）

## Decisions

### Decision: 使用 mixin 封装公共逻辑
**Rationale**: 实名认证功能在多个页面使用（首页、个人信息页、提现页），存在大量重复的状态获取、弹窗控制、导航跳转逻辑。使用 mixin 可以减少代码重复，便于维护。

**Alternatives considered**:
- Vuex store：状态管理更规范，但增加复杂度，且部分逻辑是页面级而非全局状态
- 工具函数：轻量级，但无法直接访问组件实例的方法（如 `this.$ck`）

**Trade-offs**: 
- 优点：代码复用性强，逻辑集中，易于维护
- 缺点：mixin 可能导致代码可读性降低（需查看 mixin 源码才能理解完整逻辑）

### Decision: 使用 AES 加密传输敏感数据
**Rationale**: 姓名和身份证号属于敏感个人信息，需要在传输和存储过程中加密保护。使用 AES 加密算法，由后端统一管理密钥。

**Alternatives considered**:
- Base64 编码：不是加密算法，安全性不足
- RSA 加密：安全性更高，但性能开销大，且需要密钥交换机制

**Trade-offs**:
- 优点：安全性好，性能可接受，实现简单
- 缺点：密钥管理依赖后端，前端密钥泄露风险需后端防护

### Decision: 使用接口判断是否显示弹窗和功能入口
**Rationale**: 不是所有品牌商都开通实名认证功能，只有签约品牌商才需要显示。通过 `DisplayWindow` 接口判断是否弹窗，通过 `Contract` 接口判断是否在名单内。

**Alternatives considered**:
- 前端配置：不够灵活，需要重新发布才能更新
- 品牌信息字段：增加品牌信息复杂度，且需要后端预先配置

**Trade-offs**:
- 优点：灵活可控，后端可动态调整
- 缺点：增加接口调用次数，需要处理接口失败的情况

### Decision: 兼容不同存储结构
**Rationale**: 零售小程序（MP-RETAIL）使用的本地存储 key 与其他小程序不同。需要在获取参数时兼容这些差异。

**Implementation**: 参考 `wx-log.js` 中的 `uploadLog` 函数逻辑，使用条件编译（`#ifdef`）和动态 key 选择实现兼容。对于 MP-RETAIL，使用 `storeSettingInfo` 获取品牌商信息，使用 `accountinfo` 获取手机号。

## Risks / Trade-offs

### Risk: 加密/解密失败导致数据异常
**Mitigation**: 
- 使用 try-catch 捕获解密异常
- 解密失败时使用原始数据，并上报错误日志
- 提供用户友好的错误提示

### Risk: 接口调用失败影响用户体验
**Mitigation**:
- 所有接口调用使用静默失败策略（catch 中不提示用户）
- 弹窗判断失败时默认不弹窗，避免阻断用户正常使用
- 状态获取失败时显示默认状态（未认证）

### Risk: mixin 过度使用导致代码可读性降低
**Mitigation**:
- 保持 mixin 职责单一，一个 mixin 只处理一个方面（状态、弹窗、导航）
- 使用清晰的命名（`realnameAuthStatusMixin`、`realnameAuthPopupMixin`）
- 在 mixin 中添加详细注释说明

## Important Constraints

### Uni-app 页面配置约束
- **小程序中新增页面需要在 `pages.json` 中配置**：实名认证页面 `packages/src/personal/realname-auth/index.vue` 需要在 `pages.json` 的 `subPackages` 中注册，路径为 `realname-auth/index`，并配置导航栏标题为"实名认证"
- 页面路径必须与 `uni.navigateTo` 中的路径保持一致
- 分包页面需要在对应的 `subPackages` 节点下配置

### API 接口类型约束
- 零售小程序（MP-RETAIL）使用 `type: 4` 作为接口类型标识
- API 接口需要通过 `httpWrap` 方法调用，并指定正确的 `type` 参数

## Migration Plan
该功能为新增功能，不影响现有业务逻辑。实施步骤：
1. 确认共用组件已存在（`packages` 目录下的实名认证相关文件已在 distribution-assistant-mp 中开发完成）
2. 在 `pages.json` 中配置实名认证页面路由
3. 在各个页面中集成共用的 mixin 和组件
4. 测试验证各个页面的集成效果
5. 灰度测试验证
6. 全量发布

## Open Questions
- 认证成功后是否需要重新登录？目前实现为自动刷新状态
- 认证信息修改流程如何处理？目前只支持首次提交
- 多个品牌商之间的认证状态是否共享？目前实现为按品牌商独立管理
