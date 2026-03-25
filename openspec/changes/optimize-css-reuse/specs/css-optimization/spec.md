## ADDED Requirements

### Requirement: CSS 样式复用优化

项目 SHALL 优先使用全局样式工具类，避免在页面和组件中重复声明 CSS 规则，以减少主包体积。

#### Scenario: 替换重复的间距样式
- **WHEN** 页面或组件中声明了 `padding: 20rpx` 或 `margin: 20rpx` 等间距样式
- **AND** `common.scss` 中存在对应的工具类（如 `.p-20`, `.m-20`）
- **THEN** 移除局部样式声明，在元素标签上使用对应的工具类组合

#### Scenario: 替换重复的字体样式
- **WHEN** 页面或组件中声明了 `font-size: 28rpx`, `30rpx`, `34rpx` 等字体大小
- **AND** `common.scss` 中存在对应的工具类（如 `.fs-28`, `.fs-30`, `.fs-34`）
- **THEN** 移除局部样式声明，在元素标签上使用对应的工具类

#### Scenario: 替换重复的文本对齐样式
- **WHEN** 页面或组件中声明了 `text-align: center`, `text-align: left` 等文本对齐样式
- **AND** `common.scss` 中存在对应的工具类（如 `.text-center`, `.text-left`）
- **THEN** 移除局部样式声明，在元素标签上使用对应的工具类

#### Scenario: 替换重复的颜色样式
- **WHEN** 页面或组件中声明了 `color: #333`, `color: #666` 等颜色样式
- **AND** `common.scss` 中存在对应的工具类（如 `.c-3`, `.c-6`）
- **THEN** 移除局部样式声明，在元素标签上使用对应的工具类

#### Scenario: 替换重复的圆角样式
- **WHEN** 页面或组件中声明了 `border-radius: 10rpx`, `20rpx` 等圆角样式
- **AND** `common.scss` 中存在对应的工具类（如 `.br-10`, `.br-20`）
- **THEN** 移除局部样式声明，在元素标签上使用对应的工具类

#### Scenario: 替换重复的布局样式
- **WHEN** 页面或组件中声明了 `display: flex`, `align-items: center`, `justify-content: space-between` 等布局样式
- **AND** `common.scss` 中存在对应的工具类（如 `.flex`, `.flex-middle`, `.flex-between`）
- **THEN** 移除局部样式声明，在元素标签上使用对应的工具类组合

#### Scenario: 保留必要的局部样式
- **WHEN** 样式是组件或页面特有的，不适合全局化
- **OR** 样式需要动态计算或依赖组件状态
- **OR** 样式使用了复杂的嵌套、伪元素或动画
- **OR** `common.scss` 中没有对应的工具类且使用频率较低
- **THEN** 在页面或组件文件中保留样式声明

#### Scenario: 补充常用但缺失的全局样式
- **WHEN** 发现某些样式模式在多处重复使用
- **AND** `common.scss` 中没有对应的工具类
- **AND** 该样式模式适合全局化
- **THEN** 在 `common.scss` 中补充对应的工具类，然后替换所有使用处

#### Scenario: 验证样式表现一致性
- **WHEN** 完成样式替换后
- **THEN** 所有页面的样式表现必须与优化前保持一致
- **AND** 主包体积应有所减少
