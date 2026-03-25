# Realname Authentication

## ADDED Requirements

### Requirement: Realname Authentication Page
系统 SHALL 提供实名认证页面，允许用户输入姓名和身份证号进行认证。

#### Scenario: User submits authentication information
- **WHEN** 用户进入实名认证页面
- **AND** 用户输入姓名和身份证号
- **AND** 用户勾选同意协议
- **THEN** 系统加密提交认证信息
- **AND** 系统显示认证成功页面（图标+文字"实名认证完成"）
- **AND** 2秒后自动返回上一页

#### Scenario: User views existing authentication information
- **WHEN** 用户已提交过认证信息
- **THEN** 系统显示脱敏后的姓名和身份证号（姓名保留最后一位，身份证保留首位和末位）
- **AND** 用户无法编辑已认证的信息

#### Scenario: User fails authentication validation
- **WHEN** 用户提交的身份证号格式不正确
- **THEN** 系统显示错误提示"请输入正确的身份证号"
- **AND** 阻止提交

### Requirement: Realname Authentication Popup
系统 SHALL 在特定场景下显示实名认证提醒弹窗，引导用户完成认证。

#### Scenario: Homepage displays authentication popup
- **WHEN** 用户进入首页
- **AND** 后端接口返回需要弹窗（`DisplayWindow` 接口返回 `return_code === 0` 且 `isdisplay === true`）
- **THEN** 系统显示实名认证弹窗
- **AND** 根据 `isexceedmaxamount` 字段决定弹窗模式（true=强制模式 mode=1，false=提示模式 mode=2）

#### Scenario: User checks "no reminder for 7 days"
- **WHEN** 用户在弹窗中勾选"7天内弹窗不再弹出"
- **AND** 用户关闭弹窗（确认或取消）
- **THEN** 系统上报"不再提示"状态到后端
- **AND** 7天内不再显示弹窗

#### Scenario: Withdrawal page displays authentication popup
- **WHEN** 用户点击提现按钮
- **AND** 后端接口返回需要弹窗
- **THEN** 系统在提现前显示实名认证弹窗（mode=3）
- **AND** 阻止提现流程直到用户完成认证或取消

### Requirement: Realname Authentication Status Display
系统 SHALL 在个人信息页展示用户的实名认证状态。

#### Scenario: User views authentication status in profile
- **WHEN** 用户进入个人信息页
- **AND** 当前品牌商已开通实名认证功能（`Contract` 接口返回 `return_code === 0`）
- **THEN** 系统显示"实名认证"字段
- **AND** 显示认证状态文本（"未认证"或"已认证"）
- **AND** 点击可跳转到实名认证页面

#### Scenario: Brand not in authentication whitelist
- **WHEN** 用户进入个人信息页
- **AND** 当前品牌商未开通实名认证功能（`Contract` 接口返回 `return_code !== 0`）
- **THEN** 系统不显示"实名认证"字段

### Requirement: Data Encryption and Decryption
系统 SHALL 对敏感的个人信息（姓名、身份证号）进行加密传输和存储。

#### Scenario: User submits encrypted authentication data
- **WHEN** 用户提交认证信息
- **THEN** 系统使用 AES 算法加密姓名和身份证号
- **AND** 加密后的数据提交到后端

#### Scenario: System displays decrypted authentication data
- **WHEN** 系统获取到已认证的用户信息
- **THEN** 系统解密接口返回的姓名和身份证号
- **AND** 显示脱敏后的明文信息
- **AND** 如果解密失败，使用原始数据并上报错误日志

### Requirement: Parameter Compatibility
系统 SHALL 兼容不同小程序端的本地存储结构，正确获取用户和品牌商信息。

#### Scenario: Get parameters in MP-RETAIL
- **WHEN** 在零售小程序中调用参数获取函数
- **THEN** 系统从 `storeSettingInfo` 获取品牌商信息（`memberLogin`）
- **AND** 从 `accountinfo` 获取手机号
