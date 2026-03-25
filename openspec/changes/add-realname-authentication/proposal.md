# Change: Add Realname Authentication Feature

## Why
根据《中华人民共和国个人所得税法实施条例》规定，品牌商需要开通个税代缴功能。为了符合法规要求并保护用户权益，系统需要实现实名认证功能，确保用户完成个人信息认证后才能获得佣金或奖励。该功能需要在多个场景下使用：首页提醒、提现前校验、个人信息页展示认证状态。

## What Changes
- **使用共用实名认证组件**：复用 `packages` 中已有的实名认证页面、弹窗组件、mixin 和 API 接口（已在 distribution-assistant-mp 中开发完成）
- **配置实名认证页面路由**：在 `pages.json` 中注册实名认证页面
- **集成实名认证功能到各个页面**：
  - 首页集成实名认证弹窗（使用 realnameAuthPopupMixin）
  - 个人信息页集成实名认证状态展示（使用 realnameAuthStatusMixin）
  - 提现页集成实名认证校验（使用 realnameAuthPopupSimpleMixin）

## Impact
- **Affected specs**: 新增 `realname-authentication` capability
- **Affected code**:
  - `pages/index/index.vue` - 首页集成实名认证弹窗
  - `personal/info.vue` - 个人信息页集成实名认证状态展示
  - `pages.json` - 新增实名认证页面配置（需要在 subPackages 中注册 `realname-auth/index` 页面）
- **共用组件**（已在 distribution-assistant-mp 中开发完成，直接使用）：
  - `packages/src/personal/realname-auth/index.vue` - 实名认证主页面
  - `packages/src/components/realname-auth-popup/index.vue` - 弹窗组件
  - `packages/src/mixins/realname-auth.js` - 状态管理 mixin
  - `packages/src/api/realname-auth.js` - API接口定义
  - `packages/src/personal/change/index.vue` - 提现页（已集成实名认证校验）
