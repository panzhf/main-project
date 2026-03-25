/*
 * 规则协议 webview
 */
export function linkRuleDetail(applyNo) {
  uni.navigateTo({
    url: '/packages/src/rule/webview?pageType=rule&applyNo=' + applyNo
  })
}
