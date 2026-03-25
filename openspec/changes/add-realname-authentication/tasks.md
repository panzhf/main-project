## 1. 页面路由配置
- [x] 1.1 在 `pages.json` 中配置实名认证页面（subPackages 中添加 `realname-auth/index` 页面配置）
- [x] 1.2 验证页面路由配置正确，路径与 `uni.navigateTo` 中的路径保持一致

## 2. 页面集成
- [x] 2.1 首页集成实名认证弹窗（使用 realnameAuthPopupMixin）
- [x] 2.2 首页引入 `realname-auth-popup` 组件
- [x] 2.3 首页在 `onShow` 生命周期中调用 `checkRealnameAuthStatus` 检查是否需要弹窗
- [x] 2.4 个人信息页集成实名认证状态展示（使用 realnameAuthStatusMixin）
- [x] 2.5 个人信息页在 `onShow` 生命周期中调用 `fetchRealnameAuthStatus` 获取认证状态
- [x] 2.6 个人信息页添加"实名认证"字段展示，点击跳转到认证页面

## 3. 测试与验证
- [ ] 3.1 功能测试：首页弹窗显示流程
- [ ] 3.2 功能测试：个人信息页状态展示
- [ ] 3.3 功能测试：提现页认证校验流程（已在 packages 中实现）
- [ ] 3.4 功能测试：认证提交流程
- [ ] 3.5 功能测试：认证成功后状态更新
- [ ] 3.6 端到端测试：完整认证流程（从首页弹窗到完成认证）
